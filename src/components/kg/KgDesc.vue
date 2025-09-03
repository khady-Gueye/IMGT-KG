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

    <!--  Table Gene level (HTML valide) -->
    <v-row>
      <v-col>
        <v-card>
          <v-card-item>
            <table>
              <thead>
                <tr>
                  <th scope="col">Concept</th>
                  <th scope="col">AnnotationProperty</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Gene</th>
                  <td>imgt_link</td>
                  <td>a link that points to imgt website</td>
                </tr>
                <tr>
                  <th scope="row" rowspan="2">Allele</th>
                  <td>has_fcode</td>
                  <td>a code for functionality type</td>
                </tr>
                <tr>
                  <td>has_number</td>
                  <td>number of Allele</td>
                </tr>
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

    <!--  Table Sequence level (HTML valide) -->
    <v-row>
      <v-col>
        <v-card>
          <v-card-item>
            <table class="desctab">
              <thead>
                <tr>
                  <th scope="col">Concept</th>
                  <th scope="col">AnnotationProperty</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" rowspan="2">Region</th>
                  <td>has_nucleotide_sequence</td>
                  <td>composition in nucleotides of the region when it's a coding region</td>
                </tr>
                <tr>
                  <td>has_imgt_qualifier</td>
                  <td>a qualifier imgt to describe the region</td>
                </tr>
                <tr>
                  <th scope="row">obo:GENO_0000960</th>
                  <td>has_nucleotide_sequence</td>
                  <td>composition in nucleotides of the sequence</td>
                </tr>
              </tbody>
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

    <!--  Table Chain level (HTML valide) -->
    <v-row>
      <v-col>
        <v-card>
          <v-card-item>
            <table id="chain" class="desctab">
              <thead>
                <tr>
                  <th scope="col">Concept</th>
                  <th scope="col">AnnotationProperty</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                <!-- Chain -->
                <tr>
                  <th scope="row" rowspan="3">Chain</th>
                  <td>code4A</td>
                  <td>code of the chain</td>
                </tr>
                <tr>
                  <td>has_imgt_chain_description</td>
                  <td>a description of the chain in its different domains</td>
                </tr>
                <tr>
                  <td>imgt_link</td>
                  <td>a link that points to imgt website</td>
                </tr>

                <!-- Domain -->
                <tr>
                  <th scope="row" rowspan="2">Domain</th>
                  <td>has_imgt_collier_perles</td>
                  <td>imgt collier de perles link</td>
                </tr>
                <tr>
                  <td>has_sheet</td>
                  <td>different sheets of domain</td>
                </tr>

                <!-- Residue -->
                <tr>
                  <th scope="row" rowspan="3">Residue</th>
                  <td>abreviation</td>
                  <td>short name or abreviation of the residue</td>
                </tr>
                <tr>
                  <td>has_phi_angle</td>
                  <td>phi angle</td>
                </tr>
                <tr>
                  <td>has_psi_angle</td>
                  <td>psi angle</td>
                </tr>
              </tbody>
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

    <!--Table Structure level (HTML valide) -->
    <v-row>
      <v-col>
        <v-card>
          <v-card-item>
            <table id="struct" class="desctab">
              <thead>
                <tr>
                  <th scope="col">Concept</th>
                  <th scope="col">AnnotationProperty</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                <!-- Structure -->
                <tr>
                  <th scope="row" rowspan="4">Structure</th>
                  <td>common_name</td>
                  <td>common name</td>
                </tr>
                <tr>
                  <td>commercial_name</td>
                  <td>commercial name</td>
                </tr>
                <tr>
                  <td>inn_name</td>
                  <td>INN name</td>
                </tr>
                <tr>
                  <td>immune_epitope</td>
                  <td>an external link that points to the predict epitope of a structure in IEDB</td>
                </tr>

                <!-- Amino acide sequence -->
                <tr>
                  <th scope="row" rowspan="7">Amino acide sequence</th>
                  <td>contact_analysis</td>
                  <td>a link that points to pair contacts analyses</td>
                </tr>
                <tr>
                  <td>has_amino_sequence</td>
                  <td>amino acide sequence</td>
                </tr>
                <tr>
                  <td>imgt_link</td>
                  <td>a link that points to imgt website</td>
                </tr>
                <tr>
                  <td>interaction_paratope_epitope</td>
                  <td>a link that points to interaction paratope epitope</td>
                </tr>
                <tr>
                  <td>is_entry_from</td>
                  <td>amino sequence's database</td>
                </tr>
                <tr>
                  <td>jmol_visualisation</td>
                  <td>a link to explore the structure in Jmol</td>
                </tr>
                <tr>
                  <td>pdb_link</td>
                  <td>a external link to pdb database</td>
                </tr>

                <!-- Article -->
                <tr>
                  <th scope="row" rowspan="4">Article</th>
                  <td>dc:title</td>
                  <td>article's title</td>
                </tr>
                <tr>
                  <td>dc:contributor</td>
                  <td>article's contributors</td>
                </tr>
                <tr>
                  <td>dc:date</td>
                  <td>publication date</td>
                </tr>
                <tr>
                  <td>has_journal</td>
                  <td>journal of publication</td>
                </tr>
              </tbody>
            </table>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

   <!-- Monoclonal Antibody level -->
<v-row>
  <v-col>
    <v-card class="mx-auto" title="Monoclonal Antibody level">
      <v-card-item>
        <div class="text-body-2">

          <p class="mb-4">
            Monoclonal antibodies (mAbs) are proteins made in the laboratory that act as natural antibodies.
            They bind specifically to certain targets in the body and stimulate the immune system. The mechanisms of action of mAbs range from detection and destruction of target cells,
            stimulation of immune-mediated cell toxicity, to modulation of the immune system. The mAbs can also carry drugs or radiation to efficiently deliver cell-killing agents to target cells. 
            In order to provide a unique and valuable resource concerning mAbs with therapeutic application, <strong>IMGT&reg;</strong> has developed IMGT/mAb-DB, a database which contains standardized descriptions about mAbs, 
            their targets, clinical indications and other characteristics.
            <br>From an immunogenetics data integration perspective, we built the first FAIR immunogenetics knowledge graph, <strong>IMGT Knowledge graph (IMGT-KG)</strong> to bridge the gap between nucleotide and protein sequences of
            IMGT® databases. In this same perspective, we built <strong>IMGT/MAB-KG</strong>, the IMGT-KG for therapeutic monoclonal antibodies, using semantic web standards and technologies. 
            <strong>IMGT/MAB-KG</strong> is a specific part of IMGT-KG that represents, describes and structures all knowledge of therapeutic mAbs.
            It is intrinsically connected to the IMGT-KG and reuses terms and relationships from
            <v-chip class="ma-0 v-chip-link" color="primary" label><a href="http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#">NCIT</a></v-chip>,
            <v-chip class="ma-0 v-chip-link" color="primary" label><a href="https://mondo.monarchinitiative.org/">MONDO</a></v-chip>
            and from some resources of the Open Biological and Biomedical Ontology
            <v-chip class="ma-0 v-chip-link" color="primary" label><a href="https://obofoundry.org/">OBO</a></v-chip>.
          </p>

          <p class="mb-4">
            The data model is built as an extended version of IMGT-ONTOLOGY, described in our previous
            <v-chip class="ma-0 v-chip-link" color="primary" label><a href="https://iswc2022.semanticweb.org/wp-content/uploads/2022/11/978-3-031-19433-7_36.pdf">publication</a></v-chip>.
            Here, we describe only the core elements including concepts and object properties. The data model of <strong>IMGT/MAB-KG</strong> presents several parts, the core element is the monoclonal antibody represented by a pharmacological substance and an INN molecule (International nonproprietary names).
            The INN molecule is associated with a receptor that binds to a target, which belongs to a taxon, has a construct which has one or many segments. The construct and its segments have an IMGT label.
            It also has bibliographical references, a clinical domain, a mechanism of action and its effects. The Pharmacological Substance may have a biosimilar, an origin clone and an associated product.
            The monoclonal antibody product is produced by a company and has one or more clinical trials. Every clinical trial has a clinical phase and a clinical indication for a disease, which belongs to a clinical domain.
            A clinical trial can be the subject of a decision by an organization with a final status. The pharmacological Substance may be linked to <strong>IMGT-KG</strong> 3D structures elements.
          </p>

          <p>
            For more information on the data model, please read our publication
            <a href="https://www.frontiersin.org/journals/immunology/articles/10.3389/fimmu.2024.1393839/full" target="_blank" rel="noreferrer">
              IMGT/mAb-KG: the knowledge graph for therapeutic monoclonal antibodies
            </a>.
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
        <div id="mabnetwork"></div>
      </v-card-item>
    </v-card>
  </v-col>
</v-row>


  </section>
</template>

<script setup lang="ts">
/* eslint-disable */
import { onMounted } from 'vue'

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
    // Libs UMD nécessaires
    await Promise.all([
      loadScript('https://unpkg.com/vis-network/standalone/umd/vis-network.min.js'),
    ])

    // scripts de dessin des graphes Vis
    await import('@/scripts/SchemaDescrip')
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


#genenetwork { width: 100%; height: 700px; }
#locusnetwork { width: 100%; height: 700px; }
#seqnetwork   { width: 100%; height: 700px; }
#chainnetwork { width: 100%; height: 800px; }
#structnetwork{ width: 100%; height: 700px; }
#mabnetwork{ width: 100%; height: 900px; }

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

/* Tableaux */
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
