<script setup>
// --- PHẦN 1: IMPORT THƯ VIỆN ---
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css' 
// Import icon cũ của bạn (giữ nguyên đường dẫn)
import '../assets/icon/icon/themify-icons-font/themify-icons-font/themify-icons/themify-icons.css'

// --- PHẦN 2: CẤU HÌNH SERVER BACKEND ---
// Đây là link API Server của bạn. 
// Code sẽ gọi vào đây để hỏi: "Có đơn nào không?"
const API_URL = "http://localhost:3000/api/find-order"; 

// --- PHẦN 3: KHAI BÁO BIẾN (STATE) ---
const isOnline = ref(false)          // Trạng thái nút Bật/Tắt
const isShowModal = ref(false)       // Modal dịch vụ
const incomingOrder = ref(null)      // Biến chứa thông tin đơn hàng thật
const driverLocation = ref(null)     // Vị trí hiện tại của tài xế
let scanningTimer = null;            // Bộ đếm thời gian quét đơn

// Biến quản lý bản đồ
const mapContainer = ref(null);
let map = null;
let driverMarker = null;
let routeLayer = null;

// --- PHẦN 4: CÁC HÀM XỬ LÝ ---

// 4.1. Khởi tạo bản đồ (Chạy 1 lần khi load trang)
const initMap = () => {
    // Mặc định view ở Hà Nội
    map = L.map(mapContainer.value).setView([21.0285, 105.8542], 14);

    // Load lớp bản đồ OpenStreetMap (Miễn phí)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Fix lỗi mất icon marker mặc định của thư viện Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
};

// 4.2. Lấy vị trí GPS (Có cơ chế chống lỗi cho máy tính)
const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
       // Nếu trình duyệt quá cũ
       resolve({ lat: 21.0285, lng: 105.8542 }); 
       return;
    }

    navigator.geolocation.getCurrentPosition(
      // CASE 1: Lấy được GPS thật (Điện thoại/Laptop xịn)
      (position) => {
        const pos = { 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        };
        resolve(pos);
        updateMapLocation(pos);
      },
      // CASE 2: Máy tính không có GPS -> Tự động dùng giả lập
      (error) => {
        console.warn("Máy tính không có GPS -> Chuyển sang chế độ Test (Hà Nội).");
        const fakePos = { lat: 21.0285, lng: 105.8542 }; // Toạ độ Hồ Gươm
        resolve(fakePos);
        updateMapLocation(fakePos);
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  });
};

// Hàm cập nhật vị trí marker trên bản đồ
const updateMapLocation = (pos) => {
    if (map) {
        map.setView([pos.lat, pos.lng], 15);
        if (driverMarker) {
            driverMarker.setLatLng([pos.lat, pos.lng]);
        } else {
            driverMarker = L.marker([pos.lat, pos.lng]).addTo(map)
                .bindPopup("Vị trí của bạn").openPopup();
        }
    }
}

// 4.3. Gọi API tìm đơn thật
const checkRealOrder = async (lat, lng) => {
    try {
        // Gọi lên Server
        const url = `${API_URL}?lat=${lat}&lng=${lng}`;
        // console.log("Đang quét đơn...", url); // Bỏ comment để debug

        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            
            // Nếu Server báo có đơn (data.success = true)
            if (data.success && data.order) {
                console.log("🔥 CÓ ĐƠN HÀNG MỚI!");
                
                // Gán dữ liệu thật vào giao diện
                incomingOrder.value = {
                    id: data.order.id,
                    name: data.order.food_name,      
                    price: data.order.total_price,   
                    image: data.order.image_url,     
                    restaurant: data.order.shop_name,
                    addressPick: data.order.pickup_address,
                    addressDrop: data.order.delivery_address,
                    customer: data.order.customer_name,
                    distance: data.order.distance_km,
                    // Toạ độ quán để vẽ đường
                    shopLocation: { 
                        lat: parseFloat(data.order.shop_lat), 
                        lng: parseFloat(data.order.shop_lng) 
                    }
                };

                // Vẽ đường đi
                drawRoute({ lat, lng }, incomingOrder.value.shopLocation);
                
                // Dừng quét (để tài xế thao tác nhận/huỷ)
                clearInterval(scanningTimer);
            }
        }
    } catch (error) {
        // Lỗi này thường do chưa bật Server Backend
        // console.error("Lỗi kết nối Server:", error); 
    }
};

// 4.4. Vẽ đường đi (Dùng OSRM API - Miễn phí)
const drawRoute = async (start, end) => {
    if (routeLayer) map.removeLayer(routeLayer);

    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
            routeLayer = L.geoJSON(data.routes[0].geometry, {
                style: { color: 'blue', weight: 5 }
            }).addTo(map);
            
            map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
            L.marker([end.lat, end.lng]).addTo(map).bindPopup("Điểm lấy hàng").openPopup();
        }
    } catch (e) {}
};

// 4.5. Xử lý nút BẬT/TẮT
const toggleConnection = async () => {
  if (!isOnline.value) {
    // === BẬT ===
    const location = await getCurrentLocation(); // Lấy vị trí (đã an toàn trên PC)
    driverLocation.value = location;
    isOnline.value = true; 
    
    // Bắt đầu quét đơn (5 giây/lần)
    scanningTimer = setInterval(() => {
        if (isOnline.value && !incomingOrder.value) {
            checkRealOrder(location.lat, location.lng);
        }
    }, 5000);

  } else {
    // === TẮT ===
    isOnline.value = false;
    clearInterval(scanningTimer);
    incomingOrder.value = null;
    driverLocation.value = null;
    if (routeLayer) map.removeLayer(routeLayer);
  }
};

// Các hàm phụ trợ modal/nút bấm
const openModal = () => isShowModal.value = true
const closeModal = () => isShowModal.value = false

const acceptOrder = () => { 
    alert("Đã nhận đơn! (Hãy gọi API cập nhật trạng thái đơn hàng)"); 
    incomingOrder.value = null; 
    if(routeLayer) map.removeLayer(routeLayer);
    toggleConnection(); // Tiếp tục quét
}

const rejectOrder = () => { 
    incomingOrder.value = null; 
    if(routeLayer) map.removeLayer(routeLayer);
    toggleConnection(); // Tiếp tục quét
}

// Lifecycle Hooks
onMounted(() => {
    initMap();
});

onUnmounted(() => {
    clearInterval(scanningTimer);
});
</script>

<template>
  <div class="dashboard-container">
    
    <aside class="sidebar">
      <div class="logo-area"><h2>Tài xế Pro</h2></div>
      <ul class="nav-links">
        <li class="active"><i class="ti-home"></i> Trang chủ</li>
        <router-link to="/thunhap" style="text-decoration: none;"><li><i class="ti-wallet"></i> Thu nhập</li></router-link>
        <li><i class="ti-email"></i> Hộp thư</li>
        <li><i class="ti-calendar"></i> Lịch</li>
        <li><i class="ti-user"></i> Hồ sơ</li>
      </ul>
      <div class="logout-btn"><button>Đăng xuất</button></div>
    </aside>

    <div class="order-alert-overlay" v-if="incomingOrder">
      <div class="order-card">
        <div class="card-header">
          <div class="header-left"><span class="bell-icon">🔔</span><span class="new-order-title">Đơn hàng mới!</span></div>
          <span class="distance-badge">{{ incomingOrder.distance }} km</span>
        </div>
        <div class="product-row">
          <img :src="incomingOrder.image" class="food-img" />
          <div class="food-info"><h4>{{ incomingOrder.name }}</h4><span class="price">{{ incomingOrder.price }}</span></div>
        </div>
        <hr class="divider"/>
        <div class="address-timeline">
           <div class="point"><i class="ti-home pickup-icon"></i> <div class="addr-detail"><small>Lấy tại quán:</small><b>{{ incomingOrder.restaurant }}</b><p>{{ incomingOrder.addressPick }}</p></div></div>
           <div class="point"><i class="ti-location-pin drop-icon"></i><div class="addr-detail"><small>Giao khách:</small><b>{{ incomingOrder.customer }}</b><p>{{ incomingOrder.addressDrop }}</p></div></div>
        </div>
        <div class="btn-group">
          <button @click="rejectOrder" class="btn-ignore">Bỏ qua</button>
          <button @click="acceptOrder" class="btn-accept">Nhận đơn ngay</button>
        </div>
      </div>
    </div>

    <main class="map-section">
      <div class="map-background" ref="mapContainer"></div>

      <div class="control-panel">
        <div class="status-bar" :class="{ 'online': isOnline }">
          <div class="status-indicator"></div>
          <p v-if="!isOnline">Bạn đang tắt kết nối</p>
          <p v-else-if="incomingOrder">Đã tìm thấy đơn!</p>
          <p v-else>Đang tìm kiếm đơn hàng...</p>
        </div>

        <button class="toggle-btn" @click="toggleConnection" :class="{ 'btn-on': isOnline }">
          <i class="ti-power-off"></i> {{ isOnline ? 'TẮT KẾT NỐI' : 'BẬT KẾT NỐI' }}
        </button>

        <div class="quick-actions">
           <div class="action-item"><div class="circle-icon" @click="openModal"><i class="ti-car"></i></div><span>Loại dịch vụ</span></div>
           <div class="action-item"><div class="circle-icon"><i class="ti-location-pin"></i></div><span>Điểm đến</span></div>
           <div class="action-item"><div class="circle-icon"><i class="ti-bolt"></i></div><span>Tự động nhận</span></div>
           <div class="action-item"><div class="circle-icon"><i class="ti-more"></i></div><span>Xem thêm</span></div>
        </div>
      </div>
    </main>

    <div class="modal-overlay" v-if="isShowModal">
        <div class="modal-box">
            <span class="close-btn" @click="closeModal">×</span>
            <div class="modal-body"><h2>Dịch vụ</h2><p>Food</p><p>Giao hàng nhanh</p></div>
        </div>
    </div>
  </div>
</template>

<style scoped>
/* CSS GIỮ NGUYÊN */
.map-background { width: 100%; height: 100%; z-index: 1; }
* { box-sizing: border-box; }
.dashboard-container { display: flex; height: 100vh; width: 100vw; font-family: Arial, sans-serif; overflow: hidden; }
.sidebar { width: 260px; background-color: #fff; border-right: 1px solid #ddd; display: flex; flex-direction: column; padding: 20px; z-index: 10; box-shadow: 2px 0 5px rgba(0,0,0,0.05); }
.logo-area h2 { color: #00b14f; margin-bottom: 40px; text-align: center; }
.nav-links { list-style: none; padding: 0; flex: 1; }
.nav-links li { padding: 15px 20px; margin-bottom: 10px; cursor: pointer; border-radius: 8px; font-weight: 600; color: #555; display: flex; align-items: center; gap: 15px; transition: 0.3s; }
.nav-links li i { font-size: 1.2rem; }
.nav-links li:hover, .nav-links li.active { background-color: #f0fff4; color: #00b14f; }
.logout-btn button { width: 100%; padding: 12px; border: 1px solid #ddd; background: transparent; border-radius: 8px; cursor: pointer; font-weight: bold; }
.map-section { flex: 1; position: relative; }
.control-panel { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); background: white; width: 90%; max-width: 800px; padding: 20px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); display: flex; flex-direction: column; align-items: center; gap: 20px; z-index: 50; }
.status-bar { display: flex; align-items: center; gap: 10px; font-weight: bold; color: #666; }
.status-indicator { width: 12px; height: 12px; background-color: red; border-radius: 50%; }
.status-bar.online .status-indicator { background-color: #00b14f; box-shadow: 0 0 10px #00b14f; }
.toggle-btn { background-color: #1c1c1c; color: white; border: none; padding: 15px 60px; border-radius: 50px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
.toggle-btn.btn-on { background-color: #00b14f; }
.toggle-btn:hover { transform: scale(1.05); }
.quick-actions { display: flex; justify-content: center; gap: 40px; width: 100%; border-top: 1px solid #eee; padding-top: 20px; }
.action-item { display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; }
.circle-icon { width: 50px; height: 50px; background-color: #f5f5f5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #333; transition: 0.3s; }
.action-item:hover .circle-icon { background-color: #e0e0e0; color: #00b14f; }
.action-item span { font-size: 14px; color: #555; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.modal-body h2{ text-align: center; padding-bottom: 30px; }
.modal-body p { padding-left: 30px; padding-bottom: 20px; }
.modal-box { background: #2f492f; color: white; padding: 20px; border-radius: 10px; width: 500px; position: relative; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
.close-btn { position: absolute; top: 10px; right: 15px; font-size: 25px; cursor: pointer; }
.order-alert-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 60; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s; }
.order-card { background: white; width: 90%; max-width: 400px; border-radius: 16px; padding: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.3); animation: slideUp 0.4s ease-out; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.header-left { display: flex; align-items: center; gap: 8px; }
.bell-icon { font-size: 20px; animation: ring 1s infinite; }
.new-order-title { font-weight: bold; color: #00b14f; font-size: 18px; }
.distance-badge { font-size: 13px; background: #e0f2f1; color: #00897b; padding: 4px 8px; border-radius: 12px; font-weight: bold; }
.product-row { display: flex; gap: 15px; align-items: center; }
.food-img { width: 65px; height: 65px; border-radius: 10px; object-fit: cover; }
.food-info h4 { margin: 0 0 5px 0; font-size: 16px; color: #333; }
.price { color: #e67e22; font-weight: bold; font-size: 14px; }
.divider { border: 0; border-top: 1px solid #eee; margin: 15px 0; }
.address-timeline { display: flex; flex-direction: column; gap: 15px; }
.point { display: flex; gap: 12px; align-items: flex-start; }
.pickup-icon { color: #3498db; font-size: 18px; margin-top: 2px;}
.drop-icon { color: #e74c3c; font-size: 18px; margin-top: 2px;}
.addr-detail small { display: block; color: #888; font-size: 12px; margin-bottom: 2px; }
.addr-detail b { font-size: 14px; color: #333; }
.addr-detail p { margin: 0; font-size: 13px; color: #666; margin-top: 2px;}
.btn-group { display: flex; gap: 10px; margin-top: 25px; }
.btn-ignore { flex: 1; padding: 14px; border-radius: 8px; border: none; background: #f5f5f5; color: #444; font-weight: bold; cursor: pointer; transition: 0.2s; }
.btn-accept { flex: 1; padding: 14px; border-radius: 8px; border: none; background: #00b14f; color: white; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(0,177,79,0.3); transition: 0.2s; }
.btn-accept:active { transform: scale(0.98); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes ring { 0%, 100% { transform: rotate(0); } 10% { transform: rotate(15deg); } 20% { transform: rotate(-15deg); } 30% { transform: rotate(10deg); } }
</style>