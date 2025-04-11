<template>
  <div id="graph-container">
    <!-- Conteneur qui va afficher le graphe -->
     <div id="sigma-container" style="width:100% ;height:500px;"></div>
    <!-- Importation de la bibliothèque Sigma.js -->
  </div>
</template>

<script setup>
//onMonnted permet d'exécuter du code une fois que le composant est affiché 
import {onMounted, watch , ref } from 'vue'; // watch permet de surveiller les changements d'une variable, ref permet de créer une variable réactive


//sigma st la bibliothéque qui affiche le graphe à lécran
import Sigma from 'sigma'

// Graphology est la structure de données qui contient les noeuds et les arêtes
import Graph from 'graphology'

// eslint-disable-next-line no-undef
const props = defineProps({ // permet de définir les propriétés du composant
    triples: Array // triples est un tableau d'objets contenant les triples à afficher
         // [{subject , relation , object}, ...] , array c'est le tableau permettant de stocker les triples
})

const container = ref(null) // container est une référence à l'élément HTML qui va contenir le graphe
//let sigmaInstance = null

function afficherGraph(triples) {
    const graph = new Graph(); // Créer un nouveau graphe vide
   // const positions = {} // Pour stocker les positions des noeuds


    triples.forEach((triple, i) => {
        const { subject, relation , object } = triple // destructuration de l'objet triple

        if (!graph.hasNode(subject)) {
            graph.addNode (subject, {
                label: subject,
                x: Math.cos(i),
                y: Math.sin(i), 
                size: 10,
                color: '#FF0000' // Rouge
            });
        }

        if (!graph.hasNode(object)) {
      graph.addNode(object, {
        label: object,
        x: Math.cos(i + 1),
        y: Math.sin(i + 1),
        size: 10,
        color: '#0000FF'
      });
    }

        const edgeId = `${subject}-${object}` // Créer un identifiant unique pour l'arête
        if (!graph.hasEdge(edgeId)) {
            graph.addEdge(subject, object, {
                label: relation,
                size :1,
                color: '#000000' // Noir

            });
        }
    });

    //Nettoyer l'ancien conteneur avant d'afficher le nouveau graphe
    container.value.innerHTML =''

  new Sigma(graph, container.value, { renderEdgeLabels: true }); // Créer une nouvelle instance de Sigma avec le graphe et le conteneur
}

onMounted(()=> {
    container.value= document.getElementById('sigma-container') // Récupérer l'élément HTML qui va contenir le graphe
    if (props.triples.length > 0) {
    afficherGraph(props.triples) // Afficher le graphe avec les triples passés en props
    //console.log(props.triples)
    //console.log(container.value)
    }
})
// Mise à jour automatique quand les triples changent
watch(() => props.triples, (newTriples) => {
  if (newTriples.length > 0) {
    afficherGraph(newTriples)
  }
})

</script>


<style scoped>

/* Style pour centrer le graphe */
#graph-container {
  display: flex;
  justify-content: center; /* Centre horizontalement */
  align-items: center; /* Centre verticalement si nécessaire */
  margin: 20px auto; /* Ajoute un espace autour du graphe */
  width: 100%; /* S'assure que le conteneur occupe toute la largeur */
}

#sigma-container {
  width: 80%; /* Ajustez la largeur du graphe si nécessaire */
  height: 500px;
  border: 1px solid #ddd; /* Optionnel : ajoute une bordure pour mieux visualiser */
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #42b983;
  color: white;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>