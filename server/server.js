import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// Cấu hình kết nối DB
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

// --- API ĐĂNG KÝ ---
app.post('/register', (req, res) => {
  const { fullname, username, password } = req.body;
  if (!username || !password || !fullname) {
    return res.status(400).json({ message: "Thiếu thông tin đăng ký" });
  }

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

// --- API ĐĂNG NHẬP (QUAN TRỌNG: Kiểm tra fullname) ---
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Truy vấn lấy chính xác cột fullname (viết thường) từ bảng accounts
  const sql = "SELECT account_id, username, fullname, role, avatar_url FROM accounts WHERE username = ? AND password = ?";
  
  pool.query(sql, [username, password], (err, data) => {
    if (err) {
      console.error("❌ Lỗi truy vấn Login:", err.message);
      return res.status(500).json({ message: "Lỗi Server" });
    }

    if (data.length > 0) {
      // DEBUG: In ra console để xem DB có trả về fullname không
      console.log("✅ Đăng nhập thành công. Dữ liệu từ DB:", data[0]);

      return res.json({
        status: "Success",
        user: data[0] // Trả về data[0] chứa fullname
      });
    } else {
      return res.status(401).json({ status: "Fail", message: "Sai tài khoản hoặc mật khẩu" });
    }
  });
});

// --- API CẬP NHẬT ẢNH ĐẠI DIỆN ---
app.post('/api/update-avatar', async (req, res) => {
  try {
    const { account_id, avatar_data } = req.body;
    const sql = "UPDATE accounts SET avatar_url = ? WHERE account_id = ?";
    await poolP.query(sql, [avatar_data, account_id]);
    return res.json({ status: 'success', message: 'Đã lưu ảnh' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Lỗi server' });
  }
});

// (Các API driver và order khác giữ nguyên...)

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});