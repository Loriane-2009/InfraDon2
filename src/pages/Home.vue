<script setup>
import { onMounted, ref, computed } from 'vue';

const posts = ref([]);
const isLoading = ref(true);
const newComment = ref('');
const searchQuery = ref(''); // Requête de recherche

async function getPosts() {
    const response = await fetch('http://127.0.0.1:5984/infra-don/_all_docs?include_docs=true');
    const data = await response.json();
    isLoading.value = false;
    posts.value = data.rows;

    posts.value.sort((a, b) => {
        const dateA = new Date(a.doc.publish_date);
        const dateB = new Date(b.doc.publish_date);
        return dateB - dateA;
    });
}

const filteredPosts = computed(() => {
    if (!searchQuery.value) return posts.value;
    return posts.value.filter(post =>
        post.doc.content.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

async function addComment(postId, rev, comment) {
    try {
        const post = posts.value.find(p => p.id === postId);
        if (post) {
            post.doc.comments.push({
                comment: comment,
                author: 'Utilisateur',
                likes: 0
            });

            const response = await fetch(`http://127.0.0.1:5984/infra-don/${postId}?rev=${rev}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(post.doc),
            });

            if (response.ok) {
                alert('Commentaire ajouté avec succès.');
                newComment.value = '';
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

const editingPostId = ref(null);
const newExtract = ref('');

function editExtract(postId, rev, currentExtract) {
    editingPostId.value = postId;
    newExtract.value = currentExtract;
}

async function saveExtract(postId, rev) {
    try {
        const post = posts.value.find(p => p.id === postId);
        if (post) {
            post.doc.content.extract = newExtract.value;

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
                post.doc._rev = updatedPost.rev;
                alert('Extrait mis à jour avec succès.');
            } else {
                throw new Error('Erreur lors de la mise à jour de l\'extrait.');
            }
        }
    } catch (error) {
        console.error(error);
        alert('Impossible de mettre à jour l\'extrait.');
    } finally {
        editingPostId.value = null;
        newExtract.value = '';
    }
}

function cancelEdit() {
    editingPostId.value = null;
    newExtract.value = '';
}

onMounted(() => {
    getPosts();
});
</script>

<template>
    <div class="home">
        <h1>Accueil</h1>

        <div class="search-bar">
            <input v-model="searchQuery" placeholder="Rechercher par titre..." />
        </div>

        <div v-if="isLoading" class="loading">
            Chargement...
        </div>

        <div v-else class="posts">
            <div v-for="post in filteredPosts" :key="post.id" class="post">
                <h2>{{ post.doc.content.title }}</h2>
                <p class="meta">
                    Publié par {{ post.doc.author }} le {{ new Date(post.doc.publish_date).toLocaleDateString() }}
                </p>

                <div class="extract-container">
                    <p class="extract">{{ post.doc.content.extract }}</p>
                    <button @click="editExtract(post.id, post.doc._rev, post.doc.content.extract)" class="btn-modify">Modifier l'extrait</button>
                </div>

                <div v-if="editingPostId === post.id" class="edit-form">
                    <input v-model="newExtract" placeholder="Modifier l'extrait" />
                    <button @click="saveExtract(post.id, post.doc._rev)">Enregistrer</button>
                    <button @click="cancelEdit">Annuler</button>
                </div>

                <details class="full-text">
                    <summary>Lire la suite</summary>
                    <p>{{ post.doc.content.full_text }}</p>
                </details>

                <div class="comments">
                    <h3>Commentaires</h3>
                    <div v-for="(comment, index) in post.doc.comments" :key="index" class="comment">
                        <p class="comment-author"><strong>{{ comment.author }}</strong> :</p>
                        <p class="comment-text">{{ comment.comment }}</p>
                        <p class="comment-likes">👍 {{ comment.likes }}</p>
                    </div>

                    <div class="add-comment">
                        <textarea v-model="newComment" placeholder="Ajoutez un commentaire..."></textarea>
                        <button @click="addComment(post.id, post.doc._rev, newComment)" :disabled="!newComment">Ajouter un commentaire</button>
                    </div>
                </div>

                <button @click="deletePost(post.id, post.doc._rev)" class="delete-post">Supprimer ce post</button>
            </div>
        </div>
    </div>
</template>