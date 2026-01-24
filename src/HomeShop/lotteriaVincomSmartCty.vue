<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { cartBus } from '@/pages/SanPham/Products/GioHang_G.vue' 

// --- 1. LOGIC SCROLL & HIỆU ỨNG ẢNH ---
const scrollY = ref(0);
const handleScroll = () => {
  scrollY.value = window.scrollY;
};

// Tính toán độ mờ: Khi kéo xuống, opacity giảm dần từ 1 về 0
const bannerStyle = computed(() => {
  // Giả sử kéo xuống 200px là ảnh mờ hết
  const opacity = 1 - (scrollY.value / 300); 
  return {
    opacity: opacity < 0 ? 0 : opacity, // Không cho nhỏ hơn 0
    transform: `translateY(${scrollY.value * 0.5}px)` // Tạo hiệu ứng Parallax nhẹ (ảnh trôi chậm hơn nội dung)
  };
});

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// --- 2. DỮ LIỆU NHÀ HÀNG ---
const restaurant = ref({
  name: "Trang Chủ Lotteria-Vincom Smart Cty",
  tags: ["Thức ăn nhanh", "Thịt gà", "Món Hàn"],
  rating: 4.6,
  reviews: "500+",
  time: "30 phút",
  distance: "3,8 km",
  openTime: "10:00 - 21:40",
})

// --- 3. DANH SÁCH MÓN ĂN ---
const products = ref([
  { id: 1, name: "Burger Bulgogi", price: "65000", image: new URL('../../../assets/anhND/Burger_Bulgogi.webp', import.meta.url), ordering: 0, delivered: 0 },
  { id: 2, name: "Burger tôm", price: "159000", image: new URL('../../../assets/anhND/Burger_tom.webp', import.meta.url), ordering: 0, delivered: 0 },
  { id: 3, name: "Gà Rán Phần", price: "79000", image: new URL('../../../assets/anhND/garanphan.webp', import.meta.url), ordering: 0, delivered: 0 },
  { id: 4, name: "Gà Sốt Dâu 3 Miếng", price: "120000", image: new URL('../../../assets/anhND/gasotdau3mieng.webp', import.meta.url), ordering: 0, delivered: 0 },
  { id: 5, name: "Gà Sốt phô mai 3 miếng", price: "100000", image: new URL('../../../assets/anhND/gasotphomai3mieng.webp', import.meta.url), ordering: 0, delivered: 0 },
  { id: 6, name: "Mỳ Ý", price: "87000", image: new URL('../../../assets/anhND/myy.webp', import.meta.url), ordering: 0, delivered: 0 },
  { id: 7, name: "Combo Gà Rán (Mới)", price: "150000", image: new URL('../../../assets/anhND/garanphan.webp', import.meta.url), ordering: 0, delivered: 0 },
  { id: 8, name: "Khoai tây lắc", price: "45000", image: new URL('../../../assets/anhND/Burger_tom.webp', import.meta.url), ordering: 0, delivered: 0 },
])

const openNotification = () => {
  console.log("Đã bấm thông báo");
}

const placeOrder = (item) => {
  item.ordering += 1;
  cartBus.emit('add-to-cart', {
    id: item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: 1
  });
  setTimeout(() => {
    if (item.ordering > 0) {
      item.ordering -= 1;   
      item.delivered += 1;  
    }
  }, 3000);
}
</script>

<template>
  <div class="page-container">
    
    <div class="banner-wrapper">
        <div class="banner-image" :style="bannerStyle">
            <img src="../assets/anhND/anhbanner1.jpg" alt="Lotteria Banner" 
                 onerror="this.src='https://cdn.tgdd.vn/Files/2021/07/28/1371391/lotteria-khuyen-mai-mua-1-tang-1-ga-ran-khoai-tay-lac-nuoc-ngot-202107281656093630.jpg'">
        </div>

        <div class="header-overlay-icons">
          <div class="icon-group">
            <a href="#" @click.prevent="openNotification" class="icon-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-bell">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
            </a>

            <router-link to="/thongtinnguoidung" class="icon-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather-user">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </router-link>
          </div>
        </div>
    </div>

    <div class="main">
      <div class="breadcrumb">
        <span>Trang chủ</span> <span class="arrow">></span> 
        <span>Nhà hàng</span> <span class="arrow">></span> 
        <span class="current">{{ restaurant.name }}</span>
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
      <h2 class="section-title">Kiểm soát đơn hàng</h2>
      
      <div class="product-list-vertical">
        <div v-for="item in products" :key="item.id" class="product-card-vertical">
          <div class="card-img">
            <img :src="item.image" :alt="item.name">
          </div>
          <div class="card-content">
            <h3 class="prod-name">{{ item.name }}</h3>
            <p class="prod-desc">Món ngon bán chạy nhất tuần qua...</p> 
            
            <div class="card-footer-vertical">
              <span class="price">{{ item.price.toLocaleString('vi-VN') }}₫</span>
              
              <div class="order-action-area">
                <div class="order-status">
                   <span class="status-text pending">Đơn hàng đã đặt: <b>{{ item.ordering }}</b></span>
                   <span class="status-text success">Đơn hàng đã giao: <b>{{ item.delivered }}</b></span>
                </div>
                <button class="btn-order-now" @click="placeOrder(item)">Đặt món</button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="footer">
      <div class="footer-container">
        <div class="footer-column branding">
          <img src="../../../assets/anh.logo/anhnen.png" alt="Logo" class="footer-logo">
          
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
/* --- BANNER STYLE MỚI --- */
.banner-wrapper {
  position: relative;
  width: 100%;
  height: 250px; /* Chiều cao banner */
  overflow: hidden;
  background-color: #f8f8f8;
  margin-bottom: 20px;
}

.banner-image {
  width: 100%;
  height: 100%;
  transition: opacity 0.1s linear; /* Hiệu ứng mờ mượt mà */
}

.banner-image img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Đảm bảo ảnh luôn full khung */
  object-position: center;
}

.header-overlay-icons {
  position: absolute;
  top: 20px;
  right: 30px;
  z-index: 10; /* Đảm bảo icon luôn nổi trên ảnh */
}

.icon-group {
  display: flex;
  gap: 20px;
  background: rgba(0, 0, 0, 0.3); /* Nền đen mờ nhẹ để icon dễ nhìn */
  padding: 8px 15px;
  border-radius: 20px;
  backdrop-filter: blur(2px);
}

.icon-link {
  color: white;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
}

.icon-link:hover {
  transform: scale(1.1);
  color: #F7C942;
}

/* --- CẤU TRÚC CHUNG --- */
.page-container {
  width: 100%;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  color: #1c1c1c;
}

/* --- BREADCRUMB --- */
.breadcrumb {
  display: flex;          
  align-items: center;    
  gap: 15px;              
  font-size: 13px; 
  color: #00A5CF; 
  margin-bottom: 20px;
  max-width: 1200px;
  margin: 0 auto 20px auto; /* Căn giữa */
}
.breadcrumb .arrow { color: #999; margin: 0 5px; }
.breadcrumb .current { color: #676767; }

/* ----------*/
.main {
  max-width: 1200px;
  margin: 0 auto;
  /* box-shadow: 0 8px 6px -6px black; -> Bỏ bóng đen ở main để thoáng hơn */
  padding: 0 10px;
}
.menu-section {
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 30px;
  padding: 0 10px;
}

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

/* --- DANH SÁCH MÓN ĂN (VERTICAL LIST) --- */
.section-title { font-size: 24px; font-weight: bold; margin-bottom: 20px; }

.product-list-vertical {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-card-vertical {
  display: flex; 
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s;
  border: 1px solid #f0f0f0;
  padding: 15px;
  align-items: flex-start;
}

.product-card-vertical:hover { 
  transform: translateX(5px); 
  box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
}

.card-img { width: 150px; height: 120px; flex-shrink: 0; border-radius: 8px; overflow: hidden; margin-right: 20px; }
.card-img img { width: 100%; height: 100%; object-fit: cover; }

.card-content { flex: 1; display: flex; flex-direction: column; justify-content: space-between; height: 100%; min-height: 120px;}
.prod-name { font-size: 18px; font-weight: 600; margin: 0 0 5px 0; }
.prod-desc { font-size: 14px; color: #888; margin-bottom: 10px; }

.card-footer-vertical {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
}

.price { font-weight: bold; color: #333; font-size: 16px; margin-bottom: 5px; display: block; }

/* --- STYLE CHO PHẦN TRẠNG THÁI VÀ NÚT --- */
.order-action-area {
  display: flex;
  align-items: center;
  gap: 20px;
}

.order-status {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  text-align: right;
}

.status-text {
  margin-bottom: 2px;
}
.status-text.pending { color: #f39c12; } 
.status-text.success { color: #00B14F; } 

.btn-order-now {
  background-color: #00B14F;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}
.btn-order-now:hover {
  background-color: #008f3f;
}
.btn-order-now:active {
  transform: scale(0.95);
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
</style>