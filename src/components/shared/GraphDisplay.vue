<template>
    <div class="graph-wrapper">
      <div class="network-container" ref="networkContainer"></div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, onMounted, onBeforeUnmount ,nextTick } from 'vue';
  import { initVisNetwork, type Triple } from '@/utils/Fonctions';
  /*eslint-disable */
  const props = defineProps<{ triples: Triple[] }>();
  const networkContainer = ref<HTMLElement | null>(null);
  let network: any = null;
  
  async function initializeNetwork() {
    if (networkContainer.value) {
      await nextTick(); //  Attend que le DOM soit prêt
      network?.destroy();
      const { network: net } = initVisNetwork(networkContainer.value, props.triples);
      network = net;
    }
  }
  
  onMounted(initializeNetwork);
  watch(() => props.triples, initializeNetwork);
  onBeforeUnmount(() => {
    network?.destroy();
  });
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