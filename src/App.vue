<template>
  <AppHeader />
  <TabsNavigation
    :tabs="tabs"
    :currentTab="currentTab"
    @change-tab="currentTab = $event"
  />
  <main class="main-content">
    <component :is="currentView" />
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppHeader from './components/layout/AppHeader.vue'
import TabsNavigation from './components/layout/TabsNavigation.vue'
import HomeCover from './components/home/HomeCover.vue'
import GraphWorkspace from './components/kg/GraphWorkspace.vue' // <-- Utilise bien ce composant

// Définition des onglets
const tabs = [
  { id: 'home', label: 'Home', component: HomeCover },
  { id: 'explore', label: 'Explore', component: GraphWorkspace }
]
const currentTab = ref('home')

// Calcul du composant à afficher
const currentView = computed(() =>
  tabs.find(tab => tab.id === currentTab.value)?.component || HomeCover
)
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
