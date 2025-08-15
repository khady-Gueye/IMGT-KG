/* ---------------------------------------------------------
 *  utils/Fonctions.ts  –  helpers SPARQL → vis-network
 * --------------------------------------------------------*/
import { DataSet } from 'vis-data';
import type {Node, Edge, Options } from 'vis-network';
import { Network } from 'vis-network';
import { fetchMabImagesFromSparql } from './queryLoader';

/* ───────────────────────────────
   Interfaces & types
   ─────────────────────────────── */
interface VisNode extends Node {
  id:    string;
  label: string;
  color: string;
  shape?: string;
  title?: string;
  image?: string;
  size?: number;
  font?: object;
}

interface VisEdge extends Edge {
  id:    string;
  from:  string;
  to:    string;
  title?: string;
  font?: { align?: string };
  label?:  string;
  arrows?: string;
  color?:  string;
  originalLabel?: string;
}

export interface Triple {
  subject:  string;
  relation: string;
  object:   string;
}

export type MabImagesMap = { [id: string]: string };

export type NodeType =
  | 'mAb_Level'
  | 'Target'
  | 'Construct'
  | 'MOA'
  | 'Product'
  | 'defaultnode';

/* ───────────────────────────────
   Couleurs
   ─────────────────────────────── */
export const COLORS: Record<NodeType, string> = {
  defaultnode : '#FF6B6B',
  mAb_Level   : '#CC0000',
  Target      : '#FF00FF',
  Construct   : '#0000FF',
  MOA         : ' #FF6633 ',
  Product     : ' #006600 ',
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
 * ======================================================== */
export async function fetchData(requete: string): Promise<string> {
  const response = await fetch(
    `https://www.imgt.org/fuseki/MabkgKg/?query=${encodeURIComponent(requete)}`,
    { method: 'GET', headers: { Accept: 'text/csv' } }
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.text();
}
/* =========================================================
 *  8) Fonction fetch vers l'endpoint SPARQL 
 * ======================================================== */
type SparqlRawBinding = {
  property: { value: string },
  propertyLabel?: { value: string },
  value: { value: string },
  valueLabel?: { value: string }
}

export async function fetchDocData(sparqlQuery: string): Promise<Array<{
  property: string,
  propertyLabel: string | null,
  value: string,
  valueLabel: string | null
}>> {
  const endpoint = "https://www.imgt.org/fuseki/MabkgKg/?query"
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/sparql-query",
      "Accept": "application/sparql-results+json"
    },
    body: sparqlQuery
  })

  if (!response.ok)
    throw new Error(`SPARQL error: ${response.status}`);

  const json = await response.json();

  return json.results.bindings.map((row: SparqlRawBinding) => ({
    property: row.property.value,
    propertyLabel: row.propertyLabel?.value || null,
    value: row.value.value,
    valueLabel: row.valueLabel?.value || null,
  }))
}

// Pour remplacer les préfixes dans une chaîne
export function replaceAllOccurrences(str: string): string {
  return Object.entries(PREFIX_MAPPINGS).reduce(
    (acc, [key, val]) => acc.replace(new RegExp(key, 'g'), val),
    str
  );
}

// Détermination du type d'un nœud par relation
export function subjectNodeType(subject: string, relation: string): NodeType {
  if (relation === 'imgt:isTargetOf') {
    return 'Target';
  }
  const subjectType = nodeTypeFct(subject);
  if (subjectType !== 'defaultnode') return subjectType;

  switch (relation) {
    case 'imgt:isConstructOf'    : return 'Construct';
    case 'imgt:isProductOf'      :
    case 'imgt:isStudyProductOf' :
    case 'imgt:isDecisionOf'     : return 'Product';
    default                      : return 'defaultnode';
  }
}

export function objectNodeType(relation: string): NodeType {
  switch (relation) {
    case 'imgt:hasTarget'       : return 'Target';
    case 'imgt:hasStudyProduct' : return 'Product';
    case 'bao:BAO_0000196'      : return 'MOA';
    default                     : return 'defaultnode';
  }
}

export const nodeColor = (t: NodeType) => COLORS[t] ?? COLORS.defaultnode;

// Typage d’un nœud via son URI
function nodeTypeFct(uri: string): NodeType {
  if (uri.includes('/mAb_') || uri.includes('imgt:mAb_')) {
    return 'mAb_Level';
  } else if (uri.includes("imgt:Construct_")) {
    return 'Construct';
  } else if (uri.includes("imgt:Product_")) {
    return 'Product';
  } else if (uri.includes("imgt:MOA_")) {
    return 'MOA';
  } else {
    return 'defaultnode';
  }
}

// Nettoyage et construction de la map d’images mAb
  export async function fetchAndCleanMabImages(): Promise<MabImagesMap> {
    const rawMabImages: MabImagesMap = await fetchMabImagesFromSparql();
  
    // Nettoyer les URLs pour garder uniquement le lien direct
    const cleanMabImages = Object.fromEntries(
      Object.entries(rawMabImages).map(([id, urlRaw]) => {
        // Expression régulière pour extraire l’URL entre crochets markdown [texte](url “…“)
        const markdownUrlMatch = urlRaw.match(/\[([^\]]+)\]\(([^ )]+)(?: "[^"]*")?\)/);
        const url = markdownUrlMatch ? markdownUrlMatch[1] : urlRaw
          .replace(/^\[+/, '')
          .replace(/\]+$/, '')
          .replace(/^"+|"+$/g, '')
          .trim();
        return [id, url];
      })
    );
  
    console.log('Mab images nettoyées:', Object.entries(cleanMabImages).slice(0, 5));
    return cleanMabImages;
  }




/* ===========================================================================
 * Construction DataSet pour vis-network avec injection images mAb
 * =========================================================================== */
export function prepareVisData(
  triples: Triple[],
  showRelations: boolean = false,
  mabImages: MabImagesMap = {}
): {
  
  nodes: DataSet<VisNode>; edges: DataSet<VisEdge> } {
  const nodes: DataSet<VisNode> = new DataSet<VisNode>();
  const edges: DataSet<VisEdge> = new DataSet<VisEdge>();


  // Identifier les nœuds Target
  const targetNodes: Set<string> = new Set<string>();
  triples.forEach(({ subject, relation, object }) => {
    if (relation === 'imgt:isTargetOf') {
      targetNodes.add(subject);
    } else if (relation === 'imgt:hasTarget') {
      targetNodes.add(object);
    }
  });
  console.log('Début prepareVisData, mabImages:', Object.keys(mabImages));

  // Fonction d’ajout de nœud avec prise en compte images mAb
  const setNode = (id: string, color: string) => {
    if (nodes.get(id)) return;
    
    // Si c’est un mAb (id commence par mAb_) et qu’on a une image
    if (id.startsWith('mAb_') && mabImages[id]) {
      console.log(`Ajout nœud avec image: id=${id}, imageURL=${mabImages[id]}`);
      nodes.add({
        id,
        label: shortenURI(id),
        title: id,
        shape: 'image',
        image: mabImages[id],
        size: 32,
        font: { multi: 'md' },
        color: color,  // important pour vis-network
      });
      return;
    }


    // sinon nœud classique
    if (targetNodes.has(id)) {
      nodes.add({
        id,
        label: shortenURI(id),
        title: id,
        color: nodeColor('Target'),
        shape: 'dot',
        size: 15,
      });
      return;
    }


    nodes.add({
      id,
      label: shortenURI(id),
      title: id,
      color: color,
      shape: 'dot',
      size: 15,
    });
  };


  // Parcours de tous les triplets pour créer nœuds + arêtes
  triples.forEach(({ subject, relation, object }) => {
    const subjectType = targetNodes.has(subject) ? 'Target' : subjectNodeType(subject, relation);
    setNode(subject, nodeColor(subjectType));


    let objectType = targetNodes.has(object) ? 'Target' : objectNodeType(relation);
    if (objectType === 'defaultnode') {
      objectType = nodeTypeFct(object);
    }
    const objectColor = objectType !== 'defaultnode' ? nodeColor(objectType) : nodeColor(subjectType);
    setNode(object, objectColor);


    edges.add({
      id: `${subject}-${relation}-${object}`,
      from: subject,
      to: object,
      title: shortenURI(relation),
      arrows: 'to',
      font: { align: 'top' },
      color: '#FFB8AD',
      label: showRelations ? relation : '',
      originalLabel: relation,
    });
  });
  console.log(
    'Fin prepareVisData, mabImages sample:', 
    Object.entries(mabImages).slice(0, 5)
  );
  return { nodes, edges };
}

/* =========================================================
 * Options vis.js
 * ======================================================== */
export function getVisOptions(): Options {
  return {
    nodes: {
      font: { size: 8, face: 'Roboto', strokeWidth: 3 },
      borderWidth: 2,
      shapeProperties: { useBorderWithImage: true },
      size: 100,
    },
    edges: {
      width: 0.7,
      length: 250,
      font: { size: 8, strokeWidth: 3 },
      smooth: { enabled: true, type: 'dynamic', roundness: 0.5 },
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
        avoidOverlap: 1,
      },
    },
    interaction: { tooltipDelay: 200, hideEdgesOnDrag: true },
  };
}


/* =========================================================
 * Initialisation du réseau vis.js
 * ======================================================== */
type CustomVisNode = {
  id: string;
  label?: string;
  iri?: string;
  [key: string]: any;
};

export async function initVisNetwork(
  container: HTMLElement,
  triples: Triple[],
  onNodeClick?: (iri: string) => void,
  showRelations: boolean = false
) {
  const mabImages = await fetchAndCleanMabImages();
  console.log('Mab images map:', mabImages);

  const { nodes, edges } = prepareVisData(triples, showRelations, mabImages);
  console.log('Nodes and edges prepared');

  const network = new Network(container, { nodes, edges }, getVisOptions());

  if (onNodeClick) {
    network.on('click', event => {
      if (event.nodes.length > 0) {
        const nodeId = event.nodes[0];
        const nodeData = nodes.get(nodeId) as unknown as CustomVisNode | undefined;
        console.log('Clicked node:', nodeId, nodeData);
        if (nodeData?.id) {
          onNodeClick(nodeData.id);
        } else if (nodeData?.iri) {
          onNodeClick(nodeData.iri);
        } else {
          onNodeClick(nodeId);
        }
      }
    });
  }

  return { network, nodes, edges };
}

/* =========================================================
 * Divers
 * ======================================================== */
export const shortenURI = (uri: string): string => {
  const short = replaceAllOccurrences(uri);
  return short.length > 30 ? short.split(/[/#]/).pop() || short : short;
};

export function isMabUri(uri: string): boolean {
  return uri.includes('/mAb_') || uri.includes('imgt:mAb_');
}

const getNodeShape = (_uri: string) => 'dot';

/* =========================================================
 * Filtrage de doublons inverses
 * ======================================================== */
const manualInverseRelations: Record<string, string> = {
  'imgt:someSpecialRelation': 'imgt:otherSpecialRelation',
  'imgt:otherSpecialRelation': 'imgt:someSpecialRelation',
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
    const key = `${triple.subject}->${triple.object}`;
    const inverseKey = `${triple.object}->${triple.subject}`;
    const inverseRel = getInverseRelation(triple.relation);

    if (!seen.has(inverseKey) || (inverseRel && triple.relation === inverseRel)) {
      filtered.push(triple);
      seen.add(key);
    }
  });

  return filtered;
}
