<template>
  <div class="login-page">
    <div class="container">
      
      <div class="left-side">
        <img :src="shipperImg" alt="Shipper Illustration" class="shipper-img" />
      </div>

      <div class="right-side">
        <div class="login-card">
          <h2 class="login-header">ĐĂNG NHẬP</h2>

          <form @submit.prevent="handleLogin">
            <div class="input-group">
              <input 
                type="text" 
                v-model="username" 
                placeholder="Tên đăng nhập..." 
                required
              />
            </div>

            <div class="input-group">
              <input 
                type="password" 
                v-model="password" 
                placeholder="Mật khẩu..." 
                required
              />
            </div>

            <button type="submit" class="btn btn-login">Đăng Nhập</button>
            
            <div class="divider">
              <span>Hoặc</span>
            </div>
            <render-link to="/phanhoidangky">
            <button type="button" class="btn btn-register" @click="handleRegister">Đăng ký</button>
          </render-link>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, render } from 'vue';
import { useRouter } from 'vue-router'; // Import hook router

// 1. Import ảnh đúng vị trí (trong script, không phải style)
import shipperImg from '@/assets/anh.logo/anhbiadangnhap1.png';

const router = useRouter(); // Khởi tạo router
const username = ref('');
const password = ref('');

// Hàm xử lý đăng nhập
const handleLogin = () => {
  // Validate cơ bản
  if(username.value && password.value) {
    console.log('Đang đăng nhập với:', username.value);
    
    // Giả lập đăng nhập thành công thì chuyển trang
    // Bạn hãy thay '/home' bằng đường dẫn thực tế của trang chủ
    router.push('/home'); 
  } else {
    alert('Vui lòng nhập đầy đủ thông tin!');
  }
};

// Hàm xử lý chuyển trang đăng ký
const handleRegister = () => {
  console.log('Chuyển sang trang đăng ký');
  // Thay '/register' bằng đường dẫn thực tế của trang đăng ký
  router.push('/phanhoidangky'); 
};
</script>

<style scoped>
/* Import Font chữ */
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Roboto:wght@400;500&display=swap');

/* Cấu trúc chính */
.login-page {
  font-family: 'Roboto', sans-serif;
  background-color: #FEF5E7; /* Màu nền kem */
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  display: flex;
  width: 90%;
  max-width: 1200px;
  background-color: transparent;
  align-items: center;
}

/* Phần Ảnh */
.left-side {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.shipper-img {
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

/* Phần Form */
.right-side {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  background-color: white;
  padding: 50px 40px;
  border-radius: 20px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.login-header {
  font-family: 'Merriweather', serif;
  font-size: 28px;
  font-weight: 700;
  color: #000;
  margin-bottom: 40px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Input Styles */
.input-group {
  margin-bottom: 20px;
}

.input-group input {
  width: 100%;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #F8F9FA;
  font-size: 16px;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box; 
}

.input-group input:focus {
  border-color: #FF9900;
  background-color: #fff;
}

.input-group input::placeholder {
  color: #aaa;
}

/* Button Styles */
.btn {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s, transform 0.1s;
}

.btn:active {
  transform: scale(0.98);
}

.btn-login {
  background-color: #FF9900;
  color: white;
  margin-top: 10px;
}

.btn-login:hover {
  background-color: #e68a00;
}

.btn-register {
  background-color: #FF9900;
  color: white;
}

.btn-register:hover {
  background-color: #e68a00;
}

/* Divider "Hoặc" */
.divider {
  margin: 20px 0;
  position: relative;
  text-align: center;
}

.divider span {
  background-color: white;
  padding: 0 10px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  z-index: 1;
}

/* Responsive cho Mobile */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  
  .left-side {
    margin-bottom: 30px;
    max-width: 250px; 
  }

  .login-card {
    padding: 30px 20px;
  }
}
</style>