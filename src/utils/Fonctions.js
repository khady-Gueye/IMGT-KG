// ===================
// 1. Fonction pour fetch les données
// ===================
export async function fetchData(requete) {
  const response = await fetch(
    'https://www.imgt.org/fuseki/MabkgKg/?query=' + encodeURIComponent(requete),
    {
      method: 'GET',
      headers: {
        'Accept': 'text/csv'
      }
    }
  );

  if (response.ok) {
    return await response.text();
  } else {
    throw new Error('Error: ' + response.status);
  }
}

// ===================
// 2. Fonction pour remplacer tous les préfixes
// ===================
export function replaceAllOccurrences(str) {
  const mappings = {
    "http://purl.org/dc/elements/1.1/": "dc:",
    "http://biohackathon.org/resource/faldo#": "faldo:",
    "https://www.imgt.org/imgt-ontology#": "imgt:",
    "http://purl.obolibrary.org/obo/": "obo:",
    "http://www.w3.org/2002/07/owl#": "owl:",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#": "rdf:",
    "http://www.w3.org/2000/01/rdf-schema#": "rdfs:",
    "http://www.w3.org/2004/02/skos/core#": "skos:",
    "http://www.w3.org/2001/XMLSchema#": "xsd:",
    "http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#": "ncit:",
    "http://semanticscience.org/resource/": "sio:",
    "https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/HGNC:": "hgnc:",
    "http://www.bioassayontology.org/bao#": "bao:",
    "https://www.wikidata.org/wiki/Property:": "wiki:"
  };

  let result = str;
  for (const [key, value] of Object.entries(mappings)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

// ===================
// 3. Couleurs et types de noeuds
// ===================
export const COLORS = {
  defaultnode: "red",
  "Target": "purple",
  "StudyProduct": "green",
  "Decision": "cyan",
  "Construct": "#6666CC",
  "StudyContext": "#FFCC00",
  "Product": "#00CC99"
};

export const LIGHTCOLORS = {
  defaultnode: "lightblue",
  "Target": "violet",
  "StudyProduct": "#FFCC99",
  "Decision": "#FF9999",
  "Construct": "#99CCFF",
  "StudyContext": "#FFEE99",
  "Product": "#99FFCC"
};

// ===================
// 4. Fonctions de type et couleur
// ===================
export function nodeType(relation) {
  switch (relation) {
    case 'imgt:isTargetOf':
      return 'Target';
    case 'imgt:isStudyProductOf':
      return 'StudyProduct';
    case 'imgt:isDecisionOf':
      return 'Decision';
    case 'imgt:isConstructOf':
      return 'Construct';
    case 'bao:BAO_0000196':
      return 'StudyContext';
    case 'imgt:isProductOf':
      return 'Product';
    default:
      return 'defaultnode';
  }
}

export function nodeColor(nodeTypeName) {
  return COLORS[nodeTypeName] || COLORS.defaultnode;
}



// ===================
// 5. Construction du graphe
// ===================
import Graph from "graphology";
import ForceSupervisor from "graphology-layout-force/worker";
import Sigma from "sigma";

export function initSigmaGraph(container, triples) {
  if (!container) {
    console.error("Conteneur Sigma non trouvé.");
    return null;
  }

  const graph = new Graph();

  triples.forEach((triple, i) => {
    const { subject, relation, object } = triple;

    const subjectType = nodeType(relation);
    //console.log(subjectType);
    const subjectColor = nodeColor(subjectType);
    //console.log(subjectColor);
    const objectType = nodeType(relation);
    const objectColor = nodeColor(objectType);
    console.log(objectType);
    console.log(objectColor);
console.log(relation);
    if (!graph.hasNode(subject)) {
      graph.addNode(subject, {
        label: subject,
        x: Math.cos(i),
        y: Math.sin(i),
        size: 20,
        color: subjectColor
      });
    }

    if (!graph.hasNode(object)) {
      graph.addNode(object, {
        label: object,
        x: Math.sin(i),
        y: Math.cos(i),
        size: 20,
        color: objectColor
      });
    }

    const edgeId = `${subject}-${object}-${relation}`;
    if (!graph.hasEdge(edgeId)) {
      graph.addEdge(subject, object, {
        label: relation,
        type: "arrow",
        id: edgeId,
        color: "black", // toutes les arêtes en noir
        size: 2.5
      });
    }
  });

  const layout = new ForceSupervisor(graph, {
    isNodeFixed: (_, attr) => attr.highlighted,
  });
  layout.start();

  const sigmaInstance = new Sigma(graph, container, {
    type: "canvas",
    renderEdgeLabels: true
  });

  // Drag and drop des noeuds
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
    }
  };
}
// ===================
//6.Suppression des doublons
// ===================

// Petite carte pour les exceptions ou cas particuliers
const manualInverseRelations = {
  'imgt:someSpecialRelation': 'imgt:otherSpecialRelation', // Exemple spécial
  'imgt:otherSpecialRelation': 'imgt:someSpecialRelation',
};

// Générateur automatique d'inverses basé sur le nom
function autoGenerateInverse(relation) {
  if (relation.startsWith('imgt:has')) {
    const base = relation.replace('imgt:has', '');
    return `imgt:is${base}Of`;
  } else if (relation.startsWith('imgt:is') && relation.endsWith('Of')) {
    const base = relation.replace('imgt:is', '').replace('Of', '');
    return `imgt:has${base}`;
  } else {
    return null;
  }
}

// Fonction qui donne l'inverse d'une relation (auto ou manuel)
function getInverseRelation(relation) {
  // D'abord, vérifier si l'inverse est défini manuellement
  if (manualInverseRelations[relation]) {
    return manualInverseRelations[relation];
  }
  // Sinon essayer de le générer automatiquement
  return autoGenerateInverse(relation);
}

// Fonction pour filtrer les doublons inverses
export function filterInverseEdges(triples) {
  const filtered = [];
  const seen = new Set();

  triples.forEach((triple) => {
    const key = `${triple.subject}->${triple.object}`;
    const inverseKey = `${triple.object}->${triple.subject}`;
    const inverseRelation = getInverseRelation(triple.relation);

    if (!seen.has(inverseKey) || (inverseRelation && triple.relation === inverseRelation)) {
      filtered.push(triple);
      seen.add(key);
    }
  });

  return filtered;
}
