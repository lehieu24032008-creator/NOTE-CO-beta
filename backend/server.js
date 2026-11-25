import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import db from "./db/database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const JWT_SECRET = process.env.JWT_SECRET || "note_and_co_secret_key_2026";
const PORT = Number(process.env.PORT || 3000);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(rootDir));

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

function withTransaction(fn) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

function mapProduct(row) {
  return {
    ...row,
    image: row.image_url,
  };
}

function getUserCart(userId) {
  const rows = db
    .prepare(
      `SELECT c.product_id, c.quantity, p.name, p.brand, p.price, p.unit, p.color, p.image_url, p.stock,
              (c.quantity * p.price) AS subtotal
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?
       ORDER BY c.id ASC`,
    )
    .all(userId);

  return rows.map((r) => ({
    ...r,
    id: r.product_id,
    qty: r.quantity,
    image: r.image_url,
  }));
}

// 1. Health check
app.get("/api/health", (req, res) => {
  db.prepare("SELECT 1").get();
  res.json({ status: "ok", database: "sqlite" });
});

// 2. Sản phẩm & Bộ sưu tập
app.get("/api/products", (req, res) => {
  const { category, search, sort } = req.query;
  const conditions = [];
  const params = [];

  if (category && category !== "Tất cả") {
    conditions.push("category = ?");
    params.push(category);
  }
  if (search && search.trim()) {
    const kw = `%${search.trim().toLowerCase()}%`;
    conditions.push("(LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(category) LIKE ?)");
    params.push(kw, kw, kw);
  }

  let orderBy = "ORDER BY id ASC";
  if (sort === "priceAsc") orderBy = "ORDER BY price ASC, id ASC";
  if (sort === "priceDesc") orderBy = "ORDER BY price DESC, id ASC";

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = db.prepare(`SELECT * FROM products ${where} ${orderBy}`).all(...params);
  res.json(rows.map(mapProduct));
});

app.get("/api/products/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(Number(req.params.id));
  if (!row) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  res.json(mapProduct(row));
});

app.get("/api/collections", (req, res) => {
  const cols = db.prepare("SELECT * FROM collections").all();
  const stmtProducts = db.prepare(
    "SELECT product_id FROM collection_products WHERE collection_id = ? ORDER BY sort_order ASC",
  );
  const result = cols.map((c) => ({
    id: c.id,
    name: c.name,
    desc: c.description,
    color: c.color,
    accent: c.accent,
    productIds: stmtProducts.all(c.id).map((r) => r.product_id),
  }));
  res.json(result);
});

// 3. Đăng ký & Đăng nhập
app.post("/api/auth/register", async (req, res) => {
  const full_name = String(req.body.full_name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Email không hợp lệ" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Mật khẩu tối thiểu 6 ký tự" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const info = db
      .prepare("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)")
      .run(full_name, email, hash);
    const user = { id: Number(info.lastInsertRowid), full_name, email };
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      return res.status(409).json({ message: "Email đã được sử dụng" });
    }
    res.status(500).json({ message: "Lỗi server" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!email || !password) {
    return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
  }

  const safeUser = { id: user.id, full_name: user.full_name, email: user.email };
  res.json({ token: signToken(safeUser), user: safeUser });
});

app.get("/api/auth/me", auth, (req, res) => {
  const user = db
    .prepare("SELECT id, full_name, email, created_at FROM users WHERE id = ?")
    .get(req.user.id);
  if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" });
  res.json(user);
});

// 4. Giỏ hàng
app.get("/api/cart", auth, (req, res) => {
  res.json(getUserCart(req.user.id));
});

app.post("/api/cart", auth, (req, res) => {
  const productId = Number(req.body.product_id);
  const quantity = Math.max(1, Number(req.body.quantity || 1));

  const product = db.prepare("SELECT id, stock FROM products WHERE id = ?").get(productId);
  if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

  const existing = db
    .prepare("SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?")
    .get(req.user.id, productId);
  const newQty = (existing ? existing.quantity : 0) + quantity;
  if (newQty > product.stock) {
    return res.status(400).json({ message: "Số lượng vượt quá tồn kho" });
  }

  db.prepare(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = quantity + excluded.quantity`,
  ).run(req.user.id, productId, quantity);

  res.status(201).json({ message: "Đã cập nhật giỏ hàng", items: getUserCart(req.user.id) });
});

app.post("/api/cart/sync", auth, (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  withTransaction(() => {
    const upsert = db.prepare(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = MAX(cart_items.quantity, excluded.quantity)`,
    );
    const getProd = db.prepare("SELECT id, stock FROM products WHERE id = ?");
    for (const item of items) {
      const pid = Number(item.product_id || item.id);
      const qty = Number(item.quantity || item.qty || 0);
      if (!pid || qty <= 0) continue;
      const prod = getProd.get(pid);
      if (!prod || prod.stock <= 0) continue;
      upsert.run(req.user.id, pid, Math.min(qty, prod.stock));
    }
  });
  res.json(getUserCart(req.user.id));
});

app.patch("/api/cart/:productId", auth, (req, res) => {
  const productId = Number(req.params.productId);
  const quantity = Number(req.body.quantity);

  if (quantity <= 0) {
    db.prepare("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?").run(
      req.user.id,
      productId,
    );
  } else {
    const product = db.prepare("SELECT stock FROM products WHERE id = ?").get(productId);
    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    if (quantity > product.stock) {
      return res.status(400).json({ message: "Số lượng vượt quá tồn kho" });
    }
    db.prepare("UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?").run(
      quantity,
      req.user.id,
      productId,
    );
  }

  res.json({ message: "Đã cập nhật số lượng", items: getUserCart(req.user.id) });
});

app.delete("/api/cart/:productId", auth, (req, res) => {
  db.prepare("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?").run(
    req.user.id,
    Number(req.params.productId),
  );
  res.json({ message: "Đã xóa khỏi giỏ hàng", items: getUserCart(req.user.id) });
});

// 5. Yêu thích (Wishlist)
app.get("/api/wishlist", auth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT p.* FROM wishlist_items w
       JOIN products p ON p.id = w.product_id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
    )
    .all(req.user.id);
  res.json({
    productIds: rows.map((r) => r.id),
    items: rows.map(mapProduct),
  });
});

app.post("/api/wishlist/:productId", auth, (req, res) => {
  const productId = Number(req.params.productId);
  const product = db.prepare("SELECT id FROM products WHERE id = ?").get(productId);
  if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

  const existing = db
    .prepare("SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?")
    .get(req.user.id, productId);

  if (existing) {
    db.prepare("DELETE FROM wishlist_items WHERE id = ?").run(existing.id);
    return res.json({ wishlisted: false });
  }
  db.prepare("INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)").run(
    req.user.id,
    productId,
  );
  res.status(201).json({ wishlisted: true });
});

// 6. Đặt hàng (Checkout) & Lịch sử đơn hàng
app.post("/api/orders/checkout", auth, (req, res) => {
  const shippingAddress = String(req.body.shipping_address || "").trim();
  const note = String(req.body.note || "").trim();
  const paymentMethod = String(req.body.payment_method || "cod").trim();
  if (!shippingAddress) {
    return res.status(400).json({ message: "Vui lòng nhập địa chỉ giao hàng" });
  }
  if (paymentMethod !== "cod" && paymentMethod !== "momo") {
    return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });
  }

  try {
    const order = withTransaction(() => {
      const items = db
        .prepare(
          `SELECT c.product_id, c.quantity, p.name, p.price, p.stock
           FROM cart_items c
           JOIN products p ON p.id = c.product_id
           WHERE c.user_id = ?`,
        )
        .all(req.user.id);

      if (items.length === 0) {
        const err = new Error("Giỏ hàng đang trống");
        err.status = 400;
        throw err;
      }

      let total = 0;
      for (const item of items) {
        if (item.stock < item.quantity) {
          const err = new Error(`Sản phẩm "${item.name}" không đủ tồn kho`);
          err.status = 400;
          throw err;
        }
        total += Number(item.price) * item.quantity;
      }

      const orderRes = db
        .prepare(
          "INSERT INTO orders (user_id, total_amount, shipping_address, note, payment_method) VALUES (?, ?, ?, ?, ?)",
        )
        .run(req.user.id, total, shippingAddress, note, paymentMethod);
      const orderId = Number(orderRes.lastInsertRowid);

      const insertOrderItem = db.prepare(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
      );
      const updateStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");

      for (const item of items) {
        insertOrderItem.run(orderId, item.product_id, item.quantity, item.price);
        updateStock.run(item.quantity, item.product_id);
      }

      db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(req.user.id);

      // Nếu thanh toán online, chuyển hướng đến trang QR thanh toán của cửa hàng
      let paymentUrl = null;
      if (paymentMethod === "momo") {
        paymentUrl = `${process.env.BASE_URL || "http://localhost:3000"}/payment/qr?orderId=${orderId}`;
      }

      return { order_id: orderId, total_amount: total, status: "pending", payment_method: paymentMethod, payment_url: paymentUrl };
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Lỗi khi tạo đơn hàng" });
  }
});

// Webhook / IPN từ cổng thanh toán (MoMo/VNPay...)
app.post("/api/payment/webhook", (req, res) => {
  // Trong môi trường production, cần xác thực chữ ký (signature/checksum) từ cổng thanh toán
  // Ở đây mô phỏng: nhận order_id và status từ body
  const { orderId, status, signature } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ message: "Thiếu thông tin webhook" });
  }

  const order = db.prepare("SELECT id, status FROM orders WHERE id = ?").get(Number(orderId));
  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  // Chỉ cập nhật nếu đơn đang pending và status webhook là paid
  if (order.status === "pending" && status === "paid") {
    db.prepare("UPDATE orders SET status = 'paid' WHERE id = ?").run(Number(orderId));
    return res.json({ message: "Cập nhật trạng thái thanh toán thành công", order_id: Number(orderId), status: "paid" });
  }

  res.json({ message: "Không có thay đổi trạng thái", order_id: Number(orderId), current_status: order.status });
});

// Trang hiển thị mã QR thanh toán MoMo (thay vì redirect sang cổng bên ngoài)
app.get("/payment/qr", (req, res) => {
  const { orderId } = req.query;
  const order = orderId ? db.prepare("SELECT id, total_amount, status FROM orders WHERE id = ?").get(Number(orderId)) : null;
  if (!order) {
    res.send("<h1>Không tìm thấy đơn hàng</h1><a href='/'>Về trang chủ</a>");
    return;
  }
  if (order.status === "paid") {
    res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Đã thanh toán — NOTE&CO</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
  <style>
    *{box-sizing:border-box}body{margin:0;background:#fbfaf7;color:#18211f;font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
    .card{background:#fff;border-radius:16px;padding:40px 32px;box-shadow:0 20px 60px rgba(24,33,31,0.14);text-align:center;max-width:420px;width:92%}
    .icon{font-size:48px;margin-bottom:16px}
    h1{font:'Plus Jakarta Sans',sans-serif;margin:0 0 8px;font-size:24px;letter-spacing:-0.04em}
    p{color:#69716f;margin:0 0 20px;font-size:14px}
    .order-id{font-weight:700;color:#18211f}
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#18211f;color:#fff;border:none;border-radius:8px;padding:12px 24px;font-weight:700;font-size:13px;text-decoration:none;margin-top:12px}
    .btn:hover{background:#34403c}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>Đã thanh toán thành công</h1>
    <p>Đơn hàng #${order.id} đã được xác nhận. Cảm ơn bạn đã mua sắm tại NOTE&CO!</p>
    <a href="/" class="btn">Tiếp tục mua sắm</a>
  </div>
</body>
</html>`);
    return;
  }
  res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thanh toán MoMo — NOTE&CO</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
  <style>
    *{box-sizing:border-box}body{margin:0;background:#fbfaf7;color:#18211f;font-family:'DM Sans',sans-serif}
    .page{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:24px}
    .card{background:#fff;border-radius:16px;padding:32px;box-shadow:0 20px 60px rgba(24,33,31,0.14);text-align:center;max-width:420px;width:100%}
    .brand{font:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:28px;letter-spacing:-0.04em;margin-bottom:8px}
    .brand span{color:#ef5d3b}
    .subtitle{color:#69716f;font-size:13px;margin-bottom:24px}
    .qr-box{border:2px solid #f4c5a9;border-radius:16px;padding:16px;display:inline-block;background:#fff;margin-bottom:20px}
    .qr-box img{display:block;width:260px;height:260px;border-radius:12px}
    .amount{font:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:20px;color:#18211f;margin:8px 0 4px}
    .order-id{color:#69716f;font-size:12px;margin-bottom:20px}
    .account-info{background:#f4c5a9;border-radius:12px;padding:16px;margin-bottom:20px;text-align:left}
    .account-info p{margin:4px 0;color:#18211f;font-size:13px}
    .account-info strong{color:#d94848}
    .btn-confirm{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#ef5d3b;color:#fff;border:none;border-radius:8px;padding:14px 24px;font-weight:700;font-size:14px;text-decoration:none;width:100%;margin-bottom:12px}
    .btn-confirm:hover{background:#d94848}
    .btn-back{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:transparent;color:#69716f;border:1px solid #dfe3de;border-radius:8px;padding:12px 24px;font-weight:600;font-size:13px;text-decoration:none;width:100%}
    .btn-back:hover{border-color:#18211f;color:#18211f}
    .note{font-size:11px;color:#aab3ae;margin-top:16px}
  </style>
</head>
<body>
  <div class="page">
    <div class="card">
      <div class="brand">NOTE<span class="brand"> &</span>CO</div>
      <div class="subtitle">Thanh toán qua MoMo</div>
      <div class="qr-box">
        <img src="/assets/qr-momo.png" alt="Mã QR thanh toán MoMo" />
      </div>
      <div class="amount">${Number(order.total_amount).toLocaleString("vi-VN")}đ</div>
      <div class="order-id">Đơn hàng #${order.id}</div>
      <div class="account-info">
        <p><strong>Chủ tài khoản:</strong> LE MINH HIEU</p>
        <p><strong>Nội dung:</strong> Thanh toán đơn hàng #${order.id} tại NOTE&CO</p>
      </div>
      <a class="btn-confirm" id="btnConfirm">Tôi đã thanh toán</a>
      <a class="btn-back" href="/">Về trang chủ</a>
      <p class="note">Sau khi quét QR và thanh toán xong, nhấn nút bên dưới để xác nhận đơn hàng.</p>
    </div>
  </div>
  <script>
    document.getElementById('btnConfirm').addEventListener('click', async () => {
      const res = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ orderId: ${order.id} })
      });
      const data = await res.json();
      if (data.status === 'paid') {
        location.href = '/payment/qr?orderId=${order.id}';
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    });
  </script>
</body>
</html>`);
});

// Xác nhận thanh toán từ khách hàng (gọi sau khi quét QR xong)
app.post("/api/payment/confirm", (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ message: "Thiếu mã đơn hàng" });
  }
  const order = db.prepare("SELECT id, status FROM orders WHERE id = ?").get(Number(orderId));
  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }
  if (order.status !== "pending") {
    return res.json({ message: "Đơn hàng đã được cập nhật trước đó", status: order.status });
  }
  db.prepare("UPDATE orders SET status = 'paid' WHERE id = ?").run(Number(orderId));
  res.json({ message: "Cập nhật trạng thái thanh toán thành công", order_id: Number(orderId), status: "paid" });
});

app.get("/api/orders", auth, (req, res) => {
  const orders = db
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC")
    .all(req.user.id);

  const stmtItems = db.prepare(
    `SELECT oi.product_id, oi.quantity, oi.unit_price, p.name, p.brand, p.image_url
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?`,
  );

  const result = orders.map((o) => ({
    ...o,
    items: stmtItems.all(o.id).map((i) => ({ ...i, image: i.image_url })),
  }));
  res.json(result);
});

app.delete("/api/orders/:orderId", auth, (req, res) => {
  const orderId = Number(req.params.orderId);
  const order = db
    .prepare("SELECT id, status FROM orders WHERE id = ? AND user_id = ?")
    .get(orderId, req.user.id);
  if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  if (order.status !== "pending") {
    return res.status(400).json({ message: "Chỉ có thể hủy đơn hàng đang chờ xử lý" });
  }
  db.prepare("UPDATE orders SET status = 'cancelled' WHERE id = ?").run(orderId);
  res.json({ message: "Đã hủy đơn hàng", order_id: orderId, status: "cancelled" });
});

// Xóa vĩnh viễn đơn hàng đã hủy
app.delete("/api/orders/:orderId/remove", auth, (req, res) => {
  const orderId = Number(req.params.orderId);
  const order = db
    .prepare("SELECT id, status FROM orders WHERE id = ? AND user_id = ?")
    .get(orderId, req.user.id);
  if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  if (order.status !== "cancelled") {
    return res.status(400).json({ message: "Chỉ có thể xóa đơn hàng đã bị hủy" });
  }
  db.prepare("DELETE FROM orders WHERE id = ?").run(orderId);
  res.json({ message: "Đã xóa đơn hàng", order_id: orderId });
});

// 7. Newsletter
app.post("/api/newsletter", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Email không hợp lệ" });
  }
  db.prepare("INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)").run(email);
  res.json({ message: "Cảm ơn bạn đã đăng ký nhận tin!" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Lỗi server" });
});

app.listen(PORT, () => {
  console.log(`NOTE&CO API & Web đang chạy tại http://localhost:${PORT}`);
});
