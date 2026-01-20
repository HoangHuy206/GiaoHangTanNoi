<template>
  <div class="checkout-page-wrapper">
    <div class="checkout-container">
      <div class="checkout-header">
        <button class="back-btn" @click="$router.go(-1)">←</button>
        <h1>Thanh toán</h1>
      </div>

      <div class="checkout-body">
        <div class="section">
          <h3>Tóm tắt đơn hàng</h3>
          <div class="order-items">
            <div v-for="item in items" :key="item.id" class="order-item">
              <div class="item-qty">{{ item.quantity }}x</div>
              <div class="item-details">
                <div class="name">{{ item.name }}</div>
                <div class="note" v-if="item.note">{{ item.note }}</div>
                <div class="edit-btn">Chỉnh sửa</div>
              </div>
              <div class="item-price">{{ formatCurrency(item.price * item.quantity) }}</div>
            </div>
          </div>
          <div class="subtotal-row">
            <span>Tổng tạm tính</span>
            <span>{{ formatCurrency(subTotal) }}</span>
          </div>
        </div>

        <div class="section address-section">
          <h3>Giao tới</h3>
          <div class="address-box">
             <div class="location-icon">📍</div>
             <div class="address-content">
               <div class="user-name">{{ userInfo.name }} | {{ userInfo.phone }}</div>
               <textarea v-model="userInfo.address" class="address-input" rows="2"></textarea>
             </div>
             <button class="change-addr-btn" @click="detectLocation">Vị trí hiện tại</button>
          </div>
        </div>

        <div class="section shipping-section">
          <h3>Tùy chọn giao hàng</h3>
          
          <div class="shipping-options">
            <label class="ship-option" :class="{ active: selectedShip === 'priority' }">
              <input type="radio" value="priority" v-model="selectedShip">
              <div class="ship-info">
                <div class="ship-name">Ưu tiên • 29 phút <span class="info-icon">ℹ️</span></div>
                <div class="ship-desc">Đơn hàng được ưu tiên giao trước</div>
              </div>
              <div class="ship-price">{{ formatCurrency(36000) }}</div>
            </label>

            <label class="ship-option" :class="{ active: selectedShip === 'fast' }">
              <input type="radio" value="fast" v-model="selectedShip">
              <div class="ship-info">
                <div class="ship-name">Nhanh • 35 phút</div>
              </div>
              <div class="ship-price">{{ formatCurrency(28000) }}</div>
            </label>

            <label class="ship-option" :class="{ active: selectedShip === 'saver' }">
              <input type="radio" value="saver" v-model="selectedShip">
              <div class="ship-info">
                <div class="ship-name">Tiết kiệm • 50 phút <span class="info-icon">ℹ️</span></div>
              </div>
              <div class="ship-price">{{ formatCurrency(22000) }}</div>
            </label>
          </div>
        </div>

        <div class="section payment-section">
          <h3>Thông tin thanh toán</h3>
          <div class="payment-methods">
            <label class="pay-method" :class="{ active: paymentMethod === 'cash' }">
              <input type="radio" value="cash" v-model="paymentMethod">
              <span>💵 Tiền mặt</span>
            </label>
            <label class="pay-method" :class="{ active: paymentMethod === 'banking' }">
              <input type="radio" value="banking" v-model="paymentMethod">
              <span>🏦 Chuyển khoản / ZaloPay</span>
            </label>
          </div>
        </div>

      </div>

      <div class="checkout-footer">
        <div class="footer-row">
           <span class="label">Tổng cộng</span>
           <span class="total-val">{{ formatCurrency(finalTotal) }}</span>
        </div>
        <div class="saved-badge" v-if="selectedShip === 'saver'">
           Bạn tiết kiệm được 14.000₫ 🚀
        </div>

        <button class="place-order-btn" @click="submitOrder">
          Đặt đơn
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: "ThanhToan",
  setup() {
    const router = useRouter();
    const items = ref([]);
    const selectedShip = ref('fast'); // Mặc định là Nhanh
    const paymentMethod = ref('cash');
    
    // Dữ liệu người dùng (Mô phỏng lấy từ login)
    const userInfo = reactive({
      name: 'Khách hàng',
      phone: '09xxxxxxx',
      address: '15 Ngõ 5 Lý Ái, X.Sơn Đông, TP.Hà Nội' // Giá trị mặc định
    });

    // Bảng giá ship
    const shippingRates = {
      priority: 36000,
      fast: 28000,
      saver: 22000
    };

    // Load dữ liệu từ localStorage khi vào trang
    onMounted(() => {
      const storedItems = localStorage.getItem('tempCart');
      if (storedItems) {
        items.value = JSON.parse(storedItems);
      }
      
      const storedUser = localStorage.getItem('userLogin');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        userInfo.name = u.HoTen || u.userName || 'Bạn';
        // Nếu user có lưu địa chỉ trước đó thì lấy ra, không thì dùng mặc định
        if(u.address) userInfo.address = u.address;
      }
    });

    // Mô phỏng định vị (Đổi địa chỉ ngẫu nhiên để test tính năng "không mặc định")
    const detectLocation = () => {
      const locations = [
        "Tòa nhà Landmark 72, Phạm Hùng, Hà Nội",
        "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
        "Vincom Royal City, Thanh Xuân, Hà Nội"
      ];
      // Chọn ngẫu nhiên 1 địa chỉ để giả vờ định vị
      const randomLoc = locations[Math.floor(Math.random() * locations.length)];
      userInfo.address = randomLoc;
      alert("Đã cập nhật vị trí hiện tại: " + randomLoc);
    };

    // --- TÍNH TOÁN ---
    const subTotal = computed(() => {
      return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    const shipPrice = computed(() => shippingRates[selectedShip.value]);

    const finalTotal = computed(() => subTotal.value + shipPrice.value);

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    // --- XỬ LÝ ĐẶT ĐƠN ---
    const submitOrder = () => {
       if(items.value.length === 0) return alert("Giỏ hàng trống!");
       
       const orderData = {
         user: userInfo,
         items: items.value,
         shippingMethod: selectedShip.value,
         shippingCost: shipPrice.value,
         payment: paymentMethod.value,
         total: finalTotal.value,
         date: new Date().toISOString()
       };

       console.log("Dữ liệu gửi lên Server:", JSON.stringify(orderData, null, 2));
       alert(`Đặt đơn thành công!\nTổng: ${formatCurrency(finalTotal.value)}\nShip: ${selectedShip.value}\nĐịa chỉ: ${userInfo.address}`);
       
       // Xóa giỏ hàng sau khi đặt
       localStorage.removeItem('tempCart');
       // Chuyển về trang chủ
       router.push('/');
    };

    return {
      items, userInfo, selectedShip, paymentMethod,
      subTotal, finalTotal, formatCurrency,
      detectLocation, submitOrder
    };
  }
}
</script>

<style scoped>
/* Giao diện Desktop giả lập Mobile app style */
.checkout-page-wrapper {
  background-color: #f0f2f5;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.checkout-container {
  width: 500px; /* Giới hạn chiều rộng để giống giao diện điện thoại/video */
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.checkout-header {
  padding: 15px;
  background: white;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}
.back-btn { background: none; border: none; font-size: 24px; cursor: pointer; margin-right: 15px; }
.checkout-header h1 { font-size: 18px; margin: 0; font-weight: bold; }

.checkout-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 0 100px 0; /* Để trống chỗ cho footer */
  background: #f7f7f7;
}

.section {
  background: white;
  margin-bottom: 10px;
  padding: 15px;
}

.section h3 { font-size: 16px; margin: 0 0 15px 0; font-weight: 700; color: #333; }

/* 1. Item Styles */
.order-item { display: flex; margin-bottom: 15px; align-items: flex-start; }
.item-qty { font-weight: bold; width: 30px; color: #00b14f; border: 1px solid #00b14f; border-radius: 4px; text-align: center; margin-right: 10px; font-size: 13px; }
.item-details { flex: 1; }
.item-details .name { font-weight: 500; color: #333; }
.item-details .note { font-size: 12px; color: #666; }
.item-details .edit-btn { color: #0088cc; font-size: 12px; cursor: pointer; margin-top: 2px; }
.item-price { font-weight: 600; }
.subtotal-row { display: flex; justify-content: space-between; border-top: 1px solid #eee; padding-top: 10px; font-weight: 500; }

/* 2. Address Styles */
.address-box { display: flex; align-items: flex-start; }
.location-icon { color: #ff4757; font-size: 20px; margin-right: 10px; margin-top: 5px; }
.address-content { flex: 1; margin-right: 10px; }
.user-name { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
.address-input { width: 100%; border: 1px dashed #ccc; padding: 5px; border-radius: 4px; font-family: inherit; font-size: 14px; resize: none; background: #fafafa; }
.change-addr-btn { font-size: 12px; color: #00b14f; border: 1px solid #00b14f; background: white; padding: 5px 10px; border-radius: 15px; cursor: pointer; white-space: nowrap; height: fit-content; align-self: center; }

/* 3. Shipping Options */
.shipping-options { display: flex; flex-direction: column; gap: 10px; }
.ship-option { display: flex; align-items: center; border: 1px solid #eee; padding: 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.ship-option.active { border-color: #00b14f; background-color: #f0fbf4; }
.ship-option input { margin-right: 12px; accent-color: #00b14f; }
.ship-info { flex: 1; }
.ship-name { font-weight: 600; font-size: 14px; }
.ship-desc { font-size: 12px; color: #666; margin-top: 2px; }
.ship-price { font-weight: bold; font-size: 14px; }

/* 4. Payment Styles */
.payment-methods { display: flex; flex-direction: column; gap: 10px; }
.pay-method { display: flex; align-items: center; padding: 10px; border: 1px solid #eee; border-radius: 6px; cursor: pointer; }
.pay-method.active { border-color: #00b14f; background: #f0fbf4; }
.pay-method input { margin-right: 10px; accent-color: #00b14f; }

/* FOOTER */
.checkout-footer {
  position: sticky; bottom: 0;
  background: white;
  padding: 15px 20px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  border-top: 1px solid #eee;
}
.footer-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.footer-row .label { font-size: 16px; font-weight: 500; }
.footer-row .total-val { font-size: 20px; font-weight: bold; color: #333; }
.saved-badge { background: #fff0f1; color: #ff4757; font-size: 12px; padding: 5px 10px; border-radius: 12px; display: inline-block; margin-bottom: 10px; font-weight: 500; }
.place-order-btn {
  width: 100%;
  background: #00b14f;
  color: white;
  border: none;
  padding: 15px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
}
.place-order-btn:hover { background: #009e39; }
</style>