<template>
  <transition name="cart-slide">
    <div v-if="isVisible" class="cart-overlay" @click.self="closeCart">
      <div class="cart-container">
        
        <div class="cart-header">
          <h2 class="cart-title" v-if="cartItems.length > 0">Giỏ hàng ({{ totalItems }} món)</h2>
          <h2 class="cart-title" v-else>Giỏ hàng</h2>
          <button class="close-btn" @click="closeCart" title="Đóng">×</button>
        </div>

        <div class="cart-content">
          <div v-if="cartItems.length === 0" class="empty-cart">
            <img src="@/assets/anh.logo/anhlogogiohangxoanen.png" alt="Trống" class="empty-cart-img" />
            <h3>Giỏ hàng trống!</h3>
            <p>Thêm món ăn để đặt ngay.</p>
            <button class="browse-btn" @click="closeCart">Đặt món ngay!</button>
          </div>

          <div v-else class="cart-items-container">
            <div class="select-all-container" style="padding: 10px 20px; border-bottom: 1px solid #eee;">
               <label style="display: flex; align-items: center; cursor: pointer;">
                 <input type="checkbox" v-model="isSelectAll" @change="toggleSelectAll" style="margin-right: 10px; transform: scale(1.3);">
                 <span style="font-weight: 600;">Chọn tất cả ({{ cartItems.length }})</span>
               </label>
            </div>

            <div class="cart-items-list">
              <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
                
                <div class="item-checkbox">
                  <input type="checkbox" v-model="item.selected" style="transform: scale(1.3); cursor: pointer;">
                </div>

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
                <span>Đã chọn</span>
                <span>{{ selectedCount }} món</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row total">
                <span>Tổng thanh toán</span>
                <span class="total-price">{{ formatCurrency(subTotal) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="cartItems.length > 0" class="cart-footer">
          <button class="checkout-btn" @click="goToCheckout" :disabled="subTotal === 0" :style="{ opacity: subTotal === 0 ? 0.5 : 1 }">
            Mua hàng ({{ selectedCount }})
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router'; 

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
    const isVisible = ref(false);
    const cartItems = ref([]);
    const router = useRouter(); 
    const route = useRoute();

    const syncCart = () => {
      const savedCart = localStorage.getItem('myShoppingCart');
      if (savedCart) {
        try {
          let items = JSON.parse(savedCart);
          items = items.map(i => ({ ...i, selected: i.selected !== undefined ? i.selected : true }));
          cartItems.value = items;
        } catch (e) { cartItems.value = []; }
      } else {
        cartItems.value = [];
      }
    };

    onMounted(() => syncCart());
    watch(() => route.path, () => syncCart());

    watch(cartItems, (newVal) => {
      if (newVal.length > 0) localStorage.setItem('myShoppingCart', JSON.stringify(newVal));
      else localStorage.removeItem('myShoppingCart');
    }, { deep: true });

    // --- TÍNH TOÁN ---
    const totalItems = computed(() => cartItems.value.reduce((total, item) => total + item.quantity, 0));
    
    const subTotal = computed(() => {
      return cartItems.value
        .filter(item => item.selected)
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    const selectedCount = computed(() => cartItems.value.filter(i => i.selected).length);

    const isSelectAll = computed({
      get: () => cartItems.value.length > 0 && cartItems.value.every(i => i.selected),
      set: (val) => { /* Xử lý ở toggleSelectAll */ }
    });

    const toggleSelectAll = (e) => {
      const checked = e.target.checked;
      cartItems.value.forEach(item => item.selected = checked);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const increaseQty = (index) => cartItems.value[index].quantity++;
    const decreaseQty = (index) => {
      if (cartItems.value[index].quantity > 1) cartItems.value[index].quantity--;
      else if (confirm("Xóa món này?")) cartItems.value.splice(index, 1);
    };

    const openCart = () => isVisible.value = true;
    const closeCart = () => isVisible.value = false;

    const goToCheckout = () => {
      const itemsToPay = cartItems.value.filter(item => item.selected);
      if (itemsToPay.length === 0) return alert("Vui lòng tích chọn món cần thanh toán!");
      localStorage.setItem('tempCart', JSON.stringify(itemsToPay));
      closeCart();
      router.push('/thanhtoan');
    };

    // --- SỬA LỖI TRÙNG ID TẠI ĐÂY ---
    cartBus.on('add-to-cart', (product) => {
      // Logic cũ (SAI): const existingItem = cartItems.value.find(item => item.id === product.id);
      
      // Logic MỚI (ĐÚNG): Kiểm tra cả ID và Tên món
      const existingItem = cartItems.value.find(item => item.id === product.id && item.name === product.name);
      
      if (existingItem) {
        existingItem.quantity++;
        existingItem.selected = true; 
      } else {
        cartItems.value.push({ ...product, quantity: 1, selected: true });
      }
      isVisible.value = true;
    });

    cartBus.on('open-cart', openCart);

    return {
      isVisible, cartItems, totalItems, subTotal, selectedCount,
      formatCurrency, increaseQty, decreaseQty, closeCart, goToCheckout,
      isSelectAll, toggleSelectAll
    };
  }
};
</script>

<style scoped>
/* Thêm style cho checkbox */
.item-checkbox { display: flex; align-items: center; margin-right: 15px; }

/* Các style cũ giữ nguyên */
.cart-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 9999; display: flex; justify-content: flex-end; }
.cart-container { width: 400px; max-width: 85%; height: 100%; background-color: #fff; display: flex; flex-direction: column; box-shadow: -5px 0 15px rgba(0,0,0,0.1); }
.cart-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background-color: white; }
.cart-title { font-size: 18px; font-weight: 600; margin: 0; }
.close-btn { background: none; border: none; font-size: 28px; cursor: pointer; color: #888; }
.cart-content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; background: white;}
.empty-cart { padding: 40px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
.empty-cart-img { width: 120px; margin-bottom: 20px; height: auto; object-fit: contain; }
.browse-btn { margin-top: 15px; padding: 10px 24px; border: 1px solid #00b140; color: #fff; border-radius: 4px; font-weight: bold; cursor: pointer; background-color: #00b14f; transition: 0.2s; }
.cart-items-container { padding: 0; }
.cart-item { display: flex; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f0f0f0; } /* Đã sửa align-items thành center */
.item-quantity-control { display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px; margin-right: 15px; height: 32px; }
.qty-btn { background: none; border: none; width: 25px; height: 100%; cursor: pointer; font-size: 16px; color: #00b140; }
.qty-number { font-size: 14px; font-weight: 600; padding: 0 5px; }
.item-info { flex: 1; display: flex; flex-direction: column; padding-right: 10px; }
.item-name { font-weight: 500; font-size: 15px; color: #333; }
.item-note { font-size: 12px; color: #888; margin-top: 4px; }
.item-price { font-weight: 600; font-size: 15px; color: #333; }
.cart-summary { padding: 20px; background-color: #f9f9f9; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #555; }
.summary-divider { height: 1px; background-color: #ddd; margin: 15px 0; }
.summary-row.total { font-weight: bold; color: #000; font-size: 18px; }
.total-price { color: #00b140; }
.cart-footer { padding: 15px 20px; border-top: 1px solid #eee; background: #fff; }
.checkout-btn { width: 100%; padding: 15px; background-color: #00b140; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; }
.checkout-btn:disabled { background-color: #ccc; cursor: not-allowed; }
.cart-slide-enter-active, .cart-slide-leave-active { transition: opacity 0.3s; }
.cart-slide-enter-active .cart-container, .cart-slide-leave-active .cart-container { transition: transform 0.3s ease-out; }
.cart-slide-enter-from, .cart-slide-leave-to { opacity: 0; }
.cart-slide-enter-from .cart-container, .cart-slide-leave-to .cart-container { transform: translateX(100%); }
</style>