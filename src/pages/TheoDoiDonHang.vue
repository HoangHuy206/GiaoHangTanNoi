<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine'; 
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { io } from 'socket.io-client';

// ====== CẤU HÌNH ======
const SOCKET_URL = 'https://giaohangtannoi.onrender.com'; // Đổi IP này nếu cần
const socket = io(SOCKET_URL); 

const route = useRoute();
const router = useRouter();
const maDonHang = route.params.maDon;

// State
const trangThai = ref('dang_tim_xe'); 
const thongTinDon = ref({
    diemLay: "Đang tải...",
    diemGiao: "Đang tải...",
    coordsLay: null,
    coordsGiao: null
});
const taiXeInfo = ref(null);

// Map
const mapContainer = ref(null);
let map = null;
let driverMarker = null;
let shopMarker = null;
let customerMarker = null;
let routeControl = null; 

// Icons
const shipperIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png',
    iconSize: [45, 45], iconAnchor: [22, 22]
});
const shopIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1068/1068729.png',
    iconSize: [32, 32], iconAnchor: [16, 32]
});
const customerIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32], iconAnchor: [16, 32]
});

onMounted(async () => {
    initMap();
    await layChiTietDonHang(maDonHang);

    socket.emit('khach_vao_theo_doi', maDonHang);
    
    // 1. Tài xế nhận đơn
    socket.on('order_accepted', (data) => {
        console.log("Socket: Tài xế nhận đơn", data);
        trangThai.value = 'tai_xe_nhan';
        capNhatTaiXe(data);
    });

    // 2. Tài xế di chuyển (CẬP NHẬT TUYẾN ĐƯỜNG)
    socket.on('driver_moved', (coords) => {
        if (trangThai.value !== 'hoan_thanh') {
            // Nếu đang ở trạng thái nhận, tự chuyển sang đang giao
            if (trangThai.value === 'tai_xe_nhan') trangThai.value = 'dang_giao';
            
            updateDriverPosition(coords.lat, coords.lng);
        }
    });

    // 3. Đổi trạng thái
    socket.on('order_status_change', (data) => {
        if (data.status === 'shipping') trangThai.value = 'dang_giao';
        if (data.status === 'completed') {
            trangThai.value = 'hoan_thanh';
            if (map) { map.remove(); map = null; }
        }
    });
});

const initMap = () => {
    if (map) return;
    map = L.map(mapContainer.value).setView([21.0285, 105.8542], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { noWrap: true }).addTo(map);
};

// --- XỬ LÝ DỮ LIỆU ---
const layChiTietDonHang = async (id) => {
    try {
        const response = await fetch(`${SOCKET_URL}/api/orders/${id}`);
        if (!response.ok) throw new Error("Lỗi tải đơn");
        const data = await response.json();
        console.log("Dữ liệu API:", data); // Check log xem có driver không

        // 1. Gán địa chỉ (Ưu tiên các trường có dữ liệu)
        thongTinDon.value.diemLay = data.dia_chi_quan || data.ten_quan || "Điểm lấy";
        thongTinDon.value.diemGiao = data.dia_chi_giao || "Điểm giao";
        
        // 2. Gán tọa độ
        thongTinDon.value.coordsLay = { lat: parseFloat(data.lat_don), lng: parseFloat(data.lng_don) };
        thongTinDon.value.coordsGiao = { lat: parseFloat(data.lat_tra || data.vi_do_giao), lng: parseFloat(data.lng_tra || data.kinh_do_giao) };

        // 3. Vẽ Marker
        if(shopMarker) map.removeLayer(shopMarker);
        shopMarker = L.marker([thongTinDon.value.coordsLay.lat, thongTinDon.value.coordsLay.lng], {icon: shopIcon}).addTo(map).bindPopup(thongTinDon.value.diemLay);

        if(customerMarker) map.removeLayer(customerMarker);
        customerMarker = L.marker([thongTinDon.value.coordsGiao.lat, thongTinDon.value.coordsGiao.lng], {icon: customerIcon}).addTo(map).bindPopup(thongTinDon.value.diemGiao);

        // 4. Vẽ đường mặc định (Quán -> Khách)
        drawRoute(thongTinDon.value.coordsLay, thongTinDon.value.coordsGiao);

        // 5. Cập nhật trạng thái
        if (data.status === 'shipping') trangThai.value = 'dang_giao';
        else if (data.status === 'completed') trangThai.value = 'hoan_thanh';
        else if (data.status === 'tai_xe_nhan') trangThai.value = 'tai_xe_nhan';

        // 6. Cập nhật tài xế (Quan trọng)
        if (data.driver) {
            capNhatTaiXe({ driver: data.driver, current_location: data.current_location });
        }

    } catch (e) { console.error("Lỗi:", e); }
};

const capNhatTaiXe = (data) => {
    const d = data.driver || data; // Xử lý cấu trúc lồng nhau
    if (d) {
        taiXeInfo.value = {
            ten: d.name || d.ho_ten || d.ten_tai_xe || "Tài xế",
            sdt: d.phone || d.sdt || "Chưa có SĐT",
            bien_so: d.plate || d.bien_so || d.phuong_tien || "29X1-XXXX",
            avatar: d.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'
        };
    }
    // Cập nhật vị trí xe
    const loc = data.current_location || (d && d.current_location);
    if (loc) updateDriverPosition(loc.lat, loc.lng);
};

const drawRoute = (start, end) => {
    if (!map) return;
    if (routeControl) map.removeControl(routeControl);
    
    routeControl = L.Routing.control({
        waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
        lineOptions: { styles: [{ color: '#00b14f', opacity: 0.8, weight: 6 }] },
        createMarker: () => null, 
        addWaypoints: false, draggableWaypoints: false, fitSelectedRoutes: false, show: false
    }).addTo(map);
};

// --- HÀM QUAN TRỌNG: CẬP NHẬT VỊ TRÍ XE & VẼ LẠI ĐƯỜNG ---
const updateDriverPosition = (lat, lng) => {
    if (!map) return;
    
    // 1. Di chuyển Marker xe
    if (driverMarker) driverMarker.setLatLng([lat, lng]);
    else driverMarker = L.marker([lat, lng], { icon: shipperIcon, zIndexOffset: 1000 }).addTo(map).bindPopup("Tài xế");

    // 2. Vẽ lại đường từ XE -> KHÁCH (Hiệu ứng real-time)
    // Chỉ vẽ lại nếu đã có tọa độ khách
    if (thongTinDon.value.coordsGiao) {
        drawRoute({lat, lng}, thongTinDon.value.coordsGiao);
    }
};

onUnmounted(() => { if (map) { map.remove(); map = null; } socket.disconnect(); });
</script>

<template>
  <div class="tracking-page">
    <div class="header">
        <button @click="router.push('/Food2')" class="back-btn"><i class="ti-arrow-left"></i> Quay lại</button>
        <h3>Đơn hàng: {{ maDonHang }}</h3>
    </div>

    <div v-if="trangThai === 'hoan_thanh'" class="success-screen">
        <div class="success-content">
            <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" width="80" />
            <h2>Giao Hàng Thành Công!</h2>
            <p>Đơn hàng đã được giao đến: <b>{{ thongTinDon.diemGiao }}</b></p>
            <div class="driver-review" v-if="taiXeInfo">
                <img :src="taiXeInfo.avatar" class="avatar-small"/>
                <div>
                    <p>Tài xế: <b>{{ taiXeInfo.ten }}</b></p>
                    <div class="stars">⭐⭐⭐⭐⭐</div>
                </div>
            </div>
            <button @click="router.push('/Food2')" class="btn-home">Về trang chủ</button>
        </div>
    </div>

    <div v-else class="map-wrapper">
        <div ref="mapContainer" class="map"></div>
    </div>

    <div v-if="trangThai !== 'hoan_thanh'" class="status-panel">
        
        <div v-if="trangThai === 'dang_tim_xe'" class="finding-state">
            <div class="radar-spinner"></div>
            <h3>Đang tìm tài xế gần bạn...</h3>
            <div class="route-preview">
                <p>📍 Lấy: {{ thongTinDon.diemLay }}</p>
                <p>🏠 Giao: {{ thongTinDon.diemGiao }}</p>
            </div>
        </div>

        <div v-else class="driver-info-container">
            <div class="status-bar" :class="{ 'shipping': trangThai === 'dang_giao' }">
                <span v-if="trangThai === 'tai_xe_nhan'">⏳ Tài xế đang đến quán lấy hàng...</span>
                <span v-else>🚀 ĐÃ LẤY HÀNG - Đang giao đến bạn!</span>
            </div>

            <div class="driver-card" v-if="taiXeInfo">
                <div class="driver-left">
                    <img :src="taiXeInfo.avatar" class="avatar" />
                </div>
                <div class="driver-center">
                    <h4>{{ taiXeInfo.ten }}</h4>
                    <div class="plate-badge">{{ taiXeInfo.bien_so }}</div>
                    <div class="rating">⭐ 5.0 • Honda Wave</div>
                </div>
                <div class="driver-right">
                    <a :href="`tel: 0377120866`" class="btn-call">📞 Gọi</a>
                </div>
            </div>

            <div class="route-details">
                <div class="step">
                    <div class="dot from"></div>
                    <div class="text text-truncate">{{ thongTinDon.diemLay }}</div>
                </div>
                <div class="step">
                    <div class="dot to"></div>
                    <div class="text text-truncate">{{ thongTinDon.diemGiao }}</div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.tracking-page { height: 100vh; display: flex; flex-direction: column; background: #fff; font-family: 'Segoe UI', sans-serif; }
.header { position: absolute; top: 0; width: 100%; z-index: 1000; background: white; padding: 15px; display: flex; gap: 10px; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.map-wrapper { height: 100%; width: 100%; flex: 1; }
.map { width: 100%; height: 100%; }

.status-panel { 
    background: white; border-radius: 20px 20px 0 0; margin-top: -20px; z-index: 1000; padding: 20px; 
    position: relative; box-shadow: 0 -5px 15px rgba(0,0,0,0.1); min-height: 250px; 
}

/* DRIVER CARD */
.driver-card { display: flex; align-items: center; gap: 15px; background: #f8f9fa; padding: 15px; border-radius: 12px; border: 1px solid #eee; margin-top: 15px; }
.avatar { width: 55px; height: 55px; border-radius: 50%; object-fit: cover; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.driver-center { flex: 1; }
.driver-center h4 { margin: 0 0 5px 0; font-size: 16px; font-weight: bold; color: #333; }
.plate-badge { background: #e0f2f1; color: #00897b; font-weight: bold; padding: 2px 8px; border-radius: 4px; display: inline-block; font-size: 13px; }
.rating { font-size: 12px; color: #666; margin-top: 3px; }
.btn-call { background: #00b14f; color: white; text-decoration: none; padding: 8px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; display: flex; align-items: center; gap: 5px; }

/* STATUS & ROUTE */
.status-bar { text-align: center; font-weight: bold; color: #e67e22; background: #fff3e0; padding: 10px; border-radius: 8px; }
.status-bar.shipping { color: #1976d2; background: #e3f2fd; }
.route-details { margin-top: 15px; padding-left: 5px; }
.step { display: flex; gap: 15px; margin-bottom: 12px; align-items: center; }
.dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.dot.from { background: #d32f2f; }
.dot.to { background: #00b14f; }
.text-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px; font-size: 14px; color: #555; }

/* LOADING & SUCCESS */
.finding-state { text-align: center; margin-top: 20px; }
.radar-spinner { width: 50px; height: 50px; background: #f39c12; border-radius: 50%; margin: 0 auto 15px; animation: pulse 1s infinite; }
.success-screen { flex: 1; display: flex; justify-content: center; align-items: center; background: #e8f5e9; text-align: center; padding: 20px; margin-top: 60px; }
.btn-home { margin-top: 20px; padding: 12px 30px; background: #00b14f; color: white; border: none; border-radius: 25px; font-weight: bold; }
@keyframes pulse { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
</style>