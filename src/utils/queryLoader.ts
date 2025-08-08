import { fetchData } from './Fonctions'
import Papa from 'papaparse'
import { replaceAllOccurrences, type Triple } from '@/utils/Fonctions'
import { ref } from 'vue'
import { cpSync } from 'fs'

/**
 * Charge un template SPARQL et injecte dynamiquement une clause VALUES.
 * Pour les requêtes dynamiques basées sur des entités sélectionnées.
 *
 * @param templateUrl - URL du fichier .rq contenant le template avec le marqueur __VALUES__
 * @param selectedEntities - Liste des entités sélectionnées, ex : [{ id: 'mAb_123' }, { id: 'Target_456' }]
 * @returns Une chaîne SPARQL complète avec la clause VALUES injectée
 */
export async function renderQuery(
  templateUrl: string,
  selectedEntities: Array<{ id: string }>
): Promise<string> {
  const res = await fetch(templateUrl)
  if (!res.ok) throw new Error(`Impossible de charger le template : ${res.statusText}`)
  const tpl = await res.text()

  // Génère la clause VALUES en fonction du template
  const values = selectedEntities.map(entity => {
    // Si l'id contient déjà le préfixe, on l'utilise tel quel
    if (entity.id.includes(':') || entity.id.startsWith('<')) {
      return entity.id
    }
    // Sinon, on ajoute le préfixe imgt:
    return `imgt:${entity.id}`
  }).join(' ')

  const finalQuery = tpl.replace('__VALUES__', values)
  console.log("SPARQL générée :", finalQuery)
  return finalQuery
}


const errorMessage = ref('')
interface Doublet {
  target: string;
  label: string;
}

function parseCSVResults(csv: string): Doublet[] {
  if (!csv || typeof csv !== 'string') return [];
  
  // Split lines and clean them up
  const lines = csv.split('\n')
    .map(line => line.trim())
    .filter(line => line);
    
  if (lines.length < 2) return [];
  
  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim());
  const requiredHeaders = ['target', 'label'];
  
  // Validate headers
  for (const rh of requiredHeaders) {
    if (!headers.includes(rh)) {
      // Instead of errorMessage.value, consider throwing an error or returning an error object
      throw new Error(`CSV error: Missing '${rh}' header.`);
      // Or return { error: `CSV error: Missing '${rh}' header.` };
    }
  }
  
  // Process data rows
  return lines.slice(1).map(line => {
    // Simple CSV parsing - this doesn't handle quoted values with commas
    const values = line.split(',');
    
    return {
      target: (values[headers.indexOf("target")] || "").trim(),
      label: (values[headers.indexOf("label")] || "").trim(),
      // If you need replaceAllOccurrences, define it or import it
    };
  });
}

/**
 * Fonction générique pour parser les entités depuis un CSV, utilisant PapaParse pour robustesse.
 */
async function parseEntitiesList(
  csv: string,
  idColName: string,
  labelColName: string
): Promise<Array<{ id: string; label: string }>> {
  if (!csv) return []

  const results = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  })

  if (results.errors.length > 0) {
    console.error('Erreurs durant parsing CSV:', results.errors)
    return []
  }

  const data = results.data as Array<Record<string, string>>

  const entities = data.map(row => {
    const idRaw = (row[idColName] || '').replace(/"/g, '').trim()
    let id: string

    if (idColName === 'mab') {
      const idMatch = idRaw.match(/(?:#|imgt:)?(mAb_[A-Za-z0-9_]+)/)
      id = idMatch ? idMatch[1] : idRaw
    } else if (idColName === 'target') {
      const idMatch = idRaw//.match(/(?:#|imgt:)?([A-Za-z0-9_]+)/)
      id = idMatch //? idMatch[1] : idRaw
    } else if (idColName === 'moa') {
      const idMatch = idRaw.match(/(?:#|imgt:)?(MOA_[A-Za-z0-9_]+)/)
      id = idMatch ? idMatch[1] : idRaw
    } else {
      id = idRaw
    }

    let label = (row[labelColName] || '').replace(/^"|"$/g, '').trim()
    if (!label) label = id

    return { id, label }
  })

  return entities.filter(e => e.id && e.label)
}

/**
 * Récupère dynamiquement la liste des anticorps monoclonaux (mAbs) depuis une requête SPARQL.
 */
export async function fetchMabsFromSparql(): Promise<Array<{ id: string; label: string }>> {
  const queryUrl = './templates/mabs.rq'
  const res = await fetch(queryUrl)
  if (!res.ok) throw new Error("Impossible de charger le template SPARQL pour mAbs")

  const sparqlQuery = await res.text()
  console.log('Requête SPARQL pour mAbs :', sparqlQuery)
  const csv = await fetchData(sparqlQuery)
  console.log('CSV brut reçu pour mAbs:', csv)
  const entities = await parseEntitiesList(csv, 'mab', 'label')
  console.log('Entités mAb extraites:', entities)
  return entities
}

/**
 * Récupère dynamiquement la liste des Targets depuis une requête SPARQL.
 */
export async function fetchTargetsFromSparql(): Promise<Array<{ id: string; label: string }>> {
  const queryUrl = './templates/ListeTarget.rq'
  const res = await fetch(queryUrl)
  console.log("Fetch status:", res.status, "URL:", queryUrl)
  if (!res.ok) throw new Error('Impossible de charger le template SPARQL pour Targets')
    const query_list_target = `
  PREFIX ncit: <http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  
  SELECT DISTINCT ?target ?label
  WHERE { 
    ?target a ncit:C25702; 
            rdfs:label ?label
  }
  `;
  // const sparqlQuery = await res.text()
  // console.log("Requête SPARQL pour Targets :", sparqlQuery)
  const csv = await fetchData(query_list_target)
  console.log("CSV brut reçu pour Target :", csv)

  let parsedEntities
  try {
    parsedEntities = await parseEntitiesList(csv, 'target', 'label')
    console.log("Entités Target extraites :", parsedEntities)
  } catch (err) {
    console.error("Erreur parsing CSV Target :", err, "CSV:", csv)
    throw err // Pour bien propager l'erreur à l'appelant
  }

  return parsedEntities
}


/**
 * Récupère dynamiquement la liste des MOAs depuis une requête SPARQL.
 */
export async function fetchMOAsFromSparql(): Promise<Array<{ id: string; label: string }>> {
  const queryUrl = './templates/queryMoa.rq'
  const res = await fetch(queryUrl)
  console.log("Fetch status:", res.status, "URL:", queryUrl)
  if (!res.ok) throw new Error('Impossible de charger le template SPARQL pour MOAs')

  const sparqlQuery = await res.text()
  const csv = await fetchData(sparqlQuery)
  console.log('CSV brut reçu pour MOAs :', csv)

  let parsedEntities: Array<{ id: string; label: string }>
  try {
    const results = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
    })

    if (results.errors.length > 0) {
      console.error('Erreurs durant parsing CSV MOA:', results.errors)
      return []
    }

    const data = results.data as Array<Record<string, string>>
    parsedEntities = data.map(row => {
      const idRaw = (row['moa'] || '').replace(/"/g, '').trim()
      const idMatch = idRaw.match(/(?:#|imgt:)?(MOA_[A-Za-z0-9_]+)/)
      const id = idMatch ? idMatch[1] : idRaw
      let label = (row['label'] || '').replace(/^"|"$/g, '').trim()
      if (!label) label = id
      return { id, label }
    }).filter(e => e.id && e.label)

    console.log('Entités MOA extraites :', parsedEntities)
  } catch (err) {
    console.error('Erreur parsing CSV MOA :', err, 'CSV:', csv)
    throw err
  }

  return parsedEntities
}


/**
 * Génère une requête SPARQL pour la documentation d'une entité
 */
const qnamePrefixes = ['imgt:', 'hgnc:', 'ncit:', 'obo:', 'owl:', 'faldo:', 'skos:', 'rdf:', 'rdfs:']

export async function renderDocQuery(iri: string): Promise<string> {
  const rawDocQuery = await fetch('/templates/documentation.rq').then(r => r.text())

  // Vérifie si iri commence par l'un des préfixes déclarés OU déjà <http...>
  const isPrefixed = qnamePrefixes.some(prefix => iri.startsWith(prefix))
  if (!isPrefixed && !iri.startsWith('<')) {
    iri = `<${iri}>`
  }

  return rawDocQuery.replace(/\$ENTITY/g, iri)
}
