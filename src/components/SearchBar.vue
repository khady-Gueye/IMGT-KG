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
import * as dfd from 'danfojs'; 

const query = ref('');
const results = ref<Triple[]>([]);
const errorMessage = ref('');


async function search() {
  if (!query.value.trim()) {
    errorMessage.value = "Please enter a search.";
    results.value = []; // Vider les résultats précédents
    return;
  }

  errorMessage.value = ''; // Réinitialiser le message d'erreur au début de la recherche
  results.value = []; // Vider les résultats précédents

  try {
    const sparqlQuery = await renderQuery("../templates/query.njk", { query: query.value });
    const csvData = await fetchData(sparqlQuery);
    // Il est important de s'assurer que csvData est bien une chaîne de caractères CSV ici.
    // Si fetchData retourne déjà des données parsées ou autre chose, parseCSVResults pourrait ne pas fonctionner comme attendu.
    
  
    results.value = parseCSVResults(csvData); 

    // ---- Intégration de Danfo.js ----
    if (results.value && results.value.length > 0) {
      try {
        const rdfDataFrame = new dfd.DataFrame(results.value);
        console.log("DataFrame RDF créé avec succès :");
        rdfDataFrame.print(); // Affiche le DataFrame dans la console

      

        // Exemple d'utilisation (décommentez pour tester) :
        // console.log("Sujets uniques:", rdfDataFrame['subject'].unique().values);
        // console.log("Comptage des relations:");
        // rdfDataFrame['relation'].valueCounts().print();

      } catch (dfError) {
        console.error("Erreur lors de la création ou de l'utilisation du DataFrame Danfo.js:", dfError);
        // Gérer l'erreur de création du DataFrame comme vous le souhaitez
      }
    } else {
      console.log("Aucun résultat à convertir en DataFrame.");
    }
    // ---- Fin de l'intégration de Danfo.js ----

    query.value = ""; // Réinitialiser le champ de recherche après une recherche réussie
  } catch (error) {
    errorMessage.value = (error as Error).message;
    results.value = []; // S'assurer que les résultats sont vides en cas d'erreur
    // rdfDataFrameStore.value = null; // Vider le DataFrame en cas d'erreur
    console.error("Search error:", error);
  }
}


function parseCSVResults(csv: string): Triple[] {
  if (!csv || typeof csv !== 'string') {
    console.warn("parseCSVResults: l'entrée n'est pas une chaîne de caractères valide ou est vide.");
    return [];
  }
  const lines = csv.split('\n')
    .map(line => line.trim())
    .filter(line => line); // Filtre les lignes vides

  if (lines.length < 2) { // Au moins une ligne d'en-tête et une ligne de données
    console.warn("parseCSVResults: Pas assez de lignes dans le CSV pour parser (besoin d'en-têtes + données).");
    return [];
  }

  const headers = lines[0].split(',');
  // Vérification que les en-têtes nécessaires sont présents
  const requiredHeaders = ['subject', 'relation', 'object'];
  for (const rh of requiredHeaders) {
    if (!headers.includes(rh)) {
      console.error(`parseCSVResults: En-tête manquant dans le CSV: ${rh}. En-têtes trouvés: ${headers.join(', ')}`);
      errorMessage.value = `Erreur de format CSV: en-tête '${rh}' manquant.`; // Informer l'utilisateur
      return [];
    }
  }
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    // Création de l'objet Triple. 
    const subjectValue = values[headers.indexOf("subject")] || "";
    const relationValue = values[headers.indexOf("relation")] || "";
    const objectValue = values[headers.indexOf("object")] || "";

    return {
      subject: replaceAllOccurrences(subjectValue),
      relation: replaceAllOccurrences(relationValue),
      object: replaceAllOccurrences(objectValue)
    };
  }).filter(triple => triple.subject || triple.relation || triple.object); // Optionnel: filtrer les triplets complètement vides après parsing
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
</style>