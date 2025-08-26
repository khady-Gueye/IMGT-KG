<template>
  <section class="kgdesc-page">
    <!-- Titre -->
    <v-row>
      <v-col>
        <v-card class="card-title mx-auto w-100" title="">
          <div class="title text-h5 text-center p-20">IMGT-KG Description</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Introduction -->
    <v-row>
      <v-col>
        <v-card class="mx-auto" title="Introduction">
          <v-card-item>
            <div class="text-body-2">
              <p>
                The <strong>IMGT-KG</strong> data model can be divided into five levels of description, from nucleotide to protein sequence.
                The initial level comprises the depiction of genes and alleles. The subsequent level provides details about the genomic loci of these genes.
                The following level describes the sequence characteristics of the genes. The fourth level transitions to the protein level, presenting a description
                pertaining to the sequence of the protein chain and its domains. Finally, the last model describes the chain that belongs to the structure.
                In the data model, every class has an annotation label
                <v-chip class="ma-0 v-chip-link" color="primary" label>
                  <a href="http://www.w3.org/2000/01/rdf-schema#label">(rdfs:label)</a>
                </v-chip>, a definition
                <v-chip class="ma-0 v-chip-link" color="primary" label>
                  <a href="http://www.w3.org/2004/02/skos/core#definition">(skos:definition)</a>
                </v-chip> and a comment
                <v-chip class="ma-0 v-chip-link" color="primary" label>
                  <a href="http://www.w3.org/2000/01/rdf-schema#comment">(rdfs:comment)</a>
                </v-chip> when it is possible. A dinamyc visualisation of the data model made with
                <v-chip class="ma-0 v-chip-link" color="primary" label>
                  <a href="https://visjs.github.io/vis-network/">Vis-Network</a>
                </v-chip> is provided. However a table with additional annotation properties is provided, when they exist.
              </p>
            </div>
          </v-card-item>

          <v-card-item>
            <div class="text-body-2">
              <code class="code">
                PREFIX rdfs: &lt;http://www.w3.org/2000/01/rdf-schema#&gt; <br>
                PREFIX faldo: &lt;http://biohackathon.org/resource/faldo#&gt; <br>
                PREFIX skos: &lt;http://www.w3.org/2004/02/skos/core#&gt; <br>
                PREFIX obo: &lt;http://purl.obolibrary.org/obo/&gt; <br>
                PREFIX : &lt;http://www.imgt.org/imgt-ontology#&gt;
              </code>
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gene Level -->
    <v-row>
      <v-col>
        <v-card class="mx-auto" title="Gene level">
          <v-card-item>
            <div class="text-body-2">
              <p>
                At the gene level, we have a Gene which can be member of
                <v-chip class="ma-0 v-chip-link" color="primary" label>
                  <a href="http://purl.obolibrary.org/obo/RO_0002350">(obo:RO_0002350)</a>
                </v-chip> Group, that could be a member of a SubGroup and/or Clan. A Clan or a SubGroup can also be member of a Group. A Gene concept is
                defined by a gene type (variable, diversity ...) and a structure type. An allele is a gene variant that is associated with it. An Allele has a
                functionality type that indicates its functionality (functional,pseudogene...) and it is associated to a sequence region
                <v-chip class="ma-0 v-chip-link" color="primary" label>
                  <a href="http://biohackathon.org/resource/faldo#Region">(faldo:Region)</a>
                </v-chip>, which can be a reference or literature sequence. Every Gene is ordered in a Locus and belongs to a taxon
                <v-chip class="ma-0 v-chip-link" color="primary" label>
                  <a href="http://purl.obolibrary.org/obo/NCBITaxon_1">(obo:NCBITaxon_1)</a>
                </v-chip>.
              </p>
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-card-item>
            <div id="genenetwork"></div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-card-item>
            <table>
              <thead>
                <tr>
                  <th> </th>
                  <th>AnnotationProperty</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr><td rowspan="2">Gene</td></tr>
                <tr><td>imgt_link</td><td>a link that points to imgt website</td></tr>
                <tr><td rowspan="4">Allele</td></tr>
                <tr><td>has_fcode</td><td>a code for functionality type</td></tr>
                <tr><td>has_number</td><td>number of Allele</td></tr>
              </tbody>
            </table>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- Locus level -->
    <v-row>
      <v-col>
        <v-card class="mx-auto" title="Locus level">
          <v-card-item>
            <div class="text-body-2">
              <p>
                A Locus belongs to a taxon with a location type that indicates its location (major locus, orphon ...). It is part of
                <v-chip class="ma-0 v-chip-link" color="primary" label><a href="http://purl.obolibrary.org/obo/BFO_0000050">(obo:BFO_0000050)</a></v-chip>
                chromosome <v-chip class="ma-0 v-chip-link" color="primary" label><a href="http://purl.obolibrary.org/obo/SO_0000340">(obo:SO_0000340)</a></v-chip>.
                Each chromosome is member of a given assembly
                <v-chip class="ma-0 v-chip-link" color="primary" label><a href="http://purl.obolibrary.org/obo/SO_0001248">(obo:SO_0001248)</a></v-chip>
                which has a version number
                <v-chip class="ma-0 v-chip-link" color="primary" label><a href="http://purl.obolibrary.org/obo/SWO_0004000">(obo:SWO_0004000)</a></v-chip>,
                data origin
                <v-chip class="ma-0 v-chip-link" color="primary" label><a href="http://purl.obolibrary.org/obo/NCIT_C103167">(obo:NCIT_C103167)</a></v-chip>
                and belongs also to a taxon.
              </p>
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-card-item>
            <div id="locusnetwork"></div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- Sequence level -->
    <v-row>
      <v-col>
        <v-card class="mx-auto" title="Sequence level">
          <v-card-item>
            <div class="text-body-2">
              <p>
                The sequence level characterizes the features of the sequence. A feature is a sequence region which is associated with a location, and a label.
                Therefore, each region has a label and a location
                <v-chip class="ma-0 v-chip-link" color="primary" label><a href="http://biohackathon.org/resource/faldo#ExactPosition">(faldo:ExactPosition)</a></v-chip>
                with a start and end positions. A region at the nucleotide sequence level is part of
                <v-chip class="ma-0 v-chip-link" color="primary" label><a href="http://purl.obolibrary.org/obo/BFO_0000050">(obo:BFO_0000050)</a></v-chip>
                a DNA or RNA sequence
                <v-chip class="ma-0 v-chip-link" color="primary" label><a href="http://purl.obolibrary.org/obo/GENO_0000960">(obo:GENO_0000960)</a></v-chip>
                with an accession number
                <v-chip class="ma-0 v-chip-link" color="primary" label><a href="http://purl.obolibrary.org/obo/NCIT_C25402">(obo:NCIT_C25402)</a></v-chip>.
                A region can be a prototype entity or a cluster (A DNA fragment covering several genomic entities). The Cluster and the prototype
                entity are part of a biological sequence
                <v-chip class="ma-0 v-chip-link" color="primary" label><a href="http://purl.obolibrary.org/obo/GENO_0000702">(obo:GENO_0000702)</a></v-chip>
                thanks to isPrototypeInSeq and isClusterInSeq relation, respectively. The biological sequence contains other regions which are related to each other.
                Every region in the same biological sequence has an
                <v-chip class="ma-0 v-chip-link" color="primary" label>
                  <a href="https://en.wikipedia.org/wiki/Allen%27s_interval_algebra#:~:text=Allen's%20interval%20algebra%20is%20a,about%20temporal%20descriptions%20of%20events.">
                    Allen interval relationship
                  </a>
                </v-chip>, for example, a region A can be next to (adjacent) to other regions.
              </p>
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-card-item>
            <div id="seqnetwork"></div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-card-item>
            <table class="desctab">
              <td rowspan="2"> </td>
              <tr>
                <td>AnnotationProperty</td>
                <td>Description</td>
              </tr>
              <tr><td rowspan="3">Region</td></tr>
              <tr><td>has_nucleotide_sequence</td><td>composition in nucleotides of the region when it's a coding region</td></tr>
              <tr><td>has_imgt_qualifier</td><td>a qualifier imgt to describe the region</td></tr>
              <tr><td rowspan="4">obo:GENO_0000960</td></tr>
              <tr><td>has_nucleotide_sequence</td><td>composition in nucleotides of the sequence</td></tr>
            </table>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- Chain level -->
    <v-row>
      <v-col>
        <v-card class="mx-auto" title="Chain level">
          <v-card-item>
            <div class="text-body-2">
              <p>
                This level is the transition from nucleotide sequences to protein sequences. A chain
                <v-chip class="ma-0 v-chip-link" color="primary" label> <a href="http://purl.obolibrary.org/obo/NCIT_C41207">obo:NCIT_C41207</a></v-chip>
                can have protein domains
                <v-chip class="ma-0 v-chip-link" color="primary" label> <a href="http://purl.obolibrary.org/obo/NCIT_C13303">obo:NCIT_C13303</a></v-chip>
                with a domain type. It also has regions and residues
                <v-chip class="ma-0 v-chip-link" color="primary" label> <a href="http://purl.obolibrary.org/obo/NCIT_C48795">obo:NCIT_C48795</a></v-chip>
                with the associated amino acids
                <v-chip class="ma-0 v-chip-link" color="primary" label> <a href="http://purl.obolibrary.org/obo/CHEBI_33709">obo:CHEBI_33709</a></v-chip>
                and an IMGT numbering. Each chain and domain have a label and a location. The associated region of a Chain is the reference sequence
                of an Allele with a similarity score. The Chains belong to a taxon and a structure
                <v-chip class="ma-0 v-chip-link" color="primary" label><a href="http://purl.obolibrary.org/obo/NCIT_C13303">obo:NCIT_C13303</a></v-chip>.
              </p>
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-card-item>
            <div id="chainnetwork"></div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-card-item>
            <table id="chain" class="desctab">
              <td rowspan="2"> </td>
              <tr>
                <td>AnnotationProperty</td>
                <td>Description</td>
              </tr>
              <tr><td rowspan="4">Chain</td></tr>
              <tr><td>code4A</td><td>code of the chain</td></tr>
              <tr><td>has_imgt_chain_description</td><td>a description of the chain in its different domains</td></tr>
              <tr><td>imgt_link</td><td>a link that points to imgt website</td></tr>

              <tr><td rowspan="3">Domain</td></tr>
              <tr><td>has_imgt_collier_perles</td><td>imgt collier de perles link</td></tr>
              <tr><td>has_sheet</td><td>different sheets of domain</td></tr>

              <tr><td rowspan="4">Residue</td></tr>
              <tr><td>abreviation</td><td>short name or abreviation of the residue</td></tr>
              <tr><td>has_phi_angle</td><td>phi angle</td></tr>
              <tr><td>has_psi_angle</td><td>psi angle</td></tr>
            </table>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- Structure level -->
    <v-row>
      <v-col>
        <v-card class="mx-auto" title="Structure level">
          <v-card-item>
            <div class="text-body-2">
              <p>
                A Structure
                <v-chip class="ma-0 v-chip-link" color="primary" label><a href="http://purl.obolibrary.org/obo/NCIT_C13303">obo:NCIT_C13303</a></v-chip>
                can belong to a crystal structure
                <v-chip class="ma-0 v-chip-link" color="primary" label><a href="http://semanticscience.org/resource/SIO_001100">sio:SIO_001100</a></v-chip>,
                has a label and a molecular component. A Structure is attached to a entry of amino acid sequence
                <v-chip class="ma-0 v-chip-link" color="primary" label><a href="http://purl.obolibrary.org/obo/GENO_0000720">obo:GENO_0000720</a></v-chip>.
                This sequence has a accession number, a related bibliographic reference and the acquisition experiment.
              </p>
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-card-item>
            <div id="structnetwork"></div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-card-item>
            <table id="struct" class="desctab">
              <td rowspan="2"> </td>
              <tr>
                <td>AnnotationProperty</td>
                <td>Description</td>
              </tr>
              <tr><td rowspan="5">Structure</td></tr>
              <tr><td>common_name</td><td>common name</td></tr>
              <tr><td>commercial_name</td><td>commercial name</td></tr>
              <tr><td>inn_name</td><td>INN name</td></tr>
              <tr><td>immune_epitope</td><td>an external link that points to the predict epitope of a structure in IEDB</td></tr>

              <tr><td rowspan="8">Amino acide sequence</td></tr>
              <tr><td>contact_analysis</td><td>a link that points to pair contacts analyses</td></tr>
              <tr><td>has_amino_sequence</td><td>amino acide sequence</td></tr>
              <tr><td>imgt_link</td><td>a link that points to imgt website</td></tr>
              <tr><td>interaction_paratope_epitope</td><td>a link that points to interaction paratope epitope</td></tr>
              <tr><td>is_entry_from</td><td>amino sequence's database</td></tr>
              <tr><td>jmol_visualisation</td><td>a link to explore the structure in Jmol</td></tr>
              <tr><td>pdb_link</td><td>a external link to pdb database</td></tr>

              <tr><td rowspan="5">Article</td></tr>
              <tr><td>dc:title</td><td>article's title</td></tr>
              <tr><td>dc:contributor</td><td>article's contributors</td></tr>
              <tr><td>dc:date</td><td>publication date</td></tr>
              <tr><td>has_journal</td><td>journal of publication</td></tr>
            </table>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- Statistics -->
    <v-row>
      <v-col>
        <v-card class="card-title mx-auto w-100" title="">
          <div class="title text-h5 text-center p-20"><strong>IMGT-KG</strong> Statistics</div>
        </v-card>
        <v-card>
          <v-card-item>
            <p>
              <strong>IMGT-KG</strong> provides access to 79 670 110 triplets without inferences, 95 508 660 triplets with inferences applied,
              10 430 268 entities, 15 848 105 distinct subjects, 21 861 727 distinct objects, 673 distinct concepts or classes and
              171 distinct properties or relations. We provide below Figures demonstrating the main features of <strong>IMGT-KG</strong>.
            </p>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card class="mx-auto" title="Pie chart of different categories of concepts used in IMGT-KG">
          <div id="pieclasse"></div>
        </v-card>
      </v-col>
      <v-col>
        <v-card class="mx-auto" title="Pie chart of different categories of properties used in IMGT-KG">
          <div id="pieproperty"></div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card class="mx-auto" title="BarPlot of the top 20 concepts instantiated in IMGT-KG">
          <v-card-item><div id="top20concept"></div></v-card-item>
        </v-card>
      </v-col>
      <v-col>
        <v-card class="mx-auto" title="BarPlot of the top 20 properties instantiated in IMGT-KG">
          <v-card-item><div id="top20property"></div></v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card class="mx-auto" title="Top 20 concepts with some terms removed">
          <v-card-item><div id="top20bconcept"></div></v-card-item>
        </v-card>
      </v-col>
      <v-col>
        <v-card class="mx-auto" title="Top 20 properties with some terms removed">
          <v-card-item><div id="top20bproperty"></div></v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card class="mx-auto" title="Top 20 concepts with inference applied">
          <v-card-item><div id="top20infconcept"></div></v-card-item>
        </v-card>
      </v-col>
      <v-col>
        <v-card class="mx-auto" title="Top 20 properties with inference applied">
          <v-card-item><div id="top20infproperty"></div></v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<script setup lang="ts">
/* eslint-disable */
import { onMounted } from 'vue'

/** Charge un <script> externe une seule fois (CDN ou /public/...) */
function loadScript (src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Fail load: ${src}`))
    document.head.appendChild(s)
  })
}

onMounted(async () => {
  try {
    // === mêmes CDN que dans ton HTML d'origine ===
    await loadScript('https://cdn.amcharts.com/lib/5/index.js')
    await loadScript('https://cdn.amcharts.com/lib/5/percent.js')
    await loadScript('https://cdn.amcharts.com/lib/5/xy.js')
    await loadScript('https://cdn.amcharts.com/lib/5/themes/Animated.js')
    await loadScript('https://unpkg.com/vis-network/standalone/umd/vis-network.min.js')

    // === tes scripts locaux (place-les dans /public/SrciptJs/ si besoin) ===
    // Si tu as converti en TypeScript auto-exécuté, compile-les en .js côté build
    await loadScript('/SrciptJs/CharPlotKG.js')     // crée les charts amCharts
    await loadScript('/SrciptJs/SchemaDescrip.js') // dessine les 5 graphes vis-network

    // Si un autre bundle expose des fonctions globales, on les appelle si dispo (no-op sinon)
    const w = window as any
    w.initKgCharts?.()
    w.drawGeneNetwork?.()
    w.drawLocusNetwork?.()
    w.drawSeqNetwork?.()
    w.drawChainNetwork?.()
    w.drawStructNetwork?.()
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
/* Fond gris clair uniquement pour cet onglet */
.kgdesc-page {
  background: #f7f7f7;
  padding: 20px;
}

/* largeur centrale comme dans ton CSS (.zone-main) */
.kgdesc-page :deep(.v-container),
.kgdesc-page {
  width: 85%;
  margin: auto;
}

.title { padding: 20px; font-weight: 500 !important; color: #444 !important; }
.v-chip-link a { font-weight: bold; }
.v-chip-link a:hover { color: crimson !important; }
.v-chip-link { height: 23px !important; }
.text-body-2 { text-align: justify; }

/* Ta grille de hauteurs par ID (inchangée) */
#genenetwork { width: 100%; height: 700px; }
#locusnetwork { width: 100%; height: 700px; }
#seqnetwork   { width: 100%; height: 700px; }
#chainnetwork { width: 100%; height: 800px; }
#structnetwork{ width: 100%; height: 700px; }

#pieclasse, #pieproperty,
#top5concept, #top5property,
#top10concept, #top10property,
#top20concept, #top20property,
#top5Mconcept, #top5Mproperty,
#top10Mconcept, #top10Mproperty,
#top20Mconcept, #top20Mproperty,
#top10bconcept, #top10bproperty,
#top20bconcept, #top20bproperty,
#top10infconcept, #top10infproperty,
#top20infconcept, #top20infproperty {
  width: 100%;
  height: 500px;
}

/* Tableaux “comme dans l’original” */
table {
  width: 100%;
  border-spacing: 0;
  background: white;
  border-radius: 5px;
  margin: auto;
  border: 1px solid rgba(210,210,210,0.8);
}
th, td {
  border-bottom: 1px solid rgba(210,210,210,0.8);
  padding: 8px 12px;
}
th { color: #000; font-weight: 500; text-align: start; }

/* Bloc code */
.code {
  display: inline-block;
  background: #f6f8fa;
  padding: 10px 12px;
  border-radius: 6px;
}
</style>
