<template>
  <div id="sigma-container"></div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue';
import Sigma from 'sigma';
import Graph from 'graphology';


// eslint-disable-next-line
/* eslint-disable */
const props = defineProps({
  triples: {
    type: Array,
    required: true,
  },
});

const container = ref(null);
let sigmaInstance = null // <-- nouvelle variable pour stocker l'instance
function afficherGraph(triples) {
  const containerElement = container.value;
  if (!containerElement) {
    console.error("Le conteneur Sigma n'existe pas.");
    return;
  }
  
  if (sigmaInstance) {
    sigmaInstance.kill();
    sigmaInstance = null;
  }

  containerElement.innerHTML = "";
  // On crée un nouveau graphe
  const graph = new Graph();

  triples.forEach((triple, i) => {
    const { subject, relation, object } = triple;

    if (!graph.hasNode(subject)) {
      graph.addNode(subject, {
        label: subject,
        x: Math.cos(i),
        y: Math.sin(i),
        size: 10,
        color: '#FF0000'
      });
    }

    if (!graph.hasNode(object)) {
      graph.addNode(object, {
        label: object,
        x: Math.cos(i + 1),
        y: Math.sin(i + 1),
        size: 10,
        color: '#0000FF'
      });
    }

    const edgeId = `${subject}-${object}`;
    if (!graph.hasEdge(edgeId)) {
      graph.addEdge(subject, object, {
        label: relation,
        size: 1,
        color: '#000000'
      });
    }
  });

  new Sigma(graph, container.value, { renderEdgeLabels: true });
}

onMounted(() => {
  container.value = document.getElementById('sigma-container');
  if (!container.value) {
    console.error("sigma-container non trouvé !");
    return;
  }
  if (!props.triples || props.triples.length === 0) {
    console.log("Aucun triplet à afficher.");
    return;
  }
  afficherGraph(props.triples);
});

watch(() => props.triples, (newTriples) => {
  if (newTriples && newTriples.length > 0) {
    afficherGraph(newTriples);
  } else {
    console.warn("Aucun triple à afficher.");
  }
});
</script>

<style scoped>
#sigma-container {
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  border: 1px solid #ddd;
}

#graph-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px auto;
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #42b983;
  color: white;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
