<template>
    <nav class="tabs-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: currentTab === tab.id }"
        @click="$emit('change-tab', tab.id)"
      >
        {{ tab.label }}
      </button>
    </nav>
  </template>
  
  <script setup>
    /*eslint-disable */
  const props = defineProps({
    tabs: Array,
    currentTab: String
  });
  </script>
  
  <style scoped>
  .tabs-nav {
    display: flex;
    justify-content: center;
    gap: 2rem;
    background: #f6f6f6;
    border-bottom: 1px solid #e0e0e0;
    padding: 0.5rem 0;
  }
  .tabs-nav button {
    background: none;
    border: none;
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
    cursor: pointer;
    color: #42b983;
    border-bottom: 3px solid transparent;
    transition: border-color 0.2s, background 0.2s;
  }
  .tabs-nav button.active {
    border-bottom: 3px solid #42b983;
    background: #eafaf1;
    font-weight: bold;
    color: #222;
  }
  </style>
  