import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

import'./assets/header.css';
import './assets/styles.css';
 
createApp(App).use(router).mount('#app')
