<template>
  <AppHeader />
  <TabsNavigation
    :tabs="tabs"
    :currentTab="currentTab"
    @change-tab="currentTab = $event"
  />
  <main class="main-content">
    <component :is="currentView" @jump-to-explore="onJumpToExplore"/>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppHeader from './components/layout/AppHeader.vue'
import TabsNavigation from './components/layout/TabsNavigation.vue'
import HomeCover from './components/home/HomeCover.vue'
import GraphWorkspace from './components/kg/GraphWorkspace.vue' // <-- Utilise bien ce composant
// import AboutView from './components/home/AboutView.vue'  // <-- importe ton nouveau composant
import KgDesc from './components/kg/KgDesc.vue'
import { useExploreStore } from './store/explore'
import { nextTick } from 'vue'
// Définition des onglets
const tabs = [
  { id: 'home', label: 'Home', component: HomeCover },
  { id: 'explore', label: 'Explore', component: GraphWorkspace },
  { id: 'kgDesc', label: 'IMGT-KG-DESCRIPTION', component: KgDesc }, // 
]

const currentTab = ref('home')

// Calcul du composant à afficher
const currentView = computed(() =>
  tabs.find(tab => tab.id === currentTab.value)?.component || HomeCover
)

const exploreStore = useExploreStore()

function onJumpToExplore(payload?: { entity?: string }) {
  exploreStore.setEntity(payload?.entity ?? null) // mémorise l’entité
  currentTab.value = 'explore'                    // va sur Explore
  nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
}
</script>

<style scoped>
.main-content {
  width: 100vw;
  min-height: 90vh;
  margin: 0;
  padding: 0;
  background: #fff;
}
</style>
