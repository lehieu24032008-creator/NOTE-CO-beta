import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import db from "./db/database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
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

function ensureWallet(userId) {
  db.prepare("INSERT OR IGNORE INTO wallet_accounts (user_id, coins) VALUES (?, 0)").run(userId);
  return db.prepare("SELECT coins, spin_multiplier FROM wallet_accounts WHERE user_id = ?").get(userId);
}

function awardOrderCoins(userId, orderId, total) {
  const coins = Math.ceil(Number(total) * 0.01);
  db.prepare("INSERT OR IGNORE INTO wallet_accounts (user_id, coins) VALUES (?, 0)").run(userId);
  const tx = db.prepare(
    `INSERT OR IGNORE INTO wallet_transactions (user_id, amount, type, reference_id, description)
     VALUES (?, ?, 'order_reward', ?, ?)`
  ).run(userId, coins, String(orderId), `Tích xu 1% từ đơn hàng #${orderId}`);
  if (tx.changes) db.prepare("UPDATE wallet_accounts SET coins = coins + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?").run(coins, userId);
  return coins;
}

function walletPayload(userId) {
  const completedCodOrders = db
    .prepare("SELECT id, total_amount FROM orders WHERE user_id = ? AND payment_method = 'cod' AND status = 'completed'")
    .all(userId);
  for (const order of completedCodOrders) {
    awardOrderCoins(userId, order.id, order.total_amount);
  }
  ensureWallet(userId);
  return db.prepare("SELECT coins, spin_multiplier FROM wallet_accounts WHERE user_id = ?").get(userId);
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

app.get("/api/wallet", auth, (req, res) => {
  const wallet = walletPayload(req.user.id);
  const transactions = db.prepare("SELECT amount, type, description, created_at FROM wallet_transactions WHERE user_id = ? ORDER BY id DESC LIMIT 8").all(req.user.id);
  const vouchers = db.prepare(`SELECT uv.code, uv.status, uv.created_at, v.title, v.discount_text FROM user_vouchers uv JOIN vouchers v ON v.id = uv.voucher_id WHERE uv.user_id = ? ORDER BY uv.id DESC`).all(req.user.id);
  res.json({ coins: wallet.coins, spin_multiplier: wallet.spin_multiplier, transactions, vouchers });
});

app.get("/api/wallet/vouchers", auth, (req, res) => {
  res.json(db.prepare("SELECT id, title, description, discount_text, cost, quantity FROM vouchers WHERE active = 1 AND quantity > 0 ORDER BY cost ASC").all());
});

app.post("/api/wallet/vouchers/:voucherId/redeem", auth, (req, res) => {
  try {
    const result = withTransaction(() => {
      const voucher = db.prepare("SELECT * FROM vouchers WHERE id = ? AND active = 1 AND quantity > 0").get(Number(req.params.voucherId));
      if (!voucher) { const e = new Error("Voucher không còn khả dụng"); e.status = 400; throw e; }
      const wallet = walletPayload(req.user.id);
      if (wallet.coins < voucher.cost) { const e = new Error("Số xu trong ví chưa đủ"); e.status = 400; throw e; }
      const code = `NOTE${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      db.prepare("UPDATE wallet_accounts SET coins = coins - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?").run(voucher.cost, req.user.id);
      db.prepare("INSERT INTO wallet_transactions (user_id, amount, type, reference_id, description) VALUES (?, ?, 'voucher_redeem', ?, ?)").run(req.user.id, -voucher.cost, code, `Đổi xu lấy ${voucher.title}`);
      db.prepare("INSERT INTO user_vouchers (user_id, voucher_id, code) VALUES (?, ?, ?)").run(req.user.id, voucher.id, code);
      db.prepare("UPDATE vouchers SET quantity = quantity - 1 WHERE id = ?").run(voucher.id);
      return { code, title: voucher.title, discount_text: voucher.discount_text, coins: wallet.coins - voucher.cost };
    });
    res.status(201).json(result);
  } catch (err) { res.status(err.status || 500).json({ message: err.message || "Không thể đổi voucher" }); }
});

app.post("/api/wallet/spin", auth, (req, res) => {
  const spinCost = 50;
  try {
    const result = withTransaction(() => {
      const wallet = walletPayload(req.user.id);
      if (wallet.coins < spinCost) { const e = new Error("Cần 50 xu để quay"); e.status = 400; throw e; }
      const prizes = [
        { label: "+10 xu", reward: 10 }, { label: "+25 xu", reward: 25 },
        { label: "x2 xu", multiplier: true }, { label: "+100 xu", reward: 100 },
        { label: "Chúc bạn may mắn lần sau", reward: 0 },
      ];
      const prizeIndex = Math.floor(Math.random() * prizes.length);
      const prize = prizes[prizeIndex];
      const multiplierUsed = wallet.spin_multiplier || 1;
      const rewardCoins = prize.multiplier ? 0 : (prize.reward || 0) * multiplierUsed;
      const nextMultiplier = prize.multiplier ? 2 : 1;
      const spinId = "spin_" + req.user.id + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
      db.prepare("UPDATE wallet_accounts SET coins = coins - ?, spin_multiplier = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?").run(spinCost, req.user.id);
      db.prepare("INSERT INTO wallet_spin_sessions (id, user_id, prize_index, label, reward_coins, multiplier_used, next_multiplier) VALUES (?, ?, ?, ?, ?, ?, ?)").run(spinId, req.user.id, prizeIndex, prize.label, rewardCoins, multiplierUsed, nextMultiplier);
      db.prepare("INSERT INTO wallet_transactions (user_id, amount, type, reference_id, description) VALUES (?, ?, 'spin_cost', ?, ?)").run(req.user.id, -spinCost, spinId, "Vòng xoay: trừ phí 50 xu");
      return { spin_id: spinId, label: prize.label, prize_index: prizeIndex, coins: wallet.coins - spinCost, reward_coins: rewardCoins, multiplier_used: multiplierUsed, next_multiplier: nextMultiplier };
    });
    res.json(result);
  } catch (err) { res.status(err.status || 500).json({ message: err.message || "Không thể quay lúc này" }); }
});

app.post("/api/wallet/spin/complete", auth, (req, res) => {
  try {
    const result = withTransaction(() => {
      const session = db.prepare("SELECT * FROM wallet_spin_sessions WHERE id = ? AND user_id = ?").get(String(req.body.spin_id || ""), req.user.id);
      if (!session) { const e = new Error("Không tìm thấy lượt quay"); e.status = 404; throw e; }
      if (session.status !== "pending") { const e = new Error("Lượt quay này đã được xử lý"); e.status = 409; throw e; }
      db.prepare("UPDATE wallet_accounts SET coins = coins + ?, spin_multiplier = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?").run(session.reward_coins, session.next_multiplier, req.user.id);
      const description = session.label === "x2 xu" ? "Vòng xoay: Đã lưu x2 cho lượt kế tiếp" : "Vòng xoay: +" + session.reward_coins + " xu" + (session.multiplier_used === 2 ? " (x2)" : "");
      db.prepare("INSERT INTO wallet_transactions (user_id, amount, type, reference_id, description) VALUES (?, ?, 'spin_reward', ?, ?)").run(req.user.id, session.reward_coins, session.id, description);
      db.prepare("UPDATE wallet_spin_sessions SET status = 'completed' WHERE id = ?").run(session.id);
      const wallet = ensureWallet(req.user.id);
      return { coins: wallet.coins, next_multiplier: wallet.spin_multiplier, reward_coins: session.reward_coins, multiplier_used: session.multiplier_used, label: session.label };
    });
    res.json(result);
  } catch (err) { res.status(err.status || 500).json({ message: err.message || "Không thể hoàn tất lượt quay" }); }
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
  if (paymentMethod !== "cod" && paymentMethod !== "online") {
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
      if (paymentMethod === "online") {
        paymentUrl = `${process.env.BASE_URL || "http://localhost:3000"}/payment/qr?orderId=${orderId}`;
      }

      // COD chỉ nhận xu khi đơn đã giao thành công; online nhận xu ngay khi tạo thanh toán.
      const coinsEarned = paymentMethod === "online" ? awardOrderCoins(req.user.id, orderId, total) : 0;
      return { order_id: orderId, total_amount: total, status: "pending", payment_method: paymentMethod, payment_url: paymentUrl, coins_earned: coinsEarned };
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Lỗi khi tạo đơn hàng" });
  }
});
// API cho trang QR tự động kiểm tra trạng thái thanh toán (Polling mỗi 3 giây)
app.get("/api/payment/status/:orderId", (req, res) => {
  const order = db
    .prepare("SELECT id, status, total_amount, note FROM orders WHERE id = ?")
    .get(Number(req.params.orderId));
  if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  res.json(order);
});

// Webhook nhận biến động số dư từ ngân hàng / cổng đối soát (SePay, Casso, PayOS...)
app.post("/api/payment/webhook", (req, res) => {
  const webhookSecret = process.env.WEBHOOK_SECRET || "noteco_webhook_secret_2026";
  const authHeader = req.headers["authorization"] || "";
  const sepayKey = authHeader.startsWith("Apikey ") ? authHeader.slice(7).trim() : "";
  const incomingSecret = req.headers["x-webhook-secret"] || req.body.secret || sepayKey;

  if (incomingSecret !== webhookSecret) {
    return res.status(403).json({ message: "Sai chữ ký xác thực Webhook!" });
  }

  // Chỉ xử lý giao dịch tiền vào tài khoản
  if (req.body.transferType && req.body.transferType !== "in") {
    return res.json({ message: "Bỏ qua giao dịch tiền ra" });
  }

  const transferAmount = Number(req.body.transferAmount || 0);
  const content = String(req.body.content || "");
  const match = content.match(/DH(\d+)/i);

  if (!match) {
    return res.status(400).json({ message: "Không tìm thấy mã đơn hàng trong nội dung chuyển khoản" });
  }

  const orderId = Number(match[1]);
  const order = db.prepare("SELECT id, user_id, total_amount, status, note FROM orders WHERE id = ?").get(orderId);
  if (!order) {
    return res.status(404).json({ message: "Đơn hàng không tồn tại" });
  }

  if (order.status !== "pending") {
    return res.json({ message: "Đơn hàng đã được xử lý trước đó", status: order.status });
  }

  // Kiểm tra nếu khách chuyển thiếu tiền
  if (transferAmount < order.total_amount) {
    const thieu = order.total_amount - transferAmount;
    const warnNote = `${order.note ? order.note + " | " : ""}[CẢNH BÁO] Chuyển thiếu tiền: nhận ${transferAmount.toLocaleString("vi-VN")}đ / cần ${order.total_amount.toLocaleString("vi-VN")}đ (thiếu ${thieu.toLocaleString("vi-VN")}đ)`;
    db.prepare("UPDATE orders SET note = ? WHERE id = ?").run(warnNote, orderId);
    return res.status(400).json({
      message: "Số tiền chuyển khoản không đủ, giữ nguyên trạng thái pending",
      received: transferAmount,
      expected: order.total_amount,
    });
  }

  // Chỉ chuyển sang 'paid' khi số tiền nhận >= tổng tiền đơn hàng
  db.prepare("UPDATE orders SET status = 'paid' WHERE id = ?").run(orderId);
  const coinsEarned = awardOrderCoins(order.user_id, orderId, order.total_amount);
  res.json({ message: "Xác nhận thanh toán thành công", order_id: orderId, status: "paid", coins_earned: coinsEarned });
});

// Trang hiển thị mã VietQR động và tự động chờ xác nhận
app.get("/payment/qr", (req, res) => {
  const { orderId } = req.query;
  const order = orderId
    ? db.prepare("SELECT id, total_amount, status, note FROM orders WHERE id = ?").get(Number(orderId))
    : null;

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
    h1{font-family:'Plus Jakarta Sans',sans-serif;margin:0 0 8px;font-size:24px;letter-spacing:-0.04em}
    p{color:#69716f;margin:0 0 20px;font-size:14px}
    .btn{display:inline-flex;align-items:center;justify-content:center;background:#18211f;color:#fff;border-radius:8px;padding:12px 24px;font-weight:700;font-size:13px;text-decoration:none}
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size:48px;margin-bottom:16px">✅</div>
    <h1>Đã thanh toán thành công</h1>
    <p>Hệ thống đã nhận đủ <strong>${Number(order.total_amount).toLocaleString("vi-VN")}đ</strong> cho đơn hàng #${order.id}.</p>
    <a href="/" class="btn">Tiếp tục mua sắm</a>
  </div>
</body>
</html>`);
    return;
  }

  const BANK_ID = process.env.BANK_ID || "MB";
  const ACCOUNT_NO = process.env.ACCOUNT_NO || "0123456789";
  const ACCOUNT_NAME = process.env.ACCOUNT_NAME || "LE MINH HIEU";
  const transferContent = `NOTECO DH${order.id}`;
  const dynamicQrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${order.total_amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thanh toán VietQR — NOTE&CO</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
  <style>
    *{box-sizing:border-box}body{margin:0;background:#fbfaf7;color:#18211f;font-family:'DM Sans',sans-serif}
    .page{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:24px}
    .card{background:#fff;border-radius:16px;padding:32px;box-shadow:0 20px 60px rgba(24,33,31,0.14);text-align:center;max-width:420px;width:100%}
    .brand{font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:28px;letter-spacing:-0.04em;margin-bottom:6px}
    .brand span{color:#ef5d3b}
    .qr-box{border:2px solid #f4c5a9;border-radius:16px;padding:12px;display:inline-block;background:#fff;margin:16px 0}
    .qr-box img{display:block;width:250px;height:auto;border-radius:10px}
    .amount{font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:22px;color:#d94848;margin:4px 0}
    .info{background:#fff5f0;border:1px solid #f4c5a9;border-radius:12px;padding:14px;margin:16px 0;text-align:left;font-size:13px}
    .info p{margin:5px 0}
    .waiting{display:flex;align-items:center;justify-content:center;gap:8px;background:#eef3f7;color:#4a8db7;padding:12px;border-radius:8px;font-weight:600;font-size:13px;margin-bottom:12px}
    .warn{background:#fdeaea;color:#d44;padding:10px;border-radius:8px;font-size:12px;margin-bottom:12px;display:none;text-align:left}
    .btn-back{display:block;color:#69716f;border:1px solid #dfe3de;border-radius:8px;padding:11px;font-weight:600;font-size:13px;text-decoration:none}
    .btn-back:hover{border-color:#18211f;color:#18211f}
  </style>
</head>
<body>
  <div class="page">
    <div class="card">
      <div class="brand">NOTE<span>&</span>CO</div>
      <div style="color:#69716f;font-size:13px">Quét mã QR để thanh toán online</div>
      <div class="qr-box">
        <img src="${dynamicQrUrl}" onerror="this.src='/assets/qr-momo.png'" alt="Mã QR thanh toán" />
      </div>
      <div class="amount">${Number(order.total_amount).toLocaleString("vi-VN")}đ</div>
      <div style="color:#69716f;font-size:12px">Đơn hàng #${order.id}</div>
      <div class="info">
        <p><strong>Chủ tài khoản:</strong> ${ACCOUNT_NAME}</p>
        <p><strong>Số tiền chính xác:</strong> ${Number(order.total_amount).toLocaleString("vi-VN")}đ</p>
        <p><strong>Nội dung bắt buộc:</strong> <code style="color:#d94848;font-weight:700">${transferContent}</code></p>
      </div>
      <div class="warn" id="warnBox"></div>
      <div class="waiting">⏳ Đang chờ hệ thống xác nhận giao dịch...</div>
      <a class="btn-back" href="/">Về trang chủ</a>
    </div>
  </div>
  <script>
    setInterval(async () => {
      try {
        const res = await fetch('/api/payment/status/${order.id}');
        const data = await res.json();
        if (data.status === 'paid') {
          location.reload();
        } else if (data.note && data.note.includes('[CẢNH BÁO]')) {
          const warnEl = document.getElementById('warnBox');
          warnEl.style.display = 'block';
          warnEl.innerText = data.note;
        }
      } catch (e) {}
    }, 3000);
  </script>
</body>
</html>`);
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

// Trang theo dõi đơn hàng
app.get("/tracking", (req, res) => {
  const { orderId } = req.query;
  const order = orderId ? db.prepare("SELECT * FROM orders WHERE id = ?").get(Number(orderId)) : null;
  if (!order) {
    res.send("<h1>Không tìm thấy đơn hàng</h1><a href='/'>Về trang chủ</a>");
    return;
  }
  const items = db.prepare(
    `SELECT oi.product_id, oi.quantity, oi.unit_price, p.name, p.brand, p.image_url
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?`,
  ).all(Number(orderId));
  const stepLabels = {
    1: "Xác nhận đơn",
    2: "Đã lấy đơn",
    3: "Đang giao hàng",
    4: "Đã giao hàng",
  };
  let currentStep = 1;
  if (order.status === "paid") currentStep = 1;
  if (order.status === "shipping") currentStep = 3;
  if (order.status === "completed") currentStep = 4;
  res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Theo dõi đơn hàng #${order.id} — NOTE&CO</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
  <style>
    *{box-sizing:border-box}body{margin:0;background:#fbfaf7;color:#18211f;font-family:'DM Sans',sans-serif}
    .page{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:24px}
    .card{background:#fff;border-radius:16px;padding:32px;box-shadow:0 20px 60px rgba(24,33,31,0.14);text-align:center;max-width:480px;width:100%}
    .brand{font:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:28px;letter-spacing:-0.04em;margin-bottom:8px}
    .brand span{color:#ef5d3b}
    .subtitle{color:#69716f;font-size:13px;margin-bottom:24px}
    .order-id{font:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:20px;color:#18211f;margin-bottom:20px}
    .steps{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;position:relative}
    .steps::before{content:"";position:absolute;top:14px;left:0;right:0;height:2px;background:#e4e8e6;z-index:0}
    .step{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;flex:1;cursor:pointer}
    .step-dot{width:12px;height:12px;border-radius:50%;background:#e4e8e6;border:2px solid #e4e8e6;margin-bottom:6px;transition:all 0.15s}
    .step-label{font-size:11px;color:#aab3ae;white-space:nowrap;transition:color 0.15s}
    .step.active .step-dot{background:var(--accent,#4a8db7);border-color:var(--accent,#4a8db7)}
    .step.active .step-label{color:var(--accent,#4a8db7);font-weight:600}
    .step.done .step-dot{background:#6caa88;border-color:#6caa88}
    .step.done .step-label{color:#6caa88;font-weight:600}
    .items{text-align:left;margin-bottom:20px}
    .item{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px}
    .item img{width:40px;height:40px;border-radius:6px;object-fit:cover;margin-right:10px}
    .item-info{flex:1}
    .item-name{font-weight:600;color:var(--ink)}
    .item-qty{font-size:11px;color:#aab3ae}
    .total{font:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:18px;color:var(--ink);margin-top:8px}
    .status-badge{display:inline-block;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:600;text-transform:uppercase;margin-top:12px}
    .status-badge--pending{background:#eef3f7;color:#4a8db7}
    .status-badge--paid{background:#e7f0e7;color:#6caa88}
    .status-badge--shipping{background:#fff4e0;color:#c97856}
    .status-badge--completed{background:#e7f0e7;color:#6caa88}
    .status-badge--cancelled{background:#fdeaea;color:#d44}
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#18211f;color:#fff;border:none;border-radius:8px;padding:12px 24px;font-weight:700;font-size:13px;text-decoration:none;margin-top:16px}
    .btn:hover{background:#34403c}
    .note{font-size:11px;color:#aab3ae;margin-top:16px}
  </style>
</head>
<body>
  <div class="page">
    <div class="card">
      <div class="brand">NOTE<span class="brand"> &</span>CO</div>
      <div class="subtitle">Theo dõi đơn hàng</div>
      <div class="order-id">Đơn hàng #${order.id}</div>
      <div class="steps">
        <div class="step ${currentStep >= 1 ? "active" : ""}">
          <span class="step-dot"></span>
          <span class="step-label">Xác nhận đơn</span>
        </div>
        <div class="step ${currentStep >= 2 ? "active done" : ""}">
          <span class="step-dot"></span>
          <span class="step-label">Đã lấy đơn</span>
        </div>
        <div class="step ${currentStep >= 3 ? "active done" : ""}">
          <span class="step-dot"></span>
          <span class="step-label">Đang giao hàng</span>
        </div>
        <div class="step ${currentStep >= 4 ? "active done" : ""}">
          <span class="step-dot"></span>
          <span class="step-label">Đã giao hàng</span>
        </div>
      </div>
      <div class="status-badge status-badge--${order.status}">${order.status}</div>
      <div class="items">
        ${items.map(i => `
          <div class="item">
            <img src="${i.image_url || ''}" alt="${i.name}" />
            <div class="item-info">
              <div class="item-name">${i.name} × ${i.quantity}</div>
              <div class="item-qty">${i.brand} · ${Number(i.unit_price).toLocaleString("vi-VN")}đ</div>
            </div>
            <strong>${Number(i.unit_price * i.quantity).toLocaleString("vi-VN")}đ</strong>
          </div>
        `).join("")}
        <div class="total">Tổng: ${Number(order.total_amount).toLocaleString("vi-VN")}đ</div>
      </div>
      <p class="note">Địa chỉ giao: ${order.shipping_address}</p>
      <a href="/" class="btn">Về trang chủ</a>
    </div>
  </div>
</body>
</html>`);
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
