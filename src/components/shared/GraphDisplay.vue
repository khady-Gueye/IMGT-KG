<template>
  <div class="graph-wrapper">
    <div class="network-container" ref="networkContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount ,nextTick } from 'vue';
import { initVisNetwork, type Triple } from '@/utils/Fonctions';
/*eslint-disable */
const emit = defineEmits<{
(e: 'node-click', iri: string): void
}>()
/*eslint-disable */
const props = defineProps<{
   triples: Triple[]
   showRelations: boolean
 }>();

const networkContainer = ref<HTMLElement | null>(null);
let network: any = null;

async function initializeNetwork() {
if (networkContainer.value) {
  await nextTick();
  network?.destroy();

  const { network: net } = initVisNetwork(
    networkContainer.value,
    props.triples,
    (clickedNodeId: string) => {
      // ⚡ Émet vers le parent (GraphWorkspace)
      emit('node-click', clickedNodeId)
    },
      props.showRelations ?? false   // On le met en 4em argument pour afficher ou non les relations
  );

  network = net;
}
}
// Nouveau watcher spécifique pour showRelations
watch(() => props.showRelations, (newValue) => {
  if (network) {
    // Mettre à jour les labels des edges sans réinitialiser tout le réseau
    const edges = network.body.data.edges;
    const updates = edges.get().map((edge: any) => ({
      id: edge.id,
      label: newValue ? edge.originalLabel : ''
    }));
    edges.update(updates);
  }
});

onMounted(initializeNetwork);
onBeforeUnmount(() => {
  network?.destroy();
})
watch(() => props.triples, initializeNetwork)
watch(() => props.showRelations,initializeNetwork) 
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
</style>