<script setup>
import { RouterView } from 'vue-router';


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