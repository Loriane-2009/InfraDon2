<script setup>
import { ref } from 'vue';

// Déclaration des variables liées au formulaire
const title = ref('');
const author = ref('');
const publishDate = ref('');  // La date sera définie automatiquement
const extract = ref('');
const fullText = ref('');
const comments = ref([]); // Tu peux commencer avec un tableau vide de commentaires

// Référence à l'élément pour afficher les erreurs
const error = ref('');
const successMessage = ref('');

// Fonction pour soumettre le formulaire
const submitForm = async () => {
  // On réinitialise le message d'erreur à chaque soumission
  error.value = '';
  successMessage.value = '';

  // On assigne la date de publication à la date actuelle
  publishDate.value = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

  // Création de l'objet du post
  const newPost = {
    content: {
      title: title.value,
      extract: extract.value,
      full_text: fullText.value
    },
    author: author.value,
    publish_date: publishDate.value,  // Utilisation de la date actuelle
    comments: comments.value,
  };

  try {
    const response = await fetch('http://127.0.0.1:5984/infra-don', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPost),
    });

    if (response.ok) {
      successMessage.value = 'Le post a été ajouté avec succès !';
      // Réinitialiser le formulaire après soumission réussie
      title.value = '';
      author.value = '';
      publishDate.value = '';
      extract.value = '';
      fullText.value = '';
      comments.value = [];
    } else {
      throw new Error('Échec de l\'ajout du post');
    }
  } catch (err) {
    error.value = err.message;
  }
};

const generateTestPosts = async () => {
  const count = 20; // Nombre de posts à générer

  const generateDocument = (index) => ({
    _id: `post_${index}_${new Date().getTime()}`, // ID unique basé sur l'index et le timestamp
    content: {
      title: `Titre ${index}`,
      extract: `Extrait de l'article ${index}`,
      full_text: `Texte complet de l'article ${index}. Il contient plus de contenu pour tester les performances.`
    },
    author: `Auteur ${index}`,
    publish_date: new Date().toISOString(),
    comments: Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
      comment: `Commentaire ${i + 1} sur l'article ${index}`,
      author: `Commentateur ${i + 1}`,
      likes: Math.floor(Math.random() * 100),
    })),
  });

  try {
    const docs = Array.from({ length: count }, (_, index) => generateDocument(index));
    const requests = docs.map(doc => 
      fetch('http://127.0.0.1:5984/infra-don', {
        method: 'POST', // Utiliser POST au lieu de PUT pour la génération automatique d'_id par CouchDB
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doc),
      })
    );
    
    const responses = await Promise.all(requests);
    const errors = responses.filter(response => !response.ok);

    if (errors.length === 0) {
      alert(`${count} posts générés avec succès.`);
    } else {
      alert(`${errors.length} posts n'ont pas pu être créés.`);
    }
  } catch (err) {
    console.error('Erreur lors de la génération des posts :', err);
    alert('Une erreur est survenue lors de la génération des posts.');
  }
};

</script>

<template>
  <button @click="generateTestPosts" style="margin: 10px; padding: 10px; background-color: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Générer 20 posts
      </button>
  <div>
    <h1>Ajouter un Post</h1>
    <form @submit.prevent="submitForm">
      <div>
        <label for="title">Titre :</label>
        <input v-model="title" id="title" type="text" required />
      </div>

      <div>
        <label for="author">Auteur :</label>
        <input v-model="author" id="author" type="text" required />
      </div>

      <div>
        <label for="extract">Extrait :</label>
        <textarea v-model="extract" id="extract" required></textarea>
      </div>

      <div>
        <label for="fullText">Texte complet :</label>
        <textarea v-model="fullText" id="fullText" required></textarea>
      </div>

      <div>
        <button type="submit">Ajouter le Post</button>
      </div>
    </form>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="successMessage" class="success">{{ successMessage }}</div>
  </div>
</template>