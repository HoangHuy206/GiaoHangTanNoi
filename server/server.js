// File: server/server.js
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

// Cấu hình CORS chi tiết để tránh lỗi chặn kết nối từ trình duyệt
app.use(cors({
    origin: 'http://localhost:5173', // Port mặc định của Vite
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
        rejectUnauthorized: true // Giữ true nếu bạn có CA certificate, hoặc false nếu muốn test nhanh
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

// --- API ĐĂNG KÝ ---
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const checkSql = "SELECT * FROM accounts WHERE username = ?";
    pool.query(checkSql, [username], (err, data) => {
        if (err) {
            console.error("Lỗi Check User:", err);
            return res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
        }
        
        if (data.length > 0) return res.status(409).json({ message: "Tài khoản đã tồn tại!" });

        const insertSql = "INSERT INTO accounts (username, password, role, created_at) VALUES (?, ?, 'user', NOW())";
        pool.query(insertSql, [username, password], (err, result) => {
            if (err) {
                console.error("Lỗi Insert User:", err);
                return res.status(500).json({ message: "Lỗi khi tạo tài khoản", error: err.message });
            }
            return res.status(200).json({ message: "Đăng ký thành công!" });
        });
    });
});

// --- API ĐĂNG NHẬP ---
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`📩 Yêu cầu đăng nhập từ: ${username}`); // Log để theo dõi request

    const sql = "SELECT * FROM accounts WHERE username = ? AND password = ?";
    pool.query(sql, [username, password], (err, data) => {
        if (err) {
            console.error("Lỗi Login:", err);
            return res.status(500).json({ message: "Lỗi Server", error: err.message });
        }
        
        if (data.length > 0) {
            // Trả về role và user để Frontend xử lý logic điều hướng
            return res.json({ 
                status: "Success", 
                role: data[0].role, 
                username: data[0].username 
            });
        } else {
            // Trả về 401 khi sai thông tin
            return res.status(401).json({ status: "Fail", message: "Sai tài khoản hoặc mật khẩu" });
        }
    });
});

app.listen(3000, () => {
    console.log("🚀 Server đang chạy tại http://localhost:3000");
});