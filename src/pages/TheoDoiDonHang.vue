<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';

// ====== CẤU HÌNH ======
const socket = io('http://localhost:3000'); // Kết nối Server
const route = useRoute();
const router = useRouter();

// Lấy mã đơn từ URL (ví dụ: /theo-doi/DH123456 -> DH123456)
const maDonHang = route.params.maDon;

// State
const trangThai = ref('dang_tim_xe'); // dang_tim_xe | tai_xe_nhan | dang_giao | hoan_thanh
const taiXeInfo = ref(null);
const mapContainer = ref(null);

let map = null;
let driverMarker = null;   // Marker xe máy
let customerMarker = null; // Marker nhà khách
let routeLayer = null;     // Đường vẽ

// Tọa độ nhà khách (Trong thực tế bạn nên gọi API lấy chi tiết đơn hàng để có tọa độ chuẩn)
// Tạm thời mình fix cứng hoặc lấy từ localStorage để test
const customerLocation = ref({ lat: 21.0285, lng: 105.8542 }); 

onMounted(async () => {
    // 0. Gọi API lấy chi tiết đơn hàng (để biết nhà khách ở đâu)
    // await layChiTietDonHang(); // (Tự viết hàm này nếu cần)

    initMap();
    
    // 1. [QUAN TRỌNG] Báo danh với Server: "Tôi là khách, tôi đang soi đơn này"
    socket.emit('khach_vao_theo_doi', maDonHang);

    // 2. Nghe tin: Tài xế đã nhận đơn
    socket.on('order_status_update', (data) => {
        console.log("Tài xế đã nhận:", data);
        if (data.status === 'confirmed') {
            trangThai.value = 'tai_xe_nhan';
            taiXeInfo.value = data.driver_info;
            
            // Hiện xe tài xế trên map ngay lập tức
            updateDriverPosition(data.location.lat, data.location.lng);
            alert("🎉 Đã có tài xế nhận đơn!");
        }
    });

    // 3. Nghe tin: Tài xế di chuyển (Real-time)
    socket.on('driver_moved', (coords) => {
        console.log("Xe đang chạy...", coords);
        trangThai.value = 'dang_giao';
        updateDriverPosition(coords.lat, coords.lng);
    });
});

// Khởi tạo bản đồ
const initMap = () => {
    map = L.map(mapContainer.value).setView([customerLocation.value.lat, customerLocation.value.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Icon Nhà Khách
    const homeIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png', // Icon ngôi nhà
        iconSize: [35, 35],
    });
    customerMarker = L.marker([customerLocation.value.lat, customerLocation.value.lng], {icon: homeIcon})
        .addTo(map).bindPopup("Địa chỉ nhận hàng").openPopup();
};

// Cập nhật vị trí xe tài xế
const updateDriverPosition = (lat, lng) => {
    // Icon xe máy
    const bikeIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png',
        iconSize: [45, 45],
        iconAnchor: [22, 22]
    });

    if (driverMarker) {
        // Nếu đã có marker -> chỉ cập nhật vị trí (để nó chạy mượt)
        driverMarker.setLatLng([lat, lng]);
    } else {
        // Nếu chưa có -> tạo mới
        driverMarker = L.marker([lat, lng], { icon: bikeIcon }).addTo(map).bindPopup("Tài xế đang ở đây");
    }
    
    // Vẽ đường nối từ Xe -> Nhà (Optional)
    // drawLine(lat, lng);

    // Tự động zoom bản đồ để thấy cả Khách và Xe
    const group = new L.featureGroup([customerMarker, driverMarker]);
    map.fitBounds(group.getBounds(), { padding: [80, 80] });
};

onUnmounted(() => {
    socket.disconnect();
});
</script>

<template>
  <div class="tracking-page">
    <div class="header">
        <button @click="router.push('/')" class="back-btn">
            <i class="ti-arrow-left"></i> Trang chủ
        </button>
        <h3>Đơn hàng: {{ maDonHang }}</h3>
    </div>

    <div class="map-wrapper">
        <div ref="mapContainer" class="map"></div>
    </div>

    <div class="status-panel">
        <div v-if="trangThai === 'dang_tim_xe'" class="finding-driver">
            <div class="radar-spinner"></div>
            <h3>Đang tìm tài xế gần bạn...</h3>
            <p>Vui lòng chờ trong giây lát</p>
        </div>

        <div v-else class="driver-found">
            <div class="status-step">
                <div class="step active">Đã nhận</div>
                <div class="line" :class="{ active: trangThai === 'dang_giao' }"></div>
                <div class="step" :class="{ active: trangThai === 'dang_giao' }">Đang giao</div>
                <div class="line"></div>
                <div class="step">Đến nơi</div>
            </div>

            <div class="driver-card" v-if="taiXeInfo">
                <img src="https://cdn-icons-png.flaticon.com/512/147/147144.png" class="avatar" />
                <div class="info">
                    <h4>{{ taiXeInfo.ten }}</h4>
                    <p class="plate">{{ taiXeInfo.bien_so }} • {{ taiXeInfo.sdt }}</p>
                    <div class="rating">⭐ 5.0 (120 đánh giá)</div>
                </div>
                <div class="actions">
                    <button class="btn-call"><i class="ti-mobile"></i> Gọi</button>
                    <button class="btn-chat"><i class="ti-comments"></i> Chat</button>
                </div>
            </div>
            
            <div class="eta-box" v-if="trangThai === 'dang_giao'">
                <p>🚀 Tài xế đang di chuyển tới chỗ bạn!</p>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.tracking-page { height: 100vh; display: flex; flex-direction: column; position: relative; font-family: 'Segoe UI', sans-serif; overflow: hidden; }

/* Header nổi */
.header { position: absolute; top: 0; left: 0; width: 100%; z-index: 100; padding: 15px 20px; background: rgba(255,255,255,0.95); display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.back-btn { border: none; background: transparent; font-size: 16px; font-weight: bold; cursor: pointer; color: #333; display: flex; align-items: center; gap: 5px; }

/* Bản đồ full màn hình */
.map-wrapper { flex: 1; width: 100%; height: 100%; }
.map { width: 100%; height: 100%; }

/* Panel thông tin phía dưới */
.status-panel { background: white; border-top-left-radius: 25px; border-top-right-radius: 25px; padding: 25px; box-shadow: 0 -5px 30px rgba(0,0,0,0.15); position: absolute; bottom: 0; left: 0; width: 100%; z-index: 100; min-height: 280px; transition: transform 0.3s ease; }

/* Animation Tìm xe (Radar) */
.finding-driver { text-align: center; padding-top: 30px; }
.radar-spinner { width: 60px; height: 60px; background-color: #00b14f; border-radius: 50%; margin: 0 auto 20px; animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; position: relative; }
.radar-spinner::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #00b14f; border-radius: 50%; animation: pulse-dot 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite; }

@keyframes pulse-ring { 0% { transform: scale(0.33); } 80%, 100% { opacity: 0; } }
@keyframes pulse-dot { 0% { transform: scale(0.8); } 50% { transform: scale(1); } 100% { transform: scale(0.8); } }

/* Thông tin tài xế */
.driver-card { display: flex; align-items: center; gap: 15px; background: #f8f9fa; padding: 15px; border-radius: 16px; margin-top: 25px; border: 1px solid #eee; }
.avatar { width: 55px; height: 55px; border-radius: 50%; object-fit: cover; border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.info { flex: 1; }
.info h4 { margin: 0; font-size: 17px; color: #333; }
.plate { margin: 4px 0 0; font-size: 13px; color: #555; font-weight: 600; background: #e9ecef; padding: 2px 8px; border-radius: 6px; display: inline-block; }
.rating { font-size: 12px; color: #f39c12; margin-top: 5px; }
.actions { display: flex; gap: 10px; }
.btn-call, .btn-chat { border: none; width: 42px; height: 42px; border-radius: 50%; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
.btn-call { background: #e0f2f1; color: #00897b; }
.btn-call:hover { background: #b2dfdb; }
.btn-chat { background: #f3e5f5; color: #8e24aa; }
.btn-chat:hover { background: #e1bee7; }

/* Thanh tiến trình */
.status-step { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 13px; color: #aaa; font-weight: 500; }
.step.active { color: #00b14f; font-weight: 700; }
.line { flex: 1; height: 4px; background: #f1f1f1; margin: 0 10px; border-radius: 2px; }
.line.active { background: #00b14f; }

.eta-box { margin-top: 15px; text-align: center; background: #e8f5e9; color: #2e7d32; padding: 10px; border-radius: 8px; font-weight: 600; animation: fadeIn 0.5s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>