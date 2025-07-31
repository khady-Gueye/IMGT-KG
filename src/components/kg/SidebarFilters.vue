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
      <div class="toggle-relation-labels">
        <button
         :class="{ activated: localShowRelations}"
         @click="toggleShowRelations"
         type="button"
          >
          {{ localShowRelations ? 'Hide relation name' : "Print relation name" }}
         </button>

      </div>
      
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  import { nodeColor, type NodeType } from '@/utils/Fonctions'
  /* eslint-disable */
  const props = defineProps({
    entityTypes: Array,
    selectedTypes: Array,
    showRelations: Boolean
  })
  const emit = defineEmits(['update:selectedTypes', 'update:showRelations'])
  
  const localSelectedTypes = ref([...(props.selectedTypes ?? [])])
  // Déclaration de l'état local pour le toggle des relations
  const localShowRelations = ref(props.showRelations ?? false)  // copie de props.selectedTypes(qui est déja un tableau) ou un tableau vide
  
  watch(localSelectedTypes, val => emit('update:selectedTypes', val))
  watch(localShowRelations, val => emit('update:showRelations', val))
  watch(
    () => props.selectedTypes,
    val => {
      if (JSON.stringify(val) !== JSON.stringify(localSelectedTypes.value)) {
        localSelectedTypes.value = [...val]
      }
    }
  )
  watch(
  () => props.showRelations,
  val => localShowRelations.value = val
)


function toggleShowRelations() {
  localShowRelations.value = !localShowRelations.value;
}

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
  .toggle-relation-labels {
  margin-top: 1.5em;
  text-align: left;
}

.toggle-relation-labels button {
  background: #eafaf1;
  color: #3498db;
  padding: 0.5em 1.1em;
  border: 1px solid #bde3e6;
  border-radius: 22px;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.toggle-relation-labels button.activated {
  background: #3498db;
  color: #fff;
}


  </style>
  