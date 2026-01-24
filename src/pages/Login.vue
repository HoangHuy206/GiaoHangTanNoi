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

            <router-link to="/phanhoidangky" style="margin-bottom: 20px;">
              <button type="button" class="btn btn-register">Đăng ký</button>
            </router-link>

            <router-link to="/quenmatkhau" style="margin-left: 60%; color: blue; text-decoration: none;">
              Quên mật khẩu
            </router-link>



          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import imgSource from '../assets/anh.logo/anhbiadangnhap1.png'; 

const router = useRouter();
const username = ref('');
const password = ref('');
const shipperImg = ref(imgSource);

const handleLogin = async () => {
  if (!username.value || !password.value) {
    alert("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!");
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    });

    const data = await response.json();

    if (response.ok) {
      /**
       * QUAN TRỌNG: Đổi key lưu trữ thành 'userLogin' để khớp với logic 
       * ở trang Thông tin người dùng. 
       * data.user phải chứa: account_id, username, fullname, role, avatar_url
       */
      localStorage.setItem('userLogin', JSON.stringify(data.user));

      // Phân quyền điều hướng
      if (data.user.role === 'driver') {
        alert(`Xin chào Tài xế ${data.user.fullname || data.user.username}!`);
        router.push('/trangchulaixe'); 
      } else {
        alert(`Chào mừng ${data.user.fullname || data.user.username} quay trở lại!`);
        router.push('/Food2');
      }
      
    } else {
      alert(data.message || "Sai tài khoản hoặc mật khẩu!");
    }

  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    alert("Không thể kết nối tới Server. Hãy kiểm tra XAMPP hoặc chạy 'node server.js'!");
  }
};
</script>

<style scoped>
/* Giữ nguyên phần CSS chuyên nghiệp của bạn */
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Roboto:wght@400;500&display=swap');

.login-page {
  font-family: 'Roboto', sans-serif;
  background-color: #FEF5E7;
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
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));
}

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
  background-color: #6c757d;
  color: white;
}

.btn-register:hover {
  background-color: #5a6268;
}

.divider {
  margin: 20px 0;
  position: relative;
  text-align: center;
}

.divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background: #ddd;
  z-index: 0;
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