
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



// Glisser-déposer des noeuds et créer dynamiquement des noeuds avec un clic
// src/utils/initSigmaGraph.ts
import chroma from "chroma-js";
import Graph from "graphology";
import ForceSupervisor from "graphology-layout-force/worker.js";
import Sigma from "sigma";
import { v4 as uuid } from "uuid";

export function setupSigmaGraph(container: HTMLElement, graphData: any[]) {
  const graph = new Graph();

  // Initialisation des données
  graphData.forEach(({ subject, object }) => {
    if (!graph.hasNode(subject)) {
      graph.addNode(subject, {
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        size: 10,
        color: chroma.random().hex()
      });
    }
    if (!graph.hasNode(object)) {
      graph.addNode(object, {
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        size: 10,
        color: chroma.random().hex()
      });
    }
    if (!graph.hasEdge(subject, object) && subject !== object) {
      graph.addEdge(subject, object);
    }
  });

  const layout = new ForceSupervisor(graph, { isNodeFixed: (_, attr) => attr.highlighted });
  layout.start();

  const renderer = new Sigma(graph, container, { minCameraRatio: 0.5, maxCameraRatio: 2 });

  // Drag'n'Drop
  let draggedNode: string | null = null;
  let isDragging = false;

  renderer.on("downNode", (e) => {
    isDragging = true;
    draggedNode = e.node;
    graph.setNodeAttribute(draggedNode, "highlighted", true);
    if (!renderer.getCustomBBox()) renderer.setCustomBBox(renderer.getBBox());
  });

  renderer.on("moveBody", ({ event }) => {
    if (!isDragging || !draggedNode) return;
    const pos = renderer.viewportToGraph(event);
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
  renderer.on("upNode", handleUp);
  renderer.on("upStage", handleUp);

  // Click pour créer des nœuds
  renderer.on("clickStage", ({ event }) => {
    const coordForGraph = renderer.viewportToGraph({ x: event.x, y: event.y });
    const newNode = { ...coordForGraph, size: 10, color: chroma.random().hex() };
    const closest = graph.nodes().map(nodeId => {
      const attrs = graph.getNodeAttributes(nodeId);
      const distance = Math.pow(newNode.x - attrs.x, 2) + Math.pow(newNode.y - attrs.y, 2);
      return { nodeId, distance };
    }).sort((a, b) => a.distance - b.distance).slice(0, 2);
    const id = uuid();
    graph.addNode(id, newNode);
    closest.forEach(e => graph.addEdge(id, e.nodeId));
  });

  return { graph, layout, renderer };
}

