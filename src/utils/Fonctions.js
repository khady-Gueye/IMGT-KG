
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




//import { color } from "d3";
// Glisser-déposer des noeuds et créer dynamiquement des noeuds avec un clic


// Fonctions.js


import Graph from "graphology";
import ForceSupervisor from "graphology-layout-force/worker";
import Sigma from "sigma";

// Détermine le type du noeud selon la relation
export function nodeType(relation) {
  if (relation.includes("isTargetOf")) {
    return 'target';
  } else if (relation.includes("isStudyProductOf")) {
    return 'studyProduct';
  } else if (relation.includes("isDecisionOf")) {
    return 'decision';
  } else if (relation.includes("isConstructOf")) {
    return 'construct';
  } else if (relation.includes("BAO_0000196")) {
    return 'studyContext';
  } else if (relation.includes("isProductOf")) {
    return 'product';
  } else {
    return 'defaultnode';
  }
}

  
  // Définit la couleur du noeud selon la relation
export function nodeColor(relation) {
  console.log("Récupération de la couleur pour la relation:", relation);
  
  // Utiliser includes() au lieu de cas exacts pour capturer les URIs complètes
  if (relation.includes("isTargetOf")) {
      return "purple";
  } else if (relation.includes("isStudyProductOf")) {
      return "#FF9900";
  } else if (relation.includes("isDecisionOf")) {
      return "#CC3333";
  } else if (relation.includes("isConstructOf")) {
      return "#3366CC";
  } else if (relation.includes("BAO_0000196")) {
      return "pink";
  } else if (relation.includes("isProductOf")) {
      return "#00CC99";
    } else {
      return "blue";
  }
}


// Couleur associée au type


export const COLORS = {
    defaultnode: "blue",
    target: "purple",
    studyProduct: "#FF9900",
    decision: "#CC3333",
    construct: "#3366CC",
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
      graph.addEdge(subject, object, { label: relation,
        size: 1,
        color: "#000000", // Couleur des arêtes (modifiable si nécessaire)

      });
    }
  });

  const layout = new ForceSupervisor(graph, {
    isNodeFixed: (_, attr) => attr.highlighted,
  });
  layout.start();

  const sigmaInstance = new Sigma(graph, container, {
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
