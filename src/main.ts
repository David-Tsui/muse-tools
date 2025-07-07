import { createApp } from 'vue';
import App from './App.vue';
import 'virtual:uno.css'

createApp(App).mount('#app');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
