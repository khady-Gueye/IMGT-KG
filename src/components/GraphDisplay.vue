<template>
  <div id="sigma-container"></div>
</template>

<script setup>
import { onMounted, watch, ref, onBeforeUnmount } from 'vue';
import { initSigmaGraph } from '../utils/Fonctions.js';
import { nodeType, nodeColor ,COLORS ,filterInverseEdges} from '../utils/Fonctions.js';
console.log("COULEURS DISPONIBLES :", COLORS);

// eslint-disable-next-line
const props = defineProps({
  triples: {
    type: Array,
    required: true,
  },
});

const container = ref(null);
let graphHandler = null;


// Fonction pour enrichir les triples avec type et couleur
function enrichTriples(triples) {
  const filtered = filterInverseEdges(triples); // 👈 Ici on filtre les inverses
  return filtered.map(triple => ({
    ...triple,
    type: nodeType(triple.relation), // Déterminer le type de noeud
    color: nodeColor(triple.relation), // Obtenir la couleur associée à la relation
  }));
}


onMounted(() => {
  container.value = document.getElementById('sigma-container');
  if (!container.value) {
    console.error("sigma-container non trouvé !");
    return;
  }

  if (props.triples && props.triples.length > 0) {
    const enriched = enrichTriples(props.triples);
    graphHandler = initSigmaGraph(container.value, enriched);
  }
});

watch(() => props.triples, (newTriples) => {
  if (!container.value) return;

  // Si un graphe existait, on le détruit avant d'en créer un nouveau.
  if (graphHandler) {
    graphHandler.destroy();
    graphHandler = null;
  }

  if (newTriples && newTriples.length > 0) {

    const enriched = enrichTriples(props.triples);
    graphHandler = initSigmaGraph(container.value, enriched);
  }
});

onBeforeUnmount(() => {
  if (graphHandler) {
    graphHandler.destroy();
  }
});
</script>

<style scoped>
#sigma-container {
  width: 100%;
  height: 100vh;
  border: 1px solid #ddd;
}
</style>
