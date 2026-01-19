<template>
  <div class="register-page">
    <div class="design-container">
      
      <img src="../assets/anh.logo/anhchophandangkytaixe.jpg" alt="Background" class="bg-image">

      <div class="form-card">
        <div class="header-nav">
          <router-link to="/" class="back-link">
            <span class="back-icon">‹</span> Quay lại
          </router-link>
        </div>

        <h3 class="form-title">Đăng Ký Dành Cho Tài Xế</h3>
        
        <form @submit.prevent="handleRegister" class="main-form">
          
          <div class="form-row">
            <label class="form-label">Tên đăng nhập:</label>
            <input 
              type="text" 
              v-model="username" 
              class="form-input"
              required
              placeholder="VD: taixe123"
            />
          </div>

          <div class="form-row">
            <label class="form-label">Mật khẩu:</label>
            <input 
              type="password" 
              v-model="password" 
              class="form-input"
              required
              placeholder="Nhập mật khẩu"
            />
          </div>

          <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">

          <div class="form-row">
            <label class="form-label">Họ và tên:</label>
            <input 
              type="text" 
              v-model="fullName" 
              class="form-input"
              required
              placeholder="VD: Nguyễn Văn A"
            />
          </div>

          <div class="form-row">
            <label class="form-label">Email:</label>
            <input 
              type="email" 
              v-model="email" 
              class="form-input"
              required
              placeholder="Nhập email để nhận thông báo"
            />
          </div>
          
          <div class="form-row">
            <label class="form-label">Số điện thoại:</label>
            <input 
              id="phone" 
              type="text" 
              v-model="phone" 
              class="form-input"
              @input="restrictInputToNumbers"
              required
              maxlength="10"
            />
          </div>
          
          <div class="form-row">
            <label class="form-label">CCCD:</label>
            <input 
              id="cccd"
              type="text" 
              v-model="cccd" 
              class="form-input"
              @input="restrictInputToNumbers"
              required
              maxlength="12"
            />
          </div>

          <div class="form-row">
            <label class="form-label">Giới tính:</label>
            <div class="gender-container">
              <label class="radio-label">
                <input type="radio" value="Nam" v-model="gender">
                <span class="radio-checkmark"></span> Nam
              </label>
              <label class="radio-label">
                <input type="radio" value="Nữ" v-model="gender">
                <span class="radio-checkmark"></span> Nữ
              </label>
            </div>
          </div>

          <div class="form-row">
            <label class="form-label">Nơi ở:</label>
            <input 
              type="text" 
              v-model="address" 
              class="form-input"
              required
            />
          </div>

          <div class="form-row">
            <label class="form-label">Phương tiện:</label>
            <input 
              type="text" 
              v-model="vehicle" 
              class="form-input"
              required
              placeholder="VD: Honda Wave Alpha"
            />
          </div>

          <div class="btn-container">
            <button type="submit" class="submit-btn" :disabled="isLoading">
              {{ isLoading ? 'Đang xử lý...' : 'Đăng Ký' }}
            </button>
          </div>

        </form>

        <div class="footer-link">
          <router-link to="/login" class="login-link">Đã có TK? Đăng Nhập</router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import emailjs from '@emailjs/browser';

const router = useRouter();

// --- CẤU HÌNH EMAILJS (KEY CHUẨN CỦA BẠN) ---
const SERVICE_ID = 'service_x72kuxn'; 
const TEMPLATE_ID = 'template_qm7y8o2';
const PUBLIC_KEY = 'OQJryL3gJ2al-goTB'; 

// --- KHAI BÁO BIẾN DỮ LIỆU ---
const username = ref(''); // Username đăng nhập
const password = ref(''); // Mật khẩu
const fullName = ref('');
const email = ref('');
const phone = ref('');
const cccd = ref('');
const gender = ref('Nam'); 
const address = ref('');
const vehicle = ref('');
const isLoading = ref(false);

// Hàm chỉ cho phép nhập số (dùng cho SĐT và CCCD)
const restrictInputToNumbers = (event) => {
  const value = event.target.value.replace(/[^0-9]/g, '');
  event.target.value = value;
  
  // Cập nhật lại giá trị cho biến tương ứng
  if (event.target.id === 'phone') phone.value = value;
  if (event.target.id === 'cccd') cccd.value = value;
};

// --- HÀM XỬ LÝ KHI BẤM NÚT ĐĂNG KÝ ---
const handleRegister = async () => {
  isLoading.value = true;

  try {
    // BƯỚC 1: Gửi TẤT CẢ dữ liệu xuống Server (bao gồm cả username/pass)
    // Server sẽ tự động lưu vào 2 bảng: accounts và Dang_ky_tai_xe
    const response = await fetch('http://localhost:3000/api/register-driver', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value, // Quan trọng: Gửi username
        password: password.value, // Quan trọng: Gửi password
        fullName: fullName.value,
        email: email.value,
        phone: phone.value,
        cccd: cccd.value,
        gender: gender.value,
        address: address.value,
        vehicle: vehicle.value
      })
    });

    // Nếu Server trả về lỗi (ví dụ: Tên đăng nhập đã tồn tại)
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Lỗi lưu database');
    }

    // BƯỚC 2: Gửi Email xác nhận qua EmailJS
    const templateParams = {
      to_name: fullName.value,
      to_email: email.value,
      // Nội dung email sẽ hiện cả username để tài xế nhớ
      message: `Tài khoản mới: ${username.value} - Role: Tài xế - Xe: ${vehicle.value}`,
      user_role: 'Tài xế'
    };

    console.log("Đang gửi mail...");
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    
    alert("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
    router.push('/login'); // Chuyển hướng sang trang đăng nhập

  } catch (error) {
    console.error("Lỗi quy trình đăng ký:", error);
    alert("Đăng ký thất bại: " + error.message);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Giữ nguyên CSS cũ của bạn */
:global(body) { margin: 0; padding: 0; overflow: hidden; }

.register-page {
  background-color: #e8dbc8;
  width: 100vw; height: 100vh;
  display: flex; justify-content: center; align-items: center;
  overflow: hidden; position: fixed; top: 0; left: 0;
}

.design-container { position: relative; width: 100%; height: 100%; }

.bg-image {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
  mix-blend-mode: multiply;
}

.form-card {
  position: absolute; top: 50%; right: 15%; 
  transform: translateY(-50%);
  width: 450px; max-width: 90%;
  background-color: #fff;
  border-radius: 20px;
  padding: 20px 30px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  display: flex; flex-direction: column;
}

.header-nav { width: 100%; margin-bottom: 5px; }

.back-link {
  text-decoration: none; color: #ff6b6b;
  font-size: 14px; font-weight: 500;
  display: flex; align-items: center;
}

.back-icon { font-size: 20px; margin-right: 5px; line-height: 1; }

.form-title {
  text-align: center; font-size: 20px; font-weight: bold;
  color: #2c7a3f; margin: 10px 0 20px 0;
}

.main-form { display: flex; flex-direction: column; gap: 15px; }

.form-row { display: flex; align-items: center; justify-content: space-between; }

.form-label { width: 35%; font-size: 14px; font-weight: 600; color: #333; }

.form-input {
  width: 60%; background-color: #e6e6e6;
  border: 2px solid transparent; border-radius: 4px;
  padding: 8px 12px; font-size: 14px; outline: none;
  height: 35px; transition: all 0.3s ease; 
}
.form-input:focus { border-color: #2c7a3f; background-color: #fff; }

.gender-container { width: 60%; display: flex; gap: 20px; align-items: center; height: 35px; }

.radio-label {
  font-size: 14px; display: flex; align-items: center; gap: 8px;
  cursor: pointer; position: relative;
}
.radio-label input[type="radio"] { position: absolute; opacity: 0; cursor: pointer; }

.radio-checkmark {
  position: relative; height: 18px; width: 18px;
  background-color: #e6e6e6; border: 2px solid transparent;
  border-radius: 50%; transition: all 0.3s ease;
}
.radio-label:hover input ~ .radio-checkmark { background-color: #ccc; }
.radio-label input:checked ~ .radio-checkmark { background-color: #fff; border-color: #2c7a3f; }
.radio-checkmark:after { content: ""; position: absolute; display: none; }
.radio-label input:checked ~ .radio-checkmark:after { display: block; }
.radio-label .radio-checkmark:after {
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 8px; height: 8px; border-radius: 50%; background: #2c7a3f;
}

.btn-container { margin-top: 20px; display: flex; justify-content: center; }

.submit-btn {
  color: #fff; font-weight: bold; font-size: 16px;
  border: none; border-radius: 8px; padding: 10px 40px;
  cursor: pointer; transform: scale(0.95);
  background-color: #2c7a3f; width: 100%;
}
.submit-btn:hover { background-color: #246332; }
.submit-btn:disabled { background-color: #ccc; cursor: not-allowed; }

.footer-link { text-align: center; margin-top: 15px; }
.login-link { font-size: 13px; color: #2c7a3f; text-decoration: none; font-weight: 500; }

@media (max-width: 768px) {
  .form-card { right: auto; left: 50%; transform: translate(-50%, -50%); width: 95%; }
}
</style>