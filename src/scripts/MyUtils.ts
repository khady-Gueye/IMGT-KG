
// Au tout début du fichier, selon le besoin :
declare const vis: any;                    // pour SchemaDescrip.ts
declare const am5: any;                    // pour *chart* fichiers
declare const am5xy: any;
declare const am5percent: any;
declare const am5themes_Animated: any;




/* eslint-disable */

// On attache les fonctions au window pour conserver le même usage global
declare global {
    interface Window {
      toggleFrame: (id: string) => void;
      toggleFrameSimple: (id: string) => void;
      scrollToTop: () => void;
    }
  }
  
  (() => {
    /** Déplier/replier un iframe via classes CSS .hidden / .visible */
    function toggleFrame(myFrame: string): void {
      const frame = document.getElementById(myFrame);
      if (!frame) return;
      if (frame.classList.contains("hidden")) {
        frame.classList.remove("hidden");
        frame.classList.add("visible");
      } else {
        frame.classList.remove("visible");
        frame.classList.add("hidden");
      }
    }
  
    /** Afficher/masquer un élément par style.display */
    function toggleFrameSimple(frameId: string): void {
      const frame = document.getElementById(frameId) as HTMLElement | null;
      if (!frame) return;
      frame.style.display = frame.style.display === "none" ? "block" : "none";
    }
  
    /** Scroll doux vers le haut de la page */
    function scrollToTop(): void {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  
    // Exposition globale
    window.toggleFrame = toggleFrame;
    window.toggleFrameSimple = toggleFrameSimple;
    window.scrollToTop = scrollToTop;
  })();
  
  export {};
  