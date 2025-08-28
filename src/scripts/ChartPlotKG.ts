// src/scripts/ChartPlotKG.ts
// Conversion du ancien ChartPlotKG.js (amCharts v5 via CDN globals) en module TypeScript.
// Hypothèse: les scripts CDN suivants sont chargés AVANT l'appel :
//  - https://cdn.amcharts.com/lib/5/index.js
//  - https://cdn.amcharts.com/lib/5/percent.js
//  - https://cdn.amcharts.com/lib/5/xy.js
//  - https://cdn.amcharts.com/lib/5/themes/Animated.js

import { log } from "console";
import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import * as am5percent from "@amcharts/amcharts5/percent"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"



// ❌ Enlève tout window.addEventListener('load', ...)
// ✅ Laisse le code s’exécuter immédiatement (comme avant dans ton .js)


type DataPoint = { category: string; value: number }

function getAm() {

  const w = window as any
  const am5 = w.am5
  const am5xy = w.am5xy
  const am5percent = w.am5percent
  const am5themes_Animated = w.am5themes_Animated
  if (!am5 || !am5xy || !am5percent || !am5themes_Animated) {
    console.error(
      '[CharPlotKG] amCharts v5 non disponible. Vérifie que les CDN index.js, percent.js, xy.js et themes/Animated.js sont chargés.'
    )
    return null
  }
  return { am5, am5xy, am5percent, am5themes_Animated }
}

function disposeRootIfExists(id: string) {
  const am = getAm()
  if (!am) return
  const { am5 } = am
  try {
    am5.array.each(am5.registry.rootElements, (r: any) => {
      if (r && r.dom && r.dom.id === id) r.dispose()
    })
  } catch {console.log('erreur dispose')}
}

function elExists(id: string) {
  return !!document.getElementById(id)
}

/* -------------------- Helpers de rendu -------------------- */
// imports tout en haut du fichier
// import * as am5 from "@amcharts/amcharts5"
// import * as am5percent from "@amcharts/amcharts5/percent"
// import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"

// (optionnel) garder une référence pour bien dispose si on rerend au même id
const pieRoots: Record<string, am5.Root> = {}

/** Rendu d'un camembert amCharts v5 (npm) */
export function renderPie(id: string, data: DataPoint[], endAngle = 270) {
  const el = document.getElementById(id)
  if (!el) return

  // Dispose l'ancien root si on rerend sur le même conteneur
  const prev = pieRoots[id]
  if (prev && !prev.isDisposed()) prev.dispose()

  const root = am5.Root.new(id)
  pieRoots[id] = root

  root.setThemes([am5themes_Animated.new(root)])

  const chart = root.container.children.push(
    am5percent.PieChart.new(root, { endAngle })
  )

  const series = chart.series.push(
    am5percent.PieSeries.new(root, {
      valueField: "value",
      categoryField: "category",
      endAngle,
    })
  )

  series.data.setAll(data)

  // apparitions
  series.appear(800, 80)
  chart.appear(800, 80)

  return root // (optionnel) utile si tu veux manipuler après
}


// (optionnel) mémoriser les roots pour bien dispose si on rerend sur le même id
const barRoots: Record<string, am5.Root> = {}

export function renderBarCategory(id: string, data: DataPoint[]) {
  const el = document.getElementById(id)
  if (!el) return

  // Dispose l'ancien root si on rerend
  const prev = barRoots[id]
  if (prev && !prev.isDisposed()) prev.dispose()

  const root = am5.Root.new(id)
  barRoots[id] = root
  root.setThemes([am5themes_Animated.new(root)])

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
    })
  )

  
  const cursor = am5xy.XYCursor.new(root, {})
cursor.lineY.set("visible", false)  // ou cursor.lineY.setAll({ visible: false })
chart.set("cursor", cursor)


  const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 })
  xRenderer.labels.template.setAll({
    rotation: -90,
    centerY: am5.p50,
    centerX: am5.p100,
    paddingRight: 15,
  })
  xRenderer.grid.template.setAll({ location: 1 })

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      maxDeviation: 0.3,
      categoryField: "category",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {}),
    })
  )

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      maxDeviation: 0.3,
      renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
    })
  )

  const series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: "Series 1",
      xAxis,
      yAxis,
      valueYField: "value",
      categoryXField: "category",
      sequencedInterpolation: true,
      tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" }),
    })
  )

  series.columns.template.setAll({
    cornerRadiusTL: 5,
    cornerRadiusTR: 5,
    strokeOpacity: 0,
  })


  series.columns.template.adapters.add("fill", (_fill, target) =>
    chart.get("colors")?.getIndex(series.columns.indexOf(target)) ?? am5.color(0x999999)
  )
  
  series.columns.template.adapters.add("stroke", (_stroke, target) =>
    chart.get("colors")?.getIndex(series.columns.indexOf(target)) ?? am5.color(0x999999)
  )
  
  xAxis.data.setAll(data)
  series.data.setAll(data)

  series.appear(800)
  chart.appear(800, 80)

  return root // (facultatif)
}

/* -------------------- Données (copie 1:1 de ton JS) -------------------- */

// Pie
const DATA_pieproperty: DataPoint[] = [
  { category: 'obo', value: 35 },
  { category: 'faldo', value: 1 },
  { category: 'imgt', value: 139 },
  { category: 'skos', value: 2 },
  { category: 'owl', value: 15 },
  { category: 'rdfs', value: 7 },
  { category: 'rdf', value: 3 },
  { category: 'dc', value: 5 },
]
const DATA_pieclasse: DataPoint[] = [
  { category: 'obo', value: 1008 },
  { category: 'faldo', value: 4 },
  { category: 'imgt', value: 391 },
  { category: 'owl', value: 11 },
  { category: 'bibo', value: 1 },
]

// Top 5
const DATA_top5concept: DataPoint[] = [
  { category: 'obo:NCIT_C48795', value: 6710173 },
  { category: 'faldo:Region', value: 523649 },
  { category: 'faldo:ExactPosition', value: 523191 },
  { category: 'faldo:ForwardStrandPosition', value: 261380 },
  { category: 'faldo:ReverseStrandPosition', value: 65833 },
]
const DATA_top5property: DataPoint[] = [
  { category: 'rdf:type', value: 8350934 },
  { category: 'rdfs:label', value: 7878468 },
  { category: 'imgt:isResInChain', value: 6710173 },
  { category: 'imgt:isChainOfRes', value: 6710173 },
  { category: 'imgt:abreviation', value: 6710173 },
]

// Top 10
const DATA_top10concept: DataPoint[] = [
  { category: 'obo:NCIT_C48795', value: 6710173 },
  { category: 'faldo:Region', value: 523649 },
  { category: 'faldo:ExactPosition', value: 523191 },
  { category: 'faldo:ForwardStrandPosition', value: 261380 },
  { category: 'faldo:ReverseStrandPosition', value: 65833 },
  { category: 'obo:NCIT_C13379', value: 47753 },
  { category: 'obo:NCIT_C41207', value: 44984 },
  { category: 'obo:NCIT_C13303', value: 31663 },
  { category: 'obo:GENO_0000017', value: 20607 },
  { category: 'owl:Restriction', value: 18218 },
]
const DATA_top10property: DataPoint[] = [
  { category: 'rdf:type', value: 8350934 },
  { category: 'rdfs:label', value: 7878468 },
  { category: 'imgt:isResInChain', value: 6710173 },
  { category: 'imgt:isChainOfRes', value: 6710173 },
  { category: 'imgt:abreviation', value: 6710173 },
  { category: 'imgt:hasAminoAcideType', value: 6710173 },
  { category: 'imgt:hasNumbering', value: 6709903 },
  { category: 'imgt:has_phi_angle', value: 6588448 },
  { category: 'imgt:has_psi_angle', value: 6588448 },
  { category: 'owl:differentFrom', value: 5023876 },
]

// Top 20
const DATA_top20concept: DataPoint[] = [
  { category: 'obo:NCIT_C48795', value: 6710173 },
  { category: 'faldo:Region', value: 523649 },
  { category: 'faldo:ExactPosition', value: 523191 },
  { category: 'faldo:ForwardStrandPosition', value: 261380 },
  { category: 'faldo:ReverseStrandPosition', value: 65833 },
  { category: 'obo:NCIT_C13379', value: 47753 },
  { category: 'obo:NCIT_C41207', value: 44984 },
  { category: 'obo:NCIT_C13303', value: 31663 },
  { category: 'obo:GENO_0000017', value: 20607 },
  { category: 'owl:Restriction', value: 18218 },
  { category: 'imgt:Allele', value: 14498 },
  { category: 'obo:NCIT_C25402', value: 13194 },
  { category: 'owl:Class', value: 10905 },
  { category: 'imgt:NUMEROTATION', value: 10807 },
  { category: 'obo:NCIT_C19398', value: 8611 },
  { category: 'obo:GENO_0000722', value: 7057 },
  { category: 'obo:GENO_0000960', value: 5177 },
  { category: 'obo:NCIT_C174271', value: 3124 },
  { category: 'bibo:Article', value: 2851 },
  { category: 'obo:NCIT_C51980', value: 1634 },
]
const DATA_top20property: DataPoint[] = [
  { category: 'rdf:type', value: 8350934 },
  { category: 'rdfs:label', value: 7878468 },
  { category: 'imgt:isResInChain', value: 6710173 },
  { category: 'imgt:isChainOfRes', value: 6710173 },
  { category: 'imgt:abreviation', value: 6710173 },
  { category: 'imgt:hasAminoAcideType', value: 6710173 },
  { category: 'imgt:hasNumbering', value: 6709903 },
  { category: 'imgt:has_phi_angle', value: 6588448 },
  { category: 'imgt:has_psi_angle', value: 6588448 },
  { category: 'owl:differentFrom', value: 5023876 },
  { category: 'obo:BFO_0000050', value: 1047125 },
  { category: 'obo:BFO_0000051', value: 918072 },
  { category: 'obo:RO_0001019', value: 649358 },
  { category: 'faldo:location', value: 524191 },
  { category: 'obo:GENO_0000895', value: 524191 },
  { category: 'obo:GENO_0000894', value: 524191 },
  { category: 'imgt:hasImgtLabel', value: 447860 },
  { category: 'imgt:nextTo', value: 426552 },
  { category: 'imgt:previousTo', value: 426552 },
  { category: 'imgt:isInCluster', value: 391940 },
]

// Top 10 bis
const DATA_top10bconcept: DataPoint[] = [
  { category: 'obo:NCIT_C13379', value: 47753 },
  { category: 'obo:NCIT_C41207', value: 44984 },
  { category: 'obo:NCIT_C13303', value: 31663 },
  { category: 'obo:GENO_0000017', value: 20607 },
  { category: 'imgt:Allele', value: 14498 },
  { category: 'obo:NCIT_C25402', value: 13194 },
  { category: 'imgt:NUMEROTATION', value: 10807 },
  { category: 'imgt:Gene', value: 10373 },
  { category: 'obo:NCIT_C19398', value: 8611 },
  { category: 'obo:GENO_0000722', value: 7057 },
]
const DATA_top10bproperty: DataPoint[] = [
  { category: 'imgt:isResInChain', value: 6710173 },
  { category: 'imgt:isChainOfRes', value: 6710173 },
  { category: 'imgt:abreviation', value: 6710173 },
  { category: 'imgt:hasAminoAcideType', value: 6710173 },
  { category: 'imgt:hasNumbering', value: 6709903 },
  { category: 'imgt:has_phi_angle', value: 6588448 },
  { category: 'imgt:has_psi_angle', value: 6588448 },
  { category: 'obo:BFO_0000050', value: 1047125 },
  { category: 'obo:BFO_0000051', value: 918072 },
  { category: 'obo:RO_0001019', value: 649358 },
]

// Top 20 bis
const DATA_top20bconcept: DataPoint[] = [
  { category: 'obo:NCIT_C13379', value: 47753 },
  { category: 'obo:NCIT_C41207', value: 44984 },
  { category: 'obo:NCIT_C13303', value: 31663 },
  { category: 'obo:GENO_0000017', value: 20607 },
  { category: 'imgt:Allele', value: 14498 },
  { category: 'obo:NCIT_C25402', value: 13194 },
  { category: 'imgt:NUMEROTATION', value: 10807 },
  { category: 'imgt:Gene', value: 10373 },
  { category: 'obo:NCIT_C19398', value: 8611 },
  { category: 'obo:GENO_0000722', value: 7057 },
  { category: 'obo:GENO_0000960', value: 5177 },
  { category: 'obo:NCIT_C174271', value: 3124 },
  { category: 'bibo:Article', value: 2851 },
  { category: 'imgt:Labels', value: 2378 },
  { category: 'obo:NCIT_C51980', value: 1634 },
  { category: 'imgt:Group', value: 1516 },
  { category: 'imgt:Segment', value: 1330 },
  { category: 'imgt:MAbReceptor', value: 1257 },
  { category: 'imgt:Construct', value: 1200 },
  { category: 'obo:NCIT_C53285', value: 1084 },
]
const DATA_top20bproperty: DataPoint[] = [
  { category: 'imgt:isResInChain', value: 6710173 },
  { category: 'imgt:isChainOfRes', value: 6710173 },
  { category: 'imgt:abreviation', value: 6710173 },
  { category: 'imgt:hasAminoAcideType', value: 6710173 },
  { category: 'imgt:hasNumbering', value: 6709903 },
  { category: 'imgt:has_phi_angle', value: 6588448 },
  { category: 'imgt:has_psi_angle', value: 6588448 },
  { category: 'obo:BFO_0000050', value: 1047125 },
  { category: 'obo:BFO_0000051', value: 918072 },
  { category: 'obo:RO_0001019', value: 649358 },
  { category: 'faldo:location', value: 524191 },
  { category: 'obo:GENO_0000895', value: 524191 },
  { category: 'obo:GENO_0000894', value: 524191 },
  { category: 'imgt:hasImgtLabel', value: 447860 },
  { category: 'imgt:nextTo', value: 426552 },
  { category: 'imgt:previousTo', value: 426552 },
  { category: 'imgt:isInCluster', value: 391940 },
  { category: 'obo:RO_0001018', value: 383166 },
  { category: 'imgt:isInRefSequence', value: 338430 },
  { category: 'imgt:isRefSequenceOf', value: 338430 },
]

// Top 10 inf
const DATA_top10infconcept: DataPoint[] = [
  { category: 'obo:NCIT_C48795', value: 6710173 },
  { category: 'faldo:Region', value: 539455 },
  { category: 'faldo:ExactPosition', value: 539047 },
  { category: 'faldo:Position', value: 539047 },
  { category: 'faldo:StrandedPosition', value: 322766 },
  { category: 'faldo:ForwardStrandPosition', value: 257205 },
  { category: 'imgt:3D-2DStructure', value: 143085 },
  { category: 'imgt:SEQUENCE', value: 123646 },
  { category: 'obo:GENO_0000702', value: 110160 },
  { category: 'obo:GENO_0000017', value: 96727 },
]
const DATA_top10infproperty: DataPoint[] = [
  { category: 'rdf:type', value: 14642173 },
  { category: 'rdfs:label', value: 7898063 },
  { category: 'imgt:isResInChain', value: 6710173 },
  { category: 'imgt:isChainOfRes', value: 6710173 },
  { category: 'imgt:abreviation', value: 6710173 },
  { category: 'imgt:hasAminoAcideType', value: 6710173 },
  { category: 'imgt:hasNumbering', value: 6709903 },
  { category: 'imgt:has_phi_angle', value: 6588448 },
  { category: 'imgt:has_psi_angle', value: 6588448 },
  { category: 'rdf:first', value: 5058530 },
]

// Top 20 inf
const DATA_top20infconcept: DataPoint[] = [
  { category: 'obo:NCIT_C48795', value: 6710173 },
  { category: 'faldo:Region', value: 539455 },
  { category: 'faldo:ExactPosition', value: 539047 },
  { category: 'faldo:Position', value: 539047 },
  { category: 'faldo:StrandedPosition', value: 322766 },
  { category: 'faldo:ForwardStrandPosition', value: 257205 },
  { category: 'imgt:3D-2DStructure', value: 143085 },
  { category: 'imgt:SEQUENCE', value: 123646 },
  { category: 'obo:GENO_0000702', value: 110160 },
  { category: 'obo:GENO_0000017', value: 96727 },
  { category: 'faldo:ReverseStrandPosition', value: 65561 },
  { category: 'obo:NCIT_C13379', value: 54150 },
  { category: 'obo:NCIT_C41207', value: 47060 },
  { category: 'imgt:Gene', value: 35985 },
  { category: 'obo:NCIT_C13303', value: 32937 },
  { category: 'imgt:CLASSIFICATION', value: 25220 },
  { category: 'imgt:DESCRIPTION', value: 17890 },
  { category: 'imgt:Prototype', value: 15469 },
  { category: 'imgt:Allele', value: 14483 },
  { category: 'obo:NCIT_C25402', value: 13486 },
]
const DATA_top20infproperty: DataPoint[] = [
  { category: 'rdf:type', value: 14642173 },
  { category: 'rdfs:label', value: 7898063 },
  { category: 'imgt:isResInChain', value: 6710173 },
  { category: 'imgt:isChainOfRes', value: 6710173 },
  { category: 'imgt:abreviation', value: 6710173 },
  { category: 'imgt:hasAminoAcideType', value: 6710173 },
  { category: 'imgt:hasNumbering', value: 6709903 },
  { category: 'imgt:has_phi_angle', value: 6588448 },
  { category: 'imgt:has_psi_angle', value: 6588448 },
  { category: 'rdf:first', value: 5058530 },
  { category: 'rdf:rest', value: 5058530 },
  { category: 'owl:distinctMembers', value: 2528770 },
  { category: 'obo:BFO_0000050', value: 1727861 },
  { category: 'obo:BFO_0000051', value: 1614002 },
  { category: 'obo:RO_0001018', value: 639996 },
  { category: 'obo:RO_0001019', value: 639996 },
  { category: 'obo:RO_0002220', value: 632084 },
  { category: 'faldo:location', value: 539047 },
  { category: 'obo:GENO_0000895', value: 539047 },
  { category: 'obo:GENO_0000894', value: 539047 },
]

/* -------------------- Exports de rendu 1:1 -------------------- */

// Pies
export function drawPieProperty() { renderPie('pieproperty', DATA_pieproperty) }
export function drawPieClasse() { renderPie('pieclasse', DATA_pieclasse) }

// Top 5
export function drawTop5Concept() { renderBarCategory('top5concept', DATA_top5concept) }
export function drawTop5Property() { renderBarCategory('top5property', DATA_top5property) }

// Top 10
export function drawTop10Concept() { renderBarCategory('top10concept', DATA_top10concept) }
export function drawTop10Property() { renderBarCategory('top10property', DATA_top10property) }

// Top 20
export function drawTop20Concept() { renderBarCategory('top20concept', DATA_top20concept) }
export function drawTop20Property() { renderBarCategory('top20property', DATA_top20property) }

// Top 10 bis
export function drawTop10bConcept() { renderBarCategory('top10bconcept', DATA_top10bconcept) }
export function drawTop10bProperty() { renderBarCategory('top10bproperty', DATA_top10bproperty) }

// Top 20 bis
export function drawTop20bConcept() { renderBarCategory('top20bconcept', DATA_top20bconcept) }
export function drawTop20bProperty() { renderBarCategory('top20bproperty', DATA_top20bproperty) }

// Top 10 inf
export function drawTop10infConcept() { renderBarCategory('top10infconcept', DATA_top10infconcept) }
export function drawTop10infProperty() { renderBarCategory('top10infproperty', DATA_top10infproperty) }

// Top 20 inf
export function drawTop20infConcept() { renderBarCategory('top20infconcept', DATA_top20infconcept) }
export function drawTop20infProperty() { renderBarCategory('top20infproperty', DATA_top20infproperty) }

/** Appelle TOUT (sans erreur si un id n’existe pas) */
export function initKgCharts() {
  drawPieProperty()
  drawPieClasse()
  drawTop5Concept()
  drawTop5Property()
  drawTop10Concept()
  drawTop10Property()
  drawTop20Concept()
  drawTop20Property()
  drawTop10bConcept()
  drawTop10bProperty()
  drawTop20bConcept()
  drawTop20bProperty()
  drawTop10infConcept()
  drawTop10infProperty()
  drawTop20infConcept()
  drawTop20infProperty()
}
