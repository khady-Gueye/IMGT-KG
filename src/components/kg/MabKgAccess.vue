<template>
  <section class="mabkgaccess-page">
    <v-container fluid class="zone-main pa-4">
      <!-- Titre -->
      <v-row>
        <v-col>
          <v-card class="card-title mx-auto w-100">
            <div class="title text-h5 text-center p-20">IMGT/MAB-KG Access</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Intro -->
      <v-row>
        <v-col>
          <v-card class="pa-4">
            <p>
              This page provide the access to <strong>IMGT/MAB-KG</strong> data. The interface is powered by
              <v-chip class="ma-0 v-chip-link" color="primary" label>
                <a href="https://yasgui.triply.cc/" target="_blank" rel="noopener">YASGUI</a>
              </v-chip>,
              you can directly access to
              <v-chip class="ma-0 v-chip-link" color="primary" label>
                <a href="/fuseki/#/dataset/MabkgKg/query" target="_blank" rel="noopener">
                  IMGT/MAB-KG SPARQL Endpoint Server directly
                </a>
              </v-chip>
              which uses
              <v-chip class="ma-0 v-chip-link" color="primary" label>
                <a href="https://jena.apache.org/documentation/fuseki2/" target="_blank" rel="noopener">Apache Jena Fuseki</a>
              </v-chip>
              as SPARQL server and
              <v-chip class="ma-0 v-chip-link" color="primary" label>
                <a href="https://jena.apache.org/documentation/tdb2/" target="_blank" rel="noopener">Apache Jena TDB</a>
              </v-chip>
              as triplestore. It provides acces to the <strong>IMGT/MAB-KG</strong> data. Some examples are provided below.
            </p>
          </v-card>
        </v-col>
      </v-row>

      <!-- Sous-titre Data Access -->
      <v-row>
        <v-col>
          <v-card class="card-title mx-auto w-100">
            <div class="title text-h5 text-center p-20"><strong>IMGT/MAB-KG</strong> Data Access</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- YASGUI -->
      <v-row>
        <v-col>
          <v-card class="pa-2">
            <div id="yasgui-mab" />
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, nextTick } from 'vue'

function loadCss (href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) return resolve()
    const l = document.createElement('link')
    l.rel = 'stylesheet'
    l.href = href
    l.onload = () => resolve()
    l.onerror = () => reject(new Error(`Fail CSS: ${href}`))
    document.head.appendChild(l)
  })
}
function loadScript (src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Fail JS: ${src}`))
    document.head.appendChild(s)
  })
}
function clearYasguiLocalStorage () {
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k) continue
    const low = k.toLowerCase()
    if (low.includes('yasgui') || low.includes('yasqe') || low.includes('yasr')) keysToRemove.push(k)
  }
  keysToRemove.forEach(k => localStorage.removeItem(k))
}

let yasguiInstance: any = null

onMounted(async () => {
  await loadCss('https://unpkg.com/@triply/yasgui/build/yasgui.min.css')
  await loadScript('https://unpkg.com/@triply/yasgui/build/yasgui.min.js')

  clearYasguiLocalStorage()

  await nextTick()
  const w = window as any
  if (!w.Yasgui) { console.error('Yasgui non chargé'); return }

  const container = document.getElementById('yasgui-mab')
  if (!container) return

  yasguiInstance = new w.Yasgui(container, {
    persistenceId: 'yasgui-mab',
    requestConfig: {
      endpoint: 'https://www.imgt.org/fuseki/MabkgKg/sparql',
      method: 'POST',
      timeout: 30000,
      headers: { Accept: 'application/sparql-results+json' }
    },
    autofocus: false,
    copyEndpointOnNewTab: true,
    tabName: 'Query',
    yasr: {
      prefixes: {
        imgt: 'https://www.imgt.org/imgt-ontology#',
        ncit: 'http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#',
        obo: 'http://purl.obolibrary.org/obo/',
        faldo: 'http://biohackathon.org/resource/faldo#',
        so: ' http://purl.obolibrary.org/obo/so#',
        owl: 'http://www.w3.org/2002/07/owl#',
        skos: 'http://www.w3.org/2004/02/skos/core#',
        pubmed: 'https://pubmed.ncbi.nlm.nih.gov/',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        bibo: 'http://purl.org/ontology/bibo/',
      },
      maxLines: 30,
    },
  })

  const yasqe = yasguiInstance.getTab().yasqe
  yasqe.addPrefixes({
    imgt: 'https://www.imgt.org/imgt-ontology#',
    ncit: 'http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#',
    skos: 'http://www.w3.org/2004/02/skos/core#',
    obo: 'http://purl.obolibrary.org/obo/',
    faldo: 'http://biohackathon.org/resource/faldo#',
    owl: 'http://www.w3.org/2002/07/owl#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  })
})

onBeforeUnmount(() => {
  const el = document.getElementById('yasgui-mab')
  if (el) el.innerHTML = ''
  yasguiInstance = null
})
</script>

<style scoped>
@import url('https://fonts.cdnfonts.com/css/source-sans-pro');

.mabkgaccess-page { background: #eee; }

.zone-main {
  margin-top: 20px !important;
  width: 85%;
  margin: auto;
}
.title { padding: 20px; font-weight: 500 !important; color: #444 !important; }
.text-body-2 { text-align: justify; }

a { text-decoration: none; color: darkblue; }
.v-chip-link a { font-weight: bold; }
.v-chip-link a:hover { color: crimson !important; }
.v-chip-link { height: 23px !important; }

table, .v-table { width: 100%; border-spacing: 0; background-color: white; border-radius: 5px; }
th {
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  padding: 0 16px; font-weight: 500; user-select: none; text-align: start;
  height: calc(var(--v-table-header-height) + 0px); color: black;
}
td {
  border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  height: calc(var(--v-table-row-height, 52px) + 0px);
  padding: 0 16px;
}
td, th { border-bottom: solid 1px rgba(210,210,210,0.8); }

:deep(.yasgui .autocompleteWrapper) { display: none !important; }
</style>
