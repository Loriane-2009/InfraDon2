<script setup>
import { onMounted, ref } from 'vue';

const posts = ref([]);
const isLoading = ref(true);

const newComment = ref(''); // Variable pour la saisie du commentaire

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

async function addComment(postId, rev, comment) {
    try {
        // Trouver le post correspondant
        const post = posts.value.find(p => p.id === postId);

        if (post) {
            // Ajouter le commentaire à ce post
            post.doc.comments.push({
                comment: comment,
                author: 'Utilisateur', // Vous pouvez récupérer le nom de l'utilisateur connecté si nécessaire
                likes: 0
            });

            // Faire une mise à jour de ce document dans la base de données
            const response = await fetch(`http://127.0.0.1:5984/infra-don/${postId}?rev=${rev}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(post.doc),
            });

            if (response.ok) {
                alert('Commentaire ajouté avec succès.');
                newComment.value = ''; // Réinitialiser le champ de saisie
            } else {
                alert('Échec de l\'ajout du commentaire.');
            }
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        alert('Une erreur est survenue lors de l\'ajout du commentaire.');
    }
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
//Modifier extract
const editingPostId = ref(null); // ID du post en cours de modification
const newExtract = ref(''); // Contenu du nouvel extrait
function editExtract(postId, rev, currentExtract) {
    editingPostId.value = postId;
    newExtract.value = currentExtract; // Pré-remplir avec l'extrait actuel
}

async function saveExtract(postId, rev) {
    try {
        // Trouver le post à modifier
        const post = posts.value.find(p => p.id === postId);
        if (post) {
            post.doc.content.extract = newExtract.value; // Mettre à jour l'extrait localement

            // Envoyer la mise à jour à la base CouchDB
            const response = await fetch(`http://127.0.0.1:5984/infra-don/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...post.doc,
                    _rev: rev,
                }),
            });

            if (response.ok) {
                const updatedPost = await response.json();
                post.doc._rev = updatedPost.rev; // Mettre à jour la révision
                alert('Extrait mis à jour avec succès.');
            } else {
                throw new Error('Erreur lors de la mise à jour de l\'extrait.');
            }
        }
    } catch (error) {
        console.error(error);
        alert('Impossible de mettre à jour l\'extrait.');
    } finally {
        editingPostId.value = null; // Réinitialiser le formulaire
        newExtract.value = '';
    }
}

function cancelEdit() {
    editingPostId.value = null; // Annuler la modification
    newExtract.value = ''; // Réinitialiser l'entrée
}



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
                <div class="extract-container">
                    <!-- Extrait du Post -->
                    <p class="extract">{{ post.doc.content.extract }}</p>
                    <!--modifier l'extrait-->
                    <button @click="editExtract(post.id, post.doc._rev, post.doc.content.extract)"
                        class="btn-modify">Modifier l'extrait</button>

                </div>


                <div v-if="editingPostId === post.id" class="edit-form">
                    <input v-model="newExtract" placeholder="Modifier l'extrait" />
                    <button @click="saveExtract(post.id, post.doc._rev)">Enregistrer</button>
                    <button @click="cancelEdit">Annuler</button>
                </div>


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

                    <!-- Formulaire pour ajouter un commentaire -->
                    <div class="add-comment">
                        <textarea v-model="newComment" placeholder="Ajoutez un commentaire..."></textarea>
                        <button @click="addComment(post.id, post.doc._rev, newComment)" :disabled="!newComment">Ajouter
                            un commentaire</button>
                    </div>
                </div>

                <!-- Bouton de suppression -->
                <button @click="deletePost(post.id, post.doc._rev)" class="delete-post">Supprimer ce post</button>

            </div>
        </div>
    </div>
</template>
