<template>
  <div class="page-wrapper">
    <div class="main-content-scroll">
      <div class="header-banner" :style="{ backgroundImage: `url(${bannerImage})` }">
        <div class="nav-bar">
          <button class="icon-btn" @click="$router.back()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          </button>
          
          <button class="icon-btn" @click="handleShare">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>
      </div>

      <section class="profile-section-full">
        <div class="container-center">
          <div class="avatar-wrapper" @click="triggerFileInput">
            <img :src="user.avatar || defaultAvatar" alt="Avatar" class="avatar-img" @error="handleImageError"/>
            <div class="avatar-hover-mask">
              <span>Thay ảnh</span>
            </div>
            <input type="file" ref="fileInput" hidden accept="image/*" @change="onFileChange" />
          </div>

          <h2 class="display-name">{{ user.name }}</h2>

          <div class="stats-container">
            <div class="stat-box">
              <span class="num">{{ user.likes }}</span>
              <span class="label">lượt thích</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-box">
              <span class="num">{{ user.followers }}</span>
              <span class="label">người theo dõi</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-box">
              <span class="num">{{ user.following }}</span>
              <span class="label">đang theo dõi</span>
            </div>
          </div>

          <div class="action-group">
            <button class="btn-edit">Chỉnh sửa hồ sơ</button>
            <button class="btn-logout" @click="handleLogout">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Đăng xuất
            </button>
          </div>
        </div>
      </section>

      <section class="favorites-section-full">
        <div class="container-center">
          <div class="list-header">
            <h3>Quán yêu thích</h3>
            <div class="status-pill">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Chỉ hiển thị với bạn
            </div>
          </div>

          <div v-if="isLoading" class="loading-text">Đang tải dữ liệu...</div>

          <div v-else-if="favoriteShops.length > 0" class="shop-grid">
            <div class="shop-card" v-for="shop in favoriteShops" :key="shop.MaQuan">
              <div class="image-box">
                <img :src="shop.HinhAnh" :alt="shop.TenQuan" @error="handleImageError">
                <button class="btn-remove" @click="removeFavorite(shop.MaQuan)">✕</button>
              </div>
              <div class="shop-content">
                <h4>{{ shop.TenQuan }}</h4>
                <p>⭐ {{ shop.DanhGia || '4.5' }} • {{ shop.DiaChi }}</p>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <p>Bạn chưa có quán yêu thích nào. Hãy quay lại trang chủ và nhấn ❤️ nhé!</p>
            <router-link to="/food2" class="home-link">Đi tới Trang Chủ</router-link>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios'; 

const router = useRouter();
const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
const bannerImage = 'https://vmstyle.vn/wp-content/uploads/2025/10/hinh-nen-cay-co-4k-voi-tan-la-xanh-mat-va-nang-xuyen-qua.jpg';

const user = reactive({
  id: '',
  name: 'Người dùng', 
  avatar: '',
  likes: 0,
  followers: 0,
  following: 0
});

const favoriteShops = ref([]);
const isLoading = ref(false);
const fileInput = ref(null);

// --- 1. HÀM CHIA SẺ ---
const handleShare = async () => {
  const currentUrl = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Hồ sơ người dùng: ${user.name}`,
        text: 'Xem hồ sơ người dùng trên Giao Hàng Tận Nơi:',
        url: currentUrl,
      });
    } catch (err) { console.log('Đã hủy chia sẻ', err); }
  } else {
    try {
      await navigator.clipboard.writeText(currentUrl);
      alert('✅ Đã sao chép liên kết hồ sơ!');
    } catch (err) { alert('Link hồ sơ: ' + currentUrl); }
  }
};

// --- 2. HÀM LOAD DỮ LIỆU (TỪ DB & LOCALSTORAGE) ---
const loadData = async () => {
  // Lấy User Info từ LocalStorage (lúc đăng nhập đã lưu)
  const storedUser = localStorage.getItem('userLogin');
  
  if (storedUser) {
    const data = JSON.parse(storedUser);
    
    // Gán dữ liệu hiển thị
    user.id = data.account_id;
    user.name = data.fullname || 'Người dùng'; 
    user.avatar = data.avatar_url || '';
    user.likes = data.likes || 0; // Nếu DB chưa có thì để 0
    user.followers = data.followers || 0;
    user.following = data.following || 0;

    // QUAN TRỌNG: Gọi API lấy danh sách yêu thích từ DB
    if (user.id) {
        isLoading.value = true;
        try {
            const res = await axios.get(`http://localhost:3000/api/like/${user.id}`);
            favoriteShops.value = res.data; // Dữ liệu từ SQL trả về
        } catch (error) {
            console.error("Lỗi lấy danh sách yêu thích:", error);
        } finally {
            isLoading.value = false;
        }
    }
  } else {
    // Chưa đăng nhập
    router.push('/login');
  }
};

onMounted(loadData);

// --- 3. CÁC HÀM XỬ LÝ KHÁC ---
const handleLogout = () => {
  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    localStorage.removeItem('userLogin');
    router.push('/login');
  }
};

const triggerFileInput = () => fileInput.value.click();

const onFileChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Image = event.target.result;
      user.avatar = base64Image;

      // Cập nhật Avatar lên Server
      try {
        await axios.post('http://localhost:3000/api/update-avatar', {
          account_id: user.id,
          avatar_data: base64Image
        });

        // Cập nhật lại LocalStorage để lần sau vào không bị mất ảnh
        const userData = JSON.parse(localStorage.getItem('userLogin')) || {};
        userData.avatar_url = base64Image;
        localStorage.setItem('userLogin', JSON.stringify(userData));
        
        console.log("Đã cập nhật ảnh đại diện thành công!");
      } catch (error) {
        console.error("Lỗi khi gửi ảnh lên server:", error);
        alert("Lỗi cập nhật ảnh!");
      }
    };
    reader.readAsDataURL(file);
  }
};

// Xóa yêu thích (Gọi API)
const removeFavorite = async (maQuan) => {
  if (!confirm("Bạn muốn bỏ quán này khỏi danh sách yêu thích?")) return;

  try {
      // Gọi API xóa trong DB
      await axios.post('http://localhost:3000/api/like', {
          maNguoiDung: user.id,
          maQuan: maQuan
      });

      // Cập nhật giao diện (xóa dòng đó đi)
      favoriteShops.value = favoriteShops.value.filter(item => item.MaQuan !== maQuan);
  } catch (error) {
      console.error(error);
      alert("Lỗi kết nối server!");
  }
};

const handleImageError = (e) => { e.target.src = defaultAvatar; };
</script>

<style scoped>
/* CSS Giữ nguyên không thay đổi */
.page-wrapper { width: 100vw; height: 100vh; background-color: #fff; overflow: hidden; }
.main-content-scroll { width: 100%; height: 100%; overflow-y: auto; scrollbar-width: none; }
.main-content-scroll::-webkit-scrollbar { display: none; }
.header-banner { width: 100%; height: 250px; background-size: cover; background-position: center; }
.nav-bar { display: flex; justify-content: space-between; padding: 20px; }
.icon-btn { background: rgba(0,0,0,0.4); border: none; border-radius: 50%; width: 40px; height: 40px; color: white; cursor: pointer; }
.container-center { width: 100%; max-width: 1000px; margin: 0 auto; padding: 0 20px; box-sizing: border-box; }
.profile-section-full { width: 100%; background: #fff; border-bottom: 10px solid #f8f9fa; padding-bottom: 40px; text-align: center; }
.avatar-wrapper { width: 150px; height: 150px; margin: -75px auto 15px; position: relative; border-radius: 50%; border: 5px solid white; background: #fff; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); cursor: pointer; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-hover-mask { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); color: white; display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; font-size: 14px; }
.avatar-wrapper:hover .avatar-hover-mask { opacity: 1; }
.display-name { font-size: 32px; font-weight: 700; margin-bottom: 20px; color: #333; }
.stats-container { display: flex; justify-content: center; align-items: center; gap: 30px; margin-bottom: 30px; }
.stat-box { display: flex; flex-direction: column; min-width: 100px; }
.stat-box .num { font-size: 22px; font-weight: 800; color: #222; }
.stat-box .label { font-size: 14px; color: #777; margin-top: 4px; }
.stat-divider { width: 1px; height: 30px; background: #eee; }
.action-group { display: flex; justify-content: center; gap: 15px; }
.btn-edit { background: #00B14F; color: #fff; border: none; padding: 12px 35px; border-radius: 30px; font-weight: 600; cursor: pointer; }
.btn-logout { background: #fff; color: #ff4d4f; border: 1.5px solid #ff4d4f; padding: 12px 25px; border-radius: 30px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; }
.favorites-section-full { width: 100%; padding: 40px 0; }
.list-header { display: flex; align-items: center; margin-bottom: 30px; }
.list-header h3 { font-size: 20px; margin: 0; color: #333; }
.status-pill { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #888; background: #f1f1f1; padding: 6px 14px; border-radius: 20px; margin-left: 20px; }
.shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; }
.shop-card { background: #fff; border-radius: 12px; border: 1px solid #f0f0f0; overflow: hidden; transition: 0.3s; }
.shop-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
.image-box { position: relative; height: 160px; }
.image-box img { width: 100%; height: 100%; object-fit: cover; }
.btn-remove { position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.9); border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; }
.shop-content { padding: 15px; text-align: left; }
.shop-content h4 { margin: 0 0 5px; font-size: 16px; }
.shop-content p { margin: 0; font-size: 13px; color: #999; }
.empty-state { padding: 80px 0; text-align: center; color: #aaa; }
.home-link { display: inline-block; margin-top: 15px; color: #00B14F; text-decoration: none; font-weight: 700; border: 2px solid #00B14F; padding: 8px 25px; border-radius: 25px; }
.loading-text { text-align: center; color: #999; padding: 20px; }
</style>