import { createApp } from 'vue'
import App from './App.vue'
import { vuetify } from './plugins/vuetify'
// Import global CSS
import '@/assets/style.css'  

//createApp(App).use(vuetify).mount('#app')
createApp(App).use(vuetify).mount('#app')
// Gestion globale de l'erreur ResizeObserver
window.addEventListener('error', e => {
  if (e.message.includes('ResizeObserver')) {
    e.preventDefault();
    return false;
  }
});
