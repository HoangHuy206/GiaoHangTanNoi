import { createRouter, createWebHistory } from 'vue-router'

// Import các trang chính
import HomeView from '../pages/HomeViews.vue' 
import Login from '../pages/Login.vue'
import dangkynguoidung from '../pages/dangkynguoidung.vue' 
import mainSp from '../pages/SanPham/mainSP.vue' 
import phanhoidangky from '../pages/phanhoidangky.vue'
import Food from '../pages/Food.vue'
import products from '../pages/SanPham/Products/GioHang.vue'

// THÊM: Import trang chủ của tài xế
import trangchulaixe from '../pages/trangchulaixe.vue'
import GioHang from '../pages/SanPham/Products/GioHang.vue'

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
      path: '/giohang',
      name: 'giohang',
      component: GioHang, 
      meta: { title: 'Giỏ Hàng' } 
    },

    {
      // THÊM: Route phụ để khớp với router.push('/home') trong Login.vue
      path: '/home',
      redirect: '/' 
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { title: 'Đăng nhập' }
    },
    {
      // THÊM: Khai báo route cho tài xế (Giải quyết lỗi No match found)
      path: '/trangchulaixe',
      name: 'trangchulaixe',
      component: trangchulaixe,
      meta: { title: 'Trang chủ Tài xế' }
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
      path: '/dang-ky',      
      name: 'dang-ky',
      component: dangkynguoidung, 
      meta: { title: 'Đăng ký' }
    },

    {
      path: '/dangkynguoidung',      
      name: 'dangkynguoidung',
      component: dangkynguoidung,      
      meta: { title: 'Đăng ký dành cho người dùng' }
    },

    {
       path: '/Food',      
      name: 'Food',
      component: Food ,      
      meta: { title: 'Food' }
    }
  ]
})

// Tự động đổi tiêu đề trang khi chuyển route
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Giao Hàng Tận Nơi';
  next();
});

export default router