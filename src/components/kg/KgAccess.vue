<!-- src/components/kg/KgAccess.vue -->
<template>
  <section class="kg-access">
    <!-- Titre -->
    <v-row>
      <v-col>
        <v-card class="card-title mx-auto w-100">
          <div class="title text-h5 text-center p-20">IMGT-KG Access</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Intro -->
    <v-row>
      <v-col>
        <v-card>
          <v-card-item>
            <p>
              This page provides access to <strong>IMGT-KG</strong> data. The interface is powered by
              <v-chip class="ma-0 v-chip-link" color="primary" label>
                <a href="https://yasgui.triply.cc/" target="_blank" rel="noopener">YASGUI</a>
              </v-chip>.
              You can also access the
              <v-chip class="ma-0 v-chip-link" color="primary" label>
                <a href="https://www.imgt.org/fuseki/#/dataset/ImgtKg/query" target="_blank" rel="noopener">IMGT-KG SPARQL Endpoint Server</a>
              </v-chip>
              using Apache Jena Fuseki / TDB.
            </p>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- Exemples de requêtes -->
    <v-row>
      <v-col>
        <v-card class="mx-auto">
          <div class="title text-h6 text-center p-20">SPARQL Query examples</div>
          <v-list>
            <v-list-item
              v-for="(item, i) in items"
              :key="i"
              :value="item"
              active-color="primary"
              rounded="shaped"
              @click="setQueryFromFile(item.req)"
            >
              <template #prepend><v-icon icon="mdi-database-search-outline" /></template>
              <v-list-item-title v-text="item.text" />
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- YASGUI -->
    <v-row>
      <v-col>
        <v-card>
          <v-card-item>
            <div id="yasgui-kg"></div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

type ExampleItem = { text: string; req: string }
const items = ref<ExampleItem[]>([
  { text: 'Find information on the genes/alleles functionality…', req: '/Queries/Query_scenario_1.rq' },
  { text: 'Explore crystal structures and external links…',      req: '/Queries/Query_scenario_2.rq' },
  { text: 'Find the COVID-19 spike protein and related data…',   req: '/Queries/Query_scenario_3.rq' },
  { text: 'Select an Allele which is partial…',                  req: '/Queries/Query1.rq' },
  { text: 'Why a gene is pseudogene based on qualifier',         req: '/Queries/Query2.rq' },
  { text: 'Select genes without a given feature',                req: '/Queries/Query3.rq' },
  { text: 'Groups, genes, alleles and CDR3-IMGT length',         req: '/Queries/Query4.rq' },
  { text: 'Pseudogenes without L-PART-1',                        req: '/Queries/Query5.rq' },
  { text: 'Chains and their alleles with properties',            req: '/Queries/Query6.rq' },
  { text: 'Detailed chain description and allele association',   req: '/Queries/Query7.rq' },
  { text: 'Unification of nucleotide & amino-acid sequences',    req: '/Queries/Query8.rq' },
  { text: 'Structures with biblio refs + external links',        req: '/Queries/Query9.rq' },
  { text: 'Crystal structures & related annotations',            req: '/Queries/Query10.rq' },
  { text: 'Description of a particular chain (chain-1QLFA)',     req: '/Queries/Query11.rq' },
])

/** charge un <script> externe une seule fois */
function loadScript (src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src; s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Fail load: ${src}`))
    document.head.appendChild(s)
  })
}
/** charge une feuille de style externe une seule fois */
function loadCss (href: string): void {
  if (document.querySelector(`link[href="${href}"]`)) return
  const l = document.createElement('link')
  l.rel = 'stylesheet'; l.href = href
  document.head.appendChild(l)
}

let yasgui: any = null
let yasqe: any = null

onMounted(async () => {
  // CSS + script YASGUI (CDN)
  loadCss('https://unpkg.com/@triply/yasgui/build/yasgui.min.css')
  await loadScript('https://unpkg.com/@triply/yasgui/build/yasgui.min.js')

  // Crée une instance isolée (pas de persistance précédente)
  const Y: any = (window as any).Yasgui
  if (!Y) return console.error('Yasgui non chargé')

  // Optionnel: vider juste la persistance YASGUI de cette page
  try {
  localStorage.removeItem('yasgui__kg-access')
} catch (e) {
  /* on ignore l'erreur (mode privé, quota, etc.) */ 
  void e; // évite le bloc vide
}


  yasgui = new Y(document.getElementById('yasgui-kg'), {
    // crée une zone de persistance dédiée (ne réutilise pas d’anciens onglets)
    persistenceId: 'kg-access',
    requestConfig: {
      endpoint: 'https://www.imgt.org/fuseki/ImgtKg/sparql',
    },
    copyEndpointOnNewTab: true,
    autofocus: false,
    yasr: {
      prefixes: {
        imgt: 'https://www.imgt.org/imgt-ontology#',
        ncit: 'http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#',
        obo:  'http://purl.obolibrary.org/obo/',
        faldo:'http://biohackathon.org/resource/faldo#',
        owl:  'http://www.w3.org/2002/07/owl#',
        skos: 'http://www.w3.org/2004/02/skos/core#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        bibo: 'http://purl.org/ontology/bibo/',
      },
      maxLines: 30,
    },
  })

  // premier onglet courant
  const tab = yasgui.getTab()
  yasqe = tab?.yasqe

  // prefixes utilitaires
  if (yasqe?.addPrefixes) {
    yasqe.addPrefixes({
      imgt: 'https://www.imgt.org/imgt-ontology#',
      ncit: 'http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#',
      skos: 'http://www.w3.org/2004/02/skos/core#',
      obo:  'http://purl.obolibrary.org/obo/',
      faldo:'http://biohackathon.org/resource/faldo#',
      owl:  'http://www.w3.org/2002/07/owl#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    })
  }
})

/** Charge un fichier .rq du dossier /public/Queries et lance la requête */
async function setQueryFromFile (file: string) {
  try {
    if (!yasqe) return
    const res  = await fetch(file)
    const text = await res.text()
    yasqe.setValue(text)
    yasqe.query()
    yasqe.collapsePrefixes(true)
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
.kg-access { background: #f7f7f7; padding: 20px 0; }
.kg-access :deep(.v-container), .kg-access { width: 85%; margin: auto; }

#yasgui-kg {
  width: 100%;
  min-height: 600px;
}
.title { padding: 20px; }
.v-chip-link a { font-weight: 600; }
</style>
