// File: server/server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors()); 
app.use(bodyParser.json());

// --- CẤU HÌNH KẾT NỐI (ĐÃ SỬA SANG DÙNG POOL) ---
// Dùng createPool thay vì createConnection để không bị lỗi ngắt kết nối
const pool = mysql.createPool({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com', 
    port: 4000,
    user: 'vrQxVS7dzxo8oMs.root', 
    password: 'uJYJ22lA4RuWjTWx', // Mật khẩu của bạn
    database: 'GiaoHangTanNoi',
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    },
    // Các cấu hình giữ kết nối ổn định:
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối khi khởi động server
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Lỗi kết nối TiDB:', err.message);
    } else {
        console.log('✅ Đã kết nối thành công với Database (Mode: Pool)!');
        connection.release(); // Trả kết nối về hồ chứa
    }
});

// API ĐĂNG KÝ
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    
    // 1. Kiểm tra user tồn tại
    const checkSql = "SELECT * FROM accounts WHERE username = ?";
    pool.query(checkSql, [username], (err, data) => {
        if (err) {
            console.error("Lỗi Check User:", err);
            return res.status(500).json({ message: "Lỗi Server", error: err.message });
        }
        
        if (data.length > 0) return res.status(409).json({ message: "Tài khoản đã tồn tại!" });

        // 2. Tạo mới
        const insertSql = "INSERT INTO accounts (username, password, role, created_at) VALUES (?, ?, 'user', NOW())";
        pool.query(insertSql, [username, password], (err, data) => {
            if (err) {
                console.error("Lỗi Insert User:", err);
                return res.status(500).json({ message: "Lỗi khi tạo tài khoản", error: err.message });
            }
            return res.status(200).json({ message: "Đăng ký thành công!" });
        });
    });
});

// API ĐĂNG NHẬP
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    const sql = "SELECT * FROM accounts WHERE username = ? AND password = ?";
    pool.query(sql, [username, password], (err, data) => {
        if (err) {
            console.error("Lỗi Login:", err);
            return res.status(500).json({ message: "Lỗi Server", error: err.message });
        }
        
        if (data.length > 0) {
            return res.json({ status: "Success", role: data[0].role, user: data[0] });
        } else {
            return res.status(401).json({ status: "Fail", message: "Sai tài khoản hoặc mật khẩu" });
        }
    });
});

// Chạy server tại cổng 3000
app.listen(3000, () => {
    console.log("🚀 Server đang chạy tại http://localhost:3000");
});