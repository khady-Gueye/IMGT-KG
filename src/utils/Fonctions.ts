/* ---------------------------------------------------------
 *  utils/Fonctions.ts  –  helpers SPARQL → vis-network
 * --------------------------------------------------------*/
import { DataSet } from 'vis-data';
import type { Node, Edge, Options } from 'vis-network';
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
}

interface VisEdge extends Edge {
  id:    string;
  from:  string;
  to:    string;
  label?:  string;
  arrows?: string;
  color?:  string;
  originalLabel?: string;  // Ajout de cette propriété
  //solver?: string; // Ajout de cette propriété pour le solver
}

export interface Triple {
  subject:  string;
  relation: string;
  object:   string;
}

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
  mAb_Level   : '#CC0000', // la couleur du mAb est la couleur rouge
  Target      : '#FF00FF',
  Construct   : '#0000FF',
  MOA         : ' #FF6633 ',
  Product     : ' #006600 ',  //Green
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
    {  method: "POST",
      headers: {
        "Content-Type": "application/sparql-query",
        "Accept": "text/csv"
      },
      body: requete}
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.text();
}
/* =========================================================
 *  8) Fonction fetch vers l'endpoint SPARQL 
 * ========================================================*/
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

/* =========================================================
 * Replace les préfixes dans une chaîne de caractères 
 * ========================================================*/


export function replaceAllOccurrences(str: string): string {
  return Object.entries(PREFIX_MAPPINGS).reduce(
    (acc, [key, val]) => acc.replace(new RegExp(key, 'g'), val),
    str
  );
}

/* =========================================================
 *  2) Détermination du type d'un nœud selon la relation
 * ========================================================*/
export function subjectNodeType(subject: string, relation: string): NodeType {
  // Typage par la relation pour les Target
  if (relation === 'imgt:isTargetOf') {
    return 'Target';
  }
  
  // Pour les autres types, on utilise d'abord le typage par URI
  const subjectType = nodeTypeFct(subject);
  if (subjectType !== 'defaultnode') {
    return subjectType;
  }
  
  // Sinon typage par la relation pour les autres types
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
    case 'imgt:hasTarget'        : return 'Target';  // Ajout de la détection de Target côté objet
    case 'imgt:hasStudyProduct'  : return 'Product';
    case 'bao:BAO_0000196'       : return 'MOA';
    default                      : return 'defaultnode';
  }
}

export const nodeColor = (t: NodeType) => COLORS[t] ?? COLORS.defaultnode;


/* =========================================================
 *  3) Nouvelle table "type dominant" pour chaque nœud
 * ========================================================*/

function nodeTypeFct(uri: string): NodeType {
  //  Si le sujet est un anticorps mAb
  if (uri.includes('/mAb_') || uri.includes('imgt:mAb_')) {
    return 'mAb_Level';
  }
  else if (uri.includes("imgt:Construct_")) {
    return 'Construct';
  }
  else if (uri.includes("imgt:Product_")) {
    return 'Product';
  }
  else if (uri.includes("imgt:MOA_")) {
    return 'MOA';
  }
  else {
    return 'defaultnode';
  }
}

/* =========================================================
 *  4) Construction DataSet pour vis-network avec homogénéisation des Target
 * ========================================================*/
export function prepareVisData(triples: Triple[], showRelations: boolean = false, 
mabImages: Record<string, string> = {}

): {
  nodes: DataSet<VisNode>;
  edges: DataSet<VisEdge>;
} {
  const nodes = new DataSet<VisNode>();
  const edges = new DataSet<VisEdge>();
  
  // Première étape : identifier tous les nœuds Target par leurs relations
  const targetNodes = new Set<string>();
  
  triples.forEach(({ subject, relation, object }) => {
    // Identifier les Target par la relation
    if (relation === 'imgt:isTargetOf') {
      targetNodes.add(subject);
    } else if (relation === 'imgt:hasTarget') {
      targetNodes.add(object);
    }
  });
  
  // Deuxième étape : créer les nœuds avec les types appropriés
  const setNode = (id: string, color: string) => {
    if (nodes.get(id)) return;
  
    const mabMatch = id.match(/mAb_[A-Za-z0-9_]+/);
    const mabId = mabMatch ? mabMatch[0] : null;
    const imageUrl = mabId ? mabImages[mabId] : null;
  
    if (imageUrl) {
      nodes.add({
        id,
        label: shortenURI(id),
        title: id,
        shape: "circularImage",
        image: imageUrl,
        brokenImage: undefined,   // fallback géré manuellement ci-dessous
        size: 25,
        color: COLORS.mAb_Level,
      });
  
      // fallback : si l'image ne se charge pas → repasse en "dot"
      const img = new Image();
      img.onload = () => console.log(`✅ Image OK pour ${id} :`, imageUrl);
      img.onerror = () => {
        console.warn(` Image invalide pour ${id}, fallback en dot`);
        nodes.update({
          id,
          label: shortenURI(id),
          title: id,
          shape: "dot",
          color,
          size: 25,
        });
      };
      img.src = imageUrl;
      return;
    }
  
    // fallback direct si pas d'image connue
    nodes.add({
      id,
      label: shortenURI(id),
      title: id,
      color,
      shape: "dot",
      size: 25,
    });
  };
  

  // Troisième étape : traiter tous les triplets pour créer les nœuds et les arêtes
  triples.forEach(({ subject, relation, object }) => {
    // Détermination du type de sujet
    const subjectType = targetNodes.has(subject) ? 'Target' : subjectNodeType(subject, relation);
    setNode(subject, nodeColor(subjectType));
    
    // Détermination du type d'objet
    let objectType = targetNodes.has(object) ? 'Target' : objectNodeType(relation);
    if (objectType === 'defaultnode') {
      objectType = nodeTypeFct(object);
    }
    
    let objectColor: string;
    if (objectType !== 'defaultnode') {
      objectColor = nodeColor(objectType);
    } else {
      objectColor = nodes.get(subject)?.color || COLORS.defaultnode;
    }
    
    setNode(object, objectColor);
    
    // Ajout de l'arête
    edges.add({
      id: `${subject}-${relation}-${object}`,
      from: subject,
      to: object,
      title: shortenURI(relation),
      arrows: 'to',
      font: {align: 'top'},
      color: '#FFB8AD',
      label:showRelations ? relation: '',
      originalLabel: relation  // Ajout de la propriété originale pour le label

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
      size :100,

    },
    edges: {
      width: 0.7,
      length:250, // ← Augmente la longueur des arêtes
      font: { size:8, strokeWidth: 3 },
      smooth: { enabled: true, type: 'dynamic', roundness: 0.5 }, // change 'cubicBezier' to 'dynamic' for dynamic edges or to 'straightCross' for straight edges
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
 *  6) Initialisation du réseau vis.js
 * ========================================================*/

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
  // ---- Charger les données (images incluses)
  const mabImages = await fetchMabImagesFromSparql();
  const { nodes, edges } = prepareVisData(triples, showRelations, mabImages);

  const network = new Network(container, { nodes, edges }, getVisOptions());

  // ---- Gérer les clics 
  if (onNodeClick) {
    // Sélection simple 
network.on("click", event => {
  if (event.nodes.length > 0) {
    console.log("Node selected:", event.nodes);
    // ici tu pourrais recadrer sur le node, afficher détails légers, etc.
  }
});

// Documentation seulement au double-clic
if (onNodeClick) {
  network.on("doubleClick", event => {
    if (event.nodes.length > 0) {
      const nodeId = event.nodes[0];
      const nodeItem = nodes.get(nodeId);

      if (!nodeItem || Array.isArray(nodeItem)) return;

      const customNodeData = nodeItem as CustomVisNode;
      onNodeClick(customNodeData.iri || customNodeData.id || nodeId);
    }
  });
}

  }

  // ---- RENDU JOLI + CENTRÉ DÈS CHARGEMENT
  network.once("stabilizationIterationsDone", function () {
    // Physique stop, sinon ça continue à "danser"
    network.stopSimulation();

    // Ajuster vue : recentre et zoom-out pour tout afficher
    network.fit({
      animation: {
        duration: 1000,   // animation douce (1s)
        easingFunction: "easeInOutQuad"
      }
    });
  });

  return { network, nodes, edges };
}



/* =========================================================
 *  7) Utilitaires divers
 * ========================================================*/
export const shortenURI = (uri: string): string => {
  const short = replaceAllOccurrences(uri);
  return short.length > 30 ? short.split(/[/#]/).pop() || short : short;
};

export function isMabUri(uri: string): boolean {
  return uri.includes('/mAb_') || uri.includes('imgt:mAb_');
}

const getNodeShape = (_uri: string) => 'dot';



/* =========================================================
 *  8) Filtrage de doublons inverses
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
