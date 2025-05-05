<template>
  <div class="graph-wrapper">
    <!-- Graphe et légende côte à côte -->
    <div class="network-container" ref="networkContainer"></div>
    <aside class="legend-container">
      <h3>Filtrer par type</h3>
      <!-- Case "Tout sélectionner/désélectionner" -->
      <label class="legend-item">
        <input
          type="checkbox"
          v-model="allSelected"
          @change="toggleAll"
        />
        <span>Tout (dé)sélectionner</span>
      </label>
      <div v-for="type in uniqueNodeTypes" :key="type" class="legend-item">
        <input
          type="checkbox"
          :value="type"
          v-model="selectedTypes"
          :id="`filter-${type}`"
        />
        <label
          :for="`filter-${type}`"
          :style="{ color: COLORS[type] }"
        >
          <span
            class="color-box"
            :style="{ backgroundColor: COLORS[type] }"
          ></span>
          {{ type }}
        </label>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-undef */
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { initVisNetwork, nodeType, COLORS, type Triple } from '@/utils/Fonctions';

const props = defineProps<{ triples: Triple[] }>();
const networkContainer = ref<HTMLElement | null>(null);
let network: any = null;

const uniqueNodeTypes = computed(() => {
  const types = new Set<string>();
  props.triples.forEach(triple => {
    types.add(nodeType(triple.relation));
  });
  return Array.from(types);
});

const selectedTypes = ref<string[]>([]);
const allSelected = ref(true);

// Initialisation des filtres sur tous les types
watch(uniqueNodeTypes, types => {
  if (allSelected.value) selectedTypes.value = [...types];
});

// Computed pour filtrer les triples selon la sélection
const filteredTriples = computed(() => {
  return props.triples.filter(triple =>
    selectedTypes.value.includes(nodeType(triple.relation))
  );
});

function toggleAll() {
  if (allSelected.value) {
    selectedTypes.value = [...uniqueNodeTypes.value];
  } else {
    selectedTypes.value = [];
  }
}

function initializeNetwork() {
  if (networkContainer.value) {
    network?.destroy();
    const { network: net } = initVisNetwork(networkContainer.value, filteredTriples.value);
    network = net;
  }
}

onMounted(initializeNetwork);
watch([() => props.triples, selectedTypes], initializeNetwork);
onBeforeUnmount(() => { network?.destroy(); });
</script>

<style scoped>
.graph-wrapper {
  display: flex;
  width: 100%;
  height: 80vh;
}

.network-container {
  flex: 1;
  border: 1px solid #ddd;
  background-color: #fff;
}

.legend-container {
  width: 200px;
  padding: 10px;
  border-left: 1px solid #ccc;
  background-color: #fafafa;
}

.legend-container h3 {
  margin-top: 0;
  font-size: 1.1em;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 8px 0;
}

.color-box {
  width: 16px;
  height: 16px;
  border: 1px solid #333;
  margin-right: 6px;
  border-radius: 3px;
}
</style>
