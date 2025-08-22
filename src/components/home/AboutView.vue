<template>
  <main class="zone-main">
    <v-row>
      <v-col>
        <v-card class="card-title mx-auto w-100" title="">
          <div class="title text-h5 text-center p-20">
            Welcome to IMGT Knowledge Graph (IMGT-KG): a knowledge graph to integrate immunogenetics data
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card class="mx-auto" title="Introduction">
          <v-card-item>
            <div class="text-body-2">
              <p>
                Considering the connected nature of immunogenetics entities from <strong>IMGT&reg;</strong> sequence databases to the monoclonal antibodies database, a need for integration of immunogenetics data arises. To cover this need, we built the <strong>IMGT Knowledge graph (IMGT-KG)</strong>, the first knowledge graph in the immunogenetics field. It bridges the gap between nucleotide and protein sequences of IMGT® databases and will open the way for effective queries and integrative immuno-omics analyses. <strong>IMGT-KG</strong> acquires data from <strong>IMGT&reg;</strong>, then represents, describes and structures immunogenetics entities and their interrelationships in a knowledge graph using semantic web standards and technologies.
              </p>
            </div>
          </v-card-item>

          <v-card-item>
            <div class="text-body-2">
              <p>
                <strong>IMGT-KG</strong> is built on top of an extended version of <strong>IMGT-ONTOLOGY</strong>. We prioritize reuse of existing terms in our knowledge graph as recommended by semantic web good practices. Many of these terms are from Open Biological and Biomedical Ontology <v-chip class="ma-0 v-chip-link" color="primary" label><a href="https://obofoundry.org/">(OBO)</a></v-chip> Foundry ontologies (including Thesauris). <strong>IMGT-KG</strong> uses a set of rules to guide inferences on the positions of nucleotide sequences applying Allen Interval Algebra. <strong>IMGT-KG</strong> aims to describe immunogenetics entities from nucleotide level to the protein level. In addition, <strong>IMGT-KG</strong> provides external links to other resources including Protein Data Bank <v-chip class="ma-0 v-chip-link" color="primary" label><a href="https://www.rcsb.org/">(PDB)</a></v-chip>, Immune Epitope Database <v-chip class="ma-0 v-chip-link" color="primary" label><a href="https://www.iedb.org/">(IEDB)</a></v-chip>, and <v-chip class="ma-0 v-chip-link" color="primary" label><a href="https://pubmed.ncbi.nlm.nih.gov/">PUBMED</a></v-chip> articles.
              </p>
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card class="mx-auto w-100" style="height: fit-content;">
          <v-img class="mx-auto" style="width: 100%; height: 500px;" src="assets/IMGT-KG.svg"></v-img>
        </v-card>
        <v-card>
          <v-card-item>
            <div class="text-body-2">
              <p>
                We make openly and freely available <strong>IMGT-KG</strong> powered by <v-chip class="ma-0 v-chip-link" color="primary" label><a href="https://yasgui.triply.cc/">YASGUI</a></v-chip> at this <v-chip class="ma-0 v-chip-link" color="primary" label><a href="kgdata.html">link</a></v-chip> for the normal graph without inferences. In addition, we provide another way to access <strong>IMGT-KG</strong> including normal and inferred graph at this <v-chip class="ma-0 v-chip-link" color="primary" label><a href="/fuseki/#/">link</a></v-chip> by the means of <v-chip class="ma-0 v-chip-link" color="primary" label><a href="https://jena.apache.org/documentation/fuseki2/">Apache Jena Fuseki2</a></v-chip>.
              </p>
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card class="mx-auto" title="Abstract">
          <v-card-item>
            <div class="text-body-2">
              <p>
                Knowledge graphs are emerging as one of the most popular means for data federation, transformation, integration and sharing, promising to improve data visibility and reusability. Immunogenetics is the branch of life sciences that studies the genetics of the immune system. Although the complexity and the connected nature of immunogenetics data make knowledge graphs a prominent choice to represent and describe immunogenetics entities and relations, hence enabling a plethora of applications, little effort has been directed towards building and using such knowledge graphs so far. In this work, we present the IMGT Knowledge Graph (IMGT-KG), the first of its kind FAIR knowledge graph in immunogenetics. IMGT-KG acquires and integrates data from different immunogenetics databases, hence creating links between them. Consequently, IMGT-KG provides access to 79 670 110 triplets with 10 430 268 entities, 673 concepts and 173 properties. IMGT-KG reuses many existing terms from domain ontologies or vocabularies and provides external links to other resources of the same domain, as well as a set of rules to guide inference on nucleotide sequence positions by applying Allen Interval Algebra. Such inference allows, for example, reasoning about genomics sequence positions. IMGT-KG fills in the gap between genomics and protein sequences and opens a perspective to effective queries and integrative immuno-omics analyses. We make openly and freely available IMGT-KG with detailed documentation and a Web interface for access and exploration.
              </p>
            </div>
          </v-card-item>

          <v-card-item>
            <div class="text-body-2">
              <p>
                Sanou, G., Giudicelli, V., Abdollahi, N., Kossida, S., Todorov, K., Duroux, P. (2022).
                <v-chip class="ma-0 v-chip-link" color="primary" label><a href="https://iswc2022.semanticweb.org/wp-content/uploads/2022/11/978-3-031-19433-7_36.pdf">IMGT-KG: A Knowledge Graph for Immunogenetics</a></v-chip>. In: , et al. The Semantic Web – ISWC 2022. ISWC 2022. Lecture Notes in Computer Science, vol 13489. Springer, Cham.
              </p>
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card class="cont-team" title="Team" style="width: 100%;" variant="outlined">
          <div style="display: flex; flex-wrap: wrap;">
            <v-card v-for="(profil, index) in profiles" :key="index" class="profil mx-auto" style="min-width:100px; min-height: 100px; padding: 20px; border-radius: 15px;">
              <v-card-item class="text-center">
                <v-avatar class="mx-auto text-center" size="80" :image="profil.avatar"></v-avatar>
              </v-card-item>
              <v-card-item class="infos-team">
                <div class="name text-h6 text-center">{{ profil.name }}</div>
                <div class="aff text-subtitle text-center" v-if="profil.linkedin">
                  <v-icon size="large" color="blue" icon="mdi-linkedin"></v-icon>
                  <a :href="profil.linkedin" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </div>
                <div class="contact text-caption text-center">
                  <v-chip class="ma-0 v-chip-mail" color="primary" prepend-icon="mdi-at" label>
                    <a :href="'mailto:' + profil.mail">{{ profil.mail }}</a>
                  </v-chip>
                </div>
                <div class="aff text-subtitle text-center">
                  <v-icon size="large" color="green-darken-2" icon="mdi-domain"></v-icon>{{ profil.affiliation }}
                </div>
              </v-card-item>
            </v-card>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <footer style="text-align: center;">
      <small>
        This website was developed with
        <v-chip class="ma-0 v-chip-link" color="primary" label>
          <a href="https://vuejs.org/" target="_blank" rel="noopener noreferrer">Vue.js</a>
        </v-chip>
      </small>
    </footer>
  </main>
</template>

<script setup>
/* eslint-disable vue/multi-word-component-names */
import { defineOptions } from 'vue'
import { ref } from 'vue'
import profileImage from '@/assets/1571773098456.jpeg'

defineOptions({
  name: 'AboutView'
})

const profiles = ref([
  {
    avatar: profileImage,
    name: 'Gaoussou Sanou',
    linkedin: 'https://www.linkedin.com/in/gaoussou-sanou-78982413b/',
    affiliation: 'UM, IGH, LIRMM',
    mail: 'gaoussou.sanou@igh.cnrs.fr',
  },
  {
    avatar: 'https://cdn-icons-png.flaticon.com/512/5577/5577995.png',
    name: 'Véronique Giudicelli',
    linkedin: 'https://www.linkedin.com/in/v%C3%A9ronique-giudicelli-b2559750/',
    affiliation: 'UM, IGH',
    mail: 'veronique.giudicelli@igh.cnrs.fr',
  },
  {
    avatar: 'https://cdn-icons-png.flaticon.com/512/5577/5577995.png',
    name: 'Patrice Duroux',
    linkedin: '',
    affiliation: 'IGH',
    mail: 'patrice.duroux@igh.cnrs.fr',
  },
  {
    avatar: 'https://cdn-icons-png.flaticon.com/512/5577/5577995.png',
    name: 'Konstantin Todorov',
    linkedin: '',
    affiliation: 'UM, LIRMM',
    mail: 'konstantin.todorov@lirmm.fr',
  },
  {
    avatar: 'https://cdn-icons-png.flaticon.com/512/5577/5577995.png',
    name: 'Sofia Kossida',
    linkedin: 'https://www.linkedin.com/in/sofia-kossida-b235999/',
    affiliation: 'UM, IGH',
    mail: 'sofia.kossida@igh.cnrs.fr',
  },
])
</script>

<style scoped>
.zone-main {
  padding: 1.5rem;
  max-width: 1200px;
  margin: auto;
}
.title {
  font-weight: 600;
  color: #2c3e50;
}
.cont-team {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.profil {
  min-width: 100px;
  min-height: 100px;
  padding: 20px;
  margin: 10px;
  border-radius: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.text-center {
  text-align: center;
}
</style>
