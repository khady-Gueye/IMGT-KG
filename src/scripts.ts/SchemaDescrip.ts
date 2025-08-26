/* Déclarations globales (CDN) */
declare const vis: any;

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

var container = document.getElementById("genenetwork") as any;
var options = {
  physics: {
    stabilization: false,
    barnesHut: {
      springLength: 250,
    },
  },
};
var data = vis.parseDOTNetwork(genedot);
var network = new vis.Network(container, data, options);

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

var container = document.getElementById("locusnetwork") as any;
var options = {
  physics: {
    stabilization: false,
    barnesHut: {
      springLength: 250,
    },
  },
};
var data = vis.parseDOTNetwork(locusdot);
var network = new vis.Network(container, data, options);

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
/*"faldo:\ExactPosition" -> "end ^^xsd:int" [label="obo:GENO_0000895"]#end
"faldo:\ExactPosition" -> "start ^^xsd:int" [label="obo:GENO_0000894"]#begin
*/
}`;

var container = document.getElementById("seqnetwork") as any;
var options = {
  physics: {
    stabilization: false,
    barnesHut: {
      springLength: 250,
    },
  },
};
var data = vis.parseDOTNetwork(seqdot);
var network = new vis.Network(container, data, options);

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

var container = document.getElementById("chainnetwork") as any;
var options = {
  physics: {
    stabilization: false,
    barnesHut: {
      springLength: 250,
    },
  },
};
var data = vis.parseDOTNetwork(chaindot);
var network = new vis.Network(container, data, options);

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

var container = document.getElementById("structnetwork") as any;
var options = {
  physics: {
    stabilization: false,
    barnesHut: {
      springLength: 250,
    },
  },
};
var data = vis.parseDOTNetwork(structdot);
var network = new vis.Network(container, data, options);
