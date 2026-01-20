<script setup>
import { RouterView } from 'vue-router'
// 1. Import component Giỏ hàng vào đây
import GioHang from './pages/SanPham/Products/giohang.vue'
</script>

<template>
  <div id="app">
    <RouterView />
    
    <GioHang />
  </div>
</template>