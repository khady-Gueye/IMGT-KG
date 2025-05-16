<template>
  <div>
    <div id="researchbox">
      <h2 id="researchtitle">Research</h2>
      <input 
        type="text" 
        v-model="query" 
        placeholder="Enter your search"
        @keyup.enter="search"
      >
      <button @click="search">Search</button>
    </div>

    <!-- Filtre par type de noeud -->
    <div v-if="allNodeTypes.length" class="filter-box">
      <h3>Filtrer par type de nœud</h3>
      <label>
        <input type="checkbox" v-model="allSelected" @change="toggleAllTypes" />
        Tout (dé)sélectionner
      </label>
      <div v-for="type in allNodeTypes" :key="type" class="filter-item">
        <input
          type="checkbox"
          :value="type"
          v-model="selectedTypes"
          :id="`filter-${type}`"
        />
        <label :for="`filter-${type}`">{{ type }}</label>
      </div>
    </div>

    <div id="results" v-if="filteredResults.length">
      <GraphDisplay :triples="filteredResults" />
      <h3>Results :</h3>
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

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import GraphDisplay from './GraphDisplay.vue';
import { ref, computed } from 'vue';
import { fetchData, replaceAllOccurrences, subjectNodeType, type Triple } from '../utils/Fonctions'; 
import { renderQuery } from '../utils/queryLoader'; 

// Types
type TripleWithType = Triple & { type: string };

const query = ref('');
const results = ref<TripleWithType[]>([]);
const errorMessage = ref('');

// Filtres dynamiques par type
const allNodeTypes = ref<string[]>([]);
const selectedTypes = ref<string[]>([]);
const allSelected = ref(true);

// Ajout des triplets associer au noeuds du type sélectionné
const filteredResults = computed(() => {
  if (!selectedTypes.value.length) return [];

  // Étape 1 : récupérer les triplets du type sélectionné
  const selected = results.value.filter(triple =>
    selectedTypes.value.includes(triple.type)
  );

  // Étape 2 : collecter les nœuds concernés
  const relevantNodes = new Set<string>();
  selected.forEach(triple => {
    relevantNodes.add(triple.subject);
    relevantNodes.add(triple.object);
  });

  // Étape 3 : retourner tous les triplets liés à ces nœuds
  return results.value.filter(triple =>
    relevantNodes.has(triple.subject) || relevantNodes.has(triple.object)
  );
});


function toggleAllTypes() {
  if (allSelected.value) {
    selectedTypes.value = [...allNodeTypes.value];
  } else {
    selectedTypes.value = [];
  }
}

async function search() {
  if (!query.value.trim()) {
    errorMessage.value = "Please enter a search.";
    results.value = [];
    return;
  }

  errorMessage.value = '';
  results.value = [];

  try {
    const sparqlQuery = await renderQuery("../templates/query.njk", { query: query.value });
    const csvData = await fetchData(sparqlQuery);
    const parsed = parseCSVResults(csvData);

    //  Ajouter le type via nodeType()
    const enriched: TripleWithType[] = parsed.map(triple => ({
      ...triple,
      type: subjectNodeType(triple.relation)
    }));

    results.value = enriched;

    const uniqueTypes = [...new Set(enriched.map(t => t.type))];
    allNodeTypes.value = uniqueTypes;
    selectedTypes.value = [...uniqueTypes];
    allSelected.value = true;

    query.value = "";
  } catch (error) {
    errorMessage.value = (error as Error).message;
    results.value = [];
    console.error("Search error:", error);
  }
}

function parseCSVResults(csv: string): Triple[] {
  if (!csv || typeof csv !== 'string') return [];

  const lines = csv.split('\n')
    .map(line => line.trim())
    .filter(line => line);

  if (lines.length < 2) return [];

  const headers = lines[0].split(',');
  const requiredHeaders = ['subject', 'relation', 'object'];
  for (const rh of requiredHeaders) {
    if (!headers.includes(rh)) {
      errorMessage.value = `Erreur CSV : en-tête '${rh}' manquant.`;
      return [];
    }
  }

  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      subject: replaceAllOccurrences(values[headers.indexOf("subject")] || ""),
      relation: replaceAllOccurrences(values[headers.indexOf("relation")] || ""),
      object: replaceAllOccurrences(values[headers.indexOf("object")] || "")
    };
  });
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #42b983;
  color: white;
}

.error {
  color: red;
  margin-top: 10px;
}

#researchbox {
  text-align: center;
  font-size: 2em;
  margin-bottom: 20px;
  color: #42b983;
}

/* ✅ Styles filtre */
.filter-box {
  margin: 20px 0;
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
}
.filter-item {
  margin: 5px 0;
}

</style>
