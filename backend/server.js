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
  if (!shippingAddress) {
    return res.status(400).json({ message: "Vui lòng nhập địa chỉ giao hàng" });
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
          "INSERT INTO orders (user_id, total_amount, shipping_address, note) VALUES (?, ?, ?, ?)",
        )
        .run(req.user.id, total, shippingAddress, note);
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
      return { order_id: orderId, total_amount: total, status: "pending" };
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Lỗi khi tạo đơn hàng" });
  }
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
    .prepare("SELECT id FROM orders WHERE id = ? AND user_id = ?")
    .get(orderId, req.user.id);
  if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  db.prepare("DELETE FROM orders WHERE id = ?").run(orderId);
  res.json({ message: "Đã xóa đơn hàng" });
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
