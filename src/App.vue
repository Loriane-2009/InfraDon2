<script setup>
import { RouterView } from 'vue-router';
import'./assets/header.css'

</script>

<template>
  <div>
    <nav>
      <RouterLink to="/">Voir tous les posts</RouterLink>
    <br>
      <RouterLink to="/about">Ecrire un post</RouterLink>
    </nav>
    <RouterView/>
  </div>
</template>