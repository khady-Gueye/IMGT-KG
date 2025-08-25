<template>
  
    <div class="block">
      <div class="block-header">
        <h3>{{ title }}</h3>
        <div class="actions">
          <button @click="fit">Recentrer</button>
          <button @click="exportPng">Exporter PNG</button>
        </div>
      </div>
      <GraphDisplay ref="gd" :triples="triples" :showRelations="true" />
    </div>
  </template>
  
  <script setup lang="ts">
  /* eslint-disable */
  import { ref, onMounted } from 'vue'
  import GraphDisplay from '@/components/shared/GraphDisplay.vue'
  import type { Triple } from '@/utils/Fonctions'
  
  const props = defineProps<{
    title: string
    triples: Triple[]
    fileName: string
  }>()
  
  const gd = ref<any>(null)
  const fit = () => gd.value?.fit?.()
  const exportPng = () => gd.value?.exportPng?.(props.fileName, 2)
  
  onMounted(() => fit())
  </script>
  
  <style scoped>
  .block { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
  .block-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .actions { display: flex; gap: 8px; }
  button { padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px; background: #f6f7f9; cursor: pointer; }
  button:hover { background: #eef2f7; }
  </style>
  