<template> 
  <div>
      <h2>Reseach</h2>  <!--Titre de la section--> 
      <input type="text" v-model="query" placeholder="Enter your search" /> <!-- Champ de saisie pour la recherche, lié à la variable-->
      <!--  Champ de recherche où l'utilisateur  entre sa requête.la direction v-model lie cette entrée à la variable query dans le data-->
      <button @click="search">Search</button>  <!--Bouton qui déclenche la méthode search() lorqu'il est cliqué-->
      
      
      <div v-if ="results.length"> <!--Si des résultats sont présents, afficher cette section-->
        <!-- On passe les résultats au composant graphe -->
      <GraphDisplay />  
          <h3>Results :</h3> <!--Titre pour les résultats-->
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Relation</th>
                <th>Object</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(result, index) in results" :key="index" > <!---Parcours des résultats avec une clé unique par index -->
                <td>{{ result.subject}}</td>  <!--Affiche le sujet du résultat-->
                <td>{{ result.relation }}</td> <!--// Affiche la relation du résultat-->
                <td>{{ result.object }}</td>  <!--Affiche l'objet du résultat-->             
              </tr> 
           </tbody>
          </table>
          <!-- On passe les résultats au composant graphe -->
      <!--<GraphDisplay :triples="results" />-->
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p> <!--Si un message d'erreur existe, l'afficher-->

  </div>
</template> 

<!--Logique du composant vue-->
<script>
//import { ref } from 'vue'
import GraphDisplay from "./GraphDisplay.vue"; // On importe le composant Graph qui est responsable de l'affichage du graphe
import {fetchData} from "../utils/Fontions.ts"; // On importe la fonction fetchData qui est responsable de l'exécution des requêtes SPARQL
import {renderQuery} from "../utils/queryLoader.js"; // On importe la fonction renderQuer qui est responsable de la création de la requête SPARQL



//const searchQuery = ref('')
//const results = ref([])
//Déclaration des données du composant vue
export default {
  components: {
    GraphDisplay // On déclare le composant Graph qui sera utilisé pour afficher les résultats sous forme de graphe
  },
  data() {
    return{
      query:"", //Variable qui contient la requête saisie par l'utilisateur
      results: [], //Tableau qui stocke les résultats récupérés
      errorMessage: "" //Stocke un message d'erreur en cas de probléme
    };
  },
  methods: {
    async search () {
        //On verifie si l'utilisateur a saisi une requête
        if (!this.query) {
            this.errorMessage = "Please enter a search."; //Afficher un message si la requête est vide
            return; // le mot-clé return met fin immédiatement à l'exécution de la fonction.Cela signifie que si la condition précédente (!this.query) est vraie, la fonction search() ne continue pas son exécution aprés cette ligne.
        }
        this.errorMessage= ""; //Réinitialiser le message d'erreur
    
        // la reqête est dans le template query
  

    //Envoie de la requête et traitement des résultats 
    try { 
        const sparqlQuery = await renderQuery("../templates/query.njk",{query :this.query}); //On appelle la fonction renderQuery pour créer la requête SPARQL à partir du modèle et de la requête saisie par l'utilisateur
        console.log("Requête SPARQL générée :", sparqlQuery); // Vérification de la requête générée
        const data = await fetchData(sparqlQuery); //On appelle la fonction fetchData pour exécuter la requête SPARQL et récupérer les données
        //On vérifie si les données sont présentes et contiennent des résultats
        //On utilise la méthode map pour transformer les résultats en un tableau d'objets contenant les propriétés subject, relation et object
        console.log("Données reçues (CSV) :", data);  // Vérification des données reçues
        // Vérification de l'existance des données
        const lignes = data.split("\n").map(line => line.replace(/\r/g, '').trim()).filter(line => line !== ""); //On filtre les lignes vides

        if (lignes.length < 2) { // Moins de 2 lignes signifie qu'il n'y a que l'en-tête
    this.results = [];
    this.errorMessage = "Aucun résultat trouvé.";
    return;
  }

  // Extraire les colonnes (1ère ligne)
  const colonnes = lignes[0].split(",");
  console.log(colonnes);

  // Convertir le CSV en tableau d'objets
  this.results = lignes.slice(1).map(ligne => { // On ignore la première ligne qui contient les noms des colonnes
    // On divise chaque ligne par la virgule
    // On crée un objet avec les propriétés subject, relation et object
    // On utilise les index des colonnes pour remplir les valeurs
    // On utilise || "N/A" pour gérer les valeurs manquantes
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

<!--Style du composant vue-->
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
</style>

