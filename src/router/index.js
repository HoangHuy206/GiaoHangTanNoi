import { createRouter, createWebHistory } from 'vue-router'
// Đảm bảo dấu gạch nối 'vue-router' và đường dẫn ../pages/ chuẩn xác
import HomeView from '../pages/HomeViews.vue' 
import Login from '../pages/Login.vue'
import DangKy from '../pages/dangkynguoidung.vue' 
import mainSp from '../pages/SanPham/mainSP.vue' 
import phanhoidangky from '../pages/phanhoidangky.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView, // ĐÃ SỬA: Phải là HomeView (khớp với dòng 3)
      meta: { title: 'Trang chủ - Giao Hàng' } 
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { title: 'Đăng nhập' }
    },
    {
      path: '/mainSP', 
      name: 'mainSP',
      component: mainSp, 
      meta: { title: 'Sản phẩm' }
    },
    {
      path: '/dang-ky',      
      name: 'dang-ky',
      component: DangKy,      
      meta: { title: 'Đăng ký' }
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Giao Hàng Tận Nơi';
  next();
});

export default router