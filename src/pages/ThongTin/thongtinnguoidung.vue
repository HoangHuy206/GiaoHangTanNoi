<template>
  <div class="desktop-container">
    <div class="header-banner" :style="{ backgroundImage: `url(${bannerImage})` }">
      <div class="nav-bar">
        <button class="icon-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        </button>
        
        <button class="icon-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
      </div>
    </div>

    <div class="profile-info">
      <div class="avatar-container">
        <img 
          :src="user.avatar || defaultAvatar" 
          alt="Avatar" 
          class="avatar-img"
          @error="handleImageError"
        />
      </div>

      <h2 class="user-name">{{ user.name }}</h2>

      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-num">{{ user.likes }}</span>
          <span class="stat-label">lượt thích</span>
        </div>
        <div class="divider"></div>
        <div class="stat-item">
          <span class="stat-num">{{ user.followers }}</span>
          <span class="stat-label">người theo dõi</span>
        </div>
        <div class="divider"></div>
        <div class="stat-item">
          <span class="stat-num">{{ user.following }}</span>
          <span class="stat-label">đang theo dõi</span>
        </div>
      </div>

      <button class="edit-btn">Chỉnh sửa hồ sơ</button>
    </div>

    <div class="favorites-section">
      <div class="section-header">
        <h3>Quán yêu thích</h3>
        <span class="privacy-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Chỉ hiển thị với bạn
        </span>
        <button class="arrow-right">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>

      <div class="restaurant-grid">
        <div class="restaurant-card" v-for="(shop, index) in favoriteShops" :key="index">
          <div class="card-image-wrapper">
            <img :src="shop.image" :alt="shop.name" class="shop-img">
            <span class="discount-badge" v-if="shop.discount">{{ shop.discount }}</span>
          </div>
          <div class="card-info">
            <h4>{{ shop.name }}</h4>
            <p class="shop-address">{{ shop.address }}</p>
          </div>
        </div>
      </div>
    </div>

    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

// 1. Cấu hình ảnh nền và ảnh mặc định
const bannerImage = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop'; // Ảnh lá cây
// Thêm dòng này ở trên cùng, chỗ các lệnh import khác
import defaultAvatarImg from '@/assets/anhND/anhdaidienmacdinh.jpg';

// ...

// Sau đó gán vào biến (bỏ dấu ngoặc nháy đi vì nó là biến đã import)
const defaultAvatar = defaultAvatarImg; // Ảnh mặc định nếu user chưa upload

// 2. Dữ liệu người dùng (Giả lập)
const user = reactive({
  name: 'Văn Bình Đỗ',
  avatar: '', // Để trống chuỗi này '' để test tính năng ảnh mặc định
  likes: 0,
  followers: 0,
  following: 0
});

// 3. Danh sách quán yêu thích
const favoriteShops = ref([
  {
    name: 'Cơm Thố Anh Nguyễn',
    address: 'Cơm Thố Anh Nguyễn - Lê...',
    image: 'https://images.foody.vn/res/g103/1025880/prof/s576x330/foody-upload-api-foody-mobile-com-tho-anh-nguyen-190610103723.jpg', // Link ảnh mẫu
    discount: 'Giảm 50%'
  },
  // Thêm dữ liệu giả để test giao diện máy tính
  {
    name: 'Trà Sữa TocoToco',
    address: '123 Đường Láng, Hà Nội',
    image: 'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?auto=format&fit=crop&w=500&q=60',
    discount: 'Freeship'
  }
]);

// Hàm xử lý khi link ảnh avatar bị lỗi -> chuyển về mặc định
const handleImageError = (e) => {
  e.target.src = defaultAvatar;
};
</script>

<style scoped>
/* Reset cơ bản */
* {
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Container chính trên Desktop */
.desktop-container {
  max-width: 900px; /* Giới hạn chiều rộng để nhìn giống profile card */
  margin: 40px auto;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  overflow: hidden;
  min-height: 80vh;
}

/* Header Banner */
.header-banner {
  height: 200px; /* Cao hơn trên desktop */
  background-size: cover;
  background-position: center;
  position: relative;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  padding: 20px;
}

.icon-btn {
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.5);
}

/* Thông tin Profile */
.profile-info {
  text-align: center;
  padding: 0 20px 30px;
  position: relative;
  border-bottom: 8px solid #f5f5f5;
}

.avatar-container {
  width: 120px;
  height: 120px;
  margin: -60px auto 15px; /* Kéo avatar lên đè banner */
  position: relative;
  border-radius: 50%;
  border: 4px solid white;
  background-color: #fff;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 15px;
  color: #333;
}

.stats-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-weight: bold;
  font-size: 18px;
}

.stat-label {
  font-size: 13px;
  color: #666;
}

.divider {
  width: 1px;
  height: 20px;
  background-color: #ddd;
}

.edit-btn {
  background-color: #00B14F; /* Màu xanh lá đặc trưng */
  color: white;
  border: none;
  padding: 10px 40px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: 0.2s;
}

.edit-btn:hover {
  background-color: #009944;
}

/* Phần Quán yêu thích */
.favorites-section {
  padding: 20px 30px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.arrow-right {
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
}

.privacy-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  margin-left: 10px;
}

/* Grid Layout cho Desktop */
.restaurant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* Tự động chia cột */
  gap: 20px;
}

.restaurant-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  cursor: pointer;
}

.restaurant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.card-image-wrapper {
  position: relative;
  height: 150px;
}

.shop-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: #ee4d2d;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-top-right-radius: 4px;
}

.card-info {
  padding: 12px;
}

.card-info h4 {
  margin: 0 0 5px;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shop-address {
  margin: 0;
  font-size: 13px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>