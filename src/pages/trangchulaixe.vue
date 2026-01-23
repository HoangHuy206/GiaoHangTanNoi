<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { io } from 'socket.io-client'

// ====== CẤU HÌNH ======
// Đổi thành IP LAN máy tính của bạn để test trên điện thoại (VD: 192.168.1.x)
const SOCKET_URL = 'https://giaohangtannoi.onrender.com'; 
const socket = io(SOCKET_URL)

// State
const isOnline = ref(false)
const incomingOrder = ref(null)      // Đơn hàng mới đến (Popup chờ nhận)
const currentOrder = ref(null)       // Đơn hàng đang xử lý
const orderStatus = ref('accepted')  // 'accepted' (vừa nhận) | 'shipping' (đã lấy hàng)
const driverLocation = ref(null)     // Vị trí GPS tài xế
const isShowModal = ref(false)

// Map variables
const mapContainer = ref(null)
let map = null
let driverMarker = null
let dropMarker = null
let routeLayer = null
let locationWatchId = null

// ====== 1. KHỞI TẠO BẢN ĐỒ ======
const initMap = () => {
  map = L.map(mapContainer.value).setView([21.0285, 105.8542], 14)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  // Fix lỗi icon Leaflet
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  })
}

const updateDriverMarker = (lat, lng) => {
  if (!map) return
  
  const bikeIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

  if (driverMarker) {
    driverMarker.setLatLng([lat, lng])
  } else {
    driverMarker = L.marker([lat, lng], { icon: bikeIcon }).addTo(map).bindPopup("Vị trí của bạn").openPopup()
    map.setView([lat, lng], 16)
  }
}

// ====== 2. XỬ LÝ GPS ======
const startWatchLocation = () => {
  if (!navigator.geolocation) {
    alert("Trình duyệt không hỗ trợ GPS.")
    return
  }

  locationWatchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      driverLocation.value = { lat: latitude, lng: longitude }
      
      updateDriverMarker(latitude, longitude)

      // Gửi vị trí lên server để khách theo dõi
      if (currentOrder.value) {
        socket.emit('update_location', {
            ma_don_hang: currentOrder.value.id, 
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

// ====== 3. VẼ ĐƯỜNG ĐI ======
const drawRoute = async (start, end) => {
  try {
    if (routeLayer) map.removeLayer(routeLayer)
    
    // API OSRM miễn phí
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    const data = await res.json()

    if (data.routes && data.routes.length > 0) {
      routeLayer = L.geoJSON(data.routes[0].geometry, { style: { color: 'blue', weight: 5 } }).addTo(map)
      map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] })
    }
  } catch (e) { console.error("Lỗi vẽ đường:", e) }
}

const clearMapElements = () => {
  if (routeLayer) map.removeLayer(routeLayer)
  if (dropMarker) map.removeLayer(dropMarker)
}

// ====== 4. LOGIC SOCKET & ĐƠN HÀNG ======
onMounted(() => {
  initMap()

  socket.on('new_order_available', (orderData) => {
    if (isOnline.value && !currentOrder.value && !incomingOrder.value) {
        // Map dữ liệu
        incomingOrder.value = {
            id: orderData.ma_don_hang,
            name: orderData.ten_mon_an,
            price: orderData.tong_tien,
            image: "https://cdn-icons-png.flaticon.com/512/706/706164.png",
            restaurant: orderData.ten_quan,
            addressPick: orderData.dia_chi_quan,
            addressDrop: orderData.dia_chi_giao,
            customer: orderData.ten_khach_hang,
            distance: "2.5",
            // Tọa độ giả lập nếu thiếu
            shopLat: 21.0285, shopLng: 105.8542, 
            dropLat: orderData.vi_do_giao || 21.0300, 
            dropLng: orderData.kinh_do_giao || 105.8500
        }
    }
  })
})

const toggleConnection = () => {
  isOnline.value = !isOnline.value
  if (isOnline.value) {
    socket.emit('driver_connect')
    startWatchLocation()
  } else {
    stopWatchLocation()
    incomingOrder.value = null
    currentOrder.value = null
    clearMapElements()
  }
}

// --- [BƯỚC 1] NHẬN ĐƠN ---
const acceptOrder = () => {
    if (!incomingOrder.value) return
    const order = incomingOrder.value
    
    // Báo Server
    socket.emit('driver_accept_order', {
        ma_don_hang: order.id,
        thong_tin_tai_xe: { ten: "Tài xế Pro", sdt: "0909000111", bien_so: "29H1-999.99" },
        vi_tri_tai_xe: driverLocation.value || { lat: 21.0285, lng: 105.8542 }
    })

    currentOrder.value = order
    orderStatus.value = 'accepted' // Trạng thái ban đầu: Đã nhận (đang đi lấy hàng)
    incomingOrder.value = null 
    
    // Vẽ đường tới quán (hoặc tới khách tùy logic)
    if (driverLocation.value) {
        drawRoute(driverLocation.value, { lat: order.dropLat, lng: order.dropLng })
        dropMarker = L.marker([order.dropLat, order.dropLng]).addTo(map).bindPopup("Giao cho khách tại đây").openPopup()
    }
}

// --- [BƯỚC 2] XÁC NHẬN ĐÃ LẤY HÀNG ---
const confirmPickup = () => {
    if(!currentOrder.value) return;

    // Chuyển trạng thái sang đang giao (shipping)
    orderStatus.value = 'shipping';

    // Báo server để app khách hiện "Đang giao"
    socket.emit('driver_update_status', {
        maDon: currentOrder.value.id,
        status: 'shipping'
    });
    
    alert("Đã xác nhận lấy hàng! Hãy giao ngay cho khách.");
}

// --- [BƯỚC 3] XÁC NHẬN GIAO THÀNH CÔNG ---
const confirmComplete = () => {
    if(!currentOrder.value) return;

    // Báo server để app khách hiện "Thành công"
    socket.emit('driver_update_status', {
        maDon: currentOrder.value.id,
        status: 'completed'
    });

    // Reset giao diện về trạng thái chờ đơn
    currentOrder.value = null;
    clearMapElements();
    alert("Chúc mừng! Bạn đã hoàn thành đơn hàng.");
}

const rejectOrder = () => incomingOrder.value = null
const openModal = () => isShowModal.value = true
const closeModal = () => isShowModal.value = false

onUnmounted(() => { stopWatchLocation(); socket.disconnect(); })
</script>

<template>
  <div class="dashboard-container">
    <aside class="sidebar">
      <div class="logo-area"><h2>Tài xế Pro</h2></div>
      <ul class="nav-links">
        <li class="active"><i class="ti-home"></i> Trang chủ</li>
        <li><i class="ti-wallet"></i> Thu nhập</li>
        <li><i class="ti-email"></i> Hộp thư</li>
        <li><i class="ti-user"></i><a href="/thongtinlaixe" style="text-decoration: none; color: #333;"> Hồ sơ</a></li>
      </ul>
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
          <div class="customer-mini-info">
             <h4>{{ currentOrder.customer }}</h4>
             <p>{{ currentOrder.addressDrop }}</p>
          </div>
          
          <div class="action-buttons">
              <button 
                v-if="orderStatus === 'accepted'" 
                class="btn-pickup" 
                @click="confirmPickup">
                📦 Đã lấy hàng
              </button>

              <button 
                v-else 
                class="btn-finish" 
                @click="confirmComplete">
                ✅ Đã giao hàng thành công
              </button>
          </div>
      </div>

      <div class="control-panel" v-if="!currentOrder">
        <div class="status-bar" :class="{ 'online': isOnline }">
          <div class="status-indicator"></div>
          <p>{{ isOnline ? 'Đang tìm đơn hàng...' : 'Bạn đang tắt kết nối' }}</p>
        </div>

        <button class="toggle-btn" @click="toggleConnection" :class="{ 'btn-on': isOnline }">
          <i class="ti-power-off"></i> {{ isOnline ? 'TẮT KẾT NỐI' : 'BẬT KẾT NỐI' }}
        </button>

        <div class="quick-actions">
          <div class="action-item"><div class="circle-icon" @click="openModal"><i class="ti-truck"></i></div><span>Dịch vụ</span></div>
          <div class="action-item"><div class="circle-icon"><i class="ti-location-pin"></i></div><span>Điểm đến</span></div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* CSS CŨ + CẬP NHẬT GIAO DIỆN NÚT BẤM */
.map-background { width: 100%; height: 100%; z-index: 1; }
* { box-sizing: border-box; }
.dashboard-container { display: flex; height: 100vh; width: 100vw; font-family: Arial, sans-serif; overflow: hidden; }
.sidebar { width: 260px; background-color: #fff; border-right: 1px solid #ddd; display: flex; flex-direction: column; padding: 20px; z-index: 10; box-shadow: 2px 0 5px rgba(0,0,0,0.05); }
.logo-area h2 { color: #00b14f; margin-bottom: 40px; text-align: center; }
.nav-links { list-style: none; padding: 0; flex: 1; }
.nav-links li { padding: 15px 20px; margin-bottom: 10px; cursor: pointer; border-radius: 8px; font-weight: 600; color: #555; display: flex; align-items: center; gap: 15px; }
.nav-links li.active { background-color: #f0fff4; color: #00b14f; }
.map-section { flex: 1; position: relative; }

/* Control Panel */
.control-panel { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); background: white; width: 90%; max-width: 600px; padding: 20px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); display: flex; flex-direction: column; align-items: center; gap: 20px; z-index: 50; }
.status-bar { display: flex; align-items: center; gap: 10px; font-weight: bold; color: #666; }
.status-indicator { width: 12px; height: 12px; background-color: red; border-radius: 50%; }
.status-bar.online .status-indicator { background-color: #00b14f; box-shadow: 0 0 10px #00b14f; }
.toggle-btn { background-color: #1c1c1c; color: white; border: none; padding: 15px 60px; border-radius: 50px; font-size: 18px; font-weight: bold; cursor: pointer; transition: 0.3s; }
.toggle-btn.btn-on { background-color: #00b14f; }
.quick-actions { display: flex; justify-content: center; gap: 40px; width: 100%; border-top: 1px solid #eee; padding-top: 20px; }
.circle-icon { width: 50px; height: 50px; background-color: #f5f5f5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #333; }

/* Delivery Panel (Panel đang giao hàng) */
.delivery-panel { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); background: white; padding: 20px; border-radius: 15px; width: 90%; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); z-index: 55; text-align: center; }
.customer-mini-info h4 { margin: 0; font-size: 18px; color: #333; }
.customer-mini-info p { color: #666; margin: 5px 0 15px 0; font-size: 14px; }

/* Nút bấm trạng thái đơn */
.btn-pickup { width: 100%; padding: 15px; background: #f39c12; color: white; border: none; border-radius: 10px; font-weight: bold; font-size: 16px; cursor: pointer; box-shadow: 0 4px 10px rgba(243, 156, 18, 0.3); }
.btn-finish { width: 100%; padding: 15px; background: #00b14f; color: white; border: none; border-radius: 10px; font-weight: bold; font-size: 16px; cursor: pointer; box-shadow: 0 4px 10px rgba(0, 177, 79, 0.3); }

/* Popup Nhận Đơn */
.order-alert-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 60; display: flex; align-items: center; justify-content: center; }
.order-card { background: white; width: 90%; max-width: 400px; border-radius: 16px; padding: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.3); animation: slideUp 0.4s ease-out; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.new-order-title { font-weight: bold; color: #00b14f; font-size: 18px; }
.distance-badge { font-size: 13px; background: #e0f2f1; color: #00897b; padding: 4px 8px; border-radius: 12px; font-weight: bold; }
.product-row { display: flex; gap: 15px; align-items: center; }
.food-img { width: 65px; height: 65px; border-radius: 10px; object-fit: cover; }
.food-info h4 { margin: 0; font-size: 16px; color: #333; }
.price { color: #e67e22; font-weight: bold; font-size: 14px; }
.address-timeline { display: flex; flex-direction: column; gap: 10px; margin: 15px 0; }
.btn-group { display: flex; gap: 10px; margin-top: 20px; }
.btn-ignore { flex: 1; padding: 14px; border-radius: 8px; border: none; background: #f5f5f5; cursor: pointer; font-weight: bold; }
.btn-accept { flex: 1; padding: 14px; border-radius: 8px; border: none; background: #00b14f; color: white; font-weight: bold; cursor: pointer; }

@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>