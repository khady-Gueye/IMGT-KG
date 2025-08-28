// src/scripts/vis-ambient.d.ts
// Permet d'utiliser window.vis sans erreur TypeScript
export {}

declare global {
  interface Window {
    vis: any
  }
}
