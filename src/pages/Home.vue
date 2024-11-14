<script setup>
import { onMounted, ref } from 'vue';
const posts = ref([]);
const isLoading = ref(true);

async function getPosts() {
    const response = await fetch('http://127.0.0.1:5984/infra-don/_all_docs?include_docs=true');
    const data = await response.json();
    isLoading.value = false;
    posts.value = data.rows;
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
            </div>
        </div>
    </div>
</template>