<template>
  <div class="register-page">
    <div class="design-container">
      
      <img src="../assets/anh.logo/anhdangkynguoidung.png" alt="Background" class="bg-image">

      <div class="phone-screen-overlay">
        <h3 class="mini-title" style="margin-right: 20px;">Đăng Ký Người Dùng</h3>
        
        <form @submit.prevent="handleRegister" class="mini-form">
          <input 
            type="text" 
            v-model="username" 
            placeholder="Tên đăng nhập" 
            class="mini-input"
            required style="margin-right: 20px;"
          />
          
          <input 
            type="password" 
            v-model="password" 
            placeholder="Mật khẩu" 
            class="mini-input"
            required style="margin-right: 20px;"
          />
          
          <input 
            type="password" 
            v-model="confirmPassword" 
            placeholder="Nhập lại MK" 
            class="mini-input"
            required style="margin-right: 20px;"
          />

          <button type="submit" class="mini-btn" style="margin-right: 20px;">Đăng ký</button>
        </form>

        <router-link to="/login" class="mini-link" style="margin-right: 20px;">Đã có TK? Đăng nhập</router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');
const confirmPassword = ref('');

const handleRegister = () => {
  if (password.value !== confirmPassword.value) {
    alert("Mật khẩu không khớp!");
    return;
  }
  console.log("Đăng ký thành công:", username.value);
};
</script>

<style scoped>
/* 1. CẤU HÌNH TRANG & VỊ TRÍ ẢNH */
.register-page {
  background-color: #e8dbc8;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  /* THAY ĐỔI 1: Căn xuống đáy màn hình để người chạm đáy */
  align-items: flex-end; 
  overflow: hidden;
  /* Thêm padding dưới nếu muốn hở ra một chút, hoặc để 0 để chạm hẳn */
  padding-bottom: 0; 
}

/* 2. KHUNG CHỨA ẢNH (ZOOM TO) */
.design-container {
  position: relative;
  /* THAY ĐỔI 2: Tăng kích thước khung lên để phóng to người */
  width: 1450px; 
  max-width: 100vw; /* Đảm bảo không bị thanh cuộn ngang */
}

.bg-image {
  width: 100%; 
  height: auto;
  display: block;
  mix-blend-mode: multiply;
  /* Đẩy ảnh xuống thấp một chút nếu cần tinh chỉnh vị trí người */
  margin-bottom: -10px; 
}

/* 3. VỊ TRÍ FORM (Tự động phóng to theo ảnh) */
.phone-screen-overlay {
  position: absolute;
  /* Giữ nguyên tọa độ chuẩn, nó sẽ tự scale theo width của container */
  top: 11%;
  right: 28.5%;
  width: 17%; 
  height: 77%;
  
  /* Đã thêm lại màu nền trắng để form không bị trong suốt */

  border-radius: 28px;
  padding: 25px 15px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: inset 0 0 15px rgba(0,0,0,0.05);
}

/* 4. STYLE NỘI DUNG (Cỡ chữ tự động đẹp nhờ container to ra) */
.mini-title {
  font-size: 16px; 
  color: #2c7a3f;
  margin-bottom: 18px;
  text-transform: uppercase;
  font-weight: 800;
  white-space: nowrap;
}

.mini-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mini-input {
  width: 90%;
  margin: 0 auto;
  font-size: 13px; 
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f8f9fa;
  outline: none;
}

.mini-input:focus {
  border-color: #2c7a3f;
  background: #fff;
}

.mini-btn {
  width: 90%;
  margin: 12px auto 0;
  background-color: #2c7a3f;
  color: white;
  border: none;
  font-size: 13px; 
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.mini-btn:hover {
  background-color: #246332;
}

.mini-link {
  font-size: 12px;
  margin-top: 12px;
  color: #666;
  text-decoration: none;
}

/* Mobile: Xử lý riêng để không bị vỡ trên đt thật */
@media (max-width: 600px) {
  .register-page {
    align-items: center; /* Trên mobile thì căn giữa lại */
  }
  .design-container { width: 100%; }
  .phone-screen-overlay {
    position: static;
    width: 80%;
    height: auto;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
  }
  .bg-image { display: none; }
}
</style>