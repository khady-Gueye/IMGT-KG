import { createApp } from 'vue'
import App from './App.vue'

// Import global CSS
import '@/assets/style.css'  

createApp(App).mount('#app')

// Gestion globale de l'erreur ResizeObserver
window.addEventListener('error', e => {
  if (e.message.includes('ResizeObserver')) {
    e.preventDefault();
    return false;
  }
});
