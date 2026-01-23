<template>
  <div class="login-page">
    <div class="container">
      <div class="left-side">
        <img :src="shipperImg" alt="Shipper Illustration" class="shipper-img" />
      </div>

      <div class="right-side">
        <div class="login-card">
          <h2 class="login-header">ĐĂNG NHẬP</h2>

          <form @submit.prevent="handleLogin" novalidate>
            <div class="input-group">
              <input
                type="text"
                v-model.trim="username"
                placeholder="Tên đăng nhập..."
                autocomplete="username"
                required
              />
            </div>

            <div class="input-group">
              <input
                type="password"
                v-model="password"
                placeholder="Mật khẩu..."
                autocomplete="current-password"
                required
              />
            </div>

            <button type="submit" class="btn btn-login" :disabled="isLoading">
              {{ isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập' }}
            </button>

            <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

            <div class="divider">
              <span>Hoặc</span>
            </div>

            <router-link to="/phanhoidangky" style="margin-bottom: 20px;">
              <button type="button" class="btn btn-register">Đăng ký</button>
            </router-link>

            <router-link
              to="/quenmatkhau"
              class="forgot"
            >
              Quên mật khẩu
            </router-link>
          </form>

          <p v-if="showEnvHint" class="env-hint">
            Thiếu cấu hình API: hãy kiểm tra <b>VITE_API_BASE_URL</b> trong file <b>.env</b>
            hoặc trong Render &gt; Environment.
          </p>

          <p class="small-hint">
            API đang dùng: <b>{{ BASE_URL || '(chưa cấu hình)' }}</b>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import imgSource from '../assets/anh.logo/anhbiadangnhap1.png'

const router = useRouter()

const username = ref('')
const password = ref('')
const shipperImg = ref(imgSource)

const isLoading = ref(false)
const errorMsg = ref('')
const showEnvHint = ref(false)

// ✅ Lấy BASE_URL từ .env của Vite (bỏ dấu / cuối nếu có)
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

// ✅ helper: fetch có timeout + parse JSON an toàn
const fetchJson = async (url, options = {}, timeoutMs = 15000) => {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    let data = null
    const text = await res.text()
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = { message: text || 'Server trả về dữ liệu không hợp lệ (không phải JSON).' }
    }
    return { res, data }
  } finally {
    clearTimeout(t)
  }
}

const handleLogin = async () => {
  errorMsg.value = ''
  showEnvHint.value = false

  if (!username.value || !password.value) {
    errorMsg.value = 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!'
    return
  }

  if (!BASE_URL) {
    showEnvHint.value = true
    errorMsg.value = 'Thiếu cấu hình VITE_API_BASE_URL. Kiểm tra .env hoặc Render Environment!'
    return
  }

  isLoading.value = true
  try {
    // ✅ ĐÚNG: gọi API backend (không gọi /login của frontend)
    const url = `${BASE_URL}/api/login`

    const { res, data } = await fetchJson(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Nếu backend dùng cookie/session thì bật dòng dưới:
        // credentials: 'include',
        body: JSON.stringify({
          username: username.value,
          password: password.value
        })
      },
      15000
    )

    if (res.ok) {
      // data.user nên có: account_id, username, fullname, role, avatar_url
      if (data?.user) {
        localStorage.setItem('userLogin', JSON.stringify(data.user))
      } else {
        // nếu backend trả user khác key thì vẫn không crash
        localStorage.setItem('userLogin', JSON.stringify(data))
      }

      const role = data?.user?.role || data?.role
      const displayName = data?.user?.fullname || data?.user?.username || username.value

      if (role === 'driver') {
        alert(`Xin chào Tài xế ${displayName}!`)
        router.push('/trangchulaixe')
      } else {
        alert(`Chào mừng ${displayName} quay trở lại!`)
        router.push('/Food2')
      }
    } else {
      errorMsg.value = data?.message || 'Sai tài khoản hoặc mật khẩu!'
    }
  } catch (err) {
    console.error('Lỗi đăng nhập:', err)
    if (err?.name === 'AbortError') {
      errorMsg.value = 'Request bị timeout. Kiểm tra backend Render có đang chạy không!'
    } else {
      errorMsg.value = 'Không thể kết nối tới Server. Kiểm tra backend Render + CORS + đúng URL API!'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
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

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

.forgot {
  margin-left: 60%;
  color: blue;
  text-decoration: none;
  display: inline-block;
  margin-top: 10px;
}

.error-msg {
  margin-top: 12px;
  color: #c0392b;
  font-size: 14px;
  text-align: left;
}

.env-hint {
  margin-top: 14px;
  color: #c0392b;
  font-size: 13px;
}

.small-hint{
  margin-top: 10px;
  color: #666;
  font-size: 12px;
  word-break: break-all;
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
