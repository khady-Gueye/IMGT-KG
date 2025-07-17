<template>
  <div class="documentation-drawer" v-if="visible">
    <!-- En-tête -->
    <div class="drawer-header">
      <div class="title-block">
        <h2 class="entity-title">{{ entityLabel || shortenURI(entityIRI) }}</h2>
        <div class="entity-iri">{{ shortenURI(entityIRI) }}</div>
      </div>
      <button class="close-btn" @click="$emit('close')">✕</button>
    </div>

    <div class="drawer-content">
      <ul class="doc-list">
        <li v-for="(row, index) in docData" :key="index" class="doc-item">
          <strong class="doc-label">
            <template v-if="row.property">
              <a :href="row.property" target="_blank">{{ row.propertyLabel || shortenURI(row.property) }}</a> :
            </template>
            <span v-else class="missing-value">(propriété inconnue)</span>
          </strong>
          <span class="doc-value">
            <template v-if="row.value">
              <a :href="row.value" target="_blank">{{ row.valueLabel || shortenURI(row.value) }}</a>
            </template>
            <span v-else class="missing-value">(valeur inconnue)</span>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
defineProps<{
  visible: boolean,
  entityIRI: string,
  entityLabel?: string,
  docData: Array<{
    property: string | null,
    propertyLabel: string | null,
    value: string | null,
    valueLabel: string | null
  }>
}>()

defineEmits(['close'])

function shortenURI(uri?: string | null): string {
  if (!uri) return '(inconnu)'
  return uri.replace(/^.*[#/]/, '')
}
</script>

<style scoped>
.documentation-drawer {
  position: fixed;
  right: 0;
  top: 0;
  width: 440px;
  height: 100vh;
  background: #ffffff;
  box-shadow: -2px 0 14px #d7eaff60;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #f8f9fb;
  padding: 1.2em 1.5em;
  border-bottom: 1px solid #eee;
}

.title-block {
  display: flex;
  flex-direction: column;
}

.entity-title {
  font-size: 1.4rem;
  margin: 0 0 0.2em 0;
  font-weight: 600;
  color: #333;
}

.entity-iri {
  font-size: 0.9rem;
  color: #888;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: #888;
  margin-left: 0.5em;
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.2em 1.5em;
}

.doc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.doc-item {
  margin-bottom: 1em;
  line-height: 1.4;
}

.doc-label {
  display: inline-block;
  color: #555;
  margin-bottom: 4px;
}

.doc-value a {
  color: #0056cc;
  text-decoration: none;
  word-break: break-word;
}

.doc-value a:hover {
  text-decoration: underline;
}

.missing-value {
  color: #999;
  font-style: italic;
}
</style>
