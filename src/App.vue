<template>
  <div id="app">
    <div class="container">
      <h1 id="title">SPARQL Data Search</h1>
      <SearchBar @update-results="results = $event" />
      <GraphDisplay v-if="results.length > 0" :triples="results" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SearchBar from "./components/SearchBar.vue";
import GraphDisplay from "./components/GraphDisplay.vue";

// On définit explicitement le type des résultats
const results = ref<any[]>([]);
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  background-color: #f8f8f8;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  width: 100%;
  max-width: none;
  background-color: transparent;
  padding: 0;
  box-shadow: none;
  border-radius: 0;
}


#title {
  text-align: center;
  font-size: 2em;
  margin-bottom: 20px;
  color: #42b983;
}
</style>
