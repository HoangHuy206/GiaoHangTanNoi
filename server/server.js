import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai'; 
import 'dotenv/config'; 

// --- KIỂM TRA KEY ---
console.log("Kiểm tra API", process.env.GROQ_API_KEY ? "Đã nhận API ✅" : "Chưa thấy API ❌");

const groqClient = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

const app = express();

const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

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
// PHẦN 1: CÁC API HỆ THỐNG (Auth, User, Favorite)
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

// 3. Cập nhật Avatar
app.post('/api/update-avatar', async (req, res) => {
  try {
    const { account_id, avatar_data } = req.body;
    await poolP.query("UPDATE accounts SET avatar_url = ? WHERE account_id = ?", [avatar_data, account_id]);
    return res.json({ status: 'success', message: 'Đã lưu ảnh' });
  } catch (err) { return res.status(500).json({ status: 'error', message: 'Lỗi server' }); }
});

// ------------------------------------------------------------------
// [MỚI] TÍNH NĂNG YÊU THÍCH / THẢ TIM (Đã thêm vào đây)
// ------------------------------------------------------------------

// API 1: Bấm Tim (Tự động Thêm hoặc Xóa)
app.post('/api/like', (req, res) => {
    const { maNguoiDung, maQuan } = req.body;

    // Kiểm tra xem đã like chưa
    const sqlCheck = "SELECT * FROM YeuThichMonAn WHERE MaNguoiDung = ? AND MaQuan = ?";
    
    pool.query(sqlCheck, [maNguoiDung, maQuan], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length > 0) {
            // Nếu có rồi -> XÓA (Bỏ like)
            const sqlDelete = "DELETE FROM YeuThichMonAn WHERE MaNguoiDung = ? AND MaQuan = ?";
            pool.query(sqlDelete, [maNguoiDung, maQuan], (err, data) => {
                if (err) return res.status(500).json(err);
                return res.json({ message: "Đã bỏ yêu thích", status: false });
            });
        } else {
            // Nếu chưa có -> THÊM MỚI (Like)
            const sqlInsert = "INSERT INTO YeuThichMonAn (MaNguoiDung, MaQuan) VALUES (?, ?)";
            pool.query(sqlInsert, [maNguoiDung, maQuan], (err, data) => {
                if (err) return res.status(500).json(err);
                return res.json({ message: "Đã thêm yêu thích", status: true });
            });
        }
    });
});

// API 2: Lấy danh sách yêu thích của User
app.get('/api/like/:userId', (req, res) => {
    const userId = req.params.userId;

    // ✅ Đã sửa thành bảng QuanAn
    const sql = `
        SELECT Q.* FROM QuanAn Q 
        JOIN YeuThichMonAn YT ON Q.MaQuan = YT.MaQuan 
        WHERE YT.MaNguoiDung = ?
        ORDER BY YT.NgayThem DESC
    `;

    pool.query(sql, [userId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// API 3: Kiểm tra trạng thái 1 món (để tô đỏ tim)
app.get('/api/check-like', (req, res) => {
    const { userId, foodId } = req.query;
    
    const sql = "SELECT * FROM YeuThichMonAn WHERE MaNguoiDung = ? AND MaQuan = ?";
    pool.query(sql, [userId, foodId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json({ isLiked: data.length > 0 });
    });
});


// ==================================================================
// PHẦN 2: LOGIC AI THÔNG MINH (CHÀO TÊN + TÌM ĐƠN CỦA TÔI)
// ==================================================================

// Tool 1: Tra cứu theo MÃ ĐƠN (Ví dụ: S123)
async function traCuuDonHangDB(maDon) {
    try {
        const [rows] = await poolP.query(`SELECT * FROM orders WHERE order_code = ? LIMIT 1`, [maDon]);
        if (rows.length > 0) {
            let donHang = rows[0];
            // Thông tin liên hệ giả lập
            donHang.shop_contact_info = {
                phone: "0909.123.456",
                email: `lienhe@${donHang.shop_name ? donHang.shop_name.replace(/\s/g, '').toLowerCase() : 'quan'}.com`,
                address: donHang.pickup_address || "Địa chỉ quán chưa cập nhật"
            };
            return JSON.stringify(donHang);
        }
        return JSON.stringify({ status: "not_found", message: "Không tìm thấy mã đơn này." });
    } catch (e) { return JSON.stringify({ error: e.message }); }
}

// Tool 2: Lấy danh sách đơn của USERNAME đang chat
async function layDonCuaUser(username) {
    console.log(`🔍 Đang tìm đơn hàng của user: ${username}`);
    try {
        const sql = `SELECT order_code, food_name, total_price, status, shipper_name FROM orders WHERE username = ?`;
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

// Định nghĩa Tools
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

// API Chat endpoint
app.post('/api/chat', async (req, res) => {
    const { message, history, currentUser } = req.body;

    try {
        // --- SYSTEM PROMPT ---
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

        // Gọi Groq lần 1
        const completion = await groqClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            tools: tools,
            tool_choice: "auto"
        });

        const responseMessage = completion.choices[0].message;

        // Xử lý gọi Tool
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

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});