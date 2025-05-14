import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
// Tout en haut du fichier
window.addEventListener('error', e => {
    if (e.message.includes('ResizeObserver')) {
      e.preventDefault();
      return false;
    }
  });