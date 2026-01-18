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
           <img src="../../assets/anh.logo/anhnen.png" alt="Grab" class="logo-img" style="width: 100px; height:100px;"/> 
        </div>
      </div>
      
      <div class="nav-right">
        <span class="support-text">Trung Tâm Hỗ Trợ</span>
        <svg class="icon-action" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <router-link to="/login">
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

    <div class="hero-banner">
      <div class="banner-container">
        <div class="hero-content-left">
          <h1 class="brand-title">Food</h1>
          <h2 class="hero-subtitle">Thèm món gì - Đặt ngay món đó!</h2>
          <button class="btn-order">Đặt hàng ngay</button>
          <div class="small-link">
            Trở thành Đối tác Nhà hàng của ngay! <a href="#">Ấn vào đây</a>.
          </div>
        </div>

        <div class="hero-card-right">
          <div class="card-icon-green">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <h3>Trở Thành Nhà Hàng Đối Tác</h3>
          <a href="#" class="card-arrow-link">Đăng ký ngay &rarr;</a>
        </div>
      </div>
    </div>

   

  </div> 
  <div class="contenn">
     <div class="span" style="text-align: center; font-size: 40px; font-weight: bold; color: green; margin-top: 50px;">
      Mang đến cho bạn món ăn ưa thích, nóng hổi và ngon lành
     </div>

     <div class="span" style="width: 600px; height: 100px; font-size: 30px; text-align: center; margin-top: 100px; margin-left: 30%;">

      Đặt đồ ăn giao hàng tận nhà nhanh chóng lấp đầy chiếc bụng đói của bạn 
      với những món ngon yêu thích và dịch vụ giao hàng “thần tốc”. 
     </div>

     <div class="contenn-css" style="display: flex; margin-top: 200px; text-align: center; margin-left: 20%; ">
      <div class="css-dathang" style="margin-right: 50px;">
        <img src="../../assets/anhND/anh-dat-hang.png" alt="">
        <div class="span" style="font-weight: bold; color: green; font-size: 20px;" >
          Đặt đồ ăn online chỉ sau vài cú chạm.
          <p style="font-weight: normal; color: black; width: 400px;">Giao hàng nhanh thần tốc, đảm bảo mang cho bạn bữa ăn nóng hổi và ngon lành, dù bạn đang ở đâu.</p>
        </div>
      </div>
        <div class="css-nhieumon">
          <img src="../../assets/anhND/anh-lua-mon.png" alt="">
           <div class="span" style="font-weight: bold; color: green; font-size: 20px;" >
          Đặt đồ ăn online chỉ sau vài cú chạm.
          <p style="font-weight: normal; color: black; width: 400px;">Giao hàng nhanh thần tốc, đảm bảo mang cho bạn bữa ăn nóng hổi và ngon lành, dù bạn đang ở đâu.</p>
        </div>
        </div>
      

     </div>
    </div>
<div class="footer" style="margin-top:150px;">
    <div class="footer-container">
        <div class="footer-column branding">
          <img src="./assets/anh.logo/anhnen.png" alt="" class="footer-logo">
          <div class="address-box">
            <h4>ĐỊA CHỈ </h4>
              <div class="map-container">
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.296073307168!2d105.7475674103227!3d21.020836187970833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3134549c574476c3%3A0xd3c6af79105ea6da!2zVHLGsOG7nW5nIENhbyDEkeG6s25nIEPDtG5nIG5naOG7hyBDYW8gSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1768646189995!5m2!1svi!2s" width="250" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
              </div>
          </div>
        </div>

        <div class="footer-colum">
          <h4>Người dùng </h4>
          <ul>
            <li><router-link to="">Có gì mới ?</router-link></li>
            <li><router-link to="">món mới?</router-link></li>
            <li><router-link to="">food</router-link></li>
          </ul>
        </div>

        <div class="footer-colum">
          <h4>Đối tác tài xế</h4>
          <ul>
            <li><router-link to="">Thông tim mới </router-link></li>
            <li><router-link to="">Di chuyển </router-link></li>
            <li><router-link to="">Dịch vụ </router-link></li>
            <li><router-link to="">Tung tâm tài xế</router-link></li>
          </ul>
        </div>

        <div class="footer-colum">
          <h4>Hợp tác cùng chúng tôi</h4>
          <ul>
            <li><router-link to="">Giao Hàng Tận Nơi</router-link></li>
          </ul>
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

/* --- BANNER CSS (FIX FULL MÀN HÌNH) --- */
.hero-banner {
  margin-top: 80px;
  position: relative;
  height: 600px;
  
  /* Kỹ thuật phá khung: đảm bảo banner luôn full màn hình bất kể cha nó là gì */
  width: 100vw; 
  margin-left: calc(50% - 50vw); 
  
  /* Hình ảnh đồ ăn */
  background-image: url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
}

/* Lớp phủ màu tối nhẹ */
.hero-banner::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4); 
}

.banner-container {
  position: relative; z-index: 2;
  width: 100%;
  max-width: 1200px; /* Giới hạn nội dung ở giữa */
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.user-link {
    text-decoration: none;
    color: #000;
    display: flex;       /* Quan trọng: giúp thẻ a bao trọn icon */
    align-items: center;
    cursor: pointer;     /* Hiển thị bàn tay khi di chuột */
}

.hero-content-left { color: white; max-width: 500px; }
.brand-title { font-size: 60px; font-weight: 800; margin-bottom: 10px; }
.hero-subtitle { font-size: 30px; margin-bottom: 30px; font-weight: 600; }
.btn-order { background-color: #00B14F; color: white; border: none; padding: 15px 30px; font-size: 18px; font-weight: bold; border-radius: 8px; cursor: pointer; transition: 0.3s; }
.btn-order:hover { background-color: #009e47; }
.small-link { margin-top: 20px; font-size: 15px; color: #fff; }
.small-link a { color: #fff; font-weight: bold; text-decoration: underline; }

/* Thẻ nổi bên phải */
.hero-card-right {
  background-color: white;
  width: 280px;
  padding: 30px 20px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #ddd;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  display: flex; flex-direction: column; align-items: center;
}
.card-icon-green {
  background-color: #00B14F;
  width: 60px; height: 60px;
  border-radius: 50%;
  display: flex; justify-content: center; align-items: center;
  margin-bottom: 15px;
}
.hero-card-right h3 { color: #333; font-size: 18px; font-weight: 700; margin-bottom: 15px; }
.card-arrow-link { color: #00B14F; font-weight: bold; text-decoration: none; font-size: 16px; }
.card-arrow-link:hover { text-decoration: underline; }

.footer {
    background-color: #c5e2de;
    padding: 40px 0 20px 0;
  }

  .footer-container {
    max-width: 1200px;
    margin: 0px auto;
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
  }

  .footer-colum.branding {
    flex: 1.5; 
    margin-left: 0;
  }

  .map-container {
    margin-top: 15px;
    border-radius: 8px;
    overflow: hidden; /* Bo góc cho bản đồ */
    border: 1px solid rgba(0,0,0,0.1);
  }

  .footer-colum {
    flex:1;
    margin-left: 30px;
  }

  .footer-colum h4 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
  }

  .footer-colum ul {
    list-style: none;
    padding: 0;
  }

  .footer-colum ul li {
    margin-bottom: 10px;
  }

  .footer-colum ul li a {
    text-decoration: none;
    color: #fff;
    font-size: 14px;
    transition: 0.3s;
  }

  .footer-colum ul li a:hover {
    color: #00ff28;
  }

  .footer-logo{
    width: 100px;
  }
  .address-box h4{
    margin-top: 10px;
  }

  .footer-bottom {
    text-align: center;
    border-top: 1px solid rgba(0, 0, 0, 0.1); 
  }

  .footer-bottom p {
    font-size: 14px;
    font-weight: bold;
  }
</style>