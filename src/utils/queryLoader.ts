/**
 * Charge un template SPARQL et injecte dynamiquement une clause VALUES.
 * Pour les requêtes dynamiques basées sur des mAbs sélectionnés.
 *
 * @param templateUrl - URL du fichier .rq contenant le template avec le marqueur __VALUES__
 * @param selectedMabs - Liste des mAbs sélectionnés, ex : [{ id: 'mAb_123' }, { id: 'mAb_456' }]
 * @returns Une chaîne SPARQL complète avec la clause VALUES injectée
 */
export async function renderQuery(
  templateUrl: string,
  selectedMabs: Array<{ id: string }>
): Promise<string> {
  const res = await fetch(templateUrl)
  if (!res.ok) throw new Error(`Impossible de charger le template : ${res.statusText}`)
  const tpl = await res.text()

  // On suppose que `id` contient déjà "mAb_123", donc on évite d'ajouter le préfixe deux fois
  const values = selectedMabs.map(mab => `imgt:${mab.id}`).join(' ')
  const finalQuery = tpl.replace('__VALUES__', values)

  console.log("SPARQL générée :", finalQuery)
  return finalQuery
}
import { fetchData } from './Fonctions'

/**
 * Récupère dynamiquement la liste des anticorps monoclonaux (mAbs) depuis une requête SPARQL.
 *
 * @returns Un tableau d'objets { id, label } où id est du type "mAb_781"
 */
export async function fetchMabsFromSparql(): Promise<Array<{ id: string, label: string }>> {
  const queryUrl = '/templates/mabs.rq'
  const res = await fetch(queryUrl)
  if (!res.ok) throw new Error("Impossible de charger le template SPARQL pour mAbs")
  const sparqlQuery = await res.text()

  const csv = await fetchData(sparqlQuery)
  if (!csv) throw new Error("Aucune donnée reçue pour les mAbs")
  const lines = csv.split('\n').map(line => line.trim()).filter(Boolean)
  const headerLineIdx = lines.findIndex(line => /^mab\s*,\s*label$/i.test(line))
  if (headerLineIdx === -1) throw new Error("Aucune ligne d'en-tête valide trouvée dans le CSV")
  const headers = lines[headerLineIdx].split(',').map(h => h.trim())

  const idIdx = headers.indexOf('mab')
  const labelIdx = headers.indexOf('label')
  if (idIdx === -1 || labelIdx === -1) {
    throw new Error("Colonnes 'mab' ou 'label' manquantes dans le CSV")
  }

  return lines.slice(headerLineIdx + 1)
    .map(line => {
      const cols = line.split(',')
      if (cols.length < 2) return null

      // Nettoyage de l'URI ou du QName pour extraire un identifiant comme "mAb_781"
      const idRaw = cols[idIdx].replace(/"/g, '').trim()
      const idMatch = idRaw.match(/(?:#|imgt:)?(mAb_[A-Za-z0-9_]+)/)
      const id = idMatch ? idMatch[1] : idRaw

      // Nettoyage du label
      const labelRaw = cols[labelIdx].replace(/^"|"$/g, '').trim()
      const label = labelRaw || id

      return { id, label }
    })
    .filter((item): item is { id: string; label: string } => !!item)
}


const qnamePrefixes = ['imgt:', 'hgnc:', 'ncit:', 'obo:', 'owl:', 'faldo:', 'skos:', 'rdf:', 'rdfs:'];

export async function renderDocQuery(input: string): Promise<string> {
  // Charge la requête template modifiée qui utilise $ENTITY et $LABEL
  const rawDocQuery = await fetch('/templates/documentation.rq').then(r => r.text())
  
  // Détermine si 'input' est un QName/IRI ou un label
  const isPrefixed = qnamePrefixes.some(prefix => input.startsWith(prefix));
  const isIri = input.startsWith('<'); // IRI absolu
  
  // Si c'est un QName ou une IRI complète, on remplit $ENTITY et vide $LABEL
  // Sinon, on met $ENTITY à UNDEF (pour ignorer) et on remplit $LABEL
  let entityStr: string;
  let labelStr: string;
  
  if (isPrefixed || isIri) {
    entityStr = input;          // ex: "imgt:mAb_781" ou "<http://example.org/xxx>"
    labelStr = '""';            // chaîne vide (avec guillemets)
  } else {
    entityStr = 'UNDEF';        // indique qu'on ne cherche pas par IRI
    // échappe les guillemets dans le label et met en guillemets
    labelStr = `"${input.replace(/(["\\])/g, '\\$1')}"`;
  }

  // Remplace les placeholders dans la requête
  let query = rawDocQuery.replace(/\$ENTITY/g, entityStr);
  query = query.replace(/\$LABEL/g, labelStr);

  return query;
}
