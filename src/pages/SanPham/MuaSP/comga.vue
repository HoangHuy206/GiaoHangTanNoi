<script setup>
    import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'

const isMenuOpen = ref(false)
const activeTab = ref('nguoi-dung')


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
</script>

<template>
<div class="grab-container">
    
    <header class="navbar-custom">
      <div class="nav-left">
        <svg class="menu-icon" @click="isMenuOpen = !isMenuOpen" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
        <div class="logo-box">
           <img src="../../../assets/anh.logo/anhnen.png" alt="Grab" class="logo-img" style="width: 100px; height:100px;"/> 
        </div>
      </div>
      
      <div class="nav-right">
        <span class="support-text">Trung Tâm Hỗ Trợ</span>
        <svg class="icon-action" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      
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
</div>
</template>

<style scoped>
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

</style>