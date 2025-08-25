<template>
  <section class="mabkg">
    <h2>IMGT/mAb-KG — Relatlimab (mAb_781)</h2>

    <GraphSection title="Toutes les informations concernant Relatlimab (mAb_781)"
                  :triples="triplesAll" fileName="all_mab_781.png" />

    <GraphSection title="Relatlimab (mAb_781)"
                  :triples="triplesMab" fileName="mab_781.png" />

    <GraphSection title="Récepteur de Relatlimab (IgG4-Kappa_781)"
                  :triples="triplesReceptor" fileName="recept_781.png" />

    <GraphSection title="Mode of Action : MOA_781_oncology_blocking"
                  :triples="triplesMoa" fileName="moa_781.png" />

    <GraphSection title="Produit : Product_Bristol-Myers_Squibb_781"
                  :triples="triplesProduct" fileName="product_781.png" />
  </section>

  
</template>

<script setup lang="ts">
/* eslint-disable */
import { ref, onMounted, computed } from 'vue'
import Papa from 'papaparse'
import GraphSection from '@/components/kg/GraphSection.vue'
import { renderQuery } from '@/utils/queryLoader'
import { fetchData, type Triple } from '@/utils/Fonctions'

const rawTriples = ref<Triple[]>([])

onMounted(async () => {
  // Génère la requête SPARQL à partir du template et de la valeur
  const sparql = await renderQuery('/templates/query.rq', [{ id: 'imgt:mAb_781' }])
  // Appelle l’endpoint défini dans fetchData (https://www.imgt.org/fuseki/MabkgKg/?query)
  const csv = await fetchData(sparql)

  // Parse CSV (colonnes: subject, relation, object)
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true })
  rawTriples.value = (parsed.data as any[]).map(row => ({
    subject:  (row.subject  || '').toString().trim(),
    relation: (row.relation || '').toString().trim(),
    object:   (row.object   || '').toString().trim(),
  }))
})

// Tout
const triplesAll = computed<Triple[]>(() => rawTriples.value)

// mAb : liens directs avec mAb ou relations clés
const triplesMab = computed<Triple[]>(() =>
  rawTriples.value.filter(t =>
    /mAb_781/i.test(t.subject) || /mAb_781/i.test(t.object) ||
    /(hasReceptor|hasProduct|hasMOA)$/i.test(t.relation)
  )
)

// Récepteur : récepteur, cible, taxon
const triplesReceptor = computed<Triple[]>(() =>
  rawTriples.value.filter(t =>
    /(hasReceptor|bindsTo|isTargetOf|inTaxon)$/i.test(t.relation) ||
    /IgG4[-_]?Kappa_781/i.test(t.subject+t.object) ||
    /LAG3|HGNC:6476/i.test(t.subject+t.object)
  )
)

// MOA
const triplesMoa = computed<Triple[]>(() =>
  rawTriples.value.filter(t =>
    /(BAO_0000196|clinicalDomain|hasReference)$/i.test(t.relation) ||
    /MOA_781/i.test(t.subject+t.object)
  )
)

// Produit
const triplesProduct = computed<Triple[]>(() =>
  rawTriples.value.filter(t =>
    /(isProductOf|isStudyProductOf|isDecisionOf|studiedIn|Phase)/i.test(t.relation) ||
    /Product.*781|OPDUALAG/i.test(t.subject+t.object)
  )
)
</script>

<style scoped>
.mabkg { display: grid; gap: 24px; }
</style>
