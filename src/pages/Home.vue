<script setup>
import { onMounted, ref } from 'vue';

const posts = ref([]);
const isLoading = ref(true);

async function getPosts() {
    const response = await fetch('http://127.0.0.1:5984/infra-don/_all_docs?include_docs=true');
    const data = await response.json();
    isLoading.value = false;
    posts.value = data.rows;

    // Trier les posts par date de publication décroissante
    posts.value.sort((a, b) => {
        const dateA = new Date(a.doc.publish_date);
        const dateB = new Date(b.doc.publish_date);
        return dateB - dateA; // Ordre décroissant (date la plus récente en premier)
    });
}

async function deletePost(postId, rev) {
    try {
        const response = await fetch(`http://127.0.0.1:5984/infra-don/${postId}?rev=${rev}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            // Filtrer les posts pour ne garder que ceux qui ne sont pas supprimés
            posts.value = posts.value.filter(post => post.id !== postId);
            alert('Le post a été supprimé avec succès.');
        } else {
            alert('Échec de la suppression du post.');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du post:', error);
        alert('Une erreur est survenue lors de la suppression.');
    }
}

onMounted(() => {
    getPosts();
});
</script>

<template>
    <div class="home">
        <h1>Accueil</h1>
        <div v-if="isLoading" class="loading">
            Chargement...
        </div>
        
        <div v-else class="posts">
            <div v-for="post in posts" :key="post.id" class="post">
                <!-- Titre et Infos sur le Post -->
                <h2>{{ post.doc.content.title }}</h2>
                <p class="meta">
                    Publié par {{ post.doc.author }} le {{ new Date(post.doc.publish_date).toLocaleDateString() }}
                </p>
                
                <!-- Extrait du Post -->
                <p class="extract">{{ post.doc.content.extract }}</p>
                
                <!-- Texte Complet -->
                <details class="full-text">
                    <summary>Lire la suite</summary>
                    <p>{{ post.doc.content.full_text }}</p>
                </details>

                <!-- Section des Commentaires -->
                <div class="comments">
                    <h3>Commentaires</h3>
                    <div v-for="(comment, index) in post.doc.comments" :key="index" class="comment">
                        <p class="comment-author"><strong>{{ comment.author }}</strong> :</p>
                        <p class="comment-text">{{ comment.comment }}</p>
                        <p class="comment-likes">👍 {{ comment.likes }}</p>
                    </div>
                </div>

                <!-- Bouton de suppression -->
                <button @click="deletePost(post.id, post.doc._rev)" class="delete-post">Supprimer ce post</button>

            </div>
        </div>
    </div>
</template>
