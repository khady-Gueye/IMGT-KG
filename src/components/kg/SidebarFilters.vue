<template>
    <div class="sidebar-filters">
      <h3 class="sidebar-title">Some Association Exploration</h3>
      <div class="entity-type-section">
        <h4>Entity Type Selection</h4>
        <div v-for="type in entityTypes" :key="type" class="filter-checkbox">
          <input
            type="checkbox"
            :id="type"
            :value="type"
            v-model="localSelectedTypes"
          />
          <label
            :for="type"
            :style="{ color: getColor(type) }"
          >
            {{ type }}
          </label>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  import { nodeColor, type NodeType } from '@/utils/Fonctions'
  /* eslint-disable */
  const props = defineProps({
    entityTypes: Array,
    selectedTypes: Array
  })
  const emit = defineEmits(['update:selectedTypes'])
  
  const localSelectedTypes = ref([...props.selectedTypes])
  
  watch(localSelectedTypes, val => emit('update:selectedTypes', val))
  
  watch(
    () => props.selectedTypes,
    val => {
      if (JSON.stringify(val) !== JSON.stringify(localSelectedTypes.value)) {
        localSelectedTypes.value = [...val]
      }
    }
  )
  
  function getColor(type: string) {
    return nodeColor(type as NodeType)
  }
  </script>
  
  <style scoped>
  .sidebar-title {
    color: #d7263d;
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
  }
  .entity-type-section {
    margin-top: 1.5rem;
  }
  .filter-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.6rem;
  }
  </style>
  