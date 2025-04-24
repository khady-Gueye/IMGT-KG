
export async function fetchData(requete) { // Fetch data from the SPARQL endpoint
    const response = await fetch('https://www.imgt.org/fuseki/MabkgKg/' + '?query=' + encodeURIComponent(requete), {
        method: 'GET',
        headers: {
            'Accept': 'text/csv' 
        }
    });
    if (response.ok) {

        const data = await response.text();
        return data;
    }
    else {
        throw new Error('Error: ' + response.status);
    }
}



export function replaceAllOccurrences(str) { // Replace all occurrences of a string
    return str.replace("http://purl.org/dc/elements/1.1/","dc:").replace("http://biohackathon.org/resource/faldo#","faldo:").
    replace("https://www.imgt.org/imgt-ontology#","imgt:").replace("http://purl.obolibrary.org/obo/","obo:").
    replace("http://www.w3.org/2002/07/owl#","owl:").replace("http://www.w3.org/1999/02/22-rdf-syntax-ns#","rdf:").
    replace("http://www.w3.org/2000/01/rdf-schema#","rdfs:").replace("http://www.w3.org/2004/02/skos/core#","skos:").
    replace("http://www.w3.org/2001/XMLSchema#","xsd:").replace("http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#","ncit:").replace("http://semanticscience.org/resource/","sio:").
    replace("https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/HGNC:","hgnc:").replace("http://www.bioassayontology.org/bao#","bao:").
    replace("https://www.wikidata.org/wiki/Property:","wiki:");
}






// Mapping dynamique des couleurs pour les relations
const relationColors = {};
let colorIndex = 0;
const colorPalette = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
  "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
  "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000",
  "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080"
];

// Retourne une couleur unique par relation
export function edgeColorByRelation(relation) {
  if (!relationColors[relation]) {
    relationColors[relation] = colorPalette[colorIndex % colorPalette.length];
    colorIndex++;
  }
  return relationColors[relation];
}

// Glisser-déposer des noeuds et créer dynamiquement des noeuds avec un clic
import Graph from "graphology";
import ForceSupervisor from "graphology-layout-force/worker";
import Sigma from "sigma";

// Détermine le type du noeud selon la relation
export function nodeType(relation) {
  switch (relation) {
    case 'imgt:isTargetOf':
      return 'target';
    case 'imgt:isStudyProductOf':
      return 'studyProduct';
    case 'imgt:isDecisionOf':
      return 'decision';
    case 'imgt:isConstructOf':
      return 'construct';
    case 'bao:BAO_0000196':
      return 'studyContext';
    case 'imgt:isProductOf':
      return 'product';
    default:
      return 'defaultnode';
  }
}


  
  // Définit la couleur du noeud selon la relation

export function nodeColor(relation ) {
  switch (relation) {

    case 'imgt:isTargetOf':
      return 'purple';
    case 'imgt:isStudyProductOf':
      return '#green';
    case 'imgt:isDecisionOf':
      return '#cyan';
    case 'imgt:isConstructOf':
      return '##6666CC';
    case 'bao:BAO_0000196':
      return 'pink';
    case 'imgt:isProductOf':
      return '#00CC99';
    default:
      return 'blue';
  }
}

// Couleur associée au type


export const COLORS = {
    defaultnode: "blue",
    target: "purple",
    studyProduct: "#green",
    decision: "#cyan",
    construct: "##6666CC",
    studyContext: "#FFCC00",
    product: "#00CC99"
  };
  
  export const LIGHTCOLORS = {
    defaultnode: "lightblue",
    target: "violet",
    studyProduct: "#FFCC99",
    decision: "#FF9999",
    construct: "#99CCFF",
    studyContext: "#FFEE99",
    product: "#99FFCC"
  };
  
// Map des relations inverses (à enrichir selon ton dataset)

// Carte des relations inverses
const inverseRelationsMap = {
  'imgt:isTargetOf': 'imgt:hasTarget',
  'imgt:hasTarget': 'imgt:isTargetOf',
  'imgt:isProductOf': 'imgt:hasProduct',
  'imgt:hasProduct': 'imgt:isProductOf',
  'imgt:isStudyProductOf': 'imgt:hasStudyProduct',
  'imgt:hasStudyProduct': 'imgt:isStudyProductOf',
  'imgt:isConstructOf': 'imgt:hasConstruct',
  'imgt:hasConstruct': 'imgt:isConstructOf',
  'imgt:isDecisionOf': 'imgt:hasDecision',
  'imgt:hasDecision': 'imgt:isDecisionOf',
};

// Supprimer les doublons inverses : ne garder qu’une relation
// Supprimer les doublons inverses : ne garder qu’une relation
export function filterInverseEdges(triples) {
  const filtered = [];
  const seen = new Set();

  triples.forEach((triple) => {
    const key = `${triple.subject}->${triple.object}`;
    const inverseKey = `${triple.object}->${triple.subject}`;
    const inverseRelation = inverseRelationsMap[triple.relation];

    if (
      !seen.has(inverseKey) || 
      (inverseRelation && triple.relation === inverseRelation)
    ) {
      filtered.push(triple);
      seen.add(key);
    }
  });

  return filtered;
}


// Fonction principale pour construire le graphe
export function initSigmaGraph(container, triples) {
  if (!container) {
    console.error("Conteneur Sigma non trouvé.");
    return null;
  }

  const graph = new Graph();

  triples.forEach((triple, i) => {
    const { subject, relation, object , color } = triple;

    //const type = nodeType(relation);
    //const color = triple.color || COLORS[type] || COLORS.defaultnode;

    //const color = triple.color || COLORS.defaultnode;

    if (!graph.hasNode(subject)) {
      graph.addNode(subject, {
        label: subject,
        x: Math.cos(i),
        y: Math.sin(i),
        size: 10,
        color: color, // Utilise la couleur enrichie ou une couleur par défaut

      });
    }

    if (!graph.hasNode(object)) {
      graph.addNode(object, {
        label: object,
        x: Math.sin(i),
        y: Math.cos(i),
        size: 10,
        color:color, // Utilise la couleur enrichie ou une couleur par défaut

      });
    }

    const edgeId = `${subject}-${object}-${relation}`;
    if (!graph.hasEdge(edgeId)) {
      graph.addEdge(subject, object, { label: relation, type: "arrow", id: edgeId, color: "black", size: 2.5 });

    }
  });

  const layout = new ForceSupervisor(graph, {
    isNodeFixed: (_, attr) => attr.highlighted,
  });
  layout.start();

  const sigmaInstance = new Sigma(graph, container, {
 
 
    type:"canvas",
    renderEdgeLabels: true,
  });

  let draggedNode = null;
  let isDragging = false;

  sigmaInstance.on("downNode", (e) => {
    isDragging = true;
    draggedNode = e.node;
    graph.setNodeAttribute(draggedNode, "highlighted", true);
    if (!sigmaInstance.getCustomBBox()) sigmaInstance.setCustomBBox(sigmaInstance.getBBox());
  });

  sigmaInstance.on("moveBody", ({ event }) => {
    if (!isDragging || !draggedNode) return;

    const pos = sigmaInstance.viewportToGraph(event);
    graph.setNodeAttribute(draggedNode, "x", pos.x);
    graph.setNodeAttribute(draggedNode, "y", pos.y);

    event.preventSigmaDefault();
    event.original.preventDefault();
    event.original.stopPropagation();
  });

  const handleUp = () => {
    if (draggedNode) graph.removeNodeAttribute(draggedNode, "highlighted");
    isDragging = false;
    draggedNode = null;
  };

  sigmaInstance.on("upNode", handleUp);
  sigmaInstance.on("upStage", handleUp);

  return {
    sigmaInstance,
    graph,
    layout,
    destroy: () => {
      layout.stop();
      sigmaInstance.kill();
    },
  };
}
