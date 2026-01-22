import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
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
const httpServer = createServer(app); // Tạo HTTP Server bọc lấy Express

const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

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

app.use(cors({ origin: FRONTEND_ORIGINS, methods: ['GET', 'POST'], credentials: true }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// ==================================================================
// PHẦN 1: SOCKET.IO - REALTIME (TÀI XẾ & KHÁCH)
// ==================================================================
io.on('connection', (socket) => {
    console.log('⚡ Có người kết nối Socket:', socket.id);

    // 1. Tài xế online sẽ join vào phòng "drivers_room"
    socket.on('driver_connect', () => {
        socket.join('drivers_room');
        console.log('🛵 Tài xế đã vào phòng chờ đơn');
    });

    // 2. Khách hàng đặt đơn (Sau khi lưu API thành công)
    socket.on('place_order', (orderData) => {
        console.log('📦 Có đơn hàng mới:', orderData.ma_don_hang);
        // Gửi thông báo tới TẤT CẢ tài xế
        io.to('drivers_room').emit('new_order_available', orderData);
        // Khách join vào phòng riêng của đơn hàng này để nghe tin tức
        socket.join(`order_${orderData.ma_don_hang}`); 
    });

    // 3. Tài xế nhận đơn (Đã thêm logic lưu DB)
    socket.on('driver_accept_order', async (data) => {
        console.log(`✅ Tài xế nhận đơn ${data.ma_don_hang}`);
        
        try {
            // [QUAN TRỌNG] Cập nhật Database: Chuyển trạng thái sang 'dang_giao'
            // ID tài xế tạm thời để là 1 (hoặc lấy từ data gửi lên nếu có)
            const updateSql = "UPDATE don_hang SET trang_thai = 'dang_giao', id_tai_xe = ? WHERE ma_don_hang = ?";
            await poolP.query(updateSql, [1, data.ma_don_hang]);
            console.log("   -> Đã cập nhật trạng thái đơn trong DB");
        } catch (err) {
            console.error("   -> Lỗi cập nhật DB:", err);
        }

        // Báo cho người dùng biết
        io.to(`order_${data.ma_don_hang}`).emit('order_status_update', {
            status: 'confirmed',
            driver_info: data.thong_tin_tai_xe,
            location: data.vi_tri_tai_xe
        });
    });

    // 4. Cập nhật vị trí tài xế (Real-time tracking)
    socket.on('update_location', (data) => {
        // data gồm: ma_don_hang, lat, lng
        io.to(`order_${data.ma_don_hang}`).emit('driver_moved', {
            lat: data.lat,
            lng: data.lng
        });
    });

    // 5. Khách hàng vào trang theo dõi đơn (Reconnect)
    socket.on('khach_vao_theo_doi', (maDonHang) => {
        console.log(`👀 Khách đang theo dõi đơn: ${maDonHang}`);
        socket.join(`order_${maDonHang}`); 
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
    });
});

// ==================================================================
// PHẦN 2: CÁC API HỆ THỐNG
// ==================================================================

// 1. Đăng ký
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

// 2. Đăng nhập
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT account_id, username, fullname, role, avatar_url FROM accounts WHERE username = ? AND password = ?";
  
  pool.query(sql, [username, password], (err, data) => {
    if (err) { console.error("❌ Lỗi Login:", err.message); return res.status(500).json({ message: "Lỗi Server" }); }
    if (data.length > 0) {
      console.log("✅ Đăng nhập thành công:", data[0].username);
      return res.json({ status: "Success", user: data[0] });
    } else {
      return res.status(401).json({ status: "Fail", message: "Sai tài khoản/mật khẩu" });
    }
  });
});

// API 3: TẠO ĐƠN HÀNG
app.post('/api/orders', (req, res) => {
    const { 
        ma_don_hang, tai_khoan_khach, ten_khach_hang, 
        ten_mon_an, tong_tien, ten_quan, 
        dia_chi_quan, dia_chi_giao, vi_do_giao, kinh_do_giao 
    } = req.body;

    const sql = `INSERT INTO don_hang 
    (ma_don_hang, tai_khoan_khach, ten_khach_hang, ten_mon_an, tong_tien, ten_quan, dia_chi_quan, dia_chi_giao, vi_do_giao, kinh_do_giao, trang_thai, ngay_tao) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cho_xu_ly', NOW())`;

    pool.query(sql, [ma_don_hang, tai_khoan_khach, ten_khach_hang, ten_mon_an, tong_tien, ten_quan, dia_chi_quan, dia_chi_giao, vi_do_giao, kinh_do_giao], (err, result) => {
        if (err) {
            console.error("Lỗi tạo đơn:", err);
            return res.status(500).json({ message: "Lỗi tạo đơn hàng" });
        }
        return res.json({ message: "Đặt hàng thành công", orderId: ma_don_hang });
    });
});

// API 4: LẤY DANH SÁCH ĐƠN CHỜ (Cho tài xế)
app.get('/api/orders', (req, res) => {
    // Chỉ lấy đơn đang 'cho_xu_ly'
    const sql = "SELECT * FROM don_hang WHERE trang_thai = 'cho_xu_ly' ORDER BY ngay_tao DESC";
    pool.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// API Update Avatar
app.post('/api/update-avatar', async (req, res) => {
  try {
    const { account_id, avatar_data } = req.body;
    await poolP.query("UPDATE accounts SET avatar_url = ? WHERE account_id = ?", [avatar_data, account_id]);
    return res.json({ status: 'success', message: 'Đã lưu ảnh' });
  } catch (err) { return res.status(500).json({ status: 'error', message: 'Lỗi server' }); }
});

// API Yêu thích
app.post('/api/like', (req, res) => {
    const { maNguoiDung, maQuan } = req.body;
    const sqlCheck = "SELECT * FROM YeuThichMonAn WHERE MaNguoiDung = ? AND MaQuan = ?";
    pool.query(sqlCheck, [maNguoiDung, maQuan], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length > 0) {
            const sqlDelete = "DELETE FROM YeuThichMonAn WHERE MaNguoiDung = ? AND MaQuan = ?";
            pool.query(sqlDelete, [maNguoiDung, maQuan], (err) => {
                if (err) return res.status(500).json(err);
                return res.json({ message: "Đã bỏ yêu thích", status: false });
            });
        } else {
            const sqlInsert = "INSERT INTO YeuThichMonAn (MaNguoiDung, MaQuan) VALUES (?, ?)";
            pool.query(sqlInsert, [maNguoiDung, maQuan], (err) => {
                if (err) return res.status(500).json(err);
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
// PHẦN 3: LOGIC AI THÔNG MINH
// ==================================================================

// Tool 1: Tra cứu theo MÃ ĐƠN
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
    } catch (e) { return JSON.stringify({ error: e.message }); }
}

// Tool 2: Lấy danh sách đơn của USERNAME
async function layDonCuaUser(username) {
    console.log(`🔍 Đang tìm đơn hàng của user: ${username}`);
    try {
        const sql = `SELECT ma_don_hang, ten_mon_an, tong_tien, trang_thai FROM don_hang WHERE tai_khoan_khach = ?`;
        const [rows] = await poolP.query(sql, [username]);

        if (rows.length > 0) {
            return JSON.stringify({ 
                has_order: true, 
                count: rows.length, 
                orders: rows 
            });
        } else {
            return JSON.stringify({ has_order: false, message: "Người dùng này chưa có đơn hàng nào." });
        }
    } catch (e) { return JSON.stringify({ error: e.message }); }
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
                properties: { 
                    username: { type: "string", description: "Username của người dùng (AI tự lấy từ context)" } 
                },
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
            systemContent += `Bạn đang chat với khách hàng tên là "${currentUser.fullname}" (username: ${currentUser.username}). 
            - Hãy chào họ bằng tên thật thân thiện.
            - Nếu họ hỏi "đơn hàng của tôi", hãy dùng tool 'lay_ds_don_cua_toi' với username là '${currentUser.username}'.
            - Nếu kết quả trả về là không có đơn, hãy báo: "Hiện tại ${currentUser.fullname} chưa có đơn hàng nào".`;
        } else {
            systemContent += "Khách hàng chưa đăng nhập. Nếu họ hỏi về đơn cá nhân, hãy nhắc họ đăng nhập để kiểm tra.";
        }

        const messages = [
            { role: "system", content: systemContent },
            ...(history || []),
            { role: "user", content: message }
        ];

        const completion = await groqClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            tools: tools,
            tool_choice: "auto"
        });

        const responseMessage = completion.choices[0].message;

        if (responseMessage.tool_calls) {
            const toolCall = responseMessage.tool_calls[0];
            const args = JSON.parse(toolCall.function.arguments);
            let toolResult = "";

            if (toolCall.function.name === "tra_cuu_don_hang") {
                toolResult = await traCuuDonHangDB(args.ma_don);
            } else if (toolCall.function.name === "lay_ds_don_cua_toi") {
                toolResult = await layDonCuaUser(args.username);
            }

            messages.push(responseMessage);
            messages.push({ role: "tool", tool_call_id: toolCall.id, content: toolResult });

            const secondResponse = await groqClient.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: messages
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