<template>
  <div class="sidebar-filters">
    <h3 class="sidebar-title">Some Association Exploration</h3>
    
    <multiselect
      v-model="localFocusType"
      :options="focusOptions"
      :searchable="false"
      :close-on-select="true"
      :show-labels="false"
      placeholder="Choisir le type d'exploration"
      label="label"
      track-by="value"
      :multiple="false"
    />
    
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
        :class="{ activated: localShowRelations }"
        @click="toggleShowRelations"
        type="button"
      >
        {{ localShowRelations ? 'Hide relation names' : "Show relation names" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { nodeColor, type NodeType } from '@/utils/Fonctions'
import Multiselect from 'vue-multiselect'
/* eslint-disable */
const props = defineProps({
  entityTypes: Array,
  selectedTypes: Array,
  showRelations: Boolean,
  focusType: String
})

const emit = defineEmits(['update:selectedTypes', 'update:showRelations', 'update:focusType'])


// Options focusType disponibles
const focusOptions = [
  { label: 'Exploration Centered to MAB', value: 'mAb' },
  { label: 'Exploration Centered to Target', value: 'Target' },
  { label: 'Exploration Centered to MOA', value: 'MOA' },
]
// Pour le multiselect, on stocke l'objet complet
const localFocusType = ref(
  focusOptions.find(opt => opt.value === props.focusType) || focusOptions[0]
)

const localSelectedTypes = ref([...(props.selectedTypes ?? [])])
const localShowRelations = ref(props.showRelations ?? false)

// Watchers
watch(localSelectedTypes, val => emit('update:selectedTypes', val))
watch(localShowRelations, val => emit('update:showRelations', val))
watch(localFocusType, val => emit('update:focusType', val?.value || 'mAb'))

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

watch(() => props.focusType, val => {
  const option = focusOptions.find(opt => opt.value === val)
  if (option) {
    localFocusType.value = option
  }
})

function toggleShowRelations() {
  localShowRelations.value = !localShowRelations.value
}

function getColor(type: string) {
  return nodeColor(type as NodeType)
}
</script>

<style scoped>
.sidebar-filters {
  padding: 1rem;
}

.sidebar-title {
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
}

.entity-type-section {
  margin-top: 1.5rem;
}

.entity-type-section h4 {
  margin-bottom: 1rem;
  color: #333;
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
  width: 100%;
}

.toggle-relation-labels button.activated {
  background: #3498db;
  color: #fff;
}

.toggle-relation-labels button:hover {
  background: #2176ae;
  color: #fff;
}
</style>