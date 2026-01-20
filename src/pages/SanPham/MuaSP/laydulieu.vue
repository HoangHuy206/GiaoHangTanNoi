<script setup>
import { useRoute } from 'vue-router'
import { ref, onMounted, computed } from 'vue'

const route = useRoute()
const restaurantId = route.params.id // Lấy con số ID từ thanh địa chỉ

// Giả sử đây là danh sách dữ liệu của bạn (nên để vào 1 file JS riêng hoặc gọi API)
const allRestaurants = [
  { id: 1, name: "Cơm Gà 68", image: "..." },
  { id: 2, name: "Lotteria", image: "..." },
  { id: 3, name: "cơm gà bình dân ", image: "..." },
  { id: 4, name: "com ga ham", image: "..." },
  { id: 5, name: "Tocotoco", image: "..." },
  { id: 6, name: "bun cham", image: "..." },
  { id: 7, name: "mixue", image: "..." },
  // ... thêm các quán khác giống như ở trang Food.vue
]

// Tìm đúng quán có ID khớp với ID trên thanh địa chỉ
const currentRestaurant = computed(() => {
  return allRestaurants.find(res => res.id == restaurantId)
})
</script>

<template>
  
</template>

<style scoped>

</style>