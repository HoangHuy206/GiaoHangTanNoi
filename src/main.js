import { createApp } from 'vue'
import App from './App.vue'      // Dùng ./ vì cùng nằm trong src
import router from './router'
import './assets/main.css'


const app = createApp(App)
app.use(router) // Phải có dòng này để hết lỗi "Injection not found"
app.mount('#app')