<template>
  <div class="kg-layout">
    <!-- BARRE LATERALE -->
    <SidebarNav
      :navItems="navItems"
      :currentNav="currentNav"
      @select-nav="handleNav"
    >
      <SidebarFilters
        :entityTypes="allNodeTypes"
        :selectedTypes="selectedTypes"
        @update:selectedTypes="selectedTypes = $event"
      />
    </SidebarNav>

    <!-- ZONE CENTRALE -->
    <main class="kg-main">
      <h2 class="active-tab-title">
        {{ navItems.find(item => item.id === currentNav)?.label || '' }}
      </h2>
      <p class="tab-subtitle">
        {{ tabSubtitles[currentNav] || '' }}
      </p>

      <h1 class="centered-title">Exploration Centered to Monoclonal Antibody</h1>

      <div class="search-bar-center">
        <multiselect
          v-model="selectedMabs"
          :options="allMabOptions"
          :multiple="true"
          :searchable="true"
          placeholder="Sélectionnez un ou plusieurs mAb"
          label="label"
          track-by="id"
          :close-on-select="false"
        />
      </div>

      <GraphDisplay
        v-if="filteredResults.length && currentNav === 'imgt-mab-kg'"
        :triples="filteredResults"
        @node-click="handleShowDoc"
      />

      <button
        v-if="filteredResults.length"
        class="toggle-table-btn"
        @click="showTable = !showTable"
      >
        {{ showTable ? 'Masquer' : 'Afficher' }} le tableau
      </button>

      <div v-if="showTable && filteredResults.length" class="results-table">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Relation</th>
              <th>Object</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(result, index) in filteredResults" :key="index">
              <td>{{ result.subject }}</td>
              <td>{{ result.relation }}</td>
              <td>{{ result.object }}</td>
              <td>{{ result.type }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="currentNav === 'imgt-kg'" style="text-align:center; margin-top:3rem;">
        <h2>IMGT-KG (à venir)</h2>
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </main>

    <DocumentationDrawer
      :visible="drawerVisible"
      :entityIRI="currentIRI"
      :entityLabel="currentLabel"
      :docData="docData"
      :canGoBack="canGoBack"
      :canGoForward="canGoForward"
      @close="closeDocDrawer"
      @show-doc="handleShowDoc"
      @doc-back="handleDocBack"      
      @doc-forward="handleDocForward"
    />
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
import { onMounted, ref, computed, watch } from 'vue'
import SidebarNav from './SidebarNav.vue'
import SidebarFilters from './SidebarFilters.vue'
import GraphDisplay from '../shared/GraphDisplay.vue'
import { fetchData, replaceAllOccurrences, subjectNodeType, objectNodeType, type Triple } from '@/utils/Fonctions'
import { renderQuery, fetchMabsFromSparql } from '@/utils/queryLoader'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import DocumentationDrawer from './DocumentationDrawer.vue'
import { renderDocQuery } from '@/utils/queryLoader'
import { fetchDocData } from '@/utils/Fonctions'

const selectedMabs = ref<Array<{ id: string; label: string }>>([])
const allMabOptions = ref<Array<{ id: string; label: string }>>([])

const navItems = [
  { id: 'imgt-mab-kg', label: 'IMGT-MAB-KG' },
  { id: 'imgt-kg', label: 'IMGT-KG' }
]

const tabSubtitles = {
  'imgt-mab-kg': 'Knowledge Graph for Monoclonal Antibodies',
  'imgt-kg': 'Integrated Immunogenetics Knowledge Graph (coming soon)'
}

const currentNav = ref('imgt-mab-kg')
const query = ref('')
type TripleWithType = Triple & { type: string; objectType?: string }
const results = ref<TripleWithType[]>([])
const errorMessage = ref('')
const allNodeTypes = ref<string[]>([])
const selectedTypes = ref<string[]>([])
const showTable = ref(false)


const filteredResults = computed(() => {
  if (!selectedTypes.value.length) return results.value
  const selectedNodeIds = new Set<string>()
  results.value.forEach(triple => {
    if (selectedTypes.value.includes(triple.type)) {
      selectedNodeIds.add(triple.subject)
    }
    if (triple.objectType && selectedTypes.value.includes(triple.objectType)) {
      selectedNodeIds.add(triple.object)
    }
  })
  return results.value.filter(triple =>
    selectedNodeIds.has(triple.subject) || selectedNodeIds.has(triple.object)
  )
})

function handleNav(id: string) {
  currentNav.value = id
}

onMounted(async () => {
  try {
    allMabOptions.value = await fetchMabsFromSparql()
    console.log('allMabOptions:', allMabOptions.value);
  } catch (error) {
    errorMessage.value = "Erreur lors du chargement des mAbs"
    console.error(error)
  }
})

// --- Recherche automatique à chaque changement de sélection ---
watch(selectedMabs, () => {
  search()
})

async function search() {
  if (!selectedMabs.value.length) {
    errorMessage.value = "Veuillez sélectionner au moins un mAb."
    results.value = []
    return
  }

  errorMessage.value = ''
  results.value = []

  try {
    const sparqlQuery = await renderQuery("/templates/query.rq", selectedMabs.value)
    const csvData = await fetchData(sparqlQuery)
    console.log('SPARQL envoyée :', sparqlQuery)
    const parsed = parseCSVResults(csvData)
    console.log('CSV reçu :', csvData)
    const enriched: TripleWithType[] = parsed.map(triple => {
      const subjectType = subjectNodeType(triple.subject, triple.relation)
      const objType = objectNodeType(triple.relation)
      return {
        ...triple,
        type: subjectType,
        objectType: objType !== 'defaultnode' ? objType : undefined
      }
    })

    results.value = enriched

    const typesSet = new Set<string>()
    enriched.forEach(triple => {
      typesSet.add(triple.type)
      if (triple.objectType) {
        typesSet.add(triple.objectType)
      }
    })
    const uniqueTypes = Array.from(typesSet).filter(type => type !== 'defaultnode')
    allNodeTypes.value = uniqueTypes
    selectedTypes.value = [...uniqueTypes]

    query.value = ""
    showTable.value = false
  } catch (error) {
    errorMessage.value = (error as Error).message
    results.value = []
    console.error("Search error:", error)
  }
}

function parseCSVResults(csv: string): Triple[] {
  if (!csv || typeof csv !== 'string') return []
  const lines = csv.split('\n').map(line => line.trim()).filter(line => line)
  if (lines.length < 2) return []
  const headers = lines[0].split(',')
  const requiredHeaders = ['subject', 'relation', 'object']
  for (const rh of requiredHeaders) {
    if (!headers.includes(rh)) {
      errorMessage.value = `Erreur CSV : en-tête '${rh}' manquant.`
      return []
    }
  }
  return lines.slice(1).map(line => {
    const values = line.split(',')
    return {
      subject: replaceAllOccurrences(values[headers.indexOf("subject")] || ""),
      relation: replaceAllOccurrences(values[headers.indexOf("relation")] || ""),
      object: replaceAllOccurrences(values[headers.indexOf("object")] || "")
    }
  })  
}

// === Gestion documentation drawer ===

// === Drawer ===
type DocDataRow = {
  property: string
  propertyLabel: string | null
  value: string
  valueLabel: string | null
}
const docData = ref<DocDataRow[]>([])
const currentIRI = ref('')
const currentLabel = ref('')
const drawerVisible = ref(false)

const backStack = ref<string[]>([])
const forwardStack = ref<string[]>([])
const canGoBack = computed(() => backStack.value.length > 0)
const canGoForward = computed(() => forwardStack.value.length > 0)

async function handleShowDoc(iri: string, options = { resetForward: true }) {
  if (drawerVisible.value && iri !== currentIRI.value && currentIRI.value) {
    backStack.value.push(currentIRI.value)
    if (options.resetForward) forwardStack.value = []
  }

  currentIRI.value = iri
  try {
    const query = await renderDocQuery(iri)
    const results = await fetchDocData(query)
    docData.value = results
    const labelRow = results.find(r => r.property?.includes('#label') || r.propertyLabel?.toLowerCase() === 'label')
    currentLabel.value = labelRow?.valueLabel || labelRow?.value || shortenURI(iri)
  } catch (e) {
    docData.value = []
    currentLabel.value = shortenURI(iri)
  }
  drawerVisible.value = true
}

async function handleDocBack() {
  const previous = backStack.value.pop()
  if (previous) {
    forwardStack.value.push(currentIRI.value)
    await handleShowDoc(previous, { resetForward: false })
  }
}

async function handleDocForward() {
  const next = forwardStack.value.pop()
  if (next) {
    backStack.value.push(currentIRI.value)
    await handleShowDoc(next, { resetForward: false })
  }
}

function closeDocDrawer() {
  drawerVisible.value = false
  backStack.value = []
  forwardStack.value = []
}

function shortenURI(uri?: string | null): string {
  if (!uri) return '(inconnu)'
  return uri.replace(/^.*[#/]/, '')
}


</script>

<style scoped>
.kg-layout {
  display: flex;
  height: 100vh;
}
.kg-main {
  flex: 1;
  background: #fff;
  padding: 2rem 3rem;
  overflow-y: auto;
}
.centered-title {
  text-align: center;
  color: #3498db;
  font-size: 1.3rem;
  margin-bottom: 2rem;
  font-weight: bold;
}
.search-bar-center {
  width: 80%;
  margin: 0 auto 2rem;
  display: flex;
  gap: 1rem;
}
.toggle-table-btn {
  margin: 1rem 0;
  font-size: 1.1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  cursor: pointer;
}
.results-table {
  width: 90%;
  margin: 0 auto;
}
.results-table table {
  width: 100%;
  border-collapse: collapse;
}
.results-table th, .results-table td {
  border: 1px solid #ddd;
  padding: 0.7rem;
  text-align: left;
}
.results-table th {
  background: #42b983;
  color: white;
}
.error {
  color: red;
  margin-top: 10px;
}
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
  font-weight: 400;
  font-style: italic;
}
</style>
