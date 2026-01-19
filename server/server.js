// File: server/server.js
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

// =========================
// ENV (deploy lên hosting sẽ đổi trong biến môi trường)
// =========================
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// DB ENV (nếu bạn chưa set ENV thì dùng mặc định như bạn đang có)
const DB_HOST = process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com';
const DB_PORT = Number(process.env.DB_PORT || 4000);
const DB_USER = process.env.DB_USER || 'vrQxVS7dzxo8oMs.root';
const DB_PASS = process.env.DB_PASS || 'uJYJ22lA4RuWjTWx';
const DB_NAME = process.env.DB_NAME || 'GiaoHangTanNoi';

// =========================
// CORS
// =========================
app.use(cors({
  origin: FRONTEND_ORIGINS,
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(bodyParser.json());

// =========================
// CONFIG TABLE/COLUMN (nếu DB bạn khác tên -> đổi ở đây)
// =========================
const DRIVER_STATUS_TABLE = 'driver_status'; // bảng lưu online + vị trí
const ORDERS_TABLE = 'orders';               // bảng đơn hàng

const ORDER_COL = {
  id: 'id',
  status: 'status',
  createdAt: 'created_at',
  assignedDriverId: 'assigned_driver_id',

  // fields frontend tài xế đang dùng
  foodName: 'food_name',
  totalPrice: 'total_price',
  imageUrl: 'image_url',
  shopName: 'shop_name',
  pickupAddress: 'pickup_address',
  deliveryAddress: 'delivery_address',
  customerName: 'customer_name',
  shopLat: 'shop_lat',
  shopLng: 'shop_lng',

  // (tuỳ chọn) nếu bạn có toạ độ giao hàng để vẽ tiếp
  // dropLat: 'drop_lat',
  // dropLng: 'drop_lng',
};

const RADIUS_KM = 3;

// =========================
// KẾT NỐI DB
// =========================
const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
const poolP = pool.promise();

// Kiểm tra kết nối
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Lỗi kết nối TiDB:', err.message);
  } else {
    console.log('✅ Đã kết nối DB OK (Pool)!');
    connection.release();
  }
});

app.get('/', (req, res) => {
  res.send("Server Node.js đang chạy ngon lành!");
});

// =========================
// HAVERSINE (km)
// =========================
function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

// ====================================================
// NEW: API tài xế bật hoạt động + cập nhật vị trí
// POST /api/driver/online { driverId, lat, lng }
// ====================================================
app.post('/api/driver/online', async (req, res) => {
  try {
    const { driverId, lat, lng } = req.body;
    if (!driverId || lat == null || lng == null) {
      return res.status(400).json({ ok: false, message: 'Thiếu driverId/lat/lng' });
    }

    const sql = `
      INSERT INTO ${DRIVER_STATUS_TABLE} (driver_id, is_online, lat, lng, updated_at)
      VALUES (?, 1, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        is_online=1, lat=VALUES(lat), lng=VALUES(lng), updated_at=NOW()
    `;
    await poolP.query(sql, [driverId, lat, lng]);

    return res.json({ ok: true });
  } catch (err) {
    console.error('❌ /api/driver/online:', err.message);
    return res.status(500).json({ ok: false, message: 'Lỗi server' });
  }
});

// ====================================================
// NEW: API tài xế tắt hoạt động
// POST /api/driver/offline { driverId }
// ====================================================
app.post('/api/driver/offline', async (req, res) => {
  try {
    const { driverId } = req.body;
    if (!driverId) {
      return res.status(400).json({ ok: false, message: 'Thiếu driverId' });
    }

    await poolP.query(
      `UPDATE ${DRIVER_STATUS_TABLE} SET is_online=0, updated_at=NOW() WHERE driver_id=?`,
      [driverId]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error('❌ /api/driver/offline:', err.message);
    return res.status(500).json({ ok: false, message: 'Lỗi server' });
  }
});

// ====================================================
// NEW: API tìm đơn trong bán kính 3km
// GET /api/find-order?driverId=1&lat=...&lng=...
// ====================================================
app.get('/api/find-order', async (req, res) => {
  try {
    const driverId = Number(req.query.driverId);
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if (!driverId || Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Thiếu driverId/lat/lng' });
    }

    // driver phải online
    const [st] = await poolP.query(
      `SELECT is_online FROM ${DRIVER_STATUS_TABLE} WHERE driver_id=? LIMIT 1`,
      [driverId]
    );
    if (!st.length || st[0].is_online !== 1) {
      return res.json({ success: false });
    }

    // lấy đơn pending
    const [orders] = await poolP.query(
      `SELECT *
       FROM ${ORDERS_TABLE}
       WHERE ${ORDER_COL.status}='pending'
       ORDER BY ${ORDER_COL.createdAt} ASC
       LIMIT 50`
    );

    if (!orders.length) return res.json({ success: false });

    let chosen = null;

    for (const o of orders) {
      const shopLat = Number(o[ORDER_COL.shopLat]);
      const shopLng = Number(o[ORDER_COL.shopLng]);
      if (Number.isNaN(shopLat) || Number.isNaN(shopLng)) continue;

      const d = haversineKm(lat, lng, shopLat, shopLng);
      if (d <= RADIUS_KM) {
        chosen = { ...o, distance_km: Number(d.toFixed(2)) };
        break;
      }
    }

    if (!chosen) return res.json({ success: false });

    // gán đơn (chống tranh chấp)
    const [upd] = await poolP.query(
      `UPDATE ${ORDERS_TABLE}
       SET ${ORDER_COL.status}='offered', ${ORDER_COL.assignedDriverId}=?
       WHERE ${ORDER_COL.id}=? AND ${ORDER_COL.status}='pending'`,
      [driverId, chosen[ORDER_COL.id]]
    );

    if (upd.affectedRows === 0) return res.json({ success: false });

    return res.json({
      success: true,
      order: {
        id: chosen[ORDER_COL.id],
        food_name: chosen[ORDER_COL.foodName],
        total_price: chosen[ORDER_COL.totalPrice],
        image_url: chosen[ORDER_COL.imageUrl],
        shop_name: chosen[ORDER_COL.shopName],
        pickup_address: chosen[ORDER_COL.pickupAddress],
        delivery_address: chosen[ORDER_COL.deliveryAddress],
        customer_name: chosen[ORDER_COL.customerName],
        shop_lat: chosen[ORDER_COL.shopLat],
        shop_lng: chosen[ORDER_COL.shopLng],
        distance_km: chosen.distance_km
      }
    });
  } catch (err) {
    console.error('❌ /api/find-order:', err.message);
    return res.json({ success: false });
  }
});

// ====================================================
// 1. API ĐĂNG KÝ USER (giữ nguyên)
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
    pool.query(insertSql, [username, password], (err) => {
      if (err) return res.status(500).json({ message: "Lỗi khi tạo tài khoản", error: err.message });
      return res.status(200).json({ message: "Đăng ký thành công!" });
    });
  });
});

// ====================================================
// 2. API ĐĂNG NHẬP (giữ nguyên)
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
// 3. API ĐĂNG KÝ TÀI XẾ (giữ nguyên)
// ====================================================
app.post('/api/register-driver', (req, res) => {
  const { username, password, fullName, email, phone, cccd, gender, address, vehicle } = req.body;

  const checkSql = "SELECT * FROM accounts WHERE username = ?";
  pool.query(checkSql, [username], (err, data) => {
    if (err) return res.status(500).json({ message: "Lỗi hệ thống khi kiểm tra tài khoản" });
    if (data.length > 0) return res.status(409).json({ message: "Tên đăng nhập đã tồn tại!" });

    const insertAccountSql = "INSERT INTO accounts (username, password, role, created_at) VALUES (?, ?, 'driver', NOW())";

    pool.query(insertAccountSql, [username, password], (err) => {
      if (err) {
        console.error("Lỗi tạo account:", err);
        return res.status(500).json({ message: "Lỗi khi tạo tài khoản đăng nhập" });
      }

      const insertProfileSql = `
        INSERT INTO Dang_ky_tai_xe
        (ho_ten, email, sdt, cccd, gioi_tinh, dia_chi, phuong_tien, ten_dang_nhap, mat_khau)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const profileValues = [fullName, email, phone, cccd, gender, address, vehicle, username, password];

      pool.query(insertProfileSql, profileValues, (err) => {
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

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log('✅ Allowed CORS Origins:', FRONTEND_ORIGINS);
});
