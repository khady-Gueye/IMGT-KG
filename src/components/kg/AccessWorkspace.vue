<!-- src/components/kg/AccessWorkspace.vue -->
<template>
  <section class="access-wrap">
    <v-navigation-drawer
      class="drawer"
      color="green"
      theme="dark"
      expand-on-hover
      rail
    >
      <v-list density="compact" nav>
        <v-list-item
          :active="section==='imgtkg'"
          prepend-icon="mdi-database-arrow-right"
          title="IMGT-KG"
          @click="section='imgtkg'"
        />
        <v-list-item
          :active="section==='mabkg'"
          prepend-icon="mdi-database"
          title="IMGT-MAB-KG"
          @click="section='mabkg'"
        />
      </v-list>
    </v-navigation-drawer>

    <div class="content">
      <component :is="currentView" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import KgAccess from './KgAccess.vue'
import MabKgAccess from './MabKgAccess.vue'

const section = ref<'imgtkg' | 'mabkg'>('imgtkg')
const currentView = computed(() => (section.value === 'imgtkg' ? KgAccess : MabKgAccess))
</script>

<style scoped>
.access-wrap {
  display: flex;
  min-height: 90vh;
  background: #f7f7f7;
}
.drawer {
  position: sticky;
  top: 0;
  height: 100vh;
}
.content {
  flex: 1;
  padding: 20px 0;
}
.content :deep(.v-container),
.content {
  width: 85%;
  margin: auto;
}
</style>
