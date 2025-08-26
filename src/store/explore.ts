import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExploreStore = defineStore('explore', () => {
  const selectedEntity = ref<string | null>(null) // 'Antibody' | 'Target' | 'MOA' | 'Product' | 'Gene' | 'Allele'
  function setEntity(entity: string | null) { selectedEntity.value = entity }
  return { selectedEntity, setEntity }
})
