<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
// Đảm bảo bạn đã cài: npm install socket.io-client
import { io } from 'socket.io-client'

// ====== CẤU HÌNH ======
// Kết nối tới Server Node.js của bạn (Cổng 3000)
const socket = io('http://localhost:3000')

// State
const isOnline = ref(false)
const incomingOrder = ref(null)      // Đơn hàng mới đến (chờ nhận)
const currentOrder = ref(null)       // Đơn hàng đang đi giao
const driverLocation = ref(null)     // Vị trí tài xế
const isShowModal = ref(false)

// Map variables
const mapContainer = ref(null)
let map = null
let driverMarker = null
let shopMarker = null
let dropMarker = null
let routeLayer = null
let locationWatchId = null

// ====== 1. KHỞI TẠO BẢN ĐỒ ======
const initMap = () => {
  // Mặc định view ở Hà Nội nếu chưa có GPS
  map = L.map(mapContainer.value).setView([21.0285, 105.8542], 14)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  // Fix lỗi icon mặc định của Leaflet trong Vue
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  })
}

// Cập nhật vị trí tài xế trên bản đồ
const updateDriverMarker = (lat, lng) => {
  if (!map) return
  
  // Icon xe máy
  const bikeIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  })

  if (driverMarker) {
    driverMarker.setLatLng([lat, lng])
  } else {
    driverMarker = L.marker([lat, lng], { icon: bikeIcon }).addTo(map).bindPopup("Vị trí của bạn")
    map.setView([lat, lng], 15) // Zoom vào tài xế khi mới load
  }
}

// ====== 2. XỬ LÝ GPS (VỊ TRÍ THẬT) ======
const startWatchLocation = () => {
  if (!navigator.geolocation) {
    alert("Trình duyệt không hỗ trợ GPS.")
    return
  }

  // Lấy vị trí liên tục
  locationWatchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      driverLocation.value = { lat: latitude, lng: longitude }
      
      // Vẽ lại marker tài xế
      updateDriverMarker(latitude, longitude)

      // Nếu đang giao hàng -> Gửi vị trí lên Server để khách theo dõi
      if (currentOrder.value) {
        socket.emit('update_location', {
            ma_don_hang: currentOrder.value.ma_don_hang,
            lat: latitude,
            lng: longitude
        })
      }
    },
    (err) => console.warn("Lỗi GPS:", err),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
  )
}

const stopWatchLocation = () => {
  if (locationWatchId) navigator.geolocation.clearWatch(locationWatchId)
}

// ====== 3. VẼ ĐƯỜNG ĐI (OSRM API) ======
const drawRoute = async (start, end) => {
  try {
    if (routeLayer) map.removeLayer(routeLayer)
    
    // Gọi API OSRM (Miễn phí) để lấy đường đi
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    const data = await res.json()

    if (data.routes && data.routes.length > 0) {
      // Vẽ đường màu xanh
      routeLayer = L.geoJSON(data.routes[0].geometry, { style: { color: 'blue', weight: 5 } }).addTo(map)
      map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] })
    }
  } catch (e) {
    console.error("Lỗi vẽ đường:", e)
  }
}

const clearMapElements = () => {
  if (routeLayer) map.removeLayer(routeLayer)
  if (shopMarker) map.removeLayer(shopMarker)
  if (dropMarker) map.removeLayer(dropMarker)
}

// ====== 4. LOGIC SOCKET (QUAN TRỌNG NHẤT) ======
onMounted(() => {
  initMap()

  // 1. Lắng nghe đơn hàng mới từ Server
  socket.on('new_order_available', (orderData) => {
    // Chỉ nhận nếu đang Online và chưa có đơn
    if (isOnline.value && !currentOrder.value && !incomingOrder.value) {
        console.log("🔔 Có đơn mới:", orderData)
        
        // Map dữ liệu từ Socket sang cấu trúc hiển thị
        incomingOrder.value = {
            id: orderData.ma_don_hang,
            name: orderData.ten_mon_an,
            price: orderData.tong_tien,
            image: "https://cdn-icons-png.flaticon.com/512/706/706164.png", // Ảnh mặc định
            restaurant: orderData.ten_quan,
            addressPick: orderData.dia_chi_quan,
            addressDrop: orderData.dia_chi_giao,
            customer: orderData.ten_khach_hang,
            distance: "2.5", // Giả lập khoảng cách
            // Tọa độ quán & khách (Lấy từ DB hoặc giả lập nếu thiếu)
            shopLat: 21.0285, shopLng: 105.8542, 
            dropLat: orderData.vi_do_giao || 21.0300, 
            dropLng: orderData.kinh_do_giao || 105.8500
        }

        // Phát âm thanh (tùy chọn)
        // new Audio('/tingting.mp3').play().catch(() => {})
    }
  })
})

// Bật/Tắt kết nối
const toggleConnection = () => {
  isOnline.value = !isOnline.value
  
  if (isOnline.value) {
    socket.emit('driver_connect') // Báo danh với Server
    startWatchLocation() // Bắt đầu lấy GPS thật
  } else {
    stopWatchLocation()
    incomingOrder.value = null
    currentOrder.value = null
    clearMapElements()
  }
}

// Xử lý nút NHẬN ĐƠN
const acceptOrder = () => {
    if (!incomingOrder.value) return

    const order = incomingOrder.value
    
    // 1. Báo Server tôi nhận đơn này
    socket.emit('driver_accept_order', {
        ma_don_hang: order.id,
        thong_tin_tai_xe: { ten: "Tài xế Pro", sdt: "0909000111", bien_so: "29H1-999.99" },
        vi_tri_tai_xe: driverLocation.value || { lat: 21.0285, lng: 105.8542 }
    })

    // 2. Chuyển trạng thái giao diện
    currentOrder.value = order
    incomingOrder.value = null // Tắt popup
    
    // 3. Vẽ đường đi: Từ Vị trí Xe -> Khách Hàng
    if (driverLocation.value) {
        drawRoute(driverLocation.value, { lat: order.dropLat, lng: order.dropLng })
        
        // Ghim marker điểm giao
        dropMarker = L.marker([order.dropLat, order.dropLng]).addTo(map).bindPopup("Khách hàng ở đây").openPopup()
    }
    
    alert("Đã nhận đơn! Bắt đầu dẫn đường tới khách hàng.")
}

const rejectOrder = () => {
    incomingOrder.value = null
    // Có thể gửi socket báo từ chối nếu muốn server tìm tài xế khác ngay
}

// Modal Xem thêm
const openModal = () => isShowModal.value = true
const closeModal = () => isShowModal.value = false

onUnmounted(() => {
  stopWatchLocation()
  socket.disconnect()
})
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
        <router-link to="/thongtinlaixe" style="text-decoration: none;"><li><i class="ti-user"></i> Hồ sơ</li></router-link>
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
          <div class="point"><i class="ti-home pickup-icon"></i> <div class="addr-detail"><small>Quán:</small><b>{{ incomingOrder.restaurant }}</b><p>{{ incomingOrder.addressPick }}</p></div></div>
          <div class="point"><i class="ti-location-pin drop-icon"></i><div class="addr-detail"><small>Giao:</small><b>{{ incomingOrder.customer }}</b><p>{{ incomingOrder.addressDrop }}</p></div></div>
        </div>
        <div class="btn-group">
          <button @click="rejectOrder" class="btn-ignore">Bỏ qua</button>
          <button @click="acceptOrder" class="btn-accept">Nhận đơn ngay</button>
        </div>
      </div>
    </div>

    <main class="map-section">
      <div class="map-background" ref="mapContainer"></div>

      <div v-if="currentOrder" class="delivery-panel">
          <h3>🚀 Đang giao hàng</h3>
          <p>Khách: <b>{{ currentOrder.customer }}</b></p>
          <p>Địa chỉ: {{ currentOrder.addressDrop }}</p>
          <button class="btn-finish" @click="currentOrder = null; clearMapElements()">✅ Đã giao xong</button>
      </div>

      <div class="control-panel" v-if="!currentOrder">
        <div class="status-bar" :class="{ 'online': isOnline }">
          <div class="status-indicator"></div>
          <p v-if="!isOnline">Bạn đang tắt kết nối</p>
          <p v-else>Đang chờ đơn hàng...</p>
        </div>

        <button class="toggle-btn" @click="toggleConnection" :class="{ 'btn-on': isOnline }">
          <i class="ti-power-off"></i> {{ isOnline ? 'TẮT KẾT NỐI' : 'BẬT KẾT NỐI' }}
        </button>

        <div class="quick-actions">
          <div class="action-item"><div class="circle-icon" @click="openModal"><i class="ti-car"></i></div><span>Dịch vụ</span></div>
          <div class="action-item"><div class="circle-icon"><i class="ti-location-pin"></i></div><span>Điểm đến</span></div>
          <div class="action-item"><div class="circle-icon"><i class="ti-bolt"></i></div><span>Tự động</span></div>
          <div class="action-item"><div class="circle-icon"><i class="ti-more"></i></div><span>Thêm</span></div>
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
/* CSS GIỮ NGUYÊN NHƯ CŨ + THÊM 1 CHÚT CHO ĐẸP */
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

/* Control Panel ở dưới cùng */
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

/* Popup Nhận Đơn */
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

/* Panel Giao Hàng */
.delivery-panel { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); background: white; padding: 20px; border-radius: 15px; width: 90%; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); z-index: 55; text-align: center; }
.btn-finish { width: 100%; padding: 12px; background: #3498db; color: white; border: none; border-radius: 8px; font-weight: bold; margin-top: 10px; cursor: pointer; }

/* Modal Khác */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.modal-body h2{ text-align: center; padding-bottom: 30px; }
.modal-body p { padding-left: 30px; padding-bottom: 20px; }
.modal-box { background: #2f492f; color: white; padding: 20px; border-radius: 10px; width: 500px; position: relative; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
.close-btn { position: absolute; top: 10px; right: 15px; font-size: 25px; cursor: pointer; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes ring { 0%, 100% { transform: rotate(0); } 10% { transform: rotate(15deg); } 20% { transform: rotate(-15deg); } 30% { transform: rotate(10deg); } }
</style>