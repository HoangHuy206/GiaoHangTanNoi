<template>
  <div class="checkout-page-wrapper">
    <div class="checkout-container-desktop">
      <div class="checkout-header">
        <button class="back-btn" @click="$router.go(-1)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Quay lại
        </button>
        <h1>Xác nhận thanh toán</h1>
      </div>

      <div class="checkout-content">
        <div class="left-column">
          <div class="section-card address-section">
            <div class="section-title"><span class="icon">📍</span> Thông tin giao hàng</div>
            <div class="address-box">
               <div class="user-info-row"><strong>Đơn hàng của bạn</strong></div>
               <div class="input-wrapper">
                 <textarea v-model="userInfo.address" class="address-input" rows="2" placeholder="Nhập địa chỉ chi tiết..."></textarea>
                 <div class="button-group-vertical">
                   <button class="detect-btn" @click="setHardLocation">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ff4757" stroke="#ff4757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3" fill="white" stroke="none"></circle>
                    </svg> <span class="btn-text">Vị trí hiện tại</span>
                   </button>
                   <button class="map-btn" @click="openMapModal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                      <line x1="8" y1="2" x2="8" y2="18"></line>
                      <line x1="16" y1="6" x2="16" y2="22"></line>
                    </svg> <span class="btn-text">Chọn trên bản đồ</span>
                   </button>
                 </div>
               </div>
            </div>
          </div>

          <div class="section-card shipping-section">
            <div class="section-title"><span class="icon">🛵</span> Tùy chọn giao hàng</div>
            <div class="shipping-options">
              <label class="ship-option" :class="{ active: selectedShip === 'priority' }">
                <input type="radio" value="priority" v-model="selectedShip">
                <div class="ship-info"><div class="ship-name">Ưu tiên • 29 phút <span class="badge">Nhanh nhất</span></div><div class="ship-desc">Đơn hàng được ưu tiên giao trước</div></div>
                <div class="ship-price">{{ formatCurrency(36000) }}</div>
              </label>
              <label class="ship-option" :class="{ active: selectedShip === 'fast' }">
                <input type="radio" value="fast" v-model="selectedShip">
                <div class="ship-info"><div class="ship-name">Nhanh • 35 phút</div></div>
                <div class="ship-price">{{ formatCurrency(28000) }}</div>
              </label>
              <label class="ship-option" :class="{ active: selectedShip === 'saver' }">
                <input type="radio" value="saver" v-model="selectedShip">
                <div class="ship-info"><div class="ship-name">Tiết kiệm • 50 phút</div></div>
                <div class="ship-price">{{ formatCurrency(22000) }}</div>
              </label>
            </div>
          </div>

          <div class="section-card payment-section">
            <div class="section-title"><span class="icon">💳</span> Phương thức thanh toán</div>
            <div class="payment-methods">
              <div class="pay-method" :class="{ active: paymentMethod === 'cash' }" @click="selectPayment('cash')">
                <div class="radio-circle"></div><span>💵 Tiền mặt khi nhận hàng</span>
              </div>
              <div class="pay-method" :class="{ active: paymentMethod === 'banking' }" @click="selectPayment('banking')">
                <div class="radio-circle"></div><span>🏦 Chuyển khoản</span>
              </div>
            </div>
            <div v-if="paymentMethod === 'banking'" class="qr-container">
              <div class="qr-header">Quét mã để thanh toán <span class="timer">Hết hạn sau: {{ formatTime(qrTimeLeft) }}</span></div>
              <div class="qr-body">
                <img :src="qrCodeUrl" alt="QR Code" class="qr-img" />
                <p class="qr-note">Nội dung CK: <strong>{{ randomOrderCode }}</strong></p>
                <button class="refresh-qr" @click="generateNewQR">🔄 Lấy mã mới</button>
              </div>
            </div>
          </div>
        </div>

        <div class="right-column">
          <div class="order-summary-card">
            <h3>Tóm tắt đơn hàng</h3>
            <div class="order-items-list">
              <div v-for="item in items" :key="item.id" class="summary-item">
                <div class="item-qty">{{ item.quantity }}x</div>
                <div class="item-name">{{ item.name }} <span v-if="item.note" class="item-note">({{ item.note }})</span></div>
                <div class="item-price">{{ formatCurrency(item.price * item.quantity) }}</div>
              </div>
            </div>
            <div class="divider"></div>
            <div class="price-row"><span>Tạm tính</span><span>{{ formatCurrency(subTotal) }}</span></div>
            <div class="price-row"><span>Phí giao hàng</span><span>{{ formatCurrency(shipPrice) }}</span></div>
             <div class="price-row discount" v-if="selectedShip === 'saver'"><span>Khuyến mãi vận chuyển</span><span>-14.000₫</span></div>
            <div class="divider"></div>
            <div class="total-row"><span>Tổng cộng</span><span class="total-price">{{ formatCurrency(finalTotal) }}</span></div>
            <button class="place-order-btn" @click="submitOrder">ĐẶT ĐƠN HÀNG</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showMapModal" class="map-modal-overlay" @click.self="closeMap">
      <div class="map-modal-content">
        <div class="map-header"><h3>Chọn vị trí giao hàng</h3><button class="close-map-btn" @click="closeMap">×</button></div>
        <div class="map-body">
          <p class="map-instruction">👇 Kéo bản đồ và Click chọn vị trí chính xác</p>
          <div id="interactive-map" class="interactive-map-container"></div>
          <div class="selected-address-bar"><span v-if="tempSelectedAddress">📍 {{ tempSelectedAddress }}</span><span v-else>Đang chờ chọn vị trí...</span></div>
          <div class="map-footer"><button class="confirm-map-btn" @click="confirmMapSelection" :disabled="!tempSelectedAddress">✅ Xác nhận địa chỉ này</button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: "ThanhToan",
  setup() {
    const router = useRouter();
    const items = ref([]);
    const selectedShip = ref('fast');
    const paymentMethod = ref('cash');
    const showMapModal = ref(false);
    const tempSelectedAddress = ref('');
    let mapInstance = null;
    let markerInstance = null;
    const qrCodeUrl = ref('');
    const randomOrderCode = ref('');
    const qrTimeLeft = ref(600); 
    let timerInterval = null;
    const userInfo = reactive({ name: '', phone: '', address: '' });
    const shippingRates = { priority: 36000, fast: 28000, saver: 22000 };

    onMounted(() => {
      // Load Leaflet
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link'); link.id = 'leaflet-css'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
      }
      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script'); script.id = 'leaflet-js'; script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; document.head.appendChild(script);
      }

      const storedItems = localStorage.getItem('tempCart');
      if (storedItems) items.value = JSON.parse(storedItems);
      
      const storedUser = localStorage.getItem('userLogin');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        userInfo.name = u.HoTen || u.userName || 'Bạn';
        userInfo.phone = u.phone || '';
        if(u.address) userInfo.address = u.address;
      }
    });

    onUnmounted(() => { if (timerInterval) clearInterval(timerInterval); });

    const setHardLocation = () => {
      userInfo.address = "Trường Cao Đẳng Công Nghệ Cao Hà Nội";
      alert("Vị trí của bạn đang ở Trường Cao Đẳng Công Nghệ Cao Hà Nội");
    };

    const openMapModal = async () => { showMapModal.value = true; await nextTick(); initMap(); };
    const closeMap = () => { showMapModal.value = false; };

    const initMap = () => {
      if (typeof L === 'undefined') { alert("Đang tải bản đồ..."); return; }
      if (mapInstance) mapInstance.remove();
      const defaultLat = 21.0285; const defaultLng = 105.8542;
      mapInstance = L.map('interactive-map').setView([defaultLat, defaultLng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(mapInstance);
      markerInstance = L.marker([defaultLat, defaultLng], {draggable: true}).addTo(mapInstance);
      mapInstance.on('click', async (e) => { updateMarkerAndAddress(e.latlng.lat, e.latlng.lng); });
      markerInstance.on('dragend', async (e) => { updateMarkerAndAddress(e.target.getLatLng().lat, e.target.getLatLng().lng); });
    };

    const updateMarkerAndAddress = async (lat, lng) => {
      markerInstance.setLatLng([lat, lng]);
      tempSelectedAddress.value = "Đang lấy địa chỉ...";
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        tempSelectedAddress.value = data.display_name || "Không tìm thấy tên đường";
      } catch (error) { tempSelectedAddress.value = "Lỗi kết nối"; }
    };

    const confirmMapSelection = () => {
      if (tempSelectedAddress.value) { userInfo.address = tempSelectedAddress.value; closeMap(); }
    };

    const selectPayment = (method) => {
      paymentMethod.value = method;
      if (method === 'banking') generateNewQR(); else clearInterval(timerInterval);
    };

    const generateNewQR = () => {
      const randomCode = 'DH' + Math.floor(Math.random() * 1000000);
      randomOrderCode.value = randomCode;
      qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CHUYEN_KHOAN_${randomCode}&random=${Date.now()}`;
      qrTimeLeft.value = 600;
      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        if (qrTimeLeft.value > 0) qrTimeLeft.value--; else { clearInterval(timerInterval); alert("Mã QR hết hạn!"); }
      }, 1000);
    };

    const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    const subTotal = computed(() => items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0));
    const shipPrice = computed(() => shippingRates[selectedShip.value]);
    const finalTotal = computed(() => subTotal.value + shipPrice.value);
    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    // --- LOGIC QUAN TRỌNG ĐÃ ĐƯỢC NÂNG CẤP ---
    const submitOrder = () => {
       if(items.value.length === 0) return alert("Giỏ hàng trống!");
       if(!userInfo.address) return alert("Vui lòng nhập địa chỉ giao hàng!");

       alert(`Đặt đơn thành công!\nKhách hàng: ${userInfo.name}\nTổng: ${formatCurrency(finalTotal.value)}\nĐịa chỉ: ${userInfo.address}`);
       
       // 1. Lấy giỏ hàng tổng từ bộ nhớ
       const savedCart = localStorage.getItem('myShoppingCart');
       let currentFullCart = savedCart ? JSON.parse(savedCart) : [];

       // 2. Lọc bỏ các món đã thanh toán (So sánh cả ID và TÊN MÓN để tránh xóa nhầm)
       // items.value là danh sách món đang được thanh toán
       const remainingItems = currentFullCart.filter(cartItem => {
          // Giữ lại món nến nó KHÔNG nằm trong danh sách đang thanh toán
          const isPaid = items.value.some(paidItem => 
              paidItem.id === cartItem.id && paidItem.name === cartItem.name
          );
          return !isPaid; 
       });

       // 3. Cập nhật lại bộ nhớ giỏ hàng
       if (remainingItems.length > 0) {
         localStorage.setItem('myShoppingCart', JSON.stringify(remainingItems));
       } else {
         localStorage.removeItem('myShoppingCart');
       }

       // 4. Xóa giỏ hàng tạm
       localStorage.removeItem('tempCart');
       
       // 5. Chuyển hướng
       router.push('/Food2');
    };

    return {
      items, userInfo, selectedShip, paymentMethod,
      subTotal, finalTotal, shipPrice, formatCurrency,
      setHardLocation, submitOrder,
      selectPayment, qrCodeUrl, qrTimeLeft, formatTime, generateNewQR, randomOrderCode,
      showMapModal, openMapModal, closeMap, tempSelectedAddress, confirmMapSelection
    };
  }
}
</script>

<style scoped>
/* (Giữ nguyên CSS cũ) */
.checkout-page-wrapper { background-color: #f0f2f5; min-height: 100vh; padding: 40px 20px; font-family: 'Segoe UI', sans-serif; }
.checkout-container-desktop { max-width: 1100px; margin: 0 auto; }
.checkout-header { margin-bottom: 20px; display: flex; align-items: center; }
.back-btn { background: none; border: none; font-size: 16px; cursor: pointer; color: #666; display: flex; align-items: center; gap: 5px; margin-right: 20px; }
.back-btn:hover { color: #00b14f; }
.checkout-header h1 { font-size: 24px; font-weight: 700; color: #333; margin: 0; }
.checkout-content { display: flex; gap: 30px; align-items: flex-start; }
.left-column { flex: 2; }
.right-column { flex: 1; position: sticky; top: 20px; }
.section-card, .order-summary-card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 24px; margin-bottom: 20px; }
.section-title { font-size: 18px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; color: #333; }
.icon { font-size: 20px; }
.address-box { background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee; }
.user-info-row { font-weight: 600; margin-bottom: 10px; color: #333; font-size: 16px; }
.input-wrapper { display: flex; gap: 10px; align-items: flex-start; }
.address-input { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 6px; resize: none; font-family: inherit; transition: background 0.3s; }
.address-input:focus { border-color: #00b14f; outline: none; background: white; }
.button-group-vertical { display: flex; flex-direction: column; gap: 8px; }
.detect-btn, .map-btn { display: flex; align-items: center; justify-content: flex-start; white-space: nowrap; height: 36px; padding: 0 15px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; transition: 0.2s; width: 160px; }
.detect-btn { border: 1px solid #ff4757; color: #ff4757; background: white; }
.detect-btn:hover { background: #fff0f1; }
.map-btn { border: 1px solid #2980b9; color: #2980b9; background: white; }
.map-btn:hover { background: #ebf5fb; }
.btn-text { margin-left: 8px; }
.map-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; justify-content: center; align-items: center; }
.map-modal-content { background: white; width: 900px; max-width: 95%; height: 80vh; border-radius: 12px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.3); display: flex; flex-direction: column; }
.map-header { padding: 15px 20px; background: #f0f2f5; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; }
.map-header h3 { margin: 0; font-size: 18px; }
.close-map-btn { background: none; border: none; font-size: 28px; cursor: pointer; line-height: 1; }
.map-body { flex: 1; display: flex; flex-direction: column; position: relative; padding: 0; }
.map-instruction { text-align: center; background: #fff3cd; color: #856404; padding: 8px; margin: 0; font-size: 14px; border-bottom: 1px solid #ffeeba; }
.interactive-map-container { flex: 1; width: 100%; background: #eee; }
.selected-address-bar { padding: 10px 20px; background: white; border-top: 1px solid #eee; font-weight: 500; color: #333; }
.map-footer { padding: 15px; background: #f9f9f9; border-top: 1px solid #eee; text-align: center; }
.confirm-map-btn { background: #00b14f; color: white; border: none; padding: 12px 30px; font-weight: bold; font-size: 16px; border-radius: 6px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,177,79,0.3); }
.confirm-map-btn:disabled { background: #ccc; cursor: not-allowed; box-shadow: none; }
.confirm-map-btn:hover:not(:disabled) { background: #009e39; }
.shipping-options { display: flex; flex-direction: column; gap: 12px; }
.ship-option { display: flex; align-items: center; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.ship-option:hover { border-color: #00b14f; }
.ship-option.active { border-color: #00b14f; background-color: #f0fbf4; box-shadow: 0 0 0 1px #00b14f; }
.ship-option input { margin-right: 15px; width: 18px; height: 18px; accent-color: #00b14f; }
.ship-info { flex: 1; }
.ship-name { font-weight: 600; font-size: 15px; display: flex; align-items: center; gap: 8px; }
.badge { font-size: 11px; background: #ff4757; color: white; padding: 2px 6px; border-radius: 4px; }
.ship-desc { font-size: 13px; color: #666; margin-top: 4px; }
.ship-price { font-weight: 700; color: #333; }
.payment-methods { display: flex; gap: 15px; flex-wrap: wrap; }
.pay-method { flex: 1; min-width: 200px; border: 1px solid #e0e0e0; padding: 15px; border-radius: 8px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s; }
.pay-method:hover { border-color: #00b14f; }
.pay-method.active { border-color: #00b14f; background: #f0fbf4; font-weight: 600; }
.radio-circle { width: 18px; height: 18px; border: 2px solid #ccc; border-radius: 50%; position: relative; }
.pay-method.active .radio-circle { border-color: #00b14f; }
.pay-method.active .radio-circle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 8px; height: 8px; background: #00b14f; border-radius: 50%; }
.qr-container { margin-top: 20px; background: #f3f4f6; padding: 20px; border-radius: 12px; text-align: center; border: 1px dashed #aaa; }
.qr-header { font-weight: bold; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
.timer { color: #d63031; font-family: monospace; font-size: 16px; background: white; padding: 2px 8px; border-radius: 4px; }
.qr-img { width: 180px; height: 180px; background: white; padding: 10px; border-radius: 8px; }
.qr-note { margin: 10px 0; font-size: 14px; }
.refresh-qr { background: #333; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.refresh-qr:hover { background: #555; }
.order-summary-card h3 { margin-top: 0; font-size: 18px; margin-bottom: 15px; }
.order-items-list { max-height: 300px; overflow-y: auto; margin-bottom: 15px; }
.summary-item { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
.item-qty { font-weight: bold; color: #00b14f; width: 30px; }
.item-name { flex: 1; padding-right: 10px; }
.item-note { font-style: italic; color: #888; font-size: 12px; }
.item-price { font-weight: 600; }
.divider { height: 1px; background: #eee; margin: 15px 0; }
.price-row { display: flex; justify-content: space-between; margin-bottom: 10px; color: #555; }
.price-row.discount { color: #d63031; }
.total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #333; margin-bottom: 20px; }
.total-price { color: #00b14f; font-size: 22px; }
.place-order-btn { width: 100%; background: #00b14f; color: white; border: none; padding: 18px; font-size: 18px; font-weight: bold; text-transform: uppercase; border-radius: 8px; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 10px rgba(0, 177, 79, 0.3); }
.place-order-btn:hover { background: #009e39; transform: translateY(-2px); }
</style>