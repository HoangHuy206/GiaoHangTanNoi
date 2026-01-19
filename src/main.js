import { createApp } from 'vue'
<<<<<<< HEAD
// import App from '../src/pages/trangchulaixe.vue'      // Dùng ./ vì cùng nằm trong src
=======
>>>>>>> e30fd8d93c00f68d30b5d4c3ced5caef9e82a373
import App from './App.vue'
import router from './router'
import './assets/main.css'


const app = createApp(App)
app.use(router) // Phải có dòng này để hết lỗi "Injection not found"
app.mount('#app')