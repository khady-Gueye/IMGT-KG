<template>
    <aside class="sidebar-nav">
      <nav>
        <ul>
          <li
            v-for="item in navItems"
            :key="item.id"
            :class="{ active: currentNav === item.id }"
            @click="$emit('select-nav', item.id)"
          >
            {{ item.label }}
          </li>
        </ul>
      </nav>
      <slot></slot> <!-- Pour injecter les filtres -->
    </aside>
  </template>
  
  <script setup>
  /* eslint-disable */
  const props = defineProps({
    navItems: Array,
    currentNav: String
  });
  </script>
  
  <style scoped>
  .sidebar-nav {
    width: 300px;
    background: #f6f6f6;
    border-right: 1px solid #e0e0e0;
    height: 100vh;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .sidebar-nav nav ul {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem 0;
  }
  .sidebar-nav nav li {
    padding: 0.8rem 1rem;
    cursor: pointer;
    border-radius: 6px;
    color: #3498db;
    margin-bottom: 0.5rem;
    font-weight: 500;
    transition: background 0.2s;
  }
  .sidebar-nav nav li.active,
  .sidebar-nav nav li:hover {
    background: #eafaf1;
    color: #d7263d;
  }
  </style>
  