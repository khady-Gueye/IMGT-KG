/* eslint-disable */
/* Déclaration du global vis (fourni par le CDN vis-network UMD) */
declare var vis: any;

/* ===================== Gene ===================== */
var genedot = `digraph G {
node [ shape=box fontsize=15 fontcolor=black color="#FFC996" ]
edge [fontsize=14, color="#16db93"]

":Gene" -> ":Allele" [label="obo:GENO_0000413"]
":Gene" -> ":SubGroup" [label="obo:RO_0002350"]
":Gene" -> ":Group" [label="obo:RO_0002350"]
":Gene" -> ":Clan" [label="obo:RO_0002350"]
":SubGroup" -> ":Group" [label="obo:RO_0002350"]
":Clan" -> ":Group" [label="obo:RO_0002350"]

#gene
":Gene" -> ":MoleculeStructureType" [label=":hasMoleculeStructureType"]
":Gene" -> ":GeneType" [label=":hasGeneType"]
":Gene" -> ":Locus" [label=":isOrderedIn"]
":Gene" -> "obo:NCBITaxon_1" [label="obo:RO_0002162"]

#allele
":Allele" -> ":MoleculeFunctionalityType" [label=":hasFunctionalityType"]
":Allele" -> "faldo:Region" [label=":isInRefSequence"]
}`;

var container = document.getElementById("genenetwork") as HTMLElement | null;
var options = {
  physics: {
    stabilization: false,
    barnesHut: { springLength: 250 },
  },
};
var data = vis.parseDOTNetwork(genedot);
if (container) { var network = new vis.Network(container, data, options); }

/* ===================== Locus ===================== */
var locusdot = `digraph G {
node [ shape=box fontsize=15 fontcolor=black color="#FFC996" style=filled]
edge [fontsize=13, color="#16db93"]

":Locus" -> ":Gene" [label="hasGene"] 
":Locus" -> "obo:SO_0000340" [label="obo:RO_0002350"] 
":Locus" -> "obo:NCBITaxon_1" [label="obo:RO_0002162"] 
":Locus" -> ":LocusLocationType" [label=":hasLocusLocationType"]
"obo:SO_0000340" -> "obo:SO_0001248" [label="obo:RO_0002350"]
"obo:SO_0000340" -> "obo:NCIT_C25402" [label="obo:ERO_0000405"] 
"obo:SO_0001248" -> "obo:NCBITaxon_1" [label="obo:RO_0002162"] 
"obo:SO_0001248" -> "obo:NCIT_C103167" [label=":hasOrigin"] 
"obo:SO_0001248" -> "obo:NCIT_C164455" [label="obo:SWO_0004000"] 
}`;

var container2 = document.getElementById("locusnetwork") as HTMLElement | null;
var options2 = {
  physics: {
    stabilization: false,
    barnesHut: { springLength: 250 },
  },
};
var data2 = vis.parseDOTNetwork(locusdot);
if (container2) { var network2 = new vis.Network(container2, data2, options2); }

/* ===================== Sequence ===================== */
var seqdot = `digraph G {
node [ shape=box fontsize=15 fontcolor=black color="#FFC996" style=filled]
edge [fontsize=14, color="#16db93"]
"faldo:Region" -> "faldo:Region3" [label=":isInPrototype"]
#"faldo:Region" -> "obo:GENO_0000960" [label=":isClusterInSeq"]
"faldo:Region" -> ":Allele"  [label=":isRefSeqOf"]

#region
"faldo:Region" -> "obo:GENO_0000960" [label="obo:BFO_0000050"]
#"faldo:Region" -> "obo:GENO_0000960" [label=":isPrototypeInSeq"]

"obo:GENO_0000960" -> "obo:NCIT_C25402" [label="obo:ERO_0000405"]
"faldo:Region" -> "faldo:Region2" [label="allenRelations"]
#"faldo:Region" -> "faldo:Region" [label="isInPrototype"]

"faldo:Region" -> ":PartialityType" [label=":partiality"]
"faldo:Region" -> ":ImgtLabel" [label=":hasImgtLabel"]
"faldo:Region" -> "faldo:ExactPosition" [label="faldo:location"]
/*"faldo:\\ExactPosition" -> "end ^^xsd:int" [label="obo:GENO_0000895"]#end
"faldo:\\ExactPosition" -> "start ^^xsd:int" [label="obo:GENO_0000894"]#begin
*/
}`;

var container3 = document.getElementById("seqnetwork") as HTMLElement | null;
var options3 = {
  physics: {
    stabilization: false,
    barnesHut: { springLength: 250 },
  },
};
var data3 = vis.parseDOTNetwork(seqdot);
if (container3) { var network3 = new vis.Network(container3, data3, options3); }

/* ===================== Chain ===================== */
var chaindot = `digraph G {
node [ shape=box fontsize=15 fontcolor=black color="#FFC996" style=filled]
edge [fontsize=14, color="#16db93"]

#chain
"obo:NCIT_C41207" -> "obo:NCIT_C13303"  [label=":isChainInStruct"]
"obo:NCIT_C41207" -> ":ImgtLabel"  [label=":hasImgtLabel"]
"obo:NCIT_C41207" -> "obo:NCBITaxon_1" [label="obo:RO_0002162"]
"obo:NCIT_C41207" -> "faldo:ExactPosition" [label="faldo:location"]
"faldo:Region"  -> "obo:NCIT_C41207" [label="obo:BFO_0000050"]

#region
"faldo:Region" -> "faldo:ExactPosition" [label="faldo:location"]
"faldo:Region" -> "SequenceAlignment" [label=":hasAlignment"]
"SequenceAlignment" -> ":Allele" [label=":forAllele"]
"SequenceAlignment" -> "xsd:Double" [label=":has_similarity_score"]

#domain
"obo:NCIT_C13379" -> "obo:NCIT_C41207"  [label=":isDomainInChain"] 
"obo:NCIT_C13379" -> ":ImgtLabel"  [label=":hasImgtLabel"]
"obo:NCIT_C13379" -> "faldo:ExactPosition" [label="faldo:location"]
"obo:NCIT_C13379" -> ":DomainType" [label=":hasDomainType"]

#residu
"obo:NCIT_C48795" -> "obo:NCIT_C41207"  [label=":isResInChain"]
"obo:NCIT_C48795" -> ":NUMBERING"  [label=":hasNumbering"]
"obo:NCIT_C48795" -> "obo:CHEBI_33709"  [label=":hasAminoAcid"]
}`;

var container4 = document.getElementById("chainnetwork") as HTMLElement | null;
var options4 = {
  physics: {
    stabilization: false,
    barnesHut: { springLength: 250 },
  },
};
var data4 = vis.parseDOTNetwork(chaindot);
if (container4) { var network4 = new vis.Network(container4, data4, options4); }

/* ===================== Structure ===================== */
var structdot = `digraph G {
node [ shape=box fontsize=15 fontcolor=black color="#FFC996" style=filled]
edge [fontsize=13, color="#16db93"]

"obo:NCIT_C13303" -> "obo:NCIT_C41207"  [label=":isStructOfChain"]
"obo:NCIT_C13303" -> "sio:SIO_001100"  [label="isInCrystal"]
"obo:NCIT_C13303" -> ":ImgtLabel"  [label=":hasImgtLabel"]
"obo:NCIT_C13303" -> "obo:GENO_0000722"  [label=":hasEntry"]
"obo:NCIT_C13303" -> ":MolecularComponent"  [label=":hasMolComp"]
"obo:GENO_0000722" ->"obo:NCIT_C25402" [label="obo:ERO_0000405"]
"obo:GENO_0000722" ->"bibo:Article" [label=":hasBiblioRef"]
"obo:GENO_0000722" ->":OBTENTION" [label=":isObtainedFrom"]
}`;

var container5 = document.getElementById("structnetwork") as HTMLElement | null;
var options5 = {
  physics: {
    stabilization: false,
    barnesHut: { springLength: 250 },
  },
};
var data5 = vis.parseDOTNetwork(structdot);
if (container5) { var network5 = new vis.Network(container5, data5, options5); }
