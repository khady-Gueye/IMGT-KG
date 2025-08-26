// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { vuetify } from './plugins/vuetify'
import '@/assets/style.css'

const app = createApp(App)
app.use(createPinia())
app.use(vuetify)
app.mount('#app')

// (optionnel) calmer l'erreur ResizeObserver en dev
window.addEventListener('error', e => {
  if (e.message?.includes?.('ResizeObserver')) {
    e.preventDefault()
    return false
  }
})
