<template>
  <transition name="cart-slide">
    <div v-if="isVisible" class="cart-overlay" @click.self="closeCart">
      <div class="cart-container">
        
        <div class="cart-header">
          <h2 class="cart-title" v-if="cartItems.length > 0">Giỏ hàng ({{ totalItems }} món)</h2>
          <h2 class="cart-title" v-else>Giỏ hàng</h2>

          <button class="close-btn" @click="closeCart" title="Đóng">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div class="cart-content">
          
          <div v-if="cartItems.length === 0" class="empty-cart">
            <img 
              src="@/assets/anh.logo/anhlogogiohangxoanen.png"
              alt="Giỏ hàng trống"
              class="empty-cart-img"
            />
            <h3>Bắt đầu chọn món!</h3>
            <p>Thêm món ăn vào giỏ để đặt ngay.</p>
            <button class="browse-btn" @click="closeCart">Đặt món ngay!</button>
            
            <button @click="addDemoData" style="margin-top:20px; font-size: 12px; color: gray; text-decoration: underline; background: none; border: none; cursor: pointer;">
              (Click để test thử tính tiền)
            </button>
          </div>

          <div v-else class="cart-items-container">
            <div class="cart-items-list">
              <div v-for="(item, index) in cartItems" :key="item.id" class="cart-item">
                
                <div class="item-quantity-control">
                  <button @click="decreaseQty(index)" class="qty-btn">-</button>
                  <span class="qty-number">{{ item.quantity }}</span>
                  <button @click="increaseQty(index)" class="qty-btn">+</button>
                </div>

                <div class="item-info">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-note" v-if="item.note">{{ item.note }}</span>
                </div>

                <div class="item-price">
                  {{ formatCurrency(item.price * item.quantity) }}
                </div>
              </div>
            </div>

            <div class="cart-summary">
              <div class="summary-row">
                <span>Tạm tính</span>
                <span>{{ formatCurrency(subTotal) }}</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row total">
                <span>Tổng cộng</span>
                <span class="total-price">{{ formatCurrency(subTotal) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="cartItems.length > 0" class="cart-footer">
          <button class="checkout-btn" @click="goToCheckout">
            Tiếp tục thanh toán
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router'; 

// --- Event Bus: Giúp Food2.vue gọi được hàm mở giỏ hàng ---
export const cartBus = {
  events: {},
  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  },
  emit(event, data) {
    if (this.events[event]) this.events[event].forEach(callback => callback(data));
  }
};

export default {
  name: "GioHang",
  setup() {
    const isVisible = ref(false); // Mặc định là ẨN (false)
    const cartItems = ref([]);
    const router = useRouter(); 

    // --- CÁC HÀM TÍNH TOÁN ---
    const totalItems = computed(() => {
      return cartItems.value.reduce((total, item) => total + item.quantity, 0);
    });

    const subTotal = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    // --- CÁC HÀM XỬ LÝ ---
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const increaseQty = (index) => {
      cartItems.value[index].quantity++;
    };

    const decreaseQty = (index) => {
      if (cartItems.value[index].quantity > 1) {
        cartItems.value[index].quantity--;
      } else {
        const confirmDelete = confirm("Bạn muốn xóa món này khỏi giỏ?");
        if (confirmDelete) {
          cartItems.value.splice(index, 1);
        }
      }
    };

    const addDemoData = () => {
      cartItems.value = [
        { id: 1, name: 'Thố Cơm Thêm', price: 35000, quantity: 1, note: '' },
        { id: 2, name: 'Cơm Thố Xá Xíu', price: 75000, quantity: 1, note: 'Suất bình thường' }
      ];
    };

    const openCart = () => isVisible.value = true;
    const closeCart = () => isVisible.value = false;

    // --- CHUYỂN TRANG THANH TOÁN ---
    const goToCheckout = () => {
      // 1. Lưu giỏ hàng
      localStorage.setItem('tempCart', JSON.stringify(cartItems.value));
      
      // 2. Đóng popup giỏ hàng lại cho gọn
      closeCart();

      // 3. Chuyển hướng
      router.push('/thanhtoan');
    };

    // --- LẮNG NGHE SỰ KIỆN TỪ NƠI KHÁC ---
    
    // Khi bấm nút "Thêm vào giỏ" ở trang chi tiết món
    cartBus.on('add-to-cart', (product) => {
      const existingItem = cartItems.value.find(item => item.id === product.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        cartItems.value.push({ ...product, quantity: 1 });
      }
      openCart(); // Tự động mở giỏ khi thêm món
    });

    // Khi bấm vào icon giỏ hàng trên Header (Food2.vue)
    cartBus.on('open-cart', openCart);

    return {
      isVisible,
      cartItems,
      totalItems,
      subTotal,
      formatCurrency,
      increaseQty,
      decreaseQty,
      closeCart,
      addDemoData,
      goToCheckout 
    };
  }
};
</script>

<style scoped>
/* Overlay: Che phủ toàn màn hình */
.cart-overlay {
  position: fixed; 
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5); 
  z-index: 9999; /* Đảm bảo đè lên mọi thứ */
  display: flex; 
  justify-content: flex-end; /* Đẩy giỏ hàng sang phải */
}

/* Container giỏ hàng */
.cart-container {
  width: 400px; max-width: 85%; height: 100%;
  background-color: #fff; 
  display: flex; flex-direction: column;
  box-shadow: -5px 0 15px rgba(0,0,0,0.1);
}

/* Header */
.cart-header {
  padding: 15px 20px; border-bottom: 1px solid #eee;
  display: flex; justify-content: space-between; align-items: center;
  background-color: white;
}
.cart-title { font-size: 18px; font-weight: 600; margin: 0; }
.close-btn { background: none; border: none; font-size: 28px; cursor: pointer; color: #888; }
.close-btn:hover { color: #333; }

/* Content scrollable */
.cart-content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; background: white;}

/* Empty State */
.empty-cart {
  padding: 40px 20px; text-align: center;
  display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;
}
.empty-cart-img { width: 120px; margin-bottom: 20px; height: auto; object-fit: contain; }
.browse-btn {
  margin-top: 15px; padding: 10px 24px;
  border: 1px solid #00b140; color: #fff; border-radius: 4px; 
  font-weight: bold; cursor: pointer;
  background-color: #00b14f;
  transition: 0.2s;
}
.browse-btn:hover { background-color: #009944; }

/* Items List Styling */
.cart-items-container { padding: 0; }
.cart-item {
  display: flex; align-items: flex-start; padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

/* Quantity Controls */
.item-quantity-control {
  display: flex; align-items: center; border: 1px solid #ddd;
  border-radius: 4px; margin-right: 15px; height: 32px;
}
.qty-btn {
  background: none; border: none; width: 25px; height: 100%;
  cursor: pointer; font-size: 16px; color: #00b140;
}
.qty-number { font-size: 14px; font-weight: 600; padding: 0 5px; }

/* Item Info */
.item-info { flex: 1; display: flex; flex-direction: column; padding-right: 10px; }
.item-name { font-weight: 500; font-size: 15px; color: #333; }
.item-note { font-size: 12px; color: #888; margin-top: 4px; }
.item-price { font-weight: 600; font-size: 15px; color: #333; }

/* Summary Section */
.cart-summary { padding: 20px; background-color: #f9f9f9; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #555; }
.summary-divider { height: 1px; background-color: #ddd; margin: 15px 0; }
.summary-row.total { font-weight: bold; color: #000; font-size: 18px; }
.total-price { color: #00b140; }

/* Footer */
.cart-footer { padding: 15px 20px; border-top: 1px solid #eee; background: #fff; }
.checkout-btn {
  width: 100%; padding: 15px; background-color: #00b140; color: white;
  border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer;
}
.checkout-btn:hover { background-color: #009e39; }

/* Animation: Trượt từ phải sang */
.cart-slide-enter-active, .cart-slide-leave-active { transition: opacity 0.3s; }
.cart-slide-enter-active .cart-container, .cart-slide-leave-active .cart-container { transition: transform 0.3s ease-out; }

.cart-slide-enter-from, .cart-slide-leave-to { opacity: 0; }
.cart-slide-enter-from .cart-container, .cart-slide-leave-to .cart-container { transform: translateX(100%); }
</style>