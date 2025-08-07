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
        :showRelations="showRelationLabels"
        @update:selectedTypes="selectedTypes = $event"
        @update:showRelations="showRelationLabels = $event"
        :focusType="focusType"
        @update:focusType="handleFocusTypeChange"
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

      <h1 class="centered-title">Exploration Centered on {{ focusTypeLabel }}</h1>

      <div class="search-bar-center">
        <multiselect
          v-if="currentExplorationConfig"
          v-model="currentExplorationConfig.selectedRef.value"
          :options="currentExplorationConfig.optionsRef.value"
          :multiple="true"
          :searchable="true"
          :placeholder="`Sélectionnez un ou plusieurs ${currentExplorationConfig.label}`"
          label="label"
          track-by="id"
          :close-on-select="false"
        />
      </div>

      <GraphDisplay
        v-if="filteredResults.length && currentNav === 'imgt-mab-kg'"
        :triples="filteredResults"
        :showRelations="showRelationLabels"
        @node-click="handleShowDoc"
      />

      <!-- Dropdown pour le tableau -->
      <div class="table-section" v-if="filteredResults.length">
        <div class="section-header" @click="toggleTableDropdown">
          <h4>
            Data Table 
            <span class="dropdown-arrow" :class="{ 'open': showTable }">▼</span>
          </h4>
        </div>
        
        <div class="dropdown-content" v-show="showTable">
          <div class="results-table">
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
                <tr v-for="result in filteredResults" :key="result.subject + '-' + result.relation + '-' + result.object">
                  <td>{{ result.subject }}</td>
                  <td>{{ result.relation }}</td>
                  <td>{{ result.object }}</td>
                  <td>{{ result.type }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
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
import { onMounted, ref, computed, watch } from 'vue'
import SidebarNav from './SidebarNav.vue'
import SidebarFilters from './SidebarFilters.vue'
import GraphDisplay from '../shared/GraphDisplay.vue'
import { fetchData, replaceAllOccurrences, subjectNodeType, objectNodeType, type Triple } from '@/utils/Fonctions'
import { 
  renderQuery, 
  fetchMabsFromSparql, 
  fetchTargetsFromSparql, 
  fetchMOAsFromSparql,
  renderDocQuery
} from '@/utils/queryLoader'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import DocumentationDrawer from './DocumentationDrawer.vue'
import { fetchDocData } from '@/utils/Fonctions'
/* eslint-disable */
// Types
type FocusType = 'mAb' | 'Target' | 'MOA'
type TripleWithType = Triple & { type: string; objectType?: string }

interface ExplorationConfig {
  value: FocusType
  label: string
  templateUrl: string
  fetchFunction: () => Promise<Array<{ id: string; label: string }>>
  selectedRef: Ref<Array<{ id: string; label: string }>>
  optionsRef: Ref<Array<{ id: string; label: string }>>
  
}

// États de base
const showRelationLabels = ref(false)
const navItems = [
  { id: 'imgt-mab-kg', label: 'IMGT-MAB-KG' },
  { id: 'imgt-kg', label: 'IMGT-KG' }
]

const tabSubtitles = {
  'imgt-mab-kg': 'Knowledge Graph for Monoclonal Antibodies',
  'imgt-kg': 'Integrated Immunogenetics Knowledge Graph (coming soon)'
}

const currentNav = ref('imgt-mab-kg')
const focusType = ref<FocusType>('mAb')

// États pour chaque type d'exploration
const selectedMabs = ref<Array<{ id: string; label: string }>>([])
const selectedTargets = ref<Array<{ id: string; label: string }>>([])
const selectedMOA = ref<Array<{ id: string; label: string }>>([])

const allMabOptions = ref<Array<{ id: string; label: string }>>([])
const allTargetOptions = ref<Array<{ id: string; label: string }>>([])
const allMOAOptions = ref<Array<{ id: string; label: string }>>([])


// Configuration unifiée des explorations
const explorationConfigs: Record<FocusType, ExplorationConfig> = {
  mAb: {
    value: 'mAb',
    label: 'mAb',
    templateUrl: '/templates/query.rq',
    fetchFunction: fetchMabsFromSparql,
    selectedRef: selectedMabs,
    optionsRef: allMabOptions
  },
  Target: {
    value: 'Target',
    label: 'Target',
    templateUrl: '/templates/queryTarget.rq',
    fetchFunction: fetchTargetsFromSparql,
    selectedRef: selectedTargets,
    optionsRef: allTargetOptions
  },
  MOA: {
    value: 'MOA',
    label: 'MOA',
    templateUrl: '/templates/queryMoa.rq',
    fetchFunction: fetchMOAsFromSparql,
    selectedRef: selectedMOA,
    optionsRef: allMOAOptions
  }
  
}

console.log('Options chargées pour Target:', allTargetOptions.value)
console.log('Options chargées pour MOA:', allMOAOptions.value)
// Observe les changements de options
watch(allTargetOptions, (newOptions) => {
  console.log('allTargetOptions updated:', newOptions)
})

// Observe les changements dans la sélection
watch(selectedTargets, (newSelection) => {
  console.log('selectedTargets changed:', newSelection)
})


// États pour les résultats
const results = ref<TripleWithType[]>([])
const errorMessage = ref('')
const allNodeTypes = ref<string[]>([])
const selectedTypes = ref<string[]>([])
const showTable = ref(false)

// Computed properties
const currentExplorationConfig = computed(() => explorationConfigs[focusType.value])

const focusTypeLabel = computed(() => {
  const config = explorationConfigs[focusType.value]
  return config ? `${config.label}` : ''
})

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

// Fonctions
function handleNav(id: string) {
  currentNav.value = id
}

function toggleTableDropdown() {
  showTable.value = !showTable.value
}

async function loadOptionsForFocusType(focusType: FocusType) {
  const config = explorationConfigs[focusType]
  if (config && config.optionsRef.value.length === 0) {
    try {
      config.optionsRef.value = await config.fetchFunction()
      console.log(`Options chargées pour ${config.label}:`, config.optionsRef.value)
    } catch (error) {
      errorMessage.value = `Erreur lors du chargement des ${config.label}`
      console.error(error)
    }
  }
}

function handleFocusTypeChange(newFocus: FocusType) {
  console.log('Changement de focus type vers:', newFocus)
  focusType.value = newFocus
  
  // Vide toutes les sélections
  Object.values(explorationConfigs).forEach(config => {
    config.selectedRef.value = []
  })
  
  // Charge les options pour le nouveau type
  loadOptionsForFocusType(newFocus)
  
  // Efface les résultats précédents
  results.value = []
  allNodeTypes.value = []
  selectedTypes.value = []
}

async function search() {
  errorMessage.value = ''
  results.value = []

  const config = explorationConfigs[focusType.value]
  if (!config) {
    errorMessage.value = `Type d'exploration non supporté: ${focusType.value}`
    return
  }

  const entities = config.selectedRef.value
  if (!entities.length) {
    errorMessage.value = `Veuillez sélectionner au moins un ${config.label}.`
    return
  }

  try {
    const sparqlQuery = await renderQuery(config.templateUrl, entities)
    console.log(`Requête SPARQL pour ${config.label}:`, sparqlQuery)
    const csvData = await fetchData(sparqlQuery)
    console.log(`CSV reçu pour ${config.label} :`, csvData)
    console.log('SPARQL envoyée :', sparqlQuery)
    const parsed = parseCSVResults(csvData)
    

    console.log('CSV reçu :', csvData)
    
    // Enrichir type d'entités
    const enriched = parsed.map(triple => ({
      ...triple,
      type: subjectNodeType(triple.subject, triple.relation),
      objectType: (objectNodeType(triple.relation) !== 'defaultnode') 
        ? objectNodeType(triple.relation) 
        : undefined,
    }))

    results.value = enriched
    
    // Met à jour la liste des types visibles
    const typesSet = new Set<string>()
    enriched.forEach(triple => {
      typesSet.add(triple.type)
      if (triple.objectType) {
        typesSet.add(triple.objectType)
      }
    })
    allNodeTypes.value = Array.from(typesSet).filter(t => t !== 'defaultnode')
    selectedTypes.value = [...allNodeTypes.value]

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

// Lifecycle
onMounted(async () => {
  await loadOptionsForFocusType(focusType.value)
})

// Watchers
watch(focusType, async (newFocusType) => {
  await loadOptionsForFocusType(newFocusType)
})

// Watch pour déclencher la recherche quand les sélections changent
watch([selectedMabs, selectedTargets, selectedMOA], () => {
  search()
})

// === Gestion documentation drawer ===
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

.table-section {
  margin: 2rem 0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.section-header {
  background: #f8f9fa;
  padding: 0.75rem 1rem;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.section-header:hover {
  background: #e9ecef;
}

.section-header h4 {
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  color: #333;
}

.dropdown-arrow {
  transition: transform 0.3s ease;
  font-size: 0.8rem;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-content {
  padding: 1rem;
  background: white;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-table {
  width: 100%;
  margin: 0;
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
  font-style: italic;
}
</style>