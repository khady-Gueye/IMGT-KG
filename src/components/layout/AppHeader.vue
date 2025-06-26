<template>
    <header class="app-header">
      <router-link to="/" class="logo-link">
        <img src="@/assets/LogoIMGT.png" alt="Logo IMGT" class="logo" />
      </router-link>
      <h1>IMGT Knowledge Graph: Explore and Integrate Immunogenetics Knowledge  </h1>
    </header>
  </template>
  
  <script setup lang="ts">
  // Pas de logique JS nécessaire ici
  </script>
  
  <style scoped>
  .app-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    background: linear-gradient(90deg, #42b983 0%, #3498db 100%);
    color: white;
    padding: 1.5rem 2rem;
    border-radius: 0 0 16px 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .logo-link {
    display: flex;
    align-items: center;
  }
  
  .logo {
    width: 60px;
    height: 60px;
    object-fit: contain;
    transition: transform 0.2s ease;
  }
  
  .logo:hover {
    transform: scale(1.05);
  }
  
  h1 {
    font-size: clamp(1.2rem, 2vw, 2rem);
    font-weight: bold;
    margin: 0;
    letter-spacing: 1px;
  }
  
  @media (max-width: 768px) {
    .app-header {
      padding: 1rem;
      flex-direction: column;
      text-align: center;
    }
  
    h1 {
      font-size: 1.5rem;
    }
  }
  </style>