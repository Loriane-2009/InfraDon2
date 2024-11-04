<script setup>
import { onMounted, ref } from 'vue';
const posts = ref([])
const isLoading = ref(true)

async function getPosts() {
    const response = await fetch('http://127.0.0.1:5984/infra-don/_all_docs?include_docs=true')
    const data = await response.json()
    isLoading.value = false
    posts.value = data.rows
}

onMounted(() => {
    getPosts()
})
</script>
<template>
    <div>
        <h1>Home</h1>
        <div v-if="isLoading">
            Chargement...
        </div>
        <div v-else v-for="post in posts" :key="post.id">
            <h2>{{post?.doc?.content?.title}}</h2>
        </div>
    </div>
</template>