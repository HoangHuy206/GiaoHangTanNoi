import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import OpenAI from 'openai';
import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';

// --- KIỂM TRA KEY ---
console.log("Kiểm tra API", process.env.GROQ_API_KEY ? "Đã nhận API ✅" : "Chưa thấy API ❌");

const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// ✅ CORS
app.use(cors({
  origin: FRONTEND_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ PARSE BODY
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CẤU HÌNH SOCKET.IO
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_ORIGINS,
    methods: ["GET", "POST"]
  }
});

// --- CẤU HÌNH DB ---
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER || 'vrQxVS7dzxo8oMs.root',
  password: process.env.DB_PASS || 'uJYJ22lA4RuWjTWx',
  database: process.env.DB_NAME || 'GiaoHangTanNoi',
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
const poolP = pool.promise();

// ==================================================================
// PHẦN 1: API HỆ THỐNG (AUTH & USER)
// ==================================================================

// 1. Đăng ký USER
app.post('/register', (req, res) => {
  const { fullname, username, password } = req.body;
  if (!username || !password || !fullname) return res.status(400).json({ message: "Thiếu thông tin" });

  const checkSql = "SELECT * FROM accounts WHERE username = ?";
  pool.query(checkSql, [username], (err, data) => {
    if (err) return res.status(500).json({ message: "Lỗi hệ thống" });
    if (data.length > 0) return res.status(409).json({ message: "Tên đăng nhập đã tồn tại!" });

    const insertSql = "INSERT INTO accounts (fullname, username, password, role, created_at) VALUES (?, ?, ?, 'user', NOW())";
    pool.query(insertSql, [fullname, username, password], (err) => {
      if (err) return res.status(500).json({ message: "Lỗi khi tạo tài khoản" });
      return res.status(200).json({ message: "Đăng ký thành công!" });
    });
  });
});

// 2. Đăng ký TÀI XẾ
app.post('/api/register-driver', (req, res) => {
  const tenDangNhap = (req.body.tenDangNhap || req.body.username || '').toString().trim();
  const matKhau     = (req.body.matKhau || req.body.password || '').toString().trim();
  const hoTen       = (req.body.hoTen || req.body.fullname || '').toString().trim();
  const email    = (req.body.email || '').toString().trim();
  const sdt      = (req.body.sdt || req.body.phone || '').toString().trim();
  const cccd     = (req.body.cccd || '').toString().trim();
  const gioiTinh = (req.body.gioiTinh || req.body.gender || 'Nam').toString().trim();
  const diaChi   = (req.body.diaChi || req.body.address || '').toString().trim();
  const phuongTien = (req.body.phuongTien || req.body.vehicle || '').toString().trim();

  if (!tenDangNhap || !matKhau || !hoTen) {
    return res.status(400).json({ message: "Vui lòng nhập đủ Tên đăng nhập, Mật khẩu và Họ tên." });
  }

  const checkSql = "SELECT * FROM Dang_ky_tai_xe WHERE ten_dang_nhap = ?";
  pool.query(checkSql, [tenDangNhap], (err, data) => {
    if (err) return res.status(500).json({ message: "Lỗi hệ thống kiểm tra trùng lặp." });
    if (data.length > 0) return res.status(409).json({ message: "Tên đăng nhập này đã được đăng ký!" });

    const insertSql = `INSERT INTO Dang_ky_tai_xe (ten_dang_nhap, mat_khau, ho_ten, email, sdt, cccd, gioi_tinh, dia_chi, phuong_tien, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    const params = [tenDangNhap, matKhau, hoTen, email, sdt, cccd, gioiTinh, diaChi, phuongTien];

    pool.query(insertSql, params, (err2) => {
      if (err2) return res.status(500).json({ message: "Lỗi Server: " + err2.message });
      return res.status(200).json({ message: "Đăng ký tài xế thành công! Hồ sơ đang chờ duyệt." });
    });
  });
});

// 3. Đăng nhập
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sqlAccount = "SELECT account_id, username, fullname, role, avatar_url FROM accounts WHERE username = ? AND password = ?";

  pool.query(sqlAccount, [username, password], (err, data) => {
    if (err) return res.status(500).json({ message: "Lỗi Server" });

    if (data.length > 0) {
      return res.json({ status: "Success", user: data[0] });
    } else {
      const sqlDriver = "SELECT * FROM Dang_ky_tai_xe WHERE ten_dang_nhap = ? AND mat_khau = ?";
      pool.query(sqlDriver, [username, password], (err2, dataDriver) => {
        if (err2) return res.status(500).json({ message: "Lỗi Server" });
        if (dataDriver.length > 0) {
          return res.status(403).json({ status: "Pending", message: "Tài khoản tài xế của bạn đang chờ duyệt." });
        } else {
          return res.status(401).json({ status: "Fail", message: "Sai tài khoản hoặc mật khẩu" });
        }
      });
    }
  });
});

app.post('/api/update-avatar', async (req, res) => {
  try {
    const { account_id, avatar_data } = req.body;
    await poolP.query("UPDATE accounts SET avatar_url = ? WHERE account_id = ?", [avatar_data, account_id]);
    return res.json({ status: 'success', message: 'Đã lưu ảnh' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Lỗi server' });
  }
});

// ... Các API Like món ăn ...
app.post('/api/like', (req, res) => {
  const { maNguoiDung, maQuan } = req.body;
  const sqlCheck = "SELECT * FROM YeuThichMonAn WHERE MaNguoiDung = ? AND MaQuan = ?";
  pool.query(sqlCheck, [maNguoiDung, maQuan], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length > 0) {
      const sqlDelete = "DELETE FROM YeuThichMonAn WHERE MaNguoiDung = ? AND MaQuan = ?";
      pool.query(sqlDelete, [maNguoiDung, maQuan], (err2) => {
        if (err2) return res.status(500).json(err2);
        return res.json({ message: "Đã bỏ yêu thích", status: false });
      });
    } else {
      const sqlInsert = "INSERT INTO YeuThichMonAn (MaNguoiDung, MaQuan) VALUES (?, ?)";
      pool.query(sqlInsert, [maNguoiDung, maQuan], (err2) => {
        if (err2) return res.status(500).json(err2);
        return res.json({ message: "Đã thêm yêu thích", status: true });
      });
    }
  });
});

app.get('/api/like/:userId', (req, res) => {
  const userId = req.params.userId;
  const sql = `SELECT Q.* FROM QuanAn Q JOIN YeuThichMonAn YT ON Q.MaQuan = YT.MaQuan WHERE YT.MaNguoiDung = ? ORDER BY YT.NgayThem DESC`;
  pool.query(sql, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

app.get('/api/check-like', (req, res) => {
  const { userId, foodId } = req.query;
  const sql = "SELECT * FROM YeuThichMonAn WHERE MaNguoiDung = ? AND MaQuan = ?";
  pool.query(sql, [userId, foodId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json({ isLiked: data.length > 0 });
  });
});

// ==================================================================
// PHẦN 2: API ĐƠN HÀNG (ĐÃ CẬP NHẬT TỌA ĐỘ)
// ==================================================================

// API TẠO ĐƠN HÀNG
app.post('/api/orders', (req, res) => {
  const {
    ma_don_hang, tai_khoan_khach, ten_khach_hang,
    ten_mon_an, tong_tien, ten_quan,
    dia_chi_quan, dia_chi_giao,
    vi_do_giao, kinh_do_giao, lat_tra, lng_tra, // Nhận cả 2 trường hợp
    lat_don, lng_don
  } = req.body;

  // Lấy tọa độ chuẩn hóa
  const finalLatGiao = lat_tra || vi_do_giao;
  const finalLngGiao = lng_tra || kinh_do_giao;

  // Insert vào DB với đầy đủ thông tin tọa độ
  const sql = `INSERT INTO don_hang 
    (ma_don_hang, tai_khoan_khach, ten_khach_hang, ten_mon_an, tong_tien, ten_quan, dia_chi_quan, dia_chi_giao, vi_do_giao, kinh_do_giao, lat_don, lng_don, trang_thai, ngay_tao) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cho_xu_ly', NOW())`;
  
  const params = [
    ma_don_hang, tai_khoan_khach, ten_khach_hang, ten_mon_an, tong_tien, ten_quan, dia_chi_quan, dia_chi_giao, 
    finalLatGiao, finalLngGiao, lat_don, lng_don
  ];

  pool.query(sql, params, (err) => {
    if (err) {
      console.error("Lỗi tạo đơn:", err);
      // Fallback: Thử query cũ nếu DB chưa có cột lat_don
      const sqlBackup = `INSERT INTO don_hang (ma_don_hang, tai_khoan_khach, ten_khach_hang, ten_mon_an, tong_tien, ten_quan, dia_chi_quan, dia_chi_giao, vi_do_giao, kinh_do_giao, trang_thai, ngay_tao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cho_xu_ly', NOW())`;
      pool.query(sqlBackup, [ma_don_hang, tai_khoan_khach, ten_khach_hang, ten_mon_an, tong_tien, ten_quan, dia_chi_quan, dia_chi_giao, finalLatGiao, finalLngGiao], (err2) => {
          if (err2) return res.status(500).json({ message: "Lỗi DB" });
          return res.json({ message: "Đặt hàng thành công (Fallback)", orderId: ma_don_hang });
      });
    } else {
        return res.json({ message: "Đặt hàng thành công", orderId: ma_don_hang });
    }
  });
});

// API LẤY CHI TIẾT ĐƠN (Đã sửa JOIN với bảng Tài Xế)
app.get('/api/orders/:maDon', (req, res) => {
    const { maDon } = req.params;
    
    // [SỬA QUAN TRỌNG]: Join với bảng Dang_ky_tai_xe để lấy tên, sđt
    const sql = `
        SELECT 
            d.*, 
            t.ho_ten as driver_name, 
            t.sdt as driver_phone, 
            t.phuong_tien as driver_plate,
            t.avatar as driver_avatar
        FROM don_hang d
        LEFT JOIN Dang_ky_tai_xe t ON d.id_tai_xe = t.id
        WHERE d.ma_don_hang = ?
    `;

    pool.query(sql, [maDon], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length > 0) {
            const order = data[0];
            // Format lại dữ liệu trả về cho Frontend
            const responseData = {
                ...order,
                driver: order.id_tai_xe ? {
                    name: order.driver_name,
                    phone: order.driver_phone,
                    plate: order.driver_plate,
                    avatar: order.driver_avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'
                } : null
            };
            return res.json(responseData);
        }
        return res.status(404).json({ message: "Không tìm thấy đơn" });
    });
});

// API LẤY DANH SÁCH ĐƠN MỚI (Cho tài xế xem)
app.get('/api/orders', (req, res) => {
  const sql = "SELECT * FROM don_hang WHERE trang_thai = 'cho_xu_ly' ORDER BY ngay_tao DESC";
  pool.query(sql, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

// ==================================================================
// PHẦN 3: SOCKET.IO - REALTIME (ĐÃ CẬP NHẬT)
// ==================================================================
io.on('connection', (socket) => {
  console.log('⚡ Có người kết nối Socket:', socket.id);

  // Tài xế kết nối
  socket.on('driver_connect', () => {
    socket.join('drivers_room');
    console.log('🛵 Tài xế đã vào phòng chờ đơn');
  });

  // Khách hàng kết nối theo dõi đơn
  socket.on('khach_vao_theo_doi', (maDonHang) => {
    console.log(`👀 Khách đang theo dõi đơn: ${maDonHang}`);
    socket.join(`order_${maDonHang}`);
  });

  // 1. Có đơn mới -> Báo cho tài xế
  socket.on('place_order', (orderData) => {
    console.log('📦 Có đơn hàng mới:', orderData.ma_don_hang);
    io.to('drivers_room').emit('new_order_available', orderData);
  });

  // 2. Tài xế NHẬN ĐƠN -> Báo cho khách
  socket.on('driver_accept_order', async (data) => {
    console.log(`✅ Tài xế nhận đơn ${data.ma_don_hang}`);
    
    // Cập nhật DB: tai_xe_nhan (accepted)
    try {
      const updateSql = "UPDATE don_hang SET trang_thai = 'tai_xe_nhan', id_tai_xe = ? WHERE ma_don_hang = ?";
      await poolP.query(updateSql, [data.id_tai_xe || 1, data.ma_don_hang]);
    } catch (err) { console.error("DB Update Error:", err); }

    // Gửi Socket cho Khách
    io.to(`order_${data.ma_don_hang}`).emit('order_accepted', {
      driver: data.thong_tin_tai_xe,
      current_location: data.vi_tri_tai_xe
    });
  });

  // 3. [MỚI] Tài xế CẬP NHẬT TRẠNG THÁI (Đã lấy hàng / Giao xong)
  socket.on('driver_update_status', async (data) => {
      const { maDon, status } = data; // status: 'shipping' | 'completed'
      console.log(`🔄 Đơn ${maDon} đổi trạng thái -> ${status}`);

      // Update DB
      try {
          // Map status socket sang status DB
          let dbStatus = status; 
          if(status === 'shipping') dbStatus = 'dang_giao';
          if(status === 'completed') dbStatus = 'hoan_thanh';

          const sql = "UPDATE don_hang SET trang_thai = ? WHERE ma_don_hang = ?";
          await poolP.query(sql, [dbStatus, maDon]);
      } catch (e) { console.error(e); }

      // Báo cho khách hàng
      io.to(`order_${maDon}`).emit('order_status_change', { status: status });
  });

  // 4. Tài xế DI CHUYỂN
  socket.on('update_location', (data) => {
    // data: { ma_don_hang, lat, lng }
    io.to(`order_${data.ma_don_hang}`).emit('driver_moved', { lat: data.lat, lng: data.lng });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// ==================================================================
// PHẦN 4: LOGIC AI THÔNG MINH (CHATBOT)
// ==================================================================
async function traCuuDonHangDB(maDon) {
  try {
    const [rows] = await poolP.query(`SELECT * FROM don_hang WHERE ma_don_hang = ? LIMIT 1`, [maDon]);
    if (rows.length > 0) {
      let donHang = rows[0];
      donHang.thong_tin_lien_he = {
        phone: "0909.123.456",
        email: "hotro@giaohangtannoi.com",
        dia_chi: donHang.dia_chi_quan || "Địa chỉ quán chưa cập nhật"
      };
      return JSON.stringify(donHang);
    }
    return JSON.stringify({ status: "not_found", message: "Không tìm thấy mã đơn này." });
  } catch (e) {
    return JSON.stringify({ error: e.message });
  }
}

async function layDonCuaUser(username) {
  console.log(`🔍 Đang tìm đơn hàng của user: ${username}`);
  try {
    const sql = `SELECT ma_don_hang, ten_mon_an, tong_tien, trang_thai FROM don_hang WHERE tai_khoan_khach = ?`;
    const [rows] = await poolP.query(sql, [username]);
    if (rows.length > 0) return JSON.stringify({ has_order: true, count: rows.length, orders: rows });
    return JSON.stringify({ has_order: false, message: "Người dùng này chưa có đơn hàng nào." });
  } catch (e) {
    return JSON.stringify({ error: e.message });
  }
}

const tools = [
  {
    type: "function",
    function: {
      name: "tra_cuu_don_hang",
      description: "Tra cứu chi tiết một đơn hàng cụ thể khi biết mã đơn.",
      parameters: {
        type: "object",
        properties: { ma_don: { type: "string" } },
        required: ["ma_don"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "lay_ds_don_cua_toi",
      description: "Lấy danh sách đơn hàng của người dùng hiện tại.",
      parameters: {
        type: "object",
        properties: { username: { type: "string", description: "Username của người dùng" } },
        required: ["username"],
      },
    },
  },
];

app.post('/api/chat', async (req, res) => {
  const { message, history, currentUser } = req.body;
  try {
    let systemContent = "Bạn là trợ lý ảo Giao Hàng. ";
    if (currentUser && currentUser.fullname) {
      systemContent += `Bạn đang chat với khách tên "${currentUser.fullname}" (${currentUser.username}).`;
    } else {
      systemContent += "Khách hàng chưa đăng nhập.";
    }

    const messages = [
      { role: "system", content: systemContent },
      ...(history || []),
      { role: "user", content: message }
    ];

    const completion = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools,
      tool_choice: "auto"
    });

    const responseMessage = completion.choices[0].message;

    if (responseMessage.tool_calls) {
      const toolCall = responseMessage.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);
      let toolResult = "";

      if (toolCall.function.name === "tra_cuu_don_hang") toolResult = await traCuuDonHangDB(args.ma_don);
      else if (toolCall.function.name === "lay_ds_don_cua_toi") toolResult = await layDonCuaUser(args.username);

      messages.push(responseMessage);
      messages.push({ role: "tool", tool_call_id: toolCall.id, content: toolResult });

      const secondResponse = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages
      });

      return res.json({ reply: secondResponse.choices[0].message.content });
    }

    res.json({ reply: responseMessage.content });
  } catch (error) {
    console.error("Lỗi AI:", error);
    res.status(500).json({ reply: "Xin lỗi, hệ thống AI đang quá tải." });
  }
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`🔌 Socket.io đã sẵn sàng!`);
});