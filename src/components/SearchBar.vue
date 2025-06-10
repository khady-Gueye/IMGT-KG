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
        <label :for="`filter-${type}`" :style ="{color: getColorForType(type) }">
          {{ type }}  <!--Pour la légende-->
        </label>
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
import { fetchData, replaceAllOccurrences, subjectNodeType, objectNodeType, type Triple } from '../utils/Fonctions'; 
import { renderQuery } from '../utils/queryLoader'; 
import { nodeColor, type NodeType } from '../utils/Fonctions';

// Types
type TripleWithType = Triple & { type: string; objectType?: string };

const query = ref('');
const results = ref<TripleWithType[]>([]);
const errorMessage = ref('');

// Filtres dynamiques par type
const allNodeTypes = ref<string[]>([]);
const selectedTypes = ref<string[]>([]);  // Liste des types sélectionnés
const allSelected = ref(true);

const filteredResults = computed(() => {
  // Si aucun type n'est sélectionné, on ne retourne rien
  if (!selectedTypes.value.length) return [];

  // Étape 1 : Créer un ensemble vide pour stocker les identifiants (URIs) des nœuds pertinents
  const selectedNodeIds = new Set<string>();

  // Parcourir tous les triplets actuels
  results.value.forEach(triple => {
    // Si le type du SUJET du triplet est sélectionné par l'utilisateur
    if (selectedTypes.value.includes(triple.type)) {
      selectedNodeIds.add(triple.subject); // Ajouter le sujet à l'ensemble
    }

    // Si le triplet contient un `objectType` ET que ce type est sélectionné par l'utilisateur
    if (triple.objectType && selectedTypes.value.includes(triple.objectType)) {
      selectedNodeIds.add(triple.object); // Ajouter l'objet à l'ensemble
    }
  });

  // Étape 2 : Retourner tous les triplets qui contiennent un des nœuds sélectionnés
  return results.value.filter(triple =>
    selectedNodeIds.has(triple.subject) || selectedNodeIds.has(triple.object)
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

    // Enrichir les triplets avec leur type (sujet et objet)
    const enriched: TripleWithType[] = parsed.map(triple => {
      const subjectType = subjectNodeType(triple.subject, triple.relation);
      const objType = objectNodeType(triple.relation);
      
      return {
        ...triple,
        type: subjectType,
        objectType: objType !== 'defaultnode' ? objType : undefined
      };
    });

    results.value = enriched;

    // Collecter tous les types uniques (à la fois des sujets et des objets)
    const typesSet = new Set<string>();
    enriched.forEach(triple => {
      typesSet.add(triple.type);
      if (triple.objectType) {
        typesSet.add(triple.objectType);
      }
    });
    
    // Filtrer pour exclure 'defaultnode' si nécessaire
    const uniqueTypes = Array.from(typesSet).filter(type => type !== 'defaultnode');
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

// Pour la légende
function getColorForType(type: string): string {
  return nodeColor(type as NodeType);
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