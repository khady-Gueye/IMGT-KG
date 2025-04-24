<template>
  <div id="app">
    <h1 id="title">SPARQL Data Search</h1>
    <SearchBar @update-results="results = $event"/>

     <!-- On affiche le graphe en dessous -->
     <GraphDisplay v-if="results.length > 0" :triples="results"/>  
  </div>
</template>

<script>
import { ref } from "vue";
import SearchBar from "./components/SearchBar.vue"
import GraphDisplay from "./components/GraphDisplay.vue"
export default {
  components: {
    SearchBar,
    GraphDisplay
  },
  setup() {
    const results = ref([]); // Stocke les résultats de la recherche
    return { results };
  },
};
</script>


<style>
/* #app {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 50px;
} */
#app {
  font-family: Arial, sans-serif;
  position: relative;
  width: 100%;
  height: 100%;
}

#title {
  text-align: center;
  font-size: 2em;
  margin-bottom: 20px;
  color: #42b983; /* Couleur du titre */
}
</style>