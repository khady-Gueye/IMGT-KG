<!-- src/components/kg/AccessWorkspace.vue -->
<template>
  <div class="kg-layout">
    <!-- BARRE LATERALE (pliable) -->
    <aside class="kg-sidebar" :class="{ collapsed }">
      <!-- Bouton EN HAUT À DROITE -->
      <v-btn
        icon
        variant="flat"
        size="small"
        class="collapse-handle"
        :aria-expanded="!collapsed"
        :title="collapsed ? 'Déplier' : 'Replier'"
        @click="collapsed = !collapsed"
      >
        <v-icon :icon="collapsed ? 'mdi-chevron-right' : 'mdi-chevron-left'" />
      </v-btn>

      <!-- Navigation latérale, même look que Explore -->
      <SidebarNav
        :navItems="navItems"
        :currentNav="currentNav"
        @select-nav="(id: SubTab) => currentNav = id"
      />
    </aside>

    <!-- CONTENU PRINCIPAL -->
    <!-- <main class="kg-main">
      <h2 class="active-tab-title">
        {{ navItems.find((n: NavItem) => n.id === currentNav)?.label || '' }}
      </h2>
      <p class="tab-subtitle">
        {{ currentNav === 'imgtkg'
            ? 'IMGT-KG – accès SPARQL'
            : 'IMGT/MAB-KG – accès SPARQL' }}
      </p> -->

      <!-- Important : :key="currentNav" pour forcer le remount et isoler l’état -->
      <KgAccess v-if="currentNav === 'imgtkg'" :key="'imgtkg'" />
      <MabKgAccess v-else :key="'mabkg'" />
    <!-- </main> -->
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import SidebarNav from './SidebarNav.vue'
import KgAccess from './KgAccess.vue'
import MabKgAccess from './MabKgAccess.vue'

type SubTab = 'imgtkg' | 'mabkg'
const currentNav = ref<SubTab>('imgtkg')

const navItems = [
  { id: 'imgtkg', label: 'IMGT-KG',     icon: 'mdi-database' },
  { id: 'mabkg',  label: 'IMGT-MAB-KG', icon: 'mdi-database-outline' },
]

/** Etat plié/déplié de la barre */
const collapsed = ref(false)

/** (Optionnel) Nettoyage léger au switch si besoin (ex: clés YASGUI du localStorage)
    -> Tu peux laisser vide ou cibler les clés commençant par 'YASGUI_' si nécessaire. */
watch(currentNav, () => {
  // Exemple si tu veux nettoyer YASGUI uniquement :
  // Object.keys(localStorage).forEach(k => { if (k.startsWith('YASGUI_')) localStorage.removeItem(k) })
})
</script>

<style scoped>
/* ---- Layout principal ---- */
.kg-layout {
  display: flex;
  min-height: 100vh;
}

/* ---- Sidebar pliable ---- */
.kg-sidebar {
  position: relative;
  width: 300px;              /* largeur ouverte */
  min-width: 300px;
  transition: width .25s ease, min-width .25s ease;
  border-right: 1px solid #eee;
  background: #fff;
  overflow: hidden;          /* masque le contenu quand c'est plié */
  z-index: 1;
  padding-top: 44px;         /* espace pour le bouton en haut */
}

/* Bouton (poignée) en haut à droite */
.collapse-handle {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  box-shadow: 0 2px 6px rgba(0,0,0,.12);
  border-radius: 999px;
}

/* Etat replié – style "rail" */
.kg-sidebar.collapsed {
  width: 64px;
  min-width: 64px;
}

/* Déploiement visuel au survol quand replié (comme un rail expand-on-hover) */
.kg-sidebar.collapsed:hover {
  width: 300px;
  min-width: 300px;
}

/* Atténuer le contenu interne quand c’est replié (sauf le bouton) */
.kg-sidebar.collapsed > *:not(.collapse-handle) {
  opacity: 0;
  pointer-events: none;
}
.kg-sidebar.collapsed:hover > *:not(.collapse-handle) {
  opacity: 1;
  pointer-events: auto;
}

/* ---- Zone centrale ---- */
.kg-main {
  flex: 1;
  background: #fff;
  padding: 2rem 3rem;
  overflow-y: auto;
}

/* ---- Titres (mêmes styles que Explore) ---- */
.active-tab-title {
  text-align: center;
  color: #3498db;
  font-size: 1.4rem;
  margin-bottom: 0.3rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.tab-subtitle {
  text-align: center;
  color: #555;
  font-size: 1.1rem;
  margin-bottom: 1.2rem;
  font-style: italic;
}
</style>
