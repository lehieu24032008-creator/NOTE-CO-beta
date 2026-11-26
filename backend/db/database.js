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
    description TEXT NOT NULL DEFAULT '',
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

// Migrations for existing databases
const orderMigrations = [
  "ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'cod'",
  "ALTER TABLE orders ADD COLUMN recipient_name TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE orders ADD COLUMN phone TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE orders ADD COLUMN voucher_code TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE orders ADD COLUMN discount_amount INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE products ADD COLUMN description TEXT NOT NULL DEFAULT ''",
];
for (const sql of orderMigrations) {
  try {
    db.exec(sql);
  } catch {
    // Column already exists, ignore
  }
}

const seedProducts = [
  // 1. Bìa hồ sơ, lưu trữ tài liệu
  { id: 1, name: "Bìa sơ mi A4", brand: "DELI", category: "Bìa hồ sơ, lưu trữ tài liệu", price: 18000, unit: "/ xấp 10", tag: "Bán chạy", color: "visual-blue", stock: 120, image_url: "assets/products/bia-so-mi.webp", description: "Bìa lá sơ mi A4 trong suốt, dày dặn, chống thấm và bảo vệ tài liệu không bị nhàu." },
  { id: 2, name: "Bìa đựng hồ sơ A4 Deli", brand: "DELI", category: "Bìa hồ sơ, lưu trữ tài liệu", price: 35000, unit: "/ chiếc", tag: "Mới về", color: "visual-yellow", stock: 85, image_url: "assets/products/bia-dung-ho-so-a4-deli.png", description: "Bìa đựng hồ sơ A4 thương hiệu Deli, khóa bấm chắc chắn, chứa được nhiều giấy tờ." },
  { id: 3, name: "Kệ đựng hồ sơ 3 ngăn", brand: "DELI", category: "Bìa hồ sơ, lưu trữ tài liệu", price: 85000, unit: "/ chiếc", tag: "", color: "visual-white", stock: 45, image_url: "assets/products/ke-dung-ho-so.webp", description: "Kệ nhựa lắp ghép đựng tài liệu, sách vở nhiều ngăn giúp bàn làm việc luôn ngăn nắp." },

  // 2. Dụng cụ học tập
  { id: 4, name: "Bút bi 0.5mm Treeden", brand: "TREEDEN", category: "Dụng cụ học tập", price: 8000, unit: "/ cây", tag: "Giá tốt", color: "visual-blue", stock: 200, image_url: "assets/products/but-bi-0-5mm-treeden.jpg", description: "Bút bi ngòi 0.5mm viết êm, mực ra đều, nhanh khô, phù hợp ghi chép hàng ngày." },
  { id: 5, name: "Bút chì bấm Pentel 0.5mm", brand: "PENTEL", category: "Dụng cụ học tập", price: 65000, unit: "/ cây", tag: "Được yêu thích", color: "visual-purple", stock: 70, image_url: "assets/products/but-chi-bam-pentel.jpg", description: "Bút chì bấm Pentel Nhật Bản, thân cầm chắc tay, cơ chế bấm ngòi mượt và bền bỉ." },
  { id: 6, name: "Bút chì gỗ 2B Thiên Long", brand: "THIÊN LONG", category: "Dụng cụ học tập", price: 5000, unit: "/ cây", tag: "Bán chạy", color: "visual-yellow", stock: 250, image_url: "assets/products/but-chi-go-2b-tl.jpg", description: "Bút chì gỗ 2B ngòi đậm vừa, dễ chuốt, ít gãy, thích hợp viết, vẽ và tô trắc nghiệm." },
  { id: 7, name: "Bút chì màu Artmate", brand: "ARTMATE", category: "Dụng cụ học tập", price: 78000, unit: "/ hộp", tag: "Mới về", color: "visual-peach", stock: 60, image_url: "assets/products/but-chi-mau-artmate.jpg", description: "Bộ bút chì màu Artmate sắc nét, màu lên tươi và mịn, dễ phối chuyển sắc." },
  { id: 8, name: "Bút highlight đánh dấu dòng", brand: "NOTE&CO", category: "Dụng cụ học tập", price: 15000, unit: "/ cây", tag: "", color: "visual-green", stock: 140, image_url: "assets/products/but-highlight.jpg", description: "Bút dạ quang đầu vát, mực tươi sáng không lem chữ in, giúp ghi nhớ ý chính nhanh chóng." },
  { id: 9, name: "Bút lông bảng trắng", brand: "THIÊN LONG", category: "Dụng cụ học tập", price: 12000, unit: "/ cây", tag: "", color: "visual-blue", stock: 130, image_url: "assets/products/but-long-bang.jpg", description: "Bút lông viết bảng trắng nét rõ, mực đậm và dễ dàng lau sạch không để lại vết mờ." },
  { id: 10, name: "Bút máy Lamy Safari", brand: "LAMY", category: "Dụng cụ học tập", price: 890000, unit: "/ cây", tag: "Premium", color: "visual-purple", stock: 20, image_url: "assets/products/but-may-lamy-safari.webp", description: "Bút máy Lamy Safari nhập khẩu Đức, ngòi thép viết trơn mượt, thiết kế công thái học đặc trưng." },
  { id: 11, name: "Bút sáp màu", brand: "CRAYOLA", category: "Dụng cụ học tập", price: 45000, unit: "/ hộp", tag: "", color: "visual-yellow", stock: 90, image_url: "assets/products/but-sap-mau.jpg", description: "Bộ bút sáp màu an toàn, không độc hại, màu sắc rực rỡ cho học sinh tập tô và vẽ sáng tạo." },
  { id: 12, name: "Compa học sinh", brand: "MAPED", category: "Dụng cụ học tập", price: 42000, unit: "/ bộ", tag: "", color: "visual-blue", stock: 80, image_url: "assets/products/compa.jpg", description: "Compa kim loại chắc chắn, chân trụ bám giấy tốt, vẽ đường tròn chính xác cho môn Hình học." },
  { id: 13, name: "Gôm tẩy Pentel Ain", brand: "PENTEL", category: "Dụng cụ học tập", price: 18000, unit: "/ viên", tag: "Bán chạy", color: "visual-white", stock: 180, image_url: "assets/products/gom-pentel.jpg", description: "Gôm tẩy Pentel cao cấp tẩy sạch nhẹ nhàng, ít bụi vụn và không làm rách bề mặt giấy." },
  { id: 14, name: "Gọt bút chì", brand: "DELI", category: "Dụng cụ học tập", price: 15000, unit: "/ chiếc", tag: "", color: "visual-pink", stock: 110, image_url: "assets/products/got-but-chi.jpg", description: "Chuốt bút chì lưỡi thép sắc bén, có hộp chứa vụn tiện lợi và sạch sẽ." },
  { id: 15, name: "Thước kẻ học sinh", brand: "THIÊN LONG", category: "Dụng cụ học tập", price: 10000, unit: "/ cây", tag: "Giá tốt", color: "visual-green", stock: 160, image_url: "assets/products/thuoc.png", description: "Thước nhựa trong suốt vạch chia milimet rõ nét, bền dẻo, hỗ trợ đo vẽ chính xác." },
  { id: 16, name: "Bút xóa kéo", brand: "PLUS", category: "Dụng cụ học tập", price: 24000, unit: "/ chiếc", tag: "Được yêu thích", color: "visual-peach", stock: 120, image_url: "assets/products/xoa-keo.jpg", description: "Băng xóa kéo che phủ tức thì, bám giấy tốt, viết đè lên ngay mà không cần chờ khô." },

  // 3. Dụng cụ văn phòng
  { id: 17, name: "Băng keo 2 mặt xốp 2,4cm", brand: "NOTE&CO", category: "Dụng cụ văn phòng", price: 18000, unit: "/ cuộn", tag: "", color: "visual-white", stock: 110, image_url: "assets/products/bang-keo-2-mat-xop-2-4cm.jpg", description: "Băng keo xốp 2 mặt bản 2,4cm độ bám dính cao, dùng dán tranh ảnh, mô hình và trang trí." },
  { id: 18, name: "Băng keo trong 4,8cm", brand: "NOTE&CO", category: "Dụng cụ văn phòng", price: 22000, unit: "/ cuộn", tag: "Bán chạy", color: "visual-yellow", stock: 140, image_url: "assets/products/bang-keo-trong-4-8cm.png", description: "Băng keo trong bản rộng 4,8cm dai chắc, bám dính tốt để đóng gói thùng hàng và tài liệu." },
  { id: 19, name: "Dao rọc giấy", brand: "DELI", category: "Dụng cụ văn phòng", price: 25000, unit: "/ chiếc", tag: "", color: "visual-peach", stock: 95, image_url: "assets/products/dao-roc-giay.jpg", description: "Dao rọc giấy lưỡi thép sắc bén, có khóa an toàn cố định lưỡi khi cắt giấy và bìa carton." },
  { id: 20, name: "Dập ghim văn phòng", brand: "DELI", category: "Dụng cụ văn phòng", price: 48000, unit: "/ chiếc", tag: "Được yêu thích", color: "visual-blue", stock: 75, image_url: "assets/products/dap-ghim.webp", description: "Bấm kim văn phòng trợ lực nhẹ tay, đóng được nhiều tờ giấy cùng lúc, bền bỉ." },
  { id: 21, name: "Hồ dán nước", brand: "THIÊN LONG", category: "Dụng cụ văn phòng", price: 7000, unit: "/ chai", tag: "Giá tốt", color: "visual-green", stock: 180, image_url: "assets/products/ho-nuoc.jpg", description: "Hồ nước dán giấy dạng chai có đầu lưới thoa đều, khô nhanh và không làm nhăn giấy." },
  { id: 22, name: "Kẹp tài liệu (Kẹp bướm)", brand: "DELI", category: "Dụng cụ văn phòng", price: 25000, unit: "/ hộp", tag: "", color: "visual-purple", stock: 120, image_url: "assets/products/kep-tai-lieu.png", description: "Hộp kẹp bướm kim loại sơn tĩnh điện chống gỉ, lực kẹp mạnh giữ gọn xấp tài liệu dày." },
  { id: 23, name: "Mực con dấu", brand: "SHINY", category: "Dụng cụ văn phòng", price: 38000, unit: "/ chai", tag: "", color: "visual-pink", stock: 65, image_url: "assets/products/muc-con-dau.jpg", description: "Mực chuyên dụng châm khay con dấu văn phòng, màu sắc sắc nét, lâu phai và an toàn cho mặt dấu." },

  // 4. Sách giáo khoa
  { id: 24, name: "Bộ sách Kết Nối Tri Thức Lớp 12", brand: "NXB GIÁO DỤC", category: "Sách giáo khoa", price: 245000, unit: "/ bộ", tag: "Mới về", color: "visual-blue", stock: 50, image_url: "assets/products/bo-sach-ket-noi-tri-thuc-12.jpg", description: "Trọn bộ sách giáo khoa Kết Nối Tri Thức với cuộc sống lớp 12 theo chương trình GDPT mới." },
  { id: 25, name: "Bộ sách Kết Nối Tri Thức Lớp 5", brand: "NXB GIÁO DỤC", category: "Sách giáo khoa", price: 195000, unit: "/ bộ", tag: "Bán chạy", color: "visual-yellow", stock: 60, image_url: "assets/products/bo-sach-ket-noi-tri-thuc-5.jpg", description: "Trọn bộ sách giáo khoa Kết Nối Tri Thức lớp 5 in màu sắc nét, giấy đẹp bảo vệ mắt học sinh." },
  { id: 26, name: "Bộ sách Kết Nối Tri Thức Lớp 9", brand: "NXB GIÁO DỤC", category: "Sách giáo khoa", price: 220000, unit: "/ bộ", tag: "", color: "visual-green", stock: 55, image_url: "assets/products/bo-sach-ket-noi-tri-thuc-9.jpg", description: "Trọn bộ sách giáo khoa Kết Nối Tri Thức lớp 9 đầy đủ các môn học chuẩn chương trình mới." },

  // 5. Sách văn học
  { id: 27, name: "Hannibal Trỗi Dậy", brand: "THOMAS HARRIS", category: "Sách văn học", price: 149000, unit: "/ quyển", tag: "", color: "visual-purple", stock: 40, image_url: "assets/products/hannibal-troi-day.jpg", description: "Phần tiền truyện hé lộ tuổi thơ đầy ám ảnh và quá trình hình thành thiên tài tội phạm Hannibal Lecter." },
  { id: 28, name: "Hannibal", brand: "THOMAS HARRIS", category: "Sách văn học", price: 165000, unit: "/ quyển", tag: "", color: "visual-peach", stock: 35, image_url: "assets/products/hannibal.jpg", description: "Cuộc truy đuổi nghẹt thở giữa đặc vụ Clarice Starling và bác sĩ thiên tài Hannibal Lecter tại Florence." },
  { id: 29, name: "Rồng Đỏ", brand: "THOMAS HARRIS", category: "Sách văn học", price: 155000, unit: "/ quyển", tag: "", color: "visual-pink", stock: 38, image_url: "assets/products/rong-do.jpg", description: "Tác phẩm mở đầu loạt tiểu thuyết Hannibal, nơi điều tra viên Will Graham phải nhờ đến trí tuệ của Lecter." },
  { id: 30, name: "Sự Im Lặng Của Bầy Cừu", brand: "THOMAS HARRIS", category: "Sách văn học", price: 145000, unit: "/ quyển", tag: "Bán chạy", color: "visual-blue", stock: 50, image_url: "assets/products/su-im-lang-cua-bay-cuu.jpg", description: "Kiệt tác trinh thám tâm lý kinh điển về cuộc đấu trí cân não giữa Clarice Starling và Hannibal Lecter." },
  { id: 31, name: "Harry Potter và Hòn Đá Phù Thủy", brand: "J.K. ROWLING", category: "Sách văn học", price: 150000, unit: "/ quyển", tag: "Được yêu thích", color: "visual-yellow", stock: 65, image_url: "assets/products/harry-potter-1-hon-da-phu-thuy.webp", description: "Tập 1 mở ra thế giới phép thuật kỳ diệu của trường Hogwarts và hành trình đầu tiên của cậu bé Harry Potter." },
  { id: 32, name: "Harry Potter và Phòng Chứa Bí Mật", brand: "J.K. ROWLING", category: "Sách văn học", price: 160000, unit: "/ quyển", tag: "", color: "visual-green", stock: 55, image_url: "assets/products/harry-potter-2-phong-chua-bi-mat.webp", description: "Tập 2 theo chân Harry khám phá bí mật cổ xưa ẩn giấu dưới lòng lâu đài Hogwarts." },
  { id: 33, name: "Harry Potter và Tên Tù Nhân Ngục Azkaban", brand: "J.K. ROWLING", category: "Sách văn học", price: 180000, unit: "/ quyển", tag: "", color: "visual-purple", stock: 55, image_url: "assets/products/harry-potter-3-ten-tu-nhan-nguc-azkaban.webp", description: "Tập 3 hé lộ sự thật về quá khứ gia đình Harry và cuộc đào tẩu chấn động của Sirius Black." },
  { id: 34, name: "Harry Potter và Chiếc Cốc Lửa", brand: "J.K. ROWLING", category: "Sách văn học", price: 245000, unit: "/ quyển", tag: "", color: "visual-peach", stock: 45, image_url: "assets/products/harry-potter-4-chiec-coc-lua.webp", description: "Tập 4 xoay quanh Giải đấu Tam Pháp Thuật đầy hiểm nguy và sự trở lại của Chúa tể Hắc ám." },
  { id: 35, name: "Harry Potter và Hội Phượng Hoàng", brand: "J.K. ROWLING", category: "Sách văn học", price: 285000, unit: "/ quyển", tag: "", color: "visual-pink", stock: 40, image_url: "assets/products/harry-potter-5-hoi-phuong-hoang.webp", description: "Tập 5 kể về cuộc chiến ngầm bảo vệ thế giới phù thủy và sự trưởng thành của Đoàn quân Dumbledore." },
  { id: 36, name: "Harry Potter và Hoàng Tử Lai", brand: "J.K. ROWLING", category: "Sách văn học", price: 235000, unit: "/ quyển", tag: "", color: "visual-blue", stock: 42, image_url: "assets/products/harry-potter-6-hoang-tu-lai.webp", description: "Tập 6 vén màn những mảnh ký ức về Trường Sinh Linh Giá trước trận chiến cuối cùng." },
  { id: 37, name: "Harry Potter và Bảo Bối Tử Thần", brand: "J.K. ROWLING", category: "Sách văn học", price: 295000, unit: "/ quyển", tag: "Premium", color: "visual-yellow", stock: 45, image_url: "assets/products/harry-potter-7-bao-boi-tu-than.webp", description: "Tập 7 khép lại thiên anh hùng ca phép thuật bằng trận đại chiến quyết định tại Hogwarts." },
  { id: 38, name: "Những Người Khốn Khổ (Tập 1)", brand: "VICTOR HUGO", category: "Sách văn học", price: 135000, unit: "/ quyển", tag: "", color: "visual-white", stock: 35, image_url: "assets/products/nhung-nguoi-khon-kho-tap-1.png", description: "Tập 1 kiệt tác nhân văn của Victor Hugo kể về cuộc đời Jean Valjean và khát vọng hoàn lương." },
  { id: 39, name: "Những Người Khốn Khổ (Tập 2)", brand: "VICTOR HUGO", category: "Sách văn học", price: 135000, unit: "/ quyển", tag: "", color: "visual-white", stock: 35, image_url: "assets/products/nhung-nguoi-khon-kho-tap-2.jpg", description: "Tập 2 tiếp nối hành trình của Jean Valjean, Cosette và bức tranh xã hội Pháp thế kỷ 19." },
  { id: 40, name: "Những Người Khốn Khổ (Tập 3)", brand: "VICTOR HUGO", category: "Sách văn học", price: 140000, unit: "/ quyển", tag: "", color: "visual-white", stock: 35, image_url: "assets/products/nhung-nguoi-khon-kho-tap-3.jpg", description: "Tập 3 khép lại bản trường ca bất hủ về lòng vị tha, công lý và tình yêu thương con người." },
  { id: 41, name: "Cây Cam Ngọt Của Tôi", brand: "JOSÉ MAURO DE VASCONCELOS", category: "Sách văn học", price: 108000, unit: "/ quyển", tag: "Bán chạy", color: "visual-peach", stock: 80, image_url: "assets/products/cay-cam-ngot-cua-toi.jpg", description: "Câu chuyện cảm động về cậu bé Zezé thông minh, nhạy cảm và cây cam ngọt trong khu vườn tuổi thơ." },
  { id: 42, name: "Chúa Tể Những Chiếc Nhẫn (Lord of the Rings)", brand: "J.R.R. TOLKIEN", category: "Sách văn học", price: 280000, unit: "/ quyển", tag: "Premium", color: "visual-green", stock: 30, image_url: "assets/products/lord-of-the-rings.jpg", description: "Thiên sử thi kỳ ảo kinh điển về hành trình tiêu hủy Chiếc Nhẫn Chúa tại vùng đất Trung Địa." },
  { id: 43, name: "Nhà Giả Kim", brand: "PAULO COELHO", category: "Sách văn học", price: 79000, unit: "/ quyển", tag: "Được yêu thích", color: "visual-yellow", stock: 95, image_url: "assets/products/nha-gia-kim.jpg", description: "Hành trình phiêu lưu của chàng chăn cừu Santiago đi tìm kho báu và lắng nghe tiếng gọi trái tim." },
  { id: 44, name: "Rừng Na Uy", brand: "HARUKI MURAKAMI", category: "Sách văn học", price: 129000, unit: "/ quyển", tag: "", color: "visual-blue", stock: 55, image_url: "assets/products/rung-na-uy.jpg", description: "Tiểu thuyết nổi tiếng của Haruki Murakami về tuổi trẻ, nỗi cô đơn, tình yêu và sự mất mát." },
  { id: 45, name: "Số Đỏ", brand: "VŨ TRỌNG PHỤNG", category: "Sách văn học", price: 68000, unit: "/ quyển", tag: "Giá tốt", color: "visual-pink", stock: 70, image_url: "assets/products/so-do.jpg", description: "Tác phẩm trào phúng kiệt xuất của văn học Việt Nam xoay quanh nhân vật Xuân Tóc Đỏ." },
  { id: 46, name: "Bố Già (The Godfather)", brand: "MARIO PUZO", category: "Sách văn học", price: 139000, unit: "/ quyển", tag: "Bán chạy", color: "visual-purple", stock: 50, image_url: "assets/products/the-godfather.jpg", description: "Tiểu thuyết kinh điển về gia tộc mafia Corleone, quyền lực, danh dự và tình thân gia đình." },
  { id: 47, name: "Truyện Cổ Grimm (Tái bản 2018)", brand: "ANH EM NHÀ GRIMM", category: "Sách văn học", price: 145000, unit: "/ quyển", tag: "", color: "visual-yellow", stock: 45, image_url: "assets/products/truyen-co-grimm.jpg", description: "Tuyển tập những câu chuyện cổ tích kinh điển thế giới được biên soạn và minh họa trang nhã." },
  { id: 48, name: "Đồi Gió Hú", brand: "EMILY BRONTË", category: "Sách văn học", price: 115000, unit: "/ quyển", tag: "", color: "visual-green", stock: 45, image_url: "assets/products/doi-gio-hu.webp", description: "Kiệt tác văn học Anh về mối tình dữ dội, day dứt giữa Heathcliff và Catherine trên vùng đồng hoang." },

  // 6. Sản phẩm giấy
  { id: 49, name: "Bao kiếng bọc sách vở (10 cái)", brand: "NOTE&CO", category: "Sản phẩm giấy", price: 15000, unit: "/ xấp 10", tag: "", color: "visual-blue", stock: 150, image_url: "assets/products/bao-kieng-sach-vo-10-cai.jpg", description: "Xấp 10 bao kiếng trong suốt dẻo dai, có keo dán mép tiện lợi bảo vệ bìa sách vở luôn mới." },
  { id: 50, name: "Biên lai thu tiền", brand: "NOTE&CO", category: "Sản phẩm giấy", price: 18000, unit: "/ quyển", tag: "", color: "visual-white", stock: 100, image_url: "assets/products/bien-lai-thu-tien.webp", description: "Quyển biên lai thu tiền 2 liên in rõ nét, đường xé răng cưa dễ tách, phù hợp cửa hàng và văn phòng." },
  { id: 51, name: "Giấy in A4", brand: "DOUBLE A", category: "Sản phẩm giấy", price: 85000, unit: "/ ream", tag: "Bán chạy", color: "visual-white", stock: 90, image_url: "assets/products/giay-a4.png", description: "Giấy in A4 định lượng 80gsm trắng sáng, bề mặt mịn chống kẹt giấy khi in 2 mặt." },
  { id: 52, name: "Nhãn vở Bộ Môn", brand: "HẢI TIẾN", category: "Sản phẩm giấy", price: 12000, unit: "/ xấp", tag: "Giá tốt", color: "visual-pink", stock: 160, image_url: "assets/products/nhan-vo-bo-mon.jpg", description: "Nhãn vở phân loại bộ môn in sẵn sắc nét, keo dán bám chắc giúp phân biệt sách vở nhanh chóng." },
  { id: 53, name: "Giấy note phân trang", brand: "NOTE&CO", category: "Sản phẩm giấy", price: 16000, unit: "/ xấp", tag: "", color: "visual-yellow", stock: 140, image_url: "assets/products/note-so-trang.jpg", description: "Giấy note đánh dấu trang nhiều màu sắc, dễ dán và bóc lại không làm rách trang sách." },
  { id: 54, name: "Giấy note vuông ghi chú", brand: "NOTE&CO", category: "Sản phẩm giấy", price: 20000, unit: "/ xấp", tag: "Được yêu thích", color: "visual-green", stock: 150, image_url: "assets/products/note-vuong-ghi-chu.jpg", description: "Giấy note vuông 76x76mm màu pastel dịu mắt, keo dính vừa phải để ghi chú nhắc việc hàng ngày." },
  { id: 55, name: "Sổ tay A5", brand: "NOTE&CO", category: "Sản phẩm giấy", price: 75000, unit: "/ quyển", tag: "Mới về", color: "visual-peach", stock: 80, image_url: "assets/products/so-tay-a5.webp", description: "Sổ tay khổ A5 giấy dày 100gsm chống thấm mực, gáy mở phẳng tiện lợi cho ghi chép và bullet journal." },
  { id: 56, name: "Vở 200 trang", brand: "HẢI TIẾN", category: "Sản phẩm giấy", price: 22000, unit: "/ quyển", tag: "Bán chạy", color: "visual-blue", stock: 180, image_url: "assets/products/vo-200-trang.jpg", description: "Vở ô ly 200 trang giấy trắng tự nhiên chống lóa mắt, bìa cứng cáp bền đẹp cho học sinh sinh viên." },

  // 7. Thiết bị
  { id: 57, name: "Bao đựng thẻ nhân viên / học sinh", brand: "NOTE&CO", category: "Thiết bị", price: 18000, unit: "/ chiếc", tag: "", color: "visual-blue", stock: 130, image_url: "assets/products/bao-dung-the.jpg", description: "Bao đựng thẻ nhựa cứng kèm dây đeo gọn nhẹ, bảo vệ thẻ từ và thẻ sinh viên khỏi trầy xước." },
  { id: 58, name: "Bút trình chiếu không dây", brand: "LOGITECH", category: "Thiết bị", price: 320000, unit: "/ chiếc", tag: "Premium", color: "visual-purple", stock: 30, image_url: "assets/products/but-trinh-chieu.jpg", description: "Bút trình chiếu slide kết nối không dây ổn định, tích hợp tia laser đỏ hỗ trợ thuyết trình chuyên nghiệp." },
  { id: 59, name: "Máy tính cầm tay Flexio", brand: "FLEXIO", category: "Thiết bị", price: 265000, unit: "/ chiếc", tag: "Bán chạy", color: "visual-green", stock: 45, image_url: "assets/products/may-tinh-flexio.jpg", description: "Máy tính khoa học Flexio màn hình LCD sắc nét, phím bấm nhạy, hỗ trợ đầy đủ tính năng học tập." },
  { id: 60, name: "Keo nến 5mm x 28cm", brand: "NOTE&CO", category: "Thiết bị", price: 25000, unit: "/ bịch", tag: "", color: "visual-white", stock: 100, image_url: "assets/products/keo-nen-5mmx28cm.jpg", description: "Bịch keo nến đường kính 5mm dài 28cm nóng chảy đều, kết dính nhanh trên nhiều chất liệu thủ công." },
  { id: 61, name: "Mực in văn phòng", brand: "CANON", category: "Thiết bị", price: 145000, unit: "/ chai", tag: "", color: "visual-yellow", stock: 50, image_url: "assets/products/muc-in.jpg", description: "Mực in chất lượng cao cho bản in sắc nét, đều màu, giúp bảo vệ đầu phun máy in bền lâu." },
  { id: 62, name: "Súng bắn keo nến", brand: "DELI", category: "Thiết bị", price: 95000, unit: "/ chiếc", tag: "Mới về", color: "visual-peach", stock: 60, image_url: "assets/products/sung-ban-keo.jpg", description: "Súng bắn keo nến gia nhiệt nhanh, có chân đế dựng an toàn, tiện lợi làm đồ handmade và sửa chữa." },
];

const seedCollections = [
  {
    id: "back-to-school",
    name: "Back to School 2026",
    description: "Những món cần thiết cho năm học mới — từ bút viết, vở 200 trang đến bộ sách giáo khoa.",
    color: "#e0edf3",
    accent: "#4a8db7",
    productIds: [5, 6, 12, 15, 24, 56],
  },
  {
    id: "minimal-desk",
    name: "Minimal Desk Setup",
    description: "Gọn gàng, tối giản — bàn làm việc đẹp bắt đầu từ kệ hồ sơ, sổ tay và dụng cụ văn phòng.",
    color: "#e9e8dc",
    accent: "#7c8a6e",
    productIds: [2, 3, 19, 22, 54, 55],
  },
  {
    id: "art-studio",
    name: "Sách hay & Sáng tạo",
    description: "Góc đọc sách kinh điển cùng dụng cụ mỹ thuật cho những giờ thư giãn và sáng tạo.",
    color: "#f5e4e0",
    accent: "#c97856",
    productIds: [7, 10, 11, 31, 41, 43],
  },
];

function seedIfEmpty() {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM products").get();
  if (count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (id, name, brand, category, price, unit, tag, color, stock, image_url, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of seedProducts) {
      insertProduct.run(p.id, p.name, p.brand, p.category, p.price, p.unit, p.tag, p.color, p.stock, p.image_url, p.description || "");
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
