<template>
  <div id="app">
    <h1>SPARQL Data Search</h1>
    <SearchBar/>

     <!-- On affiche le graphe en dessous -->
     <GraphDisplay />
  </div>
</template>

<script>
import SearchBar from "./components/SearchBar.vue"
import GraphDisplay from "./components/GraphDisplay.vue"
export default {
  components: {
    SearchBar,
    GraphDisplay
  }
};
</script>


<style>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 50px;
}
</style>