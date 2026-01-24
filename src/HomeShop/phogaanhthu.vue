<script setup>
import { ref } from 'vue'

// 1. Dữ liệu giả lập (Bạn thay bằng dữ liệu thật từ API sau này)
const restaurant = ref({
  name: "trang chủ phở gà anh thư",
  tags: ["Thức ăn nhanh", "Thịt gà", "Món Hàn"],
  rating: 4.6,
  reviews: "500+",
  time: "30 phút",
  distance: "3,8 km",
  openTime: "10:00 - 21:40",
})

// Danh sách danh mục (Tabs)

const activeCategory = ref("Dành cho bạn")

// Danh sách món ăn
const products = ref([
  { id: 1, name: "Cơm rang dưa bò ", price: "65000", image: new URL('../assets/anhND/comrangduabo.webp', import.meta.url),da_ban: 0},
  { id: 2, name: "Cơm Rang Đùi Gà", price: "159000", image: new URL('../assets/anhND/comrangduiga.webp', import.meta.url),da_ban: 0 },
  { id: 3, name: "Cơm Rang Hải Sản", price: "79000", image: new URL('../assets/anhND/comranghaisan.webp', import.meta.url),da_ban: 0 },
  { id: 4, name: "Cơm Rang Thập Cẩm", price: "120000", image: new URL('../assets/anhND/comrangthapcam.webp', import.meta.url),da_ban: 0 },
])

const themVaoGio = (mon) => {
  // 1. Logic tăng số đơn đã đặt (Nhảy số)
  mon.da_ban++; 

  // 2. Logic thêm vào giỏ hàng của bạn (nếu có)
  console.log(`Đã thêm ${mon.name} vào giỏ. Số đơn mới: ${mon.da_ban}`);
  
  // Nếu bạn có mảng giỏ hàng, hãy xử lý tiếp ở đây...
}

// --- 2. IMPORT EVENT BUS TỪ GIỎ HÀNG (Mới thêm) ---
// Đảm bảo đường dẫn này đúng với cấu trúc thư mục của bạn
import { cartBus } from '@/pages/SanPham/Products/GioHang_G.vue' 

// --- LOGIC MỞ GIỎ HÀNG (Mới thêm) ---
const openCartPopup = () => {
  console.log("Đã bấm mở giỏ hàng");
  cartBus.emit('open-cart'); // Gửi tín hiệu sang App.vue -> GioHang.vue
}

// --- LOGIC THÊM VÀO GIỎ HÀNG ---
const addToCart = (product) => {
  console.log("Đã thêm vào giỏ:", product.name);
  
  // Gửi thông tin sản phẩm sang component Giỏ Hàng
  // Bạn nên truyền object chứa đầy đủ thông tin cần thiết
  cartBus.emit('add-to-cart', {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    quantity: 1 // Mặc định mỗi lần nhấn là thêm 1
  });
  
  // Tùy chọn: Hiển thị thông báo nhỏ cho người dùng
  // alert(`Đã thêm ${product.name} vào giỏ hàng!`);
}
</script>

<template>
  <div class="page-container">

    <div class="restaurant-banner">
      <img src="../assets/anhND/comrangduabo.webp" alt="Banner Nhà Hàng" class="banner-img">
      <div class="banner-overlay"></div>
      
      <div class="banner-actions">
        <router-link to="/mainsp" class="circle-btn">
          <i class="ti-arrow-left">←</i>
        </router-link>
        <div class="right-actions">
          <button class="circle-btn" @click="openCartPopup"><i class="ti-shopping-cart">🛒</i></button>
        </div>
      </div>
    </div>
    
    <div class="main">

      <div class="breadcrumb">
        
        <div class="icon-header">
          <i>
          <a href="#" @click.prevent="openCartPopup" class="cart-icon-link">
            <i class=" ti-bell" style="font-size: 24px;" ></i>
          </a>

          <router-link to="/thongtinnguoidung">
            <svg class="icon-action" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </router-link>
          </i>
        </div>
      </div>

    <section class="restaurant-info">
      <h1 class="res-name">{{ restaurant.name }}</h1>
      <p class="res-type">{{ restaurant.tags.join(' • ') }}</p>
      
      <div class="res-meta">
        <div class="rating-box">
          <span class="star">★</span>
          <span class="score">{{ restaurant.rating }}</span>
          <span class="count">({{ restaurant.reviews }})</span>
        </div>
        <div class="meta-item">🕒 {{ restaurant.time }} • {{ restaurant.distance }}</div>
      </div>
      
      <p class="open-time">Giờ mở cửa: <span>Hôm nay {{ restaurant.openTime }}</span></p>

      <div class="delivery-options">
        <div class="option-box">
          <span class="icon">📅</span> Ngày giao hàng: <b>Hôm nay</b>
        </div>
        <div class="option-box">
          <span class="icon">⏰</span> Thời gian giao: <b>Ngay bây giờ</b>
        </div>
      </div>
    </section>

    </div>



    <section class="menu-section">
  <h2 class="section-title">kiểm soát đơn hàng </h2>
  
  <div class="product-list-horizontal">
    <div v-for="item in products" :key="item.id" class="product-card-horizontal">
      
      <div class="card-img-left">
        <img :src="item.image" :alt="item.name">
      </div>

      <div class="card-info-middle">
        <h3 class="prod-name">{{ item.name }}</h3>
        <p class="prod-desc">Món ngon bán chạy nhất tuần qua, hương vị đậm đà khó cưỡng...</p>
        
        <div class="order-count">
          <i class="ti-shopping-cart"></i> 
          <span>Đã đặt: <b>{{ item.da_ban }}</b> đơn</span>
        </div>

        <div class="price-row">
          <span class="price">{{ Number(item.price).toLocaleString('vi-VN') }}₫</span>
        </div>
      </div>

      <div class="card-action-right">
        <button class="add-btn-large" @click="addToCart(item); themVaoGio(item)">+</button>
      </div>

    </div>
  </div>
</section>

    <div class="footer">
      <div class="footer-container">
        <div class="footer-column branding">
          <img src="../assets/anh.logo/anhnen.png" alt="Logo" class="footer-logo">
          
        </div>
        <div class="footer-column">
          <h4>Người dùng</h4>
          <ul>
            <li><router-link to="">Có gì mới?</router-link></li>
            <li><router-link to="">Món ngon</router-link></li>
            <li><router-link to="">Dịch vụ Food</router-link></li>
          </ul>
        </div>
        <div class="footer-column">
          <h4>Đối tác tài xế</h4>
          <ul>
            <li><router-link to="">Thông tin mới</router-link></li>
            <li><router-link to="">Di chuyển</router-link></li>
            <li><router-link to="">Trung tâm tài xế</router-link></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom"><p>Theo dõi chúng tôi @2026</p></div>
    </div>

  </div>
</template>

<style scoped>
/* --- CẤU TRÚC CHUNG --- */
.page-container {
  width: 100%;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  color: #1c1c1c;
}

/* --- BREADCRUMB --- */
.breadcrumb .arrow { color: #999; margin: 0 5px; }
.breadcrumb .current { color: #676767; }
.breadcrumb{
  display: flex;          /* Kích hoạt flexbox để các thành phần nằm ngang */
  align-items: center;    /* Căn giữa logo và chữ theo chiều dọc */
  gap: 15px;              /* Tạo khoảng cách giữa logo và chữ */
  font-size: 13px; 
  color: #00A5CF; 
  margin-bottom: 20px;
  font-size: 13px; 
  color: #00A5CF; 
  margin-bottom: 20px;
}
/* ----------*/
.main {
  max-width: 1200px;
  margin: 0 auto;
  box-shadow: 0 8px 6px -6px black;
}
.menu-section {
  max-width: 1200px;
  margin: 0 auto;
  
}

.icon-header {
  margin-left: auto;      /* Đây là "chìa khóa" để đẩy sang phải */
  display: flex;          /* Giúp các icon bên trong nằm ngang */
  gap: 20px;              /* Khoảng cách giữa icon giỏ hàng và người dùng */
  align-items: center;    /* Căn giữa các icon theo chiều dọc */
}

.cart-icon-link {
  padding-right: 30px;
}

.cart-icon-link svg:hover {
  transform: scale(1.1);
}

/* --------- */
/* --- THÔNG TIN NHÀ HÀNG --- */
.res-name { font-size: 28px; font-weight: bold; margin-bottom: 8px; }
.res-type { color: #676767; font-size: 14px; margin-bottom: 12px; }

.res-meta { display: flex; align-items: center; gap: 20px; font-size: 14px; margin-bottom: 12px; }
.rating-box { display: flex; align-items: center; gap: 4px; }
.star { color: #F7C942; font-size: 16px; }
.meta-item { color: #676767; }

.open-time { font-size: 14px; color: #676767; margin-bottom: 25px; }

/* OPTIONS (Ngày/Giờ) */
.delivery-options { display: flex; gap: 15px; margin-bottom: 30px; }
.option-box {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px 15px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background: white;
}

/* --- STICKY NAV (MENU) --- */
.sticky-nav {
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
  border-bottom: 1px solid #eee;
  padding: 10px 0;
  margin-bottom: 30px;
}
.nav-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 30px;
  overflow-x: auto; /* Cho phép cuộn ngang nếu menu dài */
  white-space: nowrap;
}
.nav-list li {
  font-weight: 600;
  color: #676767;
  cursor: pointer;
  padding-bottom: 10px;
  border-bottom: 3px solid transparent;
  transition: 0.2s;
  text-transform: uppercase;
  font-size: 13px;
}
.nav-list li:hover, .nav-list li.active {
  color: #00B14F; /* Màu xanh Grab */
  border-bottom-color: #00B14F;
}

/* --- DANH SÁCH MÓN ĂN (GRID) --- */
.section-title { font-size: 24px; font-weight: bold; margin-bottom: 20px; }

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); /* Tự động chia cột */
  gap: 20px;
}

.product-card {
  display: flex;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s;
  border: 1px solid #f0f0f0;
}
.product-card:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }

.card-img { width: 120px; height: 120px; flex-shrink: 0; }
.card-img img { width: 100%; height: 100%; object-fit: cover; }

.card-content { flex: 1; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; }
.prod-name { font-size: 16px; font-weight: 600; margin: 0 0 5px 0; }
.prod-desc { font-size: 12px; color: #888; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.price { font-weight: bold; color: #333; }
.add-btn {
  background-color: #00B14F;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 18px;
  line-height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* --------------- */

.footer { background-color: #f0fbf4; padding: 60px 0 20px; border-top: 4px solid #00b14f; margin-top: 50px; }
.footer-container { width: 100%; margin: 0 auto; display: flex; justify-content: space-between; flex-wrap: wrap; padding: 0 0px; gap: 40px; }
.footer-column { flex: 1; min-width: 250px; }
.footer-logo { width: 150px; margin-bottom: 20px; }
.footer-column h4 { margin-bottom: 20px; font-size: 18px; color: #333; }
.footer-column ul { list-style: none; }
.footer-column li { margin-bottom: 10px; }
.footer-column a { text-decoration: none; color: #666; font-size: 15px; }
.map-container { margin-top: 15px; border-radius: 8px; overflow: hidden; }

/* --- GIAO DIỆN HÀNG NGANG (FULL WIDTH) --- */
.product-list-horizontal {
  display: flex;
  flex-direction: column; /* Xếp chồng các hàng lên nhau */
  gap: 16px;
  width: 100%;
}

.product-card-horizontal {
  display: flex; /* Cấu trúc ngang: Ảnh - Thông tin - Nút */
  background: #fff;
  border-bottom: 1px solid #f2f2f2;
  padding: 16px 0;
  width: 100%;
  align-items: center;
  transition: background 0.2s;
}

.product-card-horizontal:hover {
  background: #fafafa;
}

/* 1. Kích thước ảnh */
.card-img-left {
  width: 130px;
  height: 130px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  margin-right: 20px;
}

.card-img-left img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 2. Thông tin ở giữa */
.card-info-middle {
  flex: 1; /* Chiếm toàn bộ khoảng trống còn lại */
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.prod-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: #1c1c1c;
}

.prod-desc {
  font-size: 14px;
  color: #676767;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1; /* Chỉ hiện 1 dòng mô tả */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Style cho dòng số đơn đã đặt */
.order-count {
  font-size: 13px;
  color: #00b14f;
  background: #f0fbf4;
  padding: 4px 10px;
  border-radius: 4px;
  width: fit-content;
  margin: 4px 0;
}

.order-count b {
  font-weight: 800;
}

.price {
  font-size: 17px;
  font-weight: bold;
  color: #1c1c1c;
}

/* 3. Nút bấm bên phải */
.card-action-right {
  margin-left: 20px;
}

.add-btn-large {
  background-color: #00B14F;
  color: white;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 12px; /* Bo góc hiện đại hơn */
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, background 0.2s;
}

.add-btn-large:hover {
  background-color: #008f3e;
  transform: scale(1.1);
}

/* Responsive cho điện thoại */
@media (max-width: 600px) {
  .card-img-left {
    width: 100px;
    height: 100px;
  }
  .prod-name { font-size: 16px; }
}

/* --- BANNER HEADER CÓ ẢNH --- */
.restaurant-banner {
  position: relative;
  width: 100%;
  height: 300px; /* Chiều cao ảnh banner */
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.restaurant-banner:hover .banner-img {
  transform: scale(1.05); /* Hiệu ứng zoom nhẹ khi di chuột vào */
}

/* Lớp phủ đen mờ để các nút bấm nổi bật hơn */
.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(255,255,255,1) 100%);
}

/* Các nút bấm trên ảnh */
.banner-actions {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  z-index: 10;
}

.circle-btn {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

.circle-btn:hover {
  background: #f0f0f0;
}

.right-actions {
  display: flex;
  gap: 10px;
}

/* Điều chỉnh lại phần main để khít với banner */
.main {
  max-width: 1200px;
  margin: -50px auto 0; /* Đẩy nội dung lên trên ảnh một chút tạo hiệu ứng xếp lớp */
  position: relative;
  z-index: 20;
  background: white;
  border-radius: 20px 20px 0 0; /* Bo góc phía trên nội dung */
  padding: 30px;
}

@media (max-width: 768px) {
  .restaurant-banner {
    height: 200px;
  }
  .main {
    margin-top: -30px;
    padding: 20px;
  }
}
</style>