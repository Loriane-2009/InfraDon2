<script setup>
import { RouterView } from 'vue-router';


</script>

<template>
  <div>
    <nav>
      <RouterLink to="/">Go to Home</RouterLink>
      <RouterLink to="/about">Go to About</RouterLink>
    </nav>
    <RouterView/>
  </div>
</template>