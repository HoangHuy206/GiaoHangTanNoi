// File: server/server.js
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

// Cấu hình CORS
app.use(cors({
    origin: 'http://localhost:5173', // Cho phép Frontend gọi API
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(bodyParser.json());

// --- CẤU HÌNH KẾT NỐI TIDB ---
const pool = mysql.createPool({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com', 
    port: 4000,
    user: 'vrQxVS7dzxo8oMs.root', 
    password: 'uJYJ22lA4RuWjTWx', 
    database: 'GiaoHangTanNoi',
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true 
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Lỗi kết nối TiDB:', err.message);
    } else {
        console.log('✅ Đã kết nối thành công với Database (Mode: Pool)!');
        connection.release();
    }
});

app.get('/', (req, res) => {
    res.send("Server Node.js đang chạy ngon lành!");
});

// ====================================================
// 1. API ĐĂNG KÝ TÀI KHOẢN USER THƯỜNG (Bảng accounts)
// ====================================================
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const checkSql = "SELECT * FROM accounts WHERE username = ?";
    pool.query(checkSql, [username], (err, data) => {
        if (err) return res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
        if (data.length > 0) return res.status(409).json({ message: "Tài khoản đã tồn tại!" });

        const insertSql = "INSERT INTO accounts (username, password, role, created_at) VALUES (?, ?, 'user', NOW())";
        pool.query(insertSql, [username, password], (err, result) => {
            if (err) return res.status(500).json({ message: "Lỗi khi tạo tài khoản", error: err.message });
            return res.status(200).json({ message: "Đăng ký thành công!" });
        });
    });
});

// ====================================================
// 2. API ĐĂNG NHẬP (Chung cho cả User và Tài xế)
// ====================================================
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`📩 Yêu cầu đăng nhập từ: ${username}`);

    const sql = "SELECT * FROM accounts WHERE username = ? AND password = ?";
    pool.query(sql, [username, password], (err, data) => {
        if (err) return res.status(500).json({ message: "Lỗi Server", error: err.message });
        
        if (data.length > 0) {
            return res.json({ 
                status: "Success", 
                role: data[0].role, 
                username: data[0].username 
            });
        } else {
            return res.status(401).json({ status: "Fail", message: "Sai tài khoản hoặc mật khẩu" });
        }
    });
});

// ====================================================
// 3. API ĐĂNG KÝ TÀI XẾ (CẬP NHẬT MỚI NHẤT)
// ====================================================
app.post('/api/register-driver', (req, res) => {
    // Nhận cả username, password và thông tin cá nhân
    const { username, password, fullName, email, phone, cccd, gender, address, vehicle } = req.body;

    // BƯỚC 1: Kiểm tra xem username đã tồn tại chưa (trong bảng accounts)
    const checkSql = "SELECT * FROM accounts WHERE username = ?";
    pool.query(checkSql, [username], (err, data) => {
        if (err) return res.status(500).json({ message: "Lỗi hệ thống khi kiểm tra tài khoản" });
        if (data.length > 0) return res.status(409).json({ message: "Tên đăng nhập đã tồn tại!" });

        // BƯỚC 2: Tạo tài khoản đăng nhập vào bảng 'accounts' (Role = 'driver')
        const insertAccountSql = "INSERT INTO accounts (username, password, role, created_at) VALUES (?, ?, 'driver', NOW())";
        
        pool.query(insertAccountSql, [username, password], (err, result) => {
            if (err) {
                console.error("Lỗi tạo account:", err);
                return res.status(500).json({ message: "Lỗi khi tạo tài khoản đăng nhập" });
            }

            // BƯỚC 3: Lưu hồ sơ chi tiết vào bảng 'Dang_ky_tai_xe' (Kèm username/pass để backup)
            const insertProfileSql = `
                INSERT INTO Dang_ky_tai_xe 
                (ho_ten, email, sdt, cccd, gioi_tinh, dia_chi, phuong_tien, ten_dang_nhap, mat_khau) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const profileValues = [fullName, email, phone, cccd, gender, address, vehicle, username, password];

            pool.query(insertProfileSql, profileValues, (err, result) => {
                if (err) {
                    console.error("❌ Lỗi lưu hồ sơ tài xế:", err);
                    return res.status(500).json({ error: 'Lỗi lưu hồ sơ chi tiết' });
                }
                
                console.log("✅ Đã tạo Account + Hồ sơ tài xế thành công cho:", username);
                res.status(200).json({ message: 'Đăng ký tài xế thành công' });
            });
        });
    });
});

app.listen(3000, () => {
    console.log("🚀 Server đang chạy tại http://localhost:3000");
});