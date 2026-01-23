<template>
  <div class="chat-container">
    <div class="chat-header">
      <h3>🤖 Trợ lý Giao Hàng</h3>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="(msg, index) in chatHistory" 
        :key="index" 
        :class="['message', msg.role === 'user' ? 'user-msg' : 'ai-msg']"
      >
        <div class="bubble">{{ msg.content }}</div>
      </div>
      
      <div v-if="isLoading" class="message ai-msg">
        <div class="bubble loading-dots">Đang trả lời...</div>
      </div>
    </div>

    <div class="chat-input">
      <input 
        v-model="userInput" 
        @keyup.enter="sendMessage" 
        placeholder="VD: Đơn hàng của tôi đâu?..." 
        :disabled="isLoading"
      />
      <button @click="sendMessage" :disabled="isLoading">Gửi</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';

const userInput = ref('');
const messagesContainer = ref(null);
const isLoading = ref(false);

// --- [SỬA ĐỔI QUAN TRỌNG] LOGIC TẠO CÂU CHÀO ---
// Hàm lấy tên người dùng từ LocalStorage ngay khi web chạy
const getGreeting = () => {
  try {
    const storedUser = localStorage.getItem('userLogin');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Ưu tiên lấy fullname, nếu không có thì lấy username
      const name = user.fullname || user.username || "Bạn"; 
      return `Xin chào ${name}! 👋\nTôi có thể giúp gì cho đơn hàng của bạn hôm nay?`;
    }
  } catch (e) {
    console.error("Lỗi đọc user:", e);
  }
  // Nếu chưa đăng nhập thì chào chung chung
  return 'Xin chào! 👋\nTôi có thể giúp gì cho đơn hàng của bạn?';
};

// Khởi tạo lịch sử chat với câu chào ĐÃ CÓ TÊN
const chatHistory = ref([
  { role: 'assistant', content: getGreeting() } 
]);
// ------------------------------------------------

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!userInput.value.trim()) return;

  const userMsg = userInput.value;
  chatHistory.value.push({ role: 'user', content: userMsg });
  userInput.value = '';
  isLoading.value = true;
  scrollToBottom();

  const storedUser = localStorage.getItem('userLogin');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  try {
    const res = await fetch('https://giaohangtannoi.onrender.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: userMsg,
        history: chatHistory.value.slice(-5).map(m => ({ 
            role: m.role === 'assistant' ? 'assistant' : 'user', 
            content: m.content 
        })),
        currentUser: currentUser 
      })
    });

    const data = await res.json();
    chatHistory.value.push({ role: 'assistant', content: data.reply });

  } catch (error) {
    chatHistory.value.push({ role: 'assistant', content: 'Lỗi kết nối tới Server AI.' });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.chat-header {
  background: #00b14f;
  color: white;
  padding: 15px;
  text-align: center;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.chat-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  display: flex;
  width: 100%;
}

.user-msg { justify-content: flex-end; }
.ai-msg { justify-content: flex-start; }

.bubble {
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 15px;
  line-height: 1.5;
  font-size: 14px;
  word-wrap: break-word;
  white-space: pre-line; /* Để hiển thị xuống dòng nếu có */
}

.user-msg .bubble {
  background: #00b14f;
  color: white;
  border-bottom-right-radius: 2px;
}

.ai-msg .bubble {
  background: white;
  color: #333;
  border-bottom-left-radius: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.loading-dots {
  color: #666;
  font-style: italic;
  font-size: 12px;
}

.chat-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #eee;
  background: white;
}

input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  margin-right: 10px;
  outline: none;
  transition: border 0.3s;
}

input:focus {
  border-color: #00b14f;
}

button {
  padding: 0 20px;
  background: #00b14f;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

button:hover {
  background: #009e46;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>