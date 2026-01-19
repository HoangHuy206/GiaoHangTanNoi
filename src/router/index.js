import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/HomeViews.vue' 
import Login from '../pages/Login.vue'
import dangkynguoidung from '../pages/dangkynguoidung.vue' 
import mainSp from '../pages/SanPham/mainSP.vue' 
import phanhoidangky from '../pages/phanhoidangky.vue'
import Food from '../pages/Food.vue'
import dangkytaixe from '../pages/dangkytaixe.vue' // Đã đổi @ thành .. cho đồng bộ
import trangchulaixe from '../pages/trangchulaixe.vue'
import GioHang from '../pages/SanPham/Products/GioHang.vue' 


// (Đã xóa dòng "import products..." vì nó bị trùng với GioHang và không dùng tới)

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
      // Route phụ để redirect về home nếu lỡ nhập /home
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
      // Route cho tài xế
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
    },

   
    {
       path: '/dangkytaixe',      
      name: 'dangkytaixe',
      component: dangkytaixe ,      
      meta: { title: 'Đăng ký tài xế' }
    },

    {
       path: '/thongtinnguoidung',      
      name: 'thongtinnguoidung',
      component: thongtinnguoidung ,      
      meta: { title: 'Thông Tin' }
    },

    {
       path: '/Food2',      
      name: 'Food2',
      component: Food2 ,      
      meta: { title: 'Trang Chủ' }
    }
  ]
})

// Tự động đổi tiêu đề tab trình duyệt
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Giao Hàng Tận Nơi';
  next();
});

export default router