<template>
  <section class="cover">
    <!-- SVG animé en fond -->
    <svg class="cover-graph-bg" width="100%" height="320" viewBox="0 0 900 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g>
        <circle cx="120" cy="160" r="38" fill="#ffffff22">
          <animate attributeName="r" values="32;44;32" dur="6s" repeatCount="indefinite"/>
        </circle>
        <circle cx="320" cy="80" r="20" fill="#ffffff33">
          <animate attributeName="r" values="16;28;16" dur="5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="520" cy="200" r="30" fill="#ffffff22">
          <animate attributeName="r" values="24;38;24" dur="7s" repeatCount="indefinite"/>
        </circle>
        <circle cx="700" cy="120" r="18" fill="#ffffff33">
          <animate attributeName="r" values="14;22;14" dur="4s" repeatCount="indefinite"/>
        </circle>
        <line x1="120" y1="160" x2="320" y2="80" stroke="#fff" stroke-width="2" opacity="0.2"/>
        <line x1="320" y1="80" x2="520" y2="200" stroke="#fff" stroke-width="2" opacity="0.2"/>
        <line x1="520" y1="200" x2="700" y2="120" stroke="#fff" stroke-width="2" opacity="0.2"/>
      </g>
    </svg>
    <h2>Welcome to the IMGT Knowledge Graph Portal</h2>
    <p>Explore, search, and visualize relationships between entities.</p>
    <!-- <button class="cover-btn">Start Exploring</button> -->
    <div class="cover-tags">
      <span class="tag">Antibody</span>
      <span class="tag">Target</span>
      <span class="tag">MOA</span>
      <span class="tag">Product</span>
      <span class="tag">Gene</span>
      <span class="tag"> Allele</span>
    </div>
  </section>
</template>

<style scoped>
.cover {
  text-align: center;
  margin-top: 3rem;
  background: linear-gradient(45deg, #42b983 0%, #3498db 100%);
  color: white;
  padding: 5rem 2rem 3rem 2rem;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 32px rgba(50,80,150,0.12);
}
.cover-graph-bg {
  position: absolute;
  left: 0; top: 0;
  width: 100%;
  height: 320px;
  z-index: 0;
  pointer-events: none;
  opacity: 0.6;
}
.cover h2, .cover p, .cover-btn, .cover-tags {
  position: relative;
  z-index: 1;
}
.cover-btn {
  margin-top: 2em;
  background: #fff;
  color: #3498db;
  border: none;
  border-radius: 24px;
  font-size: 1.1em;
  padding: 0.7em 2.2em;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(50,80,150,0.09);
  transition: background 0.2s, color 0.2s;
}
.cover-btn:hover {
  background: #3498db;
  color: #fff;
}
.cover-tags {
  margin-top: 1.5em;
  margin-bottom: 1.5em;
}
.tag {
  display: inline-block;
  background: rgba(255,255,255,0.18);
  border-radius: 20px;
  padding: 0.2em 1.1em;
  margin: 0 0.4em;
  font-size: 1em;
  font-weight: 500;
  letter-spacing: 0.04em;
  border: 1.5px solid #fff;
}
</style>
