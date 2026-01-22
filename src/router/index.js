import { createRouter, createWebHistory } from 'vue-router'

// --- IMPORT COMPONENTS ---
import HomeView from '../pages/HomeViews.vue' 
import Login from '../pages/Login.vue'
import dangkynguoidung from '../pages/dangkynguoidung.vue' 
import mainSp from '../pages/SanPham/mainSP.vue' 
import phanhoidangky from '../pages/phanhoidangky.vue'
import Food from '../pages/Food.vue'
import dangkytaixe from '../pages/dangkytaixe.vue' 
import thongtinnguoidung from '@/pages/ThongTin/thongtinnguoidung.vue'
import Food2 from '@/pages/Food2.vue'
import toco from '@/pages/SanPham/MuaSP/toco.vue'
import thongtintaixe from '@/pages/ThongTin/thongtintaixe.vue'
import trangchulaixe from '@/pages/trangchulaixe.vue'
import giohang from '@/pages/SanPham/Products/giohang.vue'
import thanhtoan from '@/pages/SanPham/Products/thanhtoan.vue'

// [QUAN TRỌNG] Import trang Theo Dõi Đơn Hàng mới
import TheoDoiDonHang from '../pages/TheoDoiDonHang.vue'

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
      component: giohang, 
      meta: { title: 'Giỏ Hàng' } 
    },
    {
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
       path: '/Food2',      
      name: 'Food2',
      component: Food2 ,      
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
       path: '/toco',      
      name: 'toco',
      component: toco,      
      meta: { title: 'Bánh cuốn' }
    },
    {
       path: '/thongtinlaixe', 
       name: 'thongtintaixe',
       component: thongtintaixe ,      
       meta: { title: 'Thông tin tài xế' }
    },
    {
      path: '/thanhtoan',
      name: 'thanhtoan',
      component: thanhtoan, 
      meta: { title: 'Thanh toán' } 
    },

    // [MỚI] ROUTE THEO DÕI ĐƠN HÀNG (QUAN TRỌNG)
    {
      path: '/theo-doi/:maDon', // :maDon là tham số động
      name: 'TheoDoiDonHang',
      component: TheoDoiDonHang,
      meta: { title: 'Theo Dõi Đơn Hàng' }
    },

    // --- Các route chi tiết sản phẩm ---
    {
      path: '/restaurant/1',
      name: 'comga',
      component: () => import('../pages/SanPham/MuaSP/comga.vue'),
      meta: { title: 'Cơm Gà 68' }
    },
    {
      path: '/restaurant/2',
      name: 'Lotteria',
      component: () => import('../pages/SanPham/MuaSP/lotte.vue'),
      meta: { title: 'Lotteria' }
    },
    {
      path: '/restaurant/3',
      name: 'comgabinhdan',
      component: () => import('../pages/SanPham/MuaSP/combinhdan.vue'),
      meta: { title: 'Cơm bình dân' }
    },
    {
      path: '/restaurant/4',
      name: 'gaham',
      component: () => import('../pages/SanPham/MuaSP/gaham.vue'),
      meta: { title: 'Gà Hầm' }
    },
    {
      path: '/restaurant/5',
      name: 'TocoToco',
      component: () => import('../pages/SanPham/MuaSP/toco.vue'),
      meta: { title: 'TocoToco' }
    },
    {
      path: '/restaurant/6',
      name: 'buncham',
      component: () => import('../pages/SanPham/MuaSP/buncham.vue'),
      meta: { title: 'Bún Chả' }
    },
    {
      path: '/restaurant/7',
      name: 'mixue',
      component: () => import('../pages/SanPham/MuaSP/mixue.vue'),
      meta: { title: 'Mixue' }
    },
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Giao Hàng Tận Nơi';
  next();
});

export default router