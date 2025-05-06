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

    <div id="results" v-if="results.length">
      <GraphDisplay :triples="results" />
      <h3>Results :</h3>
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Relation</th>
            <th>Object</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, index) in results" :key="index">
            <td>{{ result.subject }}</td>
            <td>{{ result.relation }}</td>
            <td>{{ result.object }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import GraphDisplay from './GraphDisplay.vue';
import { ref } from 'vue';
import { fetchData, replaceAllOccurrences, type Triple } from '../utils/Fonctions';
import { renderQuery } from '../utils/queryLoader';

const query = ref('');
const results = ref<Triple[]>([]);
const errorMessage = ref('');

async function search() {
  if (!query.value.trim()) {
    errorMessage.value = "Please enter a search.";
    return;
  }

  try {
    const sparqlQuery = await renderQuery("../templates/query.njk", { query: query.value });
    const csvData = await fetchData(sparqlQuery);
    const csvDataCopy = csvData
    results.value = parseCSVResults(csvDataCopy);
    query.value = "";
  } catch (error) {
    errorMessage.value = (error as Error).message;
    console.error("Search error:", error);
  }
}

function parseCSVResults(csv: string): Triple[] {
  const lines = csv.split('\n')
    .map(line => line.trim())
    .filter(line => line);

  if (lines.length < 2) return [];

  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      subject: replaceAllOccurrences(values[headers.indexOf("subject")]),
      relation: replaceAllOccurrences(values[headers.indexOf("relation")]),
      object: replaceAllOccurrences(values[headers.indexOf("object")])
    };
  });
}
</script>

<style scoped>
/* Styles inchangés depuis votre version originale */
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
</style>