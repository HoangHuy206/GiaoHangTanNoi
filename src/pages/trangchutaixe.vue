<script setup>
import { ref } from 'vue'
import'../assets/icon/icon/themify-icons-font/themify-icons-font/themify-icons/themify-icons.css'
const isOnline = ref(false) // Trạng thái Bật/Tắt kết nối
const isShowModal = ref(false) // Biến này kiểm soát modal
const toggleConnection = () => {
  isOnline.value = !isOnline.value
}

// Hàm mở/đóng rất đơn giản
const openModal = () => isShowModal.value = true
const closeModal = () => isShowModal.value = false


</script>

<template>
  <div class="dashboard-container">
    
    <aside class="sidebar">
      <div class="logo-area">
        <h2>Tài xế Pro</h2>
      </div>
      <ul class="nav-links">
        <li class="active"><i class="ti-home"></i> Trang chủ</li>
        <li><i class="ti-wallet"></i> Thu nhập</li>
        <li><i class="ti-email"></i> Hộp thư</li>
        <li><i class="ti-calendar"></i> Lịch</li>
        <li><i class="ti-user"></i> Hồ sơ</li>
      </ul>
      <div class="logout-btn">
        <button>Đăng xuất</button>
      </div>
    </aside>

    <div class="modal-overlay" v-if="isShowModal">
        <div class="modal-box">
            <span class="close-btn" @click="closeModal">&times;</span>
            <div class="modal-body">
                <h2>dịch vụ</h2>
                <p>Food</p>
                <p>Giao hàng nhanh</p>
            </div>
        </div>
    </div>

    <main class="map-section">
      
      <div class="map-background">
        <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096814183571!2d105.78009367471446!3d21.02881188777726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab86cece9ac1%3A0xa9bc04e04602dd85!2zRlBUIFRvd2Vy!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s" 
            width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy">
        </iframe>
      </div>

      <div class="control-panel">
        <div class="status-bar" :class="{ 'online': isOnline }">
          <div class="status-indicator"></div>
          <p>{{ isOnline ? 'Bạn đang trực tuyến' : 'Bạn đang tắt kết nối' }}</p>
        </div>

        <button class="toggle-btn" @click="toggleConnection" :class="{ 'btn-on': isOnline }">
          <i class="ti-power-off"></i>
          {{ isOnline ? 'TẮT KẾT NỐI' : 'BẬT KẾT NỐI' }}
        </button>

        <div class="quick-actions">
          <div class="action-item">
            <div class="circle-icon" @click="openModal"><i class="ti-car"></i></div>
            <span>Loại dịch vụ</span>
          </div>
          <div class="action-item">
            <div class="circle-icon"><i class="ti-location-pin"></i></div>
            <span>Điểm đến</span>
          </div>
          <div class="action-item">
            <div class="circle-icon"><i class="ti-bolt"></i></div>
            <span>Tự động nhận</span>
          </div>
          <div class="action-item">
            <div class="circle-icon"><i class="ti-more"></i></div>
            <span>Xem thêm</span>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<style scoped>
/* Reset cơ bản */
* { box-sizing: border-box; }

.dashboard-container {
  display: flex; /* Bố cục ngang: Trái là menu, Phải là bản đồ */
  height: 100vh; /* Chiều cao full màn hình */
  width: 100vw;
  font-family: Arial, sans-serif;
  overflow: hidden;
}

/* --- SIDEBAR --- */
.sidebar {
  width: 260px;
  background-color: #fff;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  padding: 20px;
  z-index: 10;
  box-shadow: 2px 0 5px rgba(0,0,0,0.05);
}

.logo-area h2 {
  color: #00b14f; /* Màu xanh Grab */
  margin-bottom: 40px;
  text-align: center;
}

.nav-links {
  list-style: none;
  padding: 0;
  flex: 1;
}

.nav-links li {
  padding: 15px 20px;
  margin-bottom: 10px;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 600;
  color: #555;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: 0.3s;
}

.nav-links li i { font-size: 1.2rem; }

.nav-links li:hover, .nav-links li.active {
  background-color: #f0fff4;
  color: #00b14f;
}

.logout-btn button {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

/* --- MAP SECTION --- */
.map-section {
  flex: 1; /* Chiếm hết phần còn lại */
  position: relative; /* Để đặt control-panel đè lên */
}

.map-background {
  width: 100%;
  height: 100%;
}

/* --- CONTROL PANEL (Phần nổi) --- */
.control-panel {
  position: absolute;
  bottom: 30px; /* Cách đáy 30px */
  left: 50%;
  transform: translateX(-50%); /* Căn giữa màn hình */
  background: white;
  width: 90%;
  max-width: 800px; /* Giới hạn chiều rộng trên máy tính */
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* Trạng thái */
.status-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  color: #666;
}

.status-indicator {
  width: 12px;
  height: 12px;
  background-color: red;
  border-radius: 50%;
}

.status-bar.online .status-indicator {
  background-color: #00b14f;
  box-shadow: 0 0 10px #00b14f;
}

/* Nút Bật Tắt */
.toggle-btn {
  background-color: #1c1c1c;
  color: white;
  border: none;
  padding: 15px 60px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: 0.3s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.toggle-btn.btn-on {
  background-color: #00b14f; /* Đổi màu xanh khi bật */
}

.toggle-btn:hover {
  transform: scale(1.05);
}

/* Các nút tròn chức năng */
.quick-actions {
  display: flex;
  justify-content: center;
  gap: 40px;
  width: 100%;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.circle-icon {
  width: 50px;
  height: 50px;
  background-color: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #333;
  transition: 0.3s;
}

.action-item:hover .circle-icon {
  background-color: #e0e0e0;
  color: #00b14f;
}

.action-item span {
  font-size: 14px;
  color: #555;
}

/* -----------------------*/

    /* Lớp nền phủ toàn màn hình */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex; /* Mặc định là flex để căn giữa */
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-body h2{
    text-align: center;
    padding-bottom: 30px;
}

.modal-body p {
    padding-left: 30px;
    padding-bottom: 20px;
}

/* Hộp nội dung màu đen như trong ảnh */
.modal-box {
    background: #2f492f;
    color: white;
    padding: 20px;
    border-radius: 10px;
    width: 500px;
    position: relative;
    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
}

/* Nút đóng (X) */
.close-btn {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 25px;
    cursor: pointer;
}

</style>