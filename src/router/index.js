import { createRouter, createWebHistory } from 'vue-router'
// Đảm bảo dấu gạch nối 'vue-router' và đường dẫn ../pages/ chuẩn xác
import HomeView from '../pages/HomeViews.vue' 
import Login from '../pages/Login.vue'
import dangkynguoidung from '../pages/dangkynguoidung.vue' // Bạn đang import tên là 'dangkynguoidung'
import mainSp from '../pages/SanPham/mainSP.vue' 
import phanhoidangky from '../pages/phanhoidangky.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView, 
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
      path: '/phanhoidangky',      
      name: 'phanhoidangky',
      component: phanhoidangky,      
      meta: { title: 'Đăng ký thành viên ?' }
    },
    {
      // Route này trước đó bị lỗi vì 'DangKy' chưa được import
      path: '/dang-ky',      
      name: 'dang-ky',
      component: dangkynguoidung, // ĐÃ SỬA: Dùng 'dangkynguoidung' cho khớp với import ở dòng 5
      meta: { title: 'Đăng ký' }
    },
    {
      path: '/dangkynguoidung',      
      name: 'dangkynguoidung',
      component: dangkynguoidung,      
      meta: { title: 'Đăng ký dành cho người dùng' }
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Giao Hàng Tận Nơi';
  next();
});

export default router