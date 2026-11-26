import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, "shop.db");

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON;");
db.exec("PRAGMA journal_mode = WAL;");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    price INTEGER NOT NULL,
    unit TEXT NOT NULL DEFAULT '/ chiếc',
    tag TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT 'visual-white',
    stock INTEGER NOT NULL DEFAULT 50,
    image_url TEXT NOT NULL DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '#e0edf3',
    accent TEXT NOT NULL DEFAULT '#4a8db7'
  );

  CREATE TABLE IF NOT EXISTS collection_products (
    collection_id TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (collection_id, product_id),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    UNIQUE (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS wishlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipping', 'completed', 'cancelled')),
    shipping_address TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    payment_method TEXT NOT NULL DEFAULT 'cod',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wallet_accounts (
    user_id INTEGER PRIMARY KEY,
    coins INTEGER NOT NULL DEFAULT 0,
    spin_multiplier INTEGER NOT NULL DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS wallet_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    reference_id TEXT,
    description TEXT NOT NULL DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, type, reference_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS wallet_spin_sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    prize_index INTEGER NOT NULL,
    label TEXT NOT NULL,
    reward_coins INTEGER NOT NULL DEFAULT 0,
    multiplier_used INTEGER NOT NULL DEFAULT 1,
    next_multiplier INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    discount_text TEXT NOT NULL,
    cost INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 999,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS user_vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    voucher_id INTEGER NOT NULL,
    code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id)
  );
`);

db.exec(`
  INSERT OR IGNORE INTO vouchers (id, title, description, discount_text, cost) VALUES
    (1, 'Ưu đãi cho ngày mới', 'Áp dụng cho đơn từ 199.000đ', 'Giảm 20.000đ', 200),
    (2, 'Gọn gàng hơn, vui hơn', 'Áp dụng cho đơn từ 299.000đ', 'Giảm 35.000đ', 350),
    (3, 'NOTE&CO Premium', 'Áp dụng cho đơn từ 499.000đ', 'Giảm 60.000đ', 600);
`);

// Migration: add payment_method column for existing databases
try {
  db.exec("ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'cod'");
} catch {
  // Column already exists, ignore
}

const seedProducts = [
  { id: 1, name: "Bút gel Sarasa Clip 0.5mm", brand: "ZEBRA", category: "Bút viết", price: 32000, unit: "/ cây", tag: "Bán chạy", color: "visual-blue", stock: 120, image_url: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=700&q=80" },
  { id: 2, name: "Sổ tay Paperways A5", brand: "PAPERWAYS", category: "Giấy & sổ", price: 89000, unit: "/ quyển", tag: "Mới về", color: "visual-pink", stock: 60, image_url: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=700&q=80" },
  { id: 3, name: "Bộ bút highlight Mildliner", brand: "ZEBRA", category: "Bút viết", price: 125000, unit: "/ bộ 5", tag: "Được yêu thích", color: "visual-green", stock: 80, image_url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=700&q=80" },
  { id: 4, name: "Giấy note vuông Pastel", brand: "NOTE&CO", category: "Giấy & sổ", price: 24000, unit: "/ xấp", tag: "", color: "visual-yellow", stock: 150, image_url: "https://images.unsplash.com/photo-1586282391129-76a6df230234?auto=format&fit=crop&w=700&q=80" },
  { id: 5, name: "Thước kẻ trong 20cm", brand: "THIÊN LONG", category: "Dụng cụ học tập", price: 9000, unit: "/ cây", tag: "Giá tốt", color: "visual-purple", stock: 200, image_url: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=700&q=80" },
  { id: 6, name: "Bộ kẹp giấy Color Clip", brand: "NOTE&CO", category: "Dụng cụ văn phòng", price: 35000, unit: "/ hộp", tag: "", color: "visual-peach", stock: 90, image_url: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=700&q=80" },
  { id: 7, name: "Bút màu nước 12 màu", brand: "MONT MARTE", category: "Mỹ thuật", price: 149000, unit: "/ bộ", tag: "Mới về", color: "visual-blue", stock: 45, image_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80" },
  { id: 8, name: "Bìa hồ sơ A4 Pastel", brand: "PLUS", category: "Dụng cụ văn phòng", price: 15000, unit: "/ chiếc", tag: "", color: "visual-white", stock: 140, image_url: "https://images.unsplash.com/photo-1455885666463-2f1daccb2d1c?auto=format&fit=crop&w=700&q=80" },
  { id: 9, name: "Bút bi Uni Jetstream 0.7mm", brand: "UNI", category: "Bút viết", price: 45000, unit: "/ cây", tag: "Bán chạy", color: "visual-peach", stock: 100, image_url: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=700&q=80" },
  { id: 10, name: "Bút máy Lamy Safari", brand: "LAMY", category: "Bút viết", price: 890000, unit: "/ cây", tag: "Premium", color: "visual-purple", stock: 20, image_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80" },
  { id: 11, name: "Bút lông bảng Pilot", brand: "PILOT", category: "Bút viết", price: 28000, unit: "/ cây", tag: "", color: "visual-blue", stock: 110, image_url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=700&q=80" },
  { id: 12, name: "Sổ Moleskine Classic Large", brand: "MOLESKINE", category: "Giấy & sổ", price: 520000, unit: "/ quyển", tag: "Premium", color: "visual-green", stock: 25, image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80" },
  { id: 13, name: "Giấy in A4 Double A 80gsm", brand: "DOUBLE A", category: "Giấy & sổ", price: 85000, unit: "/ ream", tag: "Giá tốt", color: "visual-white", stock: 75, image_url: "https://images.unsplash.com/photo-1568702846914-96b305d2uj38?auto=format&fit=crop&w=700&q=80" },
  { id: 14, name: "Sổ Bullet Journal chấm bi", brand: "LEUCHTTURM", category: "Giấy & sổ", price: 380000, unit: "/ quyển", tag: "Mới về", color: "visual-peach", stock: 35, image_url: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80" },
  { id: 15, name: "Compa học sinh inox", brand: "THIÊN LONG", category: "Dụng cụ học tập", price: 35000, unit: "/ chiếc", tag: "", color: "visual-blue", stock: 85, image_url: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?auto=format&fit=crop&w=700&q=80" },
  { id: 16, name: "Hộp bút đa năng Grid", brand: "NOTE&CO", category: "Dụng cụ học tập", price: 65000, unit: "/ chiếc", tag: "Mới về", color: "visual-pink", stock: 60, image_url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=700&q=80" },
  { id: 17, name: "Bộ ê-ke thước đo góc", brand: "MAPED", category: "Dụng cụ học tập", price: 42000, unit: "/ bộ", tag: "", color: "visual-yellow", stock: 70, image_url: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=700&q=80" },
  { id: 18, name: "Băng keo washi tape Pastel", brand: "MT", category: "Dụng cụ văn phòng", price: 55000, unit: "/ cuộn", tag: "Được yêu thích", color: "visual-yellow", stock: 95, image_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80" },
  { id: 19, name: "Kéo văn phòng Scotch", brand: "3M", category: "Dụng cụ văn phòng", price: 48000, unit: "/ chiếc", tag: "", color: "visual-green", stock: 65, image_url: "https://images.unsplash.com/photo-1581783898382-80f499f07e44?auto=format&fit=crop&w=700&q=80" },
  { id: 20, name: "Bảng palette pha màu", brand: "NOTE&CO", category: "Mỹ thuật", price: 28000, unit: "/ chiếc", tag: "", color: "visual-white", stock: 80, image_url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=700&q=80" },
  { id: 21, name: "Bộ chì màu Prismacolor 24", brand: "PRISMACOLOR", category: "Mỹ thuật", price: 680000, unit: "/ bộ", tag: "Premium", color: "visual-peach", stock: 18, image_url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=700&q=80" },
  { id: 22, name: "Sketchbook A4 160gsm", brand: "CANSON", category: "Mỹ thuật", price: 120000, unit: "/ quyển", tag: "", color: "visual-pink", stock: 50, image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80" },
];

const seedCollections = [
  {
    id: "back-to-school",
    name: "Back to School 2026",
    description: "Những món cần thiết cho năm học mới — được chọn kỹ, giá vừa túi.",
    color: "#e0edf3",
    accent: "#4a8db7",
    productIds: [1, 2, 3, 5, 15, 16],
  },
  {
    id: "minimal-desk",
    name: "Minimal Desk Setup",
    description: "Gọn gàng, tối giản — bàn làm việc đẹp bắt đầu từ những món nhỏ.",
    color: "#e9e8dc",
    accent: "#7c8a6e",
    productIds: [4, 6, 8, 12, 18, 19],
  },
  {
    id: "art-studio",
    name: "Art Studio Essentials",
    description: "Dụng cụ mỹ thuật cho người yêu sáng tạo — từ chì màu đến sketchbook.",
    color: "#f5e4e0",
    accent: "#c97856",
    productIds: [7, 20, 21, 22, 3, 10],
  },
];

function seedIfEmpty() {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM products").get();
  if (count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (id, name, brand, category, price, unit, tag, color, stock, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of seedProducts) {
      insertProduct.run(p.id, p.name, p.brand, p.category, p.price, p.unit, p.tag, p.color, p.stock, p.image_url);
    }
  }

  const { colCount } = db.prepare("SELECT COUNT(*) AS colCount FROM collections").get();
  if (colCount === 0) {
    const insertCol = db.prepare(
      "INSERT INTO collections (id, name, description, color, accent) VALUES (?, ?, ?, ?, ?)"
    );
    const insertColProd = db.prepare(
      "INSERT INTO collection_products (collection_id, product_id, sort_order) VALUES (?, ?, ?)"
    );
    for (const c of seedCollections) {
      insertCol.run(c.id, c.name, c.description, c.color, c.accent);
      c.productIds.forEach((pid, idx) => insertColProd.run(c.id, pid, idx));
    }
  }
}

try {
  db.exec("ALTER TABLE wallet_accounts ADD COLUMN spin_multiplier INTEGER NOT NULL DEFAULT 1");
} catch {
  // Column already exists, ignore
}

seedIfEmpty();

export default db;
