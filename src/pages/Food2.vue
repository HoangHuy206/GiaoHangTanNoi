<script setup>
import { ref, computed ,onMounted, onUnmounted} from 'vue'
import { RouterLink } from 'vue-router'

const isMenuOpen = ref(false)
const activeTab = ref('nguoi-dung')
const searchQuery = ref('')


const menuData = [
  {
    id: 've-grab',
    label: 'Về Grab',
    columns: [
      { title: 'Về chúng tôi', items: ['Câu chuyện của tài xế', 'Chúng tôi là ai', 'Sứ mệnh'] },
      { title: 'Tin tưởng & An toàn', items: ['Chính sách an toàn', 'Tiêu chuẩn cộng đồng'] }
    ]
  },
  {
    id: 'nguoi-dung',
    label: 'Người dùng',
    columns: [
      { title: 'Có gì mới?', items: ['Sự kiện nổi bật', 'Ưu đãi hấp dẫn'] },
      { title: 'Di chuyển', items: ['Đặt xe ngay', 'Thuê xe theo giờ'] },
      { title: 'GrabFood', items: ['Món ngon tại nhà', 'Khuyến mãi'] },
      { title: 'Ví điện tử', items: ['Liên kết thẻ', 'Nạp tiền'] }
    ]
  },
  {
    id: 'doi-tac',
    label: 'Đối tác tài xế',
    columns: [
      { title: 'Thông tin mới nhất', items: ['Cập nhật chính sách', 'Chương trình thưởng'] },
      { title: 'Đăng ký', items: ['Trở thành tài xế công nghệ', 'Giao đồ ăn'] }
    ]
  }
]

const currentContent = computed(() => {
  return menuData.find(item => item.id === activeTab.value)?.columns || []
})

// ảnh chuyển động

// --- LOGIC SLIDER ---
const currentIndex = ref(0)
const images = [
  { 
    src: new URL('../assets/anhbanner/anhbanh.webp', import.meta.url).href, 
    alt: 'Banner 1' 
  },
  { 
    src: new URL('../assets/anhbanner/anhbanh2.jpg', import.meta.url).href, 
    alt: 'Banner 2' 
  },
  { 
    src: new URL('../assets/anhbanner/anhbun.jpg', import.meta.url).href, 
    alt: 'Banner 3' 
  },
]

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % images.length
}

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + images.length) % images.length
}

// Thiết lập tự động chuyển ảnh sau 4 giây
let timer = null
onMounted(() => {
  timer = setInterval(nextSlide, 4000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// kết thúc chuyển động anh

// bắt đầu 

const restaurants = ref([
  {
    id: 1,
    name: "Cơm Gà 68 - Cơm Gà, Cơm Sườn",
    type: "Cơm",
    rating: 4.9,
    time: "30 phút",
    distance: "4.4 km",
    promo: "Giảm 15.000đ",
    image: new URL('../assets/anhND/comngon.jpg', import.meta.url).href,
    isFavorite: false, // Trạng thái ban đầu
  },
  {
    id: 2,
    name: "Lotteria - Vincom Smart City",
    type: "đồ uống ",
    rating: 3.8,
    time: "25 phút",
    distance: "2.8 km",
    promo: "Tặng Menu",
    image: new URL('../assets/anhND/lotte.jpg', import.meta.url).href,
    isFavorite: false, // Trạng thái ban đầu
  },
  {
    id: 1,
    name: "cơm bình dân",
    type: "Cơm",
    rating: 4.9,
    time: "30 phút",
    distance: "4.4 km",
    promo: "Giảm 15.000đ",
    image: new URL('../assets/anhND/comtho.jpg', import.meta.url).href,
    isFavorite: false, // Trạng thái ban đầu
  },
  {
    id: 1,
    name: "Cơm Gà hầm ",
    type: "Cơm, Thức ăn nhanh",
    rating: 4.9,
    time: "30 phút",
    distance: "4.4 km",
    promo: "Giảm 15.000đ",
    image: new URL('../assets/anhND/gaham.jpg', import.meta.url).href,
    isFavorite: false, // Trạng thái ban đầu
  },
  {
    id: 1,
    name: "tocotoc ",
    type: "đồ uống",
    rating: 4.9,
    time: "30 phút",
    distance: "4.4 km",
    promo: "Giảm 15.000đ",
    image: new URL('../assets/anhND/toco.jpg', import.meta.url).href,
    isFavorite: false, // Trạng thái ban đầu
  },
    {
    id: 1,
    name: "bún chấm ",
    type: "đồ ăn chín",
    rating: 4.9,
    time: "30 phút",
    distance: "4.4 km",
    promo: "Giảm 15.000đ",
    image: new URL('../assets/anhND/buncham.jpg', import.meta.url).href,
    isFavorite: false, // Trạng thái ban đầu
  },
  {
    id: 1,
    name: "mixue ",
    type: "đồ uống",
    rating: 4.9,
    time: "30 phút",
    distance: "4.4 km",
    promo: "Giảm 15.000đ",
    image: new URL('../assets/anhND/mixue.jpg', import.meta.url).href,
    isFavorite: false, // Trạng thái ban đầu
  },
  

])

// icon trái tim 
const toggleFavorite = (res) => {
  res.isFavorite = !res.isFavorite
}

/// phần tìm kiếm 
const filteredRestaurants = computed(() => {
  // Nếu không nhập gì, trả về toàn bộ danh sách
  if (!searchQuery.value.trim()) {
    return restaurants.value
  }
  
  // Lọc danh sách: chuyển tên quán và từ khóa về chữ thường
  return restaurants.value.filter(res => 
    res.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

</script>

<template>
  <div class="grab-container">
    
    <header class="navbar-custom">
      <div class="nav-left">
        <svg class="menu-icon" @click="isMenuOpen = !isMenuOpen" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
        <div class="logo-box">
           <img src="../assets/anh.logo/anhnen.png" alt="Grab" class="logo-img" style="width: 100px; height:100px;"/> 
        </div>
      </div>
      
      <div class="nav-right">
        <span class="support-text">Trung Tâm Hỗ Trợ</span>
        
        <router-link to=" " >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" color="black">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </router-link>

        <router-link to="/thongtinnguoidung">
            <svg class="icon-action" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </router-link>
      </div>
    </header>

    <div v-if="isMenuOpen" class="mega-menu">
      <div class="menu-sidebar">
        <ul>
          <li v-for="item in menuData" :key="item.id" :class="{ active: activeTab === item.id }" @click="activeTab = item.id">
            {{ item.label }}
          </li>
        </ul>
      </div>
      <div class="menu-content">
        <div class="content-grid">
          <div v-for="(col, index) in currentContent" :key="index" class="content-column">
            <h3 class="column-title">{{ col.title }}</h3>
            <ul>
              <li v-for="(subItem, subIndex) in col.items" :key="subIndex">{{ subItem }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <!-- bắt đầu phần content -->

    <main class="hero-section">
      <div class="slider-container">
        <div class="slides-wrapper" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
          <div v-for="(img, index) in images" :key="index" class="slide">
              <img :src="img.src" :alt="img.alt" />
          </div>
        </div>

        <button class="nav-btn prev" @click="prevSlide">&#10094;</button>
        <button class="nav-btn next" @click="nextSlide">&#10095;</button>

        <div class="search-overlay">
          <div class="search-box">
            <p class="greeting">Xin Chào Bạn </p>
            <h1 class="title">Chúng tôi nên giao thức ăn của bạn ở đâu hôm nay?</h1>
            <div class="input-group">
              <input v-model="searchQuery" type="text" class="inp-find" placeholder="Nhập Quán bạn muốn tìm..." />
              <button class="btn-find">Tìm kiếm</button>
            </div>
          </div>
        </div>
      </div>
    </main>
    
   <!-- kết thúc phần content -->

   <!-- bắt đầu restaurant -->
    <section class="restaurant-container">
        <h2 class="title-section">Ưu đãi Giao Hàng Tận Nơi tại <span class="green-text">Hà Nội</span></h2>
    
      <div class="restaurant-grid">
        
        <router-link v-for="res in filteredRestaurants" :key="res.id" class="restaurant-card">
          <div class="image-box">
            <img :src="res.image" alt="restaurant" />
            <span class="promo-label">Promo</span>
          </div>

          <div class="favorite-icon" @click.prevent="toggleFavorite(res)">
            <span v-if="res.isFavorite">❤️</span>
            <span v-else>🤍</span>
          </div>
      
          <div class="info-box">
            <h3 class="res-name">{{ res.name }}</h3>
            <p class="res-type">{{ res.type }}</p>
            <div class="res-meta">
              <span>⭐ {{ res.rating }}</span>
              <span>{{ res.time }} • {{ res.distance }}</span>
            </div>
            <div class="res-discount">
              <span class="icon">🎫</span> {{ res.promo }}
            </div>
          </div>
        </router-link>

        <div v-if="filteredRestaurants.length === 0" class="no-results">
          <p>Rất tiếc, không tìm thấy quán nào khớp với "{{ searchQuery }}"</p>
        </div>
        
      </div>
    </section>
    <!-- kết thúc phần restaurant -->

    <!-- bắt đầu phần words -->
    <div class="words">
      <h1>Vì Sao Bạn Nên Order trên Giao Hàng Tận Nơi ?</h1>
      
      <p><span><b>Nhanh Nhất-</b></span> chúng tôi cung cấp dịch vụ giao đồ ăn nhanh nhất trên thị trường.</p>
      <p><span><b>Dễ Dàng Nhất-</b></span> Bạn chỉ cần thực hiện vài cú nhấp chuột là có thể đặt đồ ăn </p>
      <p><span><b>Đáp Ứng Mọi Nhu Cầu -</b></span> Từ Món đặc sản địa phương đến các nhà hàng được ưa thích ,giúp bạn có nhiều sự lựa chọn </p>
      <p><span><b>Thanh Toán Dễ Dàng -</b></span> Giao và nhận đồ ăn  thật dễ dàng , thanh toán bằng thẻ ví đơn giản .</p>
    </div>

    <!-- kết thúc phần words -->

    <!-- fooder -->

    <div class="footer">
      <div class="footer-container">
        <div class="footer-column branding">
          <img src="@/assets/anh.logo/anhnen.png" alt="Logo Footer" class="footer-logo" style="width: 200px; height: 150px;">
          <div class="address-box">
            <h4>ĐỊA CHỈ</h4>
            <div class="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.296073307168!2d105.7475674103227!3d21.020836187970833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3134549c574476c3%3A0xd3c6af79105ea6da!2zVHLGsOG7nW5nIENhbyDEkeG6s25nIEPDtG5nIG5naOG7hyBDYW8gSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1768833697804!5m2!1svi!2s""
                width="100%"
                height="200"
                style="border:0;"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
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

        <div class="footer-column">
          <h4>Hợp tác</h4>
          <ul>
            <li><router-link to="">Giao Hàng Tận Nơi</router-link></li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>Theo dõi chúng tôi @2026</p>
      </div>
    </div>

  </div> 
  
</template>
<style scoped>
/* --- CÀI ĐẶT CHUNG --- */
* { padding: 0; margin: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }

.grab-container {
  width: 100%;
  overflow-x: hidden; /* Quan trọng: Ẩn thanh cuộn ngang nếu banner bị tràn */
}

/* --- HEADER --- */
.navbar-custom { display: flex; justify-content: space-between; align-items: center; padding: 10px 40px; background-color: #9EF3C0; position: fixed; top: 0; left: 0; width: 100%; height: 80px; z-index: 1000; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.nav-left { display: flex; align-items: center; gap: 25px; }
.menu-icon { cursor: pointer; color: #000; transition: 0.2s; } .menu-icon:hover { color: #555; }
.logo-img { height: 55px; width: auto; object-fit: contain; }
.nav-right { display: flex; align-items: center; gap: 30px; color: #000; }
.support-text { font-weight: 700; font-size: 16px; cursor: pointer; white-space: nowrap; }
.icon-action { cursor: pointer; color: #000; transition: transform 0.2s; } .icon-action:hover { transform: scale(1.1); }
.user-link { text-decoration: none; color: #000; display: flex; align-items: center; }

/* --- MEGA MENU --- */
.mega-menu { 
  position: fixed; 
  top: 80px;
   left: 0;
    width: 100%;
     height: 400px; 
     background-color: white;
      z-index: 999; display: flex; 
      box-shadow: 0 10px 20px rgba(0,0,0,0.1); 
      animation: slideDown 0.3s ease-out;
     }
@keyframes slideDown
 { from { opacity: 0;
   transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.menu-sidebar { 
  width: 250px; 
  background-color: #f7f7f7;
   padding-top: 20px; 
   border-right: 1px solid #eee; }
.menu-sidebar ul {
   list-style: none; 
  }
.menu-sidebar li {
   padding: 15px 30px;
    font-weight: 600; 
    color: #333; cursor:
     pointer; transition: 0.2s; }
.menu-sidebar li:hover { 
  background-color: #e0e0e0; 
}
.menu-sidebar li.active {
   color: #00B14F; 
   background-color: white;
    border-left: 4px solid #00B14F;
   }
.menu-content { flex: 1;
   background-color: white;
    padding: 40px; 
    overflow-y: auto;
   }
.content-grid {
   display: flex;
   gap: 50px; flex-wrap: wrap;
   }
.column-title { font-size: 16px; 
  font-weight: bold; 
  margin-bottom: 20px; 
  padding-bottom: 5px; 
  border-bottom: 2px solid #ddd; 
  display: inline-block; }
.menu-content ul {
   list-style: none;
   }
.menu-content li {
   margin-bottom: 12px; 
   color: #555; 
   font-size: 14px; 
   cursor: pointer; }
.menu-content li:hover {
   color: #00B14F; 
   text-decoration: underline; 
  }

  /* kết thúc phần header */

.slider-container {
  position: relative;
  width: 100%;
  height: 500px; /* Chiều cao giống GrabFood */
  overflow: hidden;
  margin-top: 80px;
}

.slides-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); /* Hiệu ứng trượt mượt */
}

.slide {
  min-width: 100%;
  height: 100%;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Để ảnh không bị móp */
}

/* Ô tìm kiếm đè lên ảnh */
.search-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 80px;
  pointer-events: none; /* Để vẫn click được vào nút slide phía sau nếu cần */
}

.search-box {
  background: white;
  padding: 40px;
  border-radius: 8px;
  width: 450px;
  pointer-events: auto; /* Kích hoạt lại click cho ô tìm kiếm */
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.7);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
}
.next { right: 20px; }
.prev { left: 20px; }

.inp-find {
  width: 70%;
  height: 30px;
  border-radius: 5px;
  background-color: #c5c5c5;
}

.btn-find {
  margin-left: 20px;
  height: 30px;
  padding: 0 10px;
  background-color: #00b14f;
  color: #f7f7f7;
  border-radius: 5px;
}

/* bắt đầu restaurant */

.restaurant-container {
  padding: 30px 80px;
  max-width: 1200px;
  margin: 0 auto;
}

.title-section {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.green-text { color: #00b14f; }

/* CHIA Ô TẠI ĐÂY */
.restaurant-grid {
  display: grid;
  /* Chia làm 4 cột đều nhau, nếu màn hình nhỏ tự nhảy dòng */
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); 
  gap: 20px; /* Khoảng cách giữa các ô */
}

.restaurant-card {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: 0.3s;
  text-decoration: none;
}

.restaurant-card:hover { transform: translateY(-5px); }

.image-box {
  position: relative;
  width: 100%;
  height: 160px;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.promo-label {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #00b14f;
  color: white;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
}

.res-name {
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0 5px;
  /* Giới hạn tên quán 1 dòng để không làm lệch ô */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.res-type { color: #666; font-size: 14px; }

.res-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin: 8px 0;
  color: #333;
}

.res-discount {
  border-top: 1px solid #eee;
  padding-top: 8px;
  font-size: 13px;
  color: #333;
}
/* icon trái tim */
.image-box {
  position: relative; /* Gốc tọa độ cho icon con */
  width: 100%;
  height: 160px;
}

.favorite-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9); /* Nền trắng mờ để nổi bật icon */
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
  z-index: 10;
  font-size: 18px;
}

.favorite-icon:hover {
  transform: scale(1.1);
  background: #ffffff;
}

/* bắt đầu phần words */

.words {
  padding: 60px 80px; /* Tạo khoảng cách 2 bên giống với phần trên */
  max-width: 1200px;
  margin: 0 auto;
  clear: both; /* Đảm bảo không bị ảnh hưởng bởi các phần tử float (nếu có) */
  display: block; /* Đảm bảo nó là một khối riêng biệt */
}

.words h1 {
  margin-bottom: 30px;
}

.words p {
  line-height: 30px;
}

/* kết thúc phần Words */

/* bắt đầu phần footer */
.footer {
  background-color: #f0fbf4; /* Màu nền nhẹ hơn */
  padding: 60px 0 20px 0;
  margin-top: 50px;
  border-top: 4px solid #00b14f;
}
.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap; /* Cho phép xuống dòng trên mobile */
  justify-content: space-between;
  padding: 0 20px;
  gap: 30px;
}
.footer-column {
  flex: 1;
  min-width: 200px;
}
.footer-logo { height: 40px; margin-bottom: 20px; }
.footer-column h4 { margin-bottom: 20px; font-weight: bold; color: #333; }
.footer-column ul { list-style: none; padding: 0; }
.footer-column ul li { margin-bottom: 10px; }
.footer-column ul li a {
  text-decoration: none;
  color: #555;
  font-size: 14px;
  transition: 0.2s;
}
.footer-column ul li a:hover { color: #00b14f; padding-left: 5px; }

.footer-bottom {
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 20px;
  margin-top: 40px;
  color: #888;
  font-size: 14px;
}
</style>