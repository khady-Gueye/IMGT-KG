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

    <!-- Contenu -->
    <div class="drawer-content">
      <ul class="doc-list">
        <li v-for="(row, index) in docData" :key="index" class="doc-item">
          <strong class="doc-label">
            
            <template v-if="isInternalUri(row.property)">
              <span
                class="doc-link"
                @click="$emit('show-doc', row.property)"
                :title="row.property ?? undefined"
              >
                {{ row.propertyLabel || shortenURI(row.property) }}
              </span> :
            </template>
            <template v-else-if="isUri(row.property)">
                <a 
                  :href="row.property ?? undefined" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  :title="row.property ?? undefined"
                >
                  {{ row.propertyLabel || shortenURI(row.property) }}
                </a> :
              </template>
            <span v-else class="missing-value">(propriété inconnue)</span>
          </strong>

          <span class="doc-value">
            <template v-if="row.value">
              <template v-if="isInternalUri(row.value)">
                <span
                  class="doc-link"
                  @click="$emit('show-doc', row.value)"
                  :title="row.value"
                >
                  {{ row.valueLabel || shortenURI(row.value) }}
                </span>
              </template>
              <template v-else-if="isUri(row.value)">
                <a 
                  :href="row.value" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  :title="row.value"
                >
                  {{ row.valueLabel || shortenURI(row.value) }}
                </a>
              </template>
              <template v-else>
                {{ row.value }}
              </template>
            </template>
            <span v-else class="missing-value">(valeur inconnue)</span>
          </span>
        </li>
      </ul>
    </div>
    <!-- Bouton de retour si possible -->
    <div class="drawer-footer">
  <button
    class="back-btn"
    :disabled="!canGoBack"
    @click="$emit('doc-back')"
  >← Back</button>
  <button
    class="forward-btn"
    :disabled="!canGoForward"
    @click="$emit('doc-forward')"
    style="margin-left: 1em;"
  >Forward →</button>
</div>

  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
defineProps<{
  visible: boolean
  entityIRI: string
  entityLabel?: string
  docData: Array<{
    property: string | null
    propertyLabel: string | null
    value: string | null
    valueLabel: string | null
 
  }>
  canGoBack?: boolean   
  canGoForward?: boolean
}>()

defineEmits(['close', 'show-doc', 'doc-back' , 'doc-forward'])

function shortenURI(uri?: string | null): string {
  if (!uri) return '(inconnu)'
  return uri.replace(/^.*[#/]/, '')
}

function isUri(value: string | null | undefined): boolean {
  if (!value) return false
  const trimmed = value.trim()
  return /^(https?:\/\/|ftp:\/\/|mailto:|urn:|<http)/i.test(trimmed)
}

function isInternalUri(value: string | null | undefined): boolean {
  if (!value) return false
  return value.startsWith("https://www.imgt.org/imgt-ontology#") || value.startsWith("imgt:")
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

.doc-value a,
.doc-link {
  color: #0056cc;
  text-decoration: none;
  word-break: break-word;
  cursor: pointer;
}

.doc-link:hover,
.doc-value a:hover {
  text-decoration: underline;
}

.missing-value {
  color: #999;
  font-style: italic;
}
.drawer-footer {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  padding: 1em 1.5em;
  border-top: 1px solid #f1f1f1;
  background: #fafbfc;
}

.back-btn {
  background: #3498db;
  color: #fff;
  padding: 0.7em 1.8em;
  border-radius: 24px;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(50,80,150,0.05);
  transition: background 0.2s;
}

.back-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  color: #eee;
}

.back-btn:not(:disabled):hover {
  background: #2176ae;
}
.doc-link {
  color: #0056cc;
  text-decoration: underline;
  cursor: pointer;
}
.forward-btn {
  background: #68c86d;
  color: #fff;
  padding: 0.7em 1.8em;
  border-radius: 24px;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(50,80,150,0.05);
  transition: background 0.2s;
}

.forward-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  color: #eee;
}

.forward-btn:not(:disabled):hover {
  background: #32a846;
}


</style>
