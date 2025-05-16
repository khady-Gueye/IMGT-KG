/* ---------------------------------------------------------
 *  utils/Fonctions.ts  –  helpers SPARQL → vis-network
 * --------------------------------------------------------*/
import { DataSet } from 'vis-data';
import type { Node, Edge, Options } from 'vis-network';
import { Network } from 'vis-network';

/* ───────────────────────────────
   Interfaces & types
   ─────────────────────────────── */
interface VisNode extends Node {
  id:    string;
  label: string;
  color: string;
  shape?: string;
  title?: string;
}

interface VisEdge extends Edge {
  id:    string;
  from:  string;
  to:    string;
  label?:  string;
  arrows?: string;
  color?:  string;
}

export interface Triple {
  subject:  string;
  relation: string;
  object:   string;
}

export type NodeType =
  | 'Target'
  | 'StudyProduct'
  | 'Decision'
  | 'Construct'
  | 'StudyContext'
  | 'Product'
  | 'defaultnode';

/* ───────────────────────────────
   Couleurs
   ─────────────────────────────── */
export const COLORS: Record<NodeType, string> = {
  defaultnode : '#FF6B6B',
  Target      : '#9C51B6',
  StudyProduct: '#4CAF50',
  Decision    : '#00BCD4',
  Construct   : '#6666CC',
  StudyContext: '#FFCC00',
  Product     : '#00CC99',
};

/* ───────────────────────────────
   Préfixes → raccourcis
   ─────────────────────────────── */
const PREFIX_MAPPINGS: Record<string, string> = {
  'http://purl.org/dc/elements/1.1/'                           : 'dc:',
  'http://biohackathon.org/resource/faldo#'                    : 'faldo:',
  'https://www.imgt.org/imgt-ontology#'                        : 'imgt:',
  'http://purl.obolibrary.org/obo/'                            : 'obo:',
  'http://www.w3.org/2002/07/owl#'                             : 'owl:',
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#'                : 'rdf:',
  'http://www.w3.org/2000/01/rdf-schema#'                      : 'rdfs:',
  'http://www.w3.org/2004/02/skos/core#'                       : 'skos:',
  'http://www.w3.org/2001/XMLSchema#'                          : 'xsd:',
  'http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#'        : 'ncit:',
  'http://semanticscience.org/resource/'                       : 'sio:',
  'https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/HGNC:' : 'hgnc:',
  'http://www.bioassayontology.org/bao#'                       : 'bao:',
  'https://www.wikidata.org/wiki/Property:'                    : 'wiki:',
};

/* =========================================================
 *  1) Helpers de requête SPARQL
 * ========================================================*/
export async function fetchData(requete: string): Promise<string> {
  const response = await fetch(
    `https://www.imgt.org/fuseki/MabkgKg/?query=${encodeURIComponent(requete)}`,
    { method: 'GET', headers: { Accept: 'text/csv' } }
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.text();
}

export function replaceAllOccurrences(str: string): string {
  return Object.entries(PREFIX_MAPPINGS).reduce(
    (acc, [key, val]) => acc.replace(new RegExp(key, 'g'), val),
    str
  );
}

/* =========================================================
 *  2) Détermination du type d’un nœud selon la relation
 * ========================================================*/
export function subjectNodeType(relation: string): NodeType {
  switch (relation) {
    case 'imgt:isTargetOf'       : return 'Target';
    case 'imgt:isStudyProductOf' : return 'StudyProduct';
    case 'imgt:isDecisionOf'     : return 'Decision';
    case 'imgt:isConstructOf'    : return 'Construct';
    case 'imgt:isProductOf'      : return 'Product';
    default                      : return 'defaultnode';
  }
}
export function objectNodeType(relation: string): NodeType {
  switch (relation) {
    case 'imgt:hasStudyProduct'  : return 'StudyProduct';
    case 'bao:BAO_0000196'       : return 'StudyContext';
    default                      : return 'defaultnode';
  }
}
export const nodeColor = (t: NodeType) => COLORS[t] ?? COLORS.defaultnode;

/* =========================================================
 *  3) Nouvelle table “type dominant” pour chaque nœud
 * ========================================================*/
function buildNodeTypeMap(triples: Triple[]): Record<string, NodeType> {
  const map: Record<string, NodeType> = {};
  triples.forEach(({ subject, relation }) => {
    const t = subjectNodeType(relation);
    if (t !== 'defaultnode') map[subject] = t;
  });
  return map;
}

/* =========================================================
 *  4) Construction DataSet pour vis-network
 * ========================================================*/
export function prepareVisData(triples: Triple[]): {
  nodes: DataSet<VisNode>;
  edges: DataSet<VisEdge>;
} {
  const nodes = new DataSet<VisNode>();
  const edges = new DataSet<VisEdge>();
  const seen  = new Set<string>();

  const nodeTypeMap = buildNodeTypeMap(triples);

  const addNode = (id: string, nodeType: NodeType) => {
    if (seen.has(id)) return;
    //const finalType = nodeTypeMap[id] ?? nodeType(fallbackRelation);
    nodes.add({
      id,
      label: shortenURI(id),
      title: id,
      color: nodeColor(nodeType),
      shape: 'dot',
      size : 10,
    });
    seen.add(id);
  };

  triples.forEach(({ subject, relation, object }) => {
    addNode(subject, nodeTypeMap[subject] ?? subjectNodeType(relation));
    addNode(object , nodeTypeMap[object] ?? objectNodeType(relation));

    edges.add({
      id   : `${subject}-${relation}-${object}`,
      from : subject,
      to   : object,
      title: shortenURI(relation),
      arrows: 'to',
      color : '#2B2B2B',
    });
  });

  return { nodes, edges };
}

/* =========================================================
 *  5) Options vis.js
 * ========================================================*/
export function getVisOptions(): Options {
  return {
    nodes: {
      font: { size: 8, face: 'Roboto', strokeWidth: 3 },
      borderWidth: 2,
      shapeProperties: { useBorderWithImage: true },
    },
    edges: {
      width: 1,
      font: { size: 8, strokeWidth: 2 },
      smooth: { enabled: true, type: 'cubicBezier', roundness: 0.5 },
    },
    physics: {
      enabled: true,
      forceAtlas2Based: {
        theta: 0.5,
        gravitationalConstant: -50,
        centralGravity: 0.01,
        springConstant: 0.08,
        springLength: 100,
        damping: 0.4,
        avoidOverlap: 0,
      },
    },
    interaction: { tooltipDelay: 200, hideEdgesOnDrag: true },
  };
}

/* =========================================================
 *  6) Initialisation du réseau vis.js
 * ========================================================*/
export function initVisNetwork(container: HTMLElement, triples: Triple[]) {
  const { nodes, edges } = prepareVisData(triples);
  const network = new Network(container, { nodes, edges }, getVisOptions());
  return { network, nodes, edges };
}

/* =========================================================
 *  7) Utilitaires divers
 * ========================================================*/
export const shortenURI = (uri: string): string => {
  const short = replaceAllOccurrences(uri);
  return short.length > 30 ? short.split(/[/#]/).pop() || short : short;
};

const getNodeShape = (_uri: string) => 'dot';

/* =========================================================
 *  8) Filtrage de doublons inverses (inchangé)
 * ========================================================*/
const manualInverseRelations: Record<string, string> = {
  'imgt:someSpecialRelation'  : 'imgt:otherSpecialRelation',
  'imgt:otherSpecialRelation' : 'imgt:someSpecialRelation',
};

const autoGenerateInverse = (relation: string): string | null => {
  if (relation.startsWith('imgt:has')) {
    const base = relation.replace('imgt:has', '');
    return `imgt:is${base}Of`;
  }
  if (relation.startsWith('imgt:is') && relation.endsWith('Of')) {
    const base = relation.replace('imgt:is', '').replace('Of', '');
    return `imgt:has${base}`;
  }
  return null;
};

const getInverseRelation = (relation: string): string | null =>
  manualInverseRelations[relation] ?? autoGenerateInverse(relation);

export function filterInverseEdges(triples: Triple[]): Triple[] {
  const filtered: Triple[] = [];
  const seen = new Set<string>();

  triples.forEach(triple => {
    const key         = `${triple.subject}->${triple.object}`;
    const inverseKey  = `${triple.object}->${triple.subject}`;
    const inverseRel  = getInverseRelation(triple.relation);

    if (!seen.has(inverseKey) || (inverseRel && triple.relation === inverseRel)) {
      filtered.push(triple);
      seen.add(key);
    }
  });

  return filtered;
}
