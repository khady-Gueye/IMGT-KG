<template> 
  <div>
    <div id="researchbox">
      <h2 id="researchtitle">Research</h2> 
      <input type="text" v-model="query" placeholder="Enter your search" 
      @keyup.enter="search"/>
      <button @click="search">Search</button>
    </div>

    <div id="results" v-if="results.length">
      <GraphDisplay />  
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

<script>
import GraphDisplay from "./GraphDisplay.vue";
import { fetchData } from "../utils/Fonctions";
import { renderQuery } from "../utils/queryLoader.js";

export default {
  components: { GraphDisplay },
  data() {
    return {
      query: "",
      results: [],
      errorMessage: ""
    };
  },
  methods: {
    async search() {
      if (!this.query) {
        this.errorMessage = "Please enter a search.";
        return;
      }
      this.errorMessage = "";
      try { 
        const sparqlQuery = await renderQuery("../templates/query.njk", { query: this.query });
        console.log("Requête SPARQL générée :", sparqlQuery);
        const data = await fetchData(sparqlQuery);
        this.query = "";
        console.log("Données reçues (CSV) :", data);

        const lignes = data.split("\n")
                           .map(line => line.replace(/\r/g, '').trim())
                           .filter(line => line !== "");

        if (lignes.length < 2) {
          this.results = [];
          this.errorMessage = "Aucun résultat trouvé.";
          return;
        }

        const colonnes = lignes[0].split(",");
        this.results = lignes.slice(1).map(ligne => {
          const valeurs = ligne.split(",");
          return {
            subject: valeurs[colonnes.indexOf("subject")] || "N/A",
            relation: valeurs[colonnes.indexOf("relation")] || "N/A",
            object: valeurs[colonnes.indexOf("object")] || "N/A"
          };
        });

        this.$emit("update-results", this.results);
      } catch (error) {
        this.errorMessage = "Erreur lors de la récupération des données.";
        console.error(error);
      }
    }
  }
};
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
