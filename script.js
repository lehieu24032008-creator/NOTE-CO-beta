/* ======== NOTE&CO — Script ======== */

let products = [];
let collections = [];

const fallbackProducts = [
  // --- Bút viết ---
  {
    id: 1,
    name: "Bút gel Sarasa Clip 0.5mm",
    brand: "ZEBRA",
    category: "Bút viết",
    price: 32000,
    unit: "/ cây",
    tag: "Bán chạy",
    color: "visual-blue",
    image:
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 3,
    name: "Bộ bút highlight Mildliner",
    brand: "ZEBRA",
    category: "Bút viết",
    price: 125000,
    unit: "/ bộ 5",
    tag: "Được yêu thích",
    color: "visual-green",
    image:
      "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 9,
    name: "Bút bi Uni Jetstream 0.7mm",
    brand: "UNI",
    category: "Bút viết",
    price: 45000,
    unit: "/ cây",
    tag: "Bán chạy",
    color: "visual-peach",
    image:
      "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 10,
    name: "Bút máy Lamy Safari",
    brand: "LAMY",
    category: "Bút viết",
    price: 890000,
    unit: "/ cây",
    tag: "Premium",
    color: "visual-purple",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 11,
    name: "Bút lông bảng Pilot",
    brand: "PILOT",
    category: "Bút viết",
    price: 28000,
    unit: "/ cây",
    tag: "",
    color: "visual-blue",
    image:
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=700&q=80",
  },

  // --- Giấy & sổ ---
  {
    id: 2,
    name: "Sổ tay Paperways A5",
    brand: "PAPERWAYS",
    category: "Giấy & sổ",
    price: 89000,
    unit: "/ quyển",
    tag: "Mới về",
    color: "visual-pink",
    image:
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 4,
    name: "Giấy note vuông Pastel",
    brand: "NOTE&CO",
    category: "Giấy & sổ",
    price: 24000,
    unit: "/ xấp",
    tag: "",
    color: "visual-yellow",
    image:
      "https://images.unsplash.com/photo-1586282391129-76a6df230234?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 12,
    name: "Sổ Moleskine Classic Large",
    brand: "MOLESKINE",
    category: "Giấy & sổ",
    price: 520000,
    unit: "/ quyển",
    tag: "Premium",
    color: "visual-green",
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 13,
    name: "Giấy in A4 Double A 80gsm",
    brand: "DOUBLE A",
    category: "Giấy & sổ",
    price: 85000,
    unit: "/ ream",
    tag: "Giá tốt",
    color: "visual-white",
    image:
      "https://images.unsplash.com/photo-1568702846914-96b305d2uj38?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 14,
    name: "Sổ Bullet Journal chấm bi",
    brand: "LEUCHTTURM",
    category: "Giấy & sổ",
    price: 380000,
    unit: "/ quyển",
    tag: "Mới về",
    color: "visual-peach",
    image:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80",
  },

  // --- Dụng cụ học tập ---
  {
    id: 5,
    name: "Thước kẻ trong 20cm",
    brand: "THIÊN LONG",
    category: "Dụng cụ học tập",
    price: 9000,
    unit: "/ cây",
    tag: "Giá tốt",
    color: "visual-purple",
    image:
      "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 15,
    name: "Compa học sinh inox",
    brand: "THIÊN LONG",
    category: "Dụng cụ học tập",
    price: 35000,
    unit: "/ chiếc",
    tag: "",
    color: "visual-blue",
    image:
      "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 16,
    name: "Hộp bút đa năng Grid",
    brand: "NOTE&CO",
    category: "Dụng cụ học tập",
    price: 65000,
    unit: "/ chiếc",
    tag: "Mới về",
    color: "visual-pink",
    image:
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 17,
    name: "Bộ ê-ke thước đo góc",
    brand: "MAPED",
    category: "Dụng cụ học tập",
    price: 42000,
    unit: "/ bộ",
    tag: "",
    color: "visual-yellow",
    image:
      "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=700&q=80",
  },

  // --- Dụng cụ văn phòng ---
  {
    id: 6,
    name: "Bộ kẹp giấy Color Clip",
    brand: "NOTE&CO",
    category: "Dụng cụ văn phòng",
    price: 35000,
    unit: "/ hộp",
    tag: "",
    color: "visual-peach",
    image:
      "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 8,
    name: "Bìa hồ sơ A4 Pastel",
    brand: "PLUS",
    category: "Dụng cụ văn phòng",
    price: 15000,
    unit: "/ chiếc",
    tag: "",
    color: "visual-white",
    image:
      "https://images.unsplash.com/photo-1455885666463-2f1daccb2d1c?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 18,
    name: "Băng keo washi tape Pastel",
    brand: "MT",
    category: "Dụng cụ văn phòng",
    price: 55000,
    unit: "/ cuộn",
    tag: "Được yêu thích",
    color: "visual-yellow",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 19,
    name: "Kéo văn phòng Scotch",
    brand: "3M",
    category: "Dụng cụ văn phòng",
    price: 48000,
    unit: "/ chiếc",
    tag: "",
    color: "visual-green",
    image:
      "https://images.unsplash.com/photo-1581783898382-80f499f07e44?auto=format&fit=crop&w=700&q=80",
  },

  // --- Mỹ thuật ---
  {
    id: 7,
    name: "Bút màu nước 12 màu",
    brand: "MONT MARTE",
    category: "Mỹ thuật",
    price: 149000,
    unit: "/ bộ",
    tag: "Mới về",
    color: "visual-blue",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 20,
    name: "Bảng palette pha màu",
    brand: "NOTE&CO",
    category: "Mỹ thuật",
    price: 28000,
    unit: "/ chiếc",
    tag: "",
    color: "visual-white",
    image:
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 21,
    name: "Bộ chì màu Prismacolor 24",
    brand: "PRISMACOLOR",
    category: "Mỹ thuật",
    price: 680000,
    unit: "/ bộ",
    tag: "Premium",
    color: "visual-peach",
    image:
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 22,
    name: "Sketchbook A4 160gsm",
    brand: "CANSON",
    category: "Mỹ thuật",
    price: 120000,
    unit: "/ quyển",
    tag: "",
    color: "visual-pink",
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80",
  },
];

/* ======== Collections data ======== */
const fallbackCollections = [
  {
    id: "back-to-school",
    name: "Back to School 2026",
    desc: "Những món cần thiết cho năm học mới — được chọn kỹ, giá vừa túi.",
    productIds: [1, 2, 3, 5, 15, 16],
    color: "#e0edf3",
    accent: "#4a8db7",
  },
  {
    id: "minimal-desk",
    name: "Minimal Desk Setup",
    desc: "Gọn gàng, tối giản — bàn làm việc đẹp bắt đầu từ những món nhỏ.",
    productIds: [4, 6, 8, 12, 18, 19],
    color: "#e9e8dc",
    accent: "#7c8a6e",
  },
  {
    id: "art-studio",
    name: "Art Studio Essentials",
    desc: "Dụng cụ mỹ thuật cho người yêu sáng tạo — từ chì màu đến sketchbook.",
    productIds: [7, 20, 21, 22, 3, 10],
    color: "#f5e4e0",
    accent: "#c97856",
  },
];

/* ======== API & State ======== */
const API_BASE =
  window.location.protocol === "file:" ? "http://localhost:3000/api" : "/api";

let state = {
  filter: "Tất cả",
  search: "",
  sort: "featured",
  cart: JSON.parse(localStorage.getItem("notecoGuestCart") || "[]"),
  wishlist: new Set(),
};
let authToken = localStorage.getItem("notecoToken") || null;
let currentUser = JSON.parse(localStorage.getItem("notecoUser") || "null");
let pendingAddProductId = null;

async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && authToken) {
      authToken = null;
      currentUser = null;
      localStorage.removeItem("notecoToken");
      localStorage.removeItem("notecoUser");
      updateAuthUI();
    }
    throw new Error(data.message || "Có lỗi xảy ra");
  }
  return data;
}

function saveGuestCart() {
  if (!authToken) {
    localStorage.setItem("notecoGuestCart", JSON.stringify(state.cart));
  }
}

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const formatPrice = (n) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

/* ======== Loyalty wallet ======== */
let walletData = { coins: 0, spin_multiplier: 1, transactions: [], vouchers: [] };
let spinRotation = 0;
function updateWalletStatus(multiplier = walletData.spin_multiplier || 1) {
  const status = $("#spinBoostStatus");
  if (!status) return;
  status.textContent = multiplier === 2 ? "Đang có x2 cho lượt quay kế tiếp" : "Lượt kế tiếp: x1 xu";
  status.classList.toggle("is-boosted", multiplier === 2);
}
function updateWalletBalance(coins = walletData.coins) {
  walletData.coins = coins;
  $("#walletCoinCount").textContent = coins.toLocaleString("vi-VN");
  $("#walletBalance").textContent = coins.toLocaleString("vi-VN");
  updateWalletStatus();
}
function showWalletDelta(label, amount) {
  const delta = $("#walletDelta");
  if (!delta) return;
  delta.className = "wallet-delta " + (amount < 0 ? "is-negative" : "is-positive") + " is-visible";
  delta.textContent = label;
  void delta.offsetWidth;
  delta.classList.remove("is-visible");
  requestAnimationFrame(() => delta.classList.add("is-visible"));
}
function animateWalletBalance(from, to, deltaLabel, deltaAmount) {
  const start = Number(from) || 0;
  const end = Number(to) || 0;
  const startedAt = performance.now();
  const duration = 650;
  showWalletDelta(deltaLabel, deltaAmount);
  const tick = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(start + (end - start) * eased);
    $("#walletCoinCount").textContent = value.toLocaleString("vi-VN");
    $("#walletBalance").textContent = value.toLocaleString("vi-VN");
    if (progress < 1) requestAnimationFrame(tick);
    else updateWalletBalance(end);
  };
  requestAnimationFrame(tick);
}
function renderWalletHistory() {
  const el = $("#walletHistory");
  el.innerHTML = walletData.transactions.length ? walletData.transactions.map((t) => `<div class="wallet-history-row"><span>${t.description}<small>${new Date(t.created_at).toLocaleString("vi-VN")}</small></span><b class="${t.amount >= 0 ? "coin-positive" : "coin-negative"}">${t.amount >= 0 ? "+" : ""}${t.amount} xu</b></div>`).join("") : "<p class='wallet-helper'>Chưa có giao dịch xu nào.</p>";
}
function renderOwnedVouchers() {
  const el = $("#myVouchers");
  if (!walletData.vouchers.length) {
    el.innerHTML = "";
    return;
  }
  const sorted = [...walletData.vouchers].sort((a, b) => {
    const aUsed = a.status !== "available" ? 1 : 0;
    const bUsed = b.status !== "available" ? 1 : 0;
    return aUsed - bUsed;
  });
  el.innerHTML = `<h3>Voucher của bạn</h3>${sorted
    .map((v) => {
      const isAvailable = v.status === "available";
      return `<div class="owned-voucher${isAvailable ? "" : " is-used"}">
        <div class="owned-voucher__info">
          <span>${v.title} · <strong>${v.discount_text}</strong></span>
          ${v.description ? `<small>${v.description}</small>` : ""}
        </div>
        <div class="owned-voucher__meta">
          <span class="owned-voucher__status ${isAvailable ? "is-available" : "is-used"}">${isAvailable ? "Khả dụng" : "Đã sử dụng"}</span>
          <button type="button" class="owned-voucher__code" data-copy-voucher="${v.code}" ${isAvailable ? "" : "disabled"} title="${isAvailable ? "Nhấn để sao chép mã" : "Voucher đã sử dụng"}"><code>${v.code}</code></button>
        </div>
      </div>`;
    })
    .join("")}`;
}
async function loadWallet() {
  walletData = await apiFetch("/wallet");
  updateWalletBalance(); renderWalletHistory(); renderOwnedVouchers();
  const vouchers = await apiFetch("/wallet/vouchers");
  $("#voucherGrid").innerHTML = vouchers.map((v) => `<article class="voucher-card"><h3>${v.title}</h3><p>${v.description}</p><strong>${v.discount_text} · ${v.cost} xu</strong><button data-redeem-voucher="${v.id}" ${walletData.coins < v.cost ? "disabled" : ""}>Đổi voucher</button></article>`).join("");
}
async function openWallet(tab = "spin") {
  if (!authToken) { openAuth("login"); toast("Đăng nhập để dùng ví tích lũy", "error"); return; }
  try { await loadWallet(); } catch (err) { toast(err.message, "error"); return; }
  $("#walletModal").classList.add("is-open"); $("#walletOverlay").classList.add("is-open"); document.body.style.overflow = "hidden";
  $$(".wallet-tab").forEach((b) => b.classList.toggle("is-active", b.dataset.walletTab === tab));
  $$(".wallet-panel").forEach((p) => p.classList.toggle("is-active", p.id === `wallet${tab.charAt(0).toUpperCase() + tab.slice(1)}Panel`));
}
function closeWallet() { $("#walletModal").classList.remove("is-open"); $("#walletOverlay").classList.remove("is-open"); document.body.style.overflow = ""; }

/* ======== Products ======== */
function renderProducts() {
  const q = state.search.trim().toLowerCase();
  let list = products.filter(
    (p) =>
      (state.filter === "Tất cả" || p.category === state.filter) &&
      (!q || `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q)),
  );
  if (state.sort === "priceAsc") list.sort((a, b) => a.price - b.price);
  if (state.sort === "priceDesc") list.sort((a, b) => b.price - a.price);
  const grid = $("#productsGrid");
  grid.innerHTML = list
    .map(
      (p, i) => `
    <article class="product-card" style="animation-delay:${i * 60}ms">
      <div class="product-visual ${p.color}">
        ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ""}
        <button class="wish-btn ${state.wishlist.has(p.id) ? "is-active" : ""}" data-wish="${p.id}" aria-label="Thêm ${p.name} vào yêu thích">
          <svg class="icon"><use href="#i-heart"/></svg>
        </button>
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="product-info">
        <p class="product-brand">${p.brand}</p>
        <h3 class="product-name" title="${p.name}">${p.name}</h3>
        <div class="product-meta">
          <div>
            <span class="product-price">${formatPrice(p.price)}</span>
            <span class="product-unit"> ${p.unit}</span>
            <p class="product-stock ${p.stock <= 0 ? "stock-out" : ""}">${p.stock <= 0 ? "Hết hàng" : `Còn ${p.stock}`}</p>
          </div>
          <div class="product-qty">
            <button class="add-btn ${p.stock <= 0 ? "disabled" : ""}" data-add="${p.id}" ${p.stock <= 0 ? "disabled" : ""} aria-label="Thêm ${p.name} vào giỏ">
              <svg class="icon"><use href="#i-bag"/></svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  `,
    )
    .join("");
  $("#emptyState").classList.toggle("is-visible", list.length === 0);
  grid.style.display = list.length ? "grid" : "none";
}

/* ======== Cart ======== */
function renderCart() {
  const count = state.cart.reduce((n, i) => n + i.qty, 0);
  $("#cartCount").textContent = count;
  $("#drawerCount").textContent = count;
  $("#cartItems").innerHTML = state.cart
    .map(
      (item) => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}"/>
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p>${item.brand} · ${formatPrice(item.price)}</p>
        <p class="cart-item-stock ${item.stock <= 0 ? "stock-out" : ""}">${item.stock <= 0 ? "Hết hàng" : `Còn ${item.stock}`}</p>
        <div class="qty-control">
          <button data-minus="${item.id}">−</button>
          <input type="number" class="cart-qty-input" data-cart-qty="${item.id}" min="1" max="${item.stock || 1}" value="${item.qty}" />
          <button data-plus="${item.id}">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-cart-remove="${item.id}" aria-label="Xóa ${item.name} khỏi giỏ hàng">
        <svg class="icon"><use href="#i-close"/></svg>
      </button>
      <strong class="cart-item-price">${formatPrice(item.price * item.qty)}</strong>
    </div>
  `,
    )
    .join("");
  const empty = state.cart.length === 0;
  $("#cartEmpty").classList.toggle("is-visible", empty);
  $("#cartSummary").style.display = empty ? "none" : "block";
  $("#cartItems").style.display = empty ? "none" : "block";
  $("#subtotal").textContent = formatPrice(
    state.cart.reduce((n, i) => n + i.price * i.qty, 0),
  );
}

function openCart() {
  renderCart();
  $("#cartDrawer").classList.add("is-open");
  $("#drawerOverlay").classList.add("is-open");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  $("#cartDrawer").classList.remove("is-open");
  $("#drawerOverlay").classList.remove("is-open");
  document.body.style.overflow = "";
}

function toast(text, type = "success") {
  const t = $("#toast");
  t.className = "toast is-visible" + (type === "error" ? " toast--error" : "");
  $("#toastText").textContent = text;
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => t.classList.remove("is-visible"), 2500);
}

async function addToCart(id, qty = 1) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  if (authToken) {
    try {
      const res = await apiFetch("/cart", {
        method: "POST",
        body: JSON.stringify({ product_id: id, quantity: qty }),
      });
      state.cart = res.items;
      renderCart();
      toast(`${p.name} đã được thêm vào giỏ`);
    } catch (err) {
      toast(err.message, "error");
    }
    return;
  }
  const found = state.cart.find((x) => x.id === id);
  if (found) found.qty = Math.min(found.qty + qty, p.stock);
  else state.cart.push({ ...p, qty: Math.min(qty, p.stock) });
  saveGuestCart();
  renderCart();
  toast(`${p.name} đã được thêm vào giỏ`);
}

/* ======== Quick View ======== */
function openQuick(id) {
  const p = products.find((x) => x.id === id);
  $("#quickBrand").textContent = p.brand;
  $("#quickName").textContent = p.name;
  $("#quickPrice").textContent = formatPrice(p.price) + " " + p.unit;
  $("#quickUnit").textContent = p.unit.replace("/ ", "");
  $("#quickImage").style.backgroundImage = `url(${p.image})`;
  $("#quickImage").className = `quick-image ${p.color}`;
  $("#quickAdd").dataset.addQuick = p.id;
  $("#quickStock").textContent = p.stock <= 0 ? "Hết hàng" : `Còn ${p.stock}`;
  $("#quickStock").className = p.stock <= 0 ? "stock-out" : "";
  $("#quickQty").max = p.stock || 1;
  $("#quickQty").value = 1;
  if (p.stock <= 0) {
    $("#quickAdd").disabled = true;
  } else {
    $("#quickAdd").disabled = false;
  }
  $("#quickView").classList.add("is-open");
  $("#quickOverlay").classList.add("is-open");
}
function closeQuick() {
  $("#quickView").classList.remove("is-open");
  $("#quickOverlay").classList.remove("is-open");
}

/* ======== Auth Modal ======== */
function openAuth(tab = "login") {
  const modal = $("#authModal");
  modal.classList.add("is-open");
  $("#authOverlay").classList.add("is-open");
  document.body.style.overflow = "hidden";
  switchAuthTab(tab);
}
function closeAuth() {
  $("#authModal").classList.remove("is-open");
  $("#authOverlay").classList.remove("is-open");
  document.body.style.overflow = "";
  // Clear form
  $$("#authModal input").forEach((i) => (i.value = ""));
  $$("#authModal .form-error").forEach((e) => (e.textContent = ""));
}
function switchAuthTab(tab) {
  $$(".auth-tab").forEach((t) =>
    t.classList.toggle("is-active", t.dataset.tab === tab),
  );
  $$(".auth-form").forEach((f) =>
    f.classList.toggle("is-active", f.id === tab + "Form"),
  );
}

async function syncUserSession() {
  if (!authToken) return;
  try {
    if (state.cart.length > 0) {
      state.cart = await apiFetch("/cart/sync", {
        method: "POST",
        body: JSON.stringify({
          items: state.cart.map((i) => ({ product_id: i.id, quantity: i.qty })),
        }),
      });
      localStorage.removeItem("notecoGuestCart");
    } else {
      state.cart = await apiFetch("/cart");
    }
    const wl = await apiFetch("/wishlist");
    state.wishlist = new Set(wl.productIds || []);
    renderCart();
    renderProducts();
    try {
      await loadWallet();
    } catch (walletErr) {
      console.warn("Wallet sync failed:", walletErr.message);
    }
  } catch (err) {
    console.warn("Sync session failed:", err.message);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = $("#loginEmail").value.trim();
  const pass = $("#loginPassword").value;
  const errEl = $("#loginError");
  errEl.textContent = "";
  if (!email || !pass) {
    errEl.textContent = "Vui lòng nhập đầy đủ thông tin.";
    return;
  }
  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: pass }),
    });
    authToken = data.token;
    currentUser = {
      id: data.user.id,
      name: data.user.full_name,
      email: data.user.email,
    };
    localStorage.setItem("notecoToken", authToken);
    localStorage.setItem("notecoUser", JSON.stringify(currentUser));
    updateAuthUI();
    closeAuth();
    await syncUserSession();
    toast(`Chào mừng trở lại, ${currentUser.name}! 👋`);
  } catch (err) {
    errEl.textContent = err.message;
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = $("#regName").value.trim();
  const email = $("#regEmail").value.trim();
  const pass = $("#regPassword").value;
  const pass2 = $("#regPassword2").value;
  const errEl = $("#regError");
  errEl.textContent = "";
  if (!name || !email || !pass || !pass2) {
    errEl.textContent = "Vui lòng nhập đầy đủ thông tin.";
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errEl.textContent = "Email không hợp lệ.";
    return;
  }
  if (pass.length < 6) {
    errEl.textContent = "Mật khẩu tối thiểu 6 ký tự.";
    return;
  }
  if (pass !== pass2) {
    errEl.textContent = "Mật khẩu xác nhận không khớp.";
    return;
  }
  try {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name: name, email, password: pass }),
    });
    authToken = data.token;
    currentUser = {
      id: data.user.id,
      name: data.user.full_name,
      email: data.user.email,
    };
    localStorage.setItem("notecoToken", authToken);
    localStorage.setItem("notecoUser", JSON.stringify(currentUser));
    updateAuthUI();
    closeAuth();
    await syncUserSession();
    toast(`Đăng ký thành công! Chào ${name} 🎉`);
  } catch (err) {
    errEl.textContent = err.message;
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  state.cart = [];
  state.wishlist = new Set();
  localStorage.removeItem("notecoToken");
  localStorage.removeItem("notecoUser");
  localStorage.removeItem("notecoGuestCart");
  updateAuthUI();
  renderCart();
  renderProducts();
  closeUserMenu();
  toast("Đã đăng xuất thành công");
}

function updateAuthUI() {
  const btn = $("#accountBtn");
  if (currentUser) {
    btn.innerHTML = `<span class="user-avatar">${currentUser.name.charAt(0).toUpperCase()}</span><span>${currentUser.name}</span>`;
    btn.classList.add("logged-in");
    // Update user menu
    const menuAvatar = $("#menuAvatar");
    if (menuAvatar)
      menuAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    const menuName = $("#menuName");
    if (menuName) menuName.textContent = currentUser.name;
    const menuEmail = $("#menuEmail");
    if (menuEmail) menuEmail.textContent = currentUser.email;
  } else {
    btn.innerHTML = `<svg class="icon"><use href="#i-user"/></svg><span>Tài khoản</span>`;
    btn.classList.remove("logged-in");
  }
}

/* ======== User menu ======== */
function openUserMenu() {
  const menu = $("#userMenu");
  menu.classList.toggle("is-open");
}
function closeUserMenu() {
  $("#userMenu").classList.remove("is-open");
}

/* ======== Collections modal ======== */
function openCollections() {
  const modal = $("#collectionsModal");
  renderCollections();
  modal.classList.add("is-open");
  $("#collectionsOverlay").classList.add("is-open");
  document.body.style.overflow = "hidden";
}
function closeCollections() {
  $("#collectionsModal").classList.remove("is-open");
  $("#collectionsOverlay").classList.remove("is-open");
  document.body.style.overflow = "";
}
function renderCollections() {
  const grid = $("#collectionsGrid");
  grid.innerHTML = collections
    .map((c) => {
      const prods = c.productIds
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean);
      return `
      <div class="collection-card" style="--col-bg:${c.color};--col-accent:${c.accent}">
        <div class="collection-header">
          <div>
            <h3>${c.name}</h3>
            <p>${c.desc}</p>
          </div>
          <span class="collection-count">${prods.length} sản phẩm</span>
        </div>
        <div class="collection-products">
          ${prods
            .slice(0, 4)
            .map(
              (p) => `
            <div class="collection-product-thumb">
              <img src="${p.image}" alt="${p.name}" loading="lazy" />
              <span>${p.name}</span>
            </div>
          `,
            )
            .join("")}
          ${prods.length > 4 ? `<div class="collection-product-thumb collection-more">+${prods.length - 4}</div>` : ""}
        </div>
        <button class="btn btn--outline collection-browse" data-collection="${c.id}">Xem bộ sưu tập <svg class="icon"><use href="#i-arrow"/></svg></button>
      </div>
    `;
    })
    .join("");
}

function browseCollection(collectionId) {
  const col = collections.find((c) => c.id === collectionId);
  if (!col) return;
  closeCollections();
  state.filter = "Tất cả";
  state.search = "";
  $("#searchInput").value = "";
  $$(".filter-chip").forEach((x) =>
    x.classList.toggle("is-active", x.dataset.filter === "Tất cả"),
  );
  // Temporarily show only collection products
  const grid = $("#productsGrid");
  const list = col.productIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);
  grid.innerHTML = list
    .map(
      (p, i) => `
    <article class="product-card" style="animation-delay:${i * 60}ms">
      <div class="product-visual ${p.color}">
        ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ""}
        <button class="wish-btn ${state.wishlist.has(p.id) ? "is-active" : ""}" data-wish="${p.id}" aria-label="Thêm ${p.name} vào yêu thích">
          <svg class="icon"><use href="#i-heart"/></svg>
        </button>
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="product-info">
        <p class="product-brand">${p.brand}</p>
        <h3 class="product-name" title="${p.name}">${p.name}</h3>
        <div class="product-meta">
          <div>
            <span class="product-price">${formatPrice(p.price)}</span>
            <span class="product-unit"> ${p.unit}</span>
            <p class="product-stock ${p.stock <= 0 ? "stock-out" : ""}">${p.stock <= 0 ? "Hết hàng" : `Còn ${p.stock}`}</p>
          </div>
          <div class="product-qty">
            <button class="add-btn ${p.stock <= 0 ? "disabled" : ""}" data-add="${p.id}" ${p.stock <= 0 ? "disabled" : ""} aria-label="Thêm ${p.name} vào giỏ">
              <svg class="icon"><use href="#i-bag"/></svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  `,
    )
    .join("");
  grid.style.display = "grid";
  $("#emptyState").classList.remove("is-visible");
  // Update heading
  const heading = document.querySelector(
    ".product-section .section-heading h2",
  );
  heading.innerHTML = `${col.name} <button class="btn btn--outline btn--small" id="clearCollection">Xem tất cả</button>`;
  document.getElementById("clearCollection").addEventListener("click", () => {
    heading.textContent = "Những món đang được chọn";
    renderProducts();
  });
  $("#products").scrollIntoView({ behavior: "smooth" });
}

/* ======== Events ======== */
document.addEventListener("click", async (e) => {
  // Wishlist toggle
  const wish = e.target.closest("[data-wish]");
  if (wish) {
    const id = Number(wish.dataset.wish);
    if (!authToken) {
      toast("Vui lòng đăng nhập để lưu sản phẩm yêu thích", "error");
      openAuth("login");
      return;
    }
    try {
      const res = await apiFetch(`/wishlist/${id}`, { method: "POST" });
      if (res.wishlisted) state.wishlist.add(id);
      else state.wishlist.delete(id);
      wish.classList.toggle("is-active", res.wishlisted);
      toast(res.wishlisted ? "Đã thêm vào yêu thích" : "Đã bỏ khỏi yêu thích");
    } catch (err) {
      toast(err.message, "error");
    }
    return;
  }

  // Remove from wishlist modal
  const wishRemove = e.target.closest("[data-wish-remove]");
  if (wishRemove) {
    const id = Number(wishRemove.dataset.wishRemove);
    try {
      const res = await apiFetch(`/wishlist/${id}`, { method: "POST" });
      if (!res.wishlisted) {
        state.wishlist.delete(id);
        renderWishlist();
        renderProducts();
        toast("Đã bỏ khỏi yêu thích");
      }
    } catch (err) {
      toast(err.message, "error");
    }
    return;
  }

  // Cancel order
  const orderCancel = e.target.closest("[data-order-cancel]");
  if (orderCancel) {
    const orderId = Number(orderCancel.dataset.orderCancel);
    if (!confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;
    try {
      await apiFetch(`/orders/${orderId}`, { method: "DELETE" });
      toast("Đã xóa đơn hàng");
      openOrders();
      if ($("#accountModal").classList.contains("is-open")) {
        const orders = await apiFetch("/orders");
        $("#orderCount").textContent = orders.filter(
          (o) => o.status !== "cancelled",
        ).length;
      }
    } catch (err) {
      toast(err.message, "error");
    }
    return;
  }

  // Xóa vĩnh viễn đơn đã hủy
  const orderDelete = e.target.closest("[data-order-delete]");
  if (orderDelete) {
    const orderId = Number(orderDelete.dataset.orderDelete);
    if (!confirm("Bạn có chắc muốn xóa vĩnh viễn đơn hàng này?")) return;
    try {
      await apiFetch(`/orders/${orderId}/remove`, { method: "DELETE" });
      toast("Đã xóa đơn hàng");
      openOrders();
      if ($("#accountModal").classList.contains("is-open")) {
        const orders = await apiFetch("/orders");
        $("#orderCount").textContent = orders.filter(
          (o) => o.status !== "cancelled",
        ).length;
      }
    } catch (err) {
      toast(err.message, "error");
    }
    return;
  }

  // Add to cart
  const add = e.target.closest("[data-add]");
  if (add) {
    const p = products.find((x) => x.id === Number(add.dataset.add));
    if (!p) return;
    if (p.stock <= 0) {
      toast("Sản phẩm đã hết hàng", "error");
      return;
    }
    pendingAddProductId = p.id;
    $("#qtyProductName").textContent = p.name;
    $("#qtyStockValue").textContent = p.stock;
    $("#qtyInput").max = p.stock;
    $("#qtyInput").value = Math.min(1, p.stock);
    $("#qtyError").textContent = "";
    $("#qtyModal").classList.add("is-open");
    $("#qtyOverlay").classList.add("is-open");
    document.body.style.overflow = "hidden";
    return;
  }

  // Product card click -> quick view
  const card = e.target.closest(".product-card");
  if (card && !e.target.closest("button")) {
    const pid = Number(card.querySelector("[data-add]").dataset.add);
    const p = products.find((x) => x.id === pid);
    if (p && p.stock <= 0) {
      toast("Sản phẩm đã hết hàng", "error");
      return;
    }
    openQuick(pid);
    return;
  }

  // Quick view add
  const quickAdd = e.target.closest("[data-add-quick]");
  if (quickAdd) {
    const qty = Math.max(1, Number($("#quickQty").value || 1));
    addToCart(Number(quickAdd.dataset.addQuick), qty);
    closeQuick();
    return;
  }

  // Cart qty
  const plus = e.target.closest("[data-plus]");
  const minus = e.target.closest("[data-minus]");
  if (plus || minus) {
    const id = Number((plus || minus).dataset[plus ? "plus" : "minus"]);
    const item = state.cart.find((x) => x.id === id);
    if (!item) return;
    const nextQty = plus ? item.qty + 1 : item.qty - 1;
    if (authToken) {
      try {
        const res = await apiFetch(`/cart/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ quantity: nextQty }),
        });
        state.cart = res.items;
        renderCart();
      } catch (err) {
        toast(err.message, "error");
      }
      return;
    }
    item.qty = nextQty;
    if (item.qty < 1) state.cart = state.cart.filter((x) => x.id !== id);
    saveGuestCart();
    renderCart();
    return;
  }

  // Remove item from cart
  const cartRemove = e.target.closest("[data-cart-remove]");
  if (cartRemove) {
    const id = Number(cartRemove.dataset.cartRemove);
    if (authToken) {
      try {
        const res = await apiFetch(`/cart/${id}`, {
          method: "DELETE",
        });
        state.cart = res.items;
        renderCart();
        toast("Đã xóa sản phẩm khỏi giỏ hàng");
      } catch (err) {
        toast(err.message, "error");
      }
      return;
    }
    state.cart = state.cart.filter((x) => x.id !== id);
    saveGuestCart();
    renderCart();
    toast("Đã xóa sản phẩm khỏi giỏ hàng");
    return;
  }

  // Category card click
  const cat = e.target.closest("[data-category]");
  if (cat) {
    state.filter = cat.dataset.category;
    $$(".filter-chip").forEach((x) =>
      x.classList.toggle("is-active", x.dataset.filter === state.filter),
    );
    renderProducts();
    $("#products").scrollIntoView({ behavior: "smooth" });
    return;
  }

  // Collection browse
  const colBrowse = e.target.closest("[data-collection]");
  if (colBrowse) {
    browseCollection(colBrowse.dataset.collection);
    return;
  }

  // Auth tabs
  const authTab =
    e.target.closest(".auth-tab") || e.target.closest(".auth-tab-link");
  if (authTab) {
    switchAuthTab(authTab.dataset.tab);
    return;
  }

  // Close user menu on outside click
  if (!e.target.closest("#accountBtn") && !e.target.closest("#userMenu")) {
    closeUserMenu();
  }
});

// Filter chips
$$(".filter-chip").forEach((b) =>
  b.addEventListener("click", () => {
    state.filter = b.dataset.filter;
    $$(".filter-chip").forEach((x) => x.classList.toggle("is-active", x === b));
    // Restore heading
    const heading = document.querySelector(
      ".product-section .section-heading h2",
    );
    heading.textContent = "Những món đang được chọn";
    renderProducts();
  }),
);

// Search
$("#searchInput").addEventListener("input", (e) => {
  state.search = e.target.value;
  renderProducts();
});
$("#searchBtn").addEventListener("click", () =>
  $("#products").scrollIntoView({ behavior: "smooth" }),
);
const sortDropdown = $("#sortDropdown");
const sortTrigger = $("#sortTrigger");
const sortMenu = $("#sortMenu");
const sortLabel = $("#sortLabel");
if (sortDropdown && sortTrigger && sortMenu) {
  const closeSortDropdown = () => {
    sortDropdown.classList.remove("is-open");
    sortTrigger.setAttribute("aria-expanded", "false");
  };
  sortTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = sortDropdown.classList.toggle("is-open");
    sortTrigger.setAttribute("aria-expanded", String(isOpen));
  });
  sortMenu.addEventListener("click", (e) => {
    const option = e.target.closest("[data-sort]");
    if (!option) return;
    const value = option.dataset.sort;
    state.sort = value;
    sortLabel.textContent = option.querySelector("span").textContent;
    sortMenu.querySelectorAll("[data-sort]").forEach((btn) => {
      const selected = btn === option;
      btn.classList.toggle("is-selected", selected);
      btn.setAttribute("aria-selected", String(selected));
    });
    closeSortDropdown();
    renderProducts();
  });
  document.addEventListener("click", (e) => {
    if (!sortDropdown.contains(e.target)) closeSortDropdown();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSortDropdown();
  });
}
$("#clearSearch").addEventListener("click", () => {
  state.search = "";
  state.filter = "Tất cả";
  $("#searchInput").value = "";
  $$(".filter-chip").forEach((x) =>
    x.classList.toggle("is-active", x.dataset.filter === "Tất cả"),
  );
  renderProducts();
});

// Cart
$("#cartBtn").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#drawerOverlay").addEventListener("click", closeCart);
$("#cartItems").addEventListener("change", async (e) => {
  const input = e.target.closest("[data-cart-qty]");
  if (!input) return;
  const id = Number(input.dataset.cartQty);
  const qty = Math.max(1, Number(input.value || 1));
  const item = state.cart.find((x) => x.id === id);
  if (!item) return;
  input.value = qty;
  if (authToken) {
    try {
      const res = await apiFetch(`/cart/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: qty }),
      });
      state.cart = res.items;
      renderCart();
    } catch (err) {
      toast(err.message, "error");
      renderCart();
    }
    return;
  }
  item.qty = Math.min(qty, item.stock || item.qty);
  input.value = item.qty;
  saveGuestCart();
  renderCart();
});
$("#shopNow").addEventListener("click", () => {
  closeCart();
  $("#products").scrollIntoView({ behavior: "smooth" });
});
$("#walletBtn").addEventListener("click", () => openWallet());
$("#closeWallet").addEventListener("click", closeWallet);
$("#walletOverlay").addEventListener("click", closeWallet);
$(".wallet-tabs").addEventListener("click", (e) => { const tab = e.target.closest("[data-wallet-tab]"); if (tab) openWallet(tab.dataset.walletTab); });
$("#spinBtn").addEventListener("click", async () => {
  const btn = $("#spinBtn");
  const wheel = $("#spinWheel");
  const pointer = $("#spinPointer");
  const frame = $("#spinFrame");
  const progress = $("#spinProgress");
  const result = $("#spinResult");
  if (walletData.coins < 50) { toast("Không đủ xu để quay", "error"); return; }

  const originalBtnHtml = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = "Đang quay vòng xoay...";
  wheel.querySelectorAll(".spin-slice").forEach((el) => el.classList.remove("is-winner"));
  result.textContent = "Đã trừ 50 xu · Chúc bạn may mắn!";
  result.className = "wallet-result";
  frame.classList.remove("spin-frame--adding");
  frame.classList.add("is-active", "spin-frame--deducting");
  progress.style.width = "0%";

  const balanceBefore = walletData.coins;
  const balanceAfterDeduct = balanceBefore - 50;
  walletData.spin_multiplier = 1;
  updateWalletStatus();
  animateWalletBalance(balanceBefore, balanceAfterDeduct, "−50 xu", -50);
  walletData.coins = balanceAfterDeduct;
  $("#walletCoinCount").textContent = walletData.coins.toLocaleString("vi-VN");
  $("#walletBalance").textContent = walletData.coins.toLocaleString("vi-VN");

  const prizeLabels = ["+10 xu", "+25 xu", "x2 xu", "+100 xu", "Không trúng thưởng"];

  try {
    const res = await apiFetch("/wallet/spin", { method: "POST" });
    // Fallback keeps the animation alive when an older backend is still running.
    const prizeIndex = Number.isInteger(res.prize_index) ? res.prize_index : Math.floor(Math.random() * 5);
    const segmentCenter = 36 + (prizeIndex * 72);
    const jitter = (Math.random() - 0.5) * 32; // ±16° inside the 72° slice for organic stops
    const currentAngle = ((spinRotation % 360) + 360) % 360;
    const correction = (360 - (segmentCenter + jitter) - currentAngle + 360) % 360;
    spinRotation += 2520 + correction;

    const spinDuration = 4600;
    const start = performance.now();
    let lastSector = -1;
    let tickTimer = null;
    const runProgress = () => {
      const now = performance.now();
      const p = Math.min(1, (now - start) / spinDuration);
      progress.style.width = (p * 100) + "%";

      if (pointer) {
        const matrix = new DOMMatrix(getComputedStyle(wheel).transform);
        const angle = ((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI + 360) % 360;
        const sector = Math.floor(angle / 72);
        if (lastSector !== -1 && sector !== lastSector) {
          pointer.classList.add("is-ticking");
          clearTimeout(tickTimer);
          tickTimer = setTimeout(() => pointer.classList.remove("is-ticking"), 75);
        }
        lastSector = sector;
      }

      if (p < 1) requestAnimationFrame(runProgress);
    };
    requestAnimationFrame(runProgress);

    wheel.style.transform = "rotate(" + spinRotation + "deg)";

    let finished = false;
    const finishSpin = async () => {
      if (finished) return;
      finished = true;
      progress.style.width = "100%";
      if (pointer) pointer.classList.remove("is-ticking");
      frame.classList.remove("is-active", "spin-frame--deducting");

      const winningSlice = wheel.querySelectorAll(".spin-slice")[prizeIndex];
      if (winningSlice) winningSlice.classList.add("is-winner");

      const isDouble = prizeIndex === 2;
      const isJackpot = prizeIndex === 3;
      const isMiss = prizeIndex === 4;
      const stopLabel = isDouble
        ? "Trúng x2 lượt sau · +50 xu hoàn lại"
        : isMiss
          ? "Chúc bạn may mắn lần sau"
          : prizeLabels[prizeIndex] + " đã cộng";
      result.textContent = stopLabel;
      result.className = "wallet-result " + (isMiss ? "is-miss" : isJackpot || isDouble ? "is-jackpot" : "is-success");

      try {
        const completed = await apiFetch("/wallet/spin/complete", {
          method: "POST",
          body: JSON.stringify({ spin_id: res.spin_id }),
        });
        walletData.spin_multiplier = completed.next_multiplier || 1;
        updateWalletStatus(walletData.spin_multiplier);
        let rewardCoins = Number(completed.reward_coins) || 0;
        if (prizeIndex === 2) rewardCoins = 50; // hoàn lại chi phí quay khi trúng x2
        const finalCoins = Number.isFinite(completed.coins) ? completed.coins : walletData.coins + rewardCoins;
        if (rewardCoins > 0) {
          frame.classList.add("spin-frame--adding");
          setTimeout(() => frame.classList.remove("spin-frame--adding"), 1800);
          showWalletDelta("+" + rewardCoins + " xu", rewardCoins);
        }
        animateWalletBalance(walletData.coins, finalCoins, stopLabel, rewardCoins);
        walletData.coins = finalCoins;
        updateWalletBalance(finalCoins);
        result.textContent = stopLabel + " · Số dư: " + finalCoins.toLocaleString("vi-VN") + " xu";
      } catch (completeErr) {
        toast(completeErr.message, "error");
        const fallbackCoins = walletData.coins;
        result.textContent = stopLabel + " · Số dư: " + fallbackCoins.toLocaleString("vi-VN") + " xu";
        await loadWallet().catch(() => {});
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalBtnHtml;
      }
    };
    wheel.addEventListener("transitionend", (event) => {
      if (event.propertyName === "transform") finishSpin();
    }, { once: true });
    setTimeout(finishSpin, 5200);
  } catch (err) {
    toast(err.message, "error");
    btn.disabled = false;
    btn.innerHTML = originalBtnHtml;
    if (pointer) pointer.classList.remove("is-ticking");
    frame.classList.remove("is-active", "spin-frame--deducting");
    await loadWallet().catch(() => {});
  }
});
$("#myVouchers").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-copy-voucher]");
  if (!btn || btn.disabled) return;
  const code = btn.dataset.copyVoucher;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => toast("Đã sao chép mã " + code)).catch(() => toast("Mã voucher: " + code));
  } else {
    toast("Mã voucher: " + code);
  }
});
$("#voucherGrid").addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-redeem-voucher]"); if (!btn) return;
  btn.disabled = true;
  try { const res = await apiFetch("/wallet/vouchers/" + btn.dataset.redeemVoucher + "/redeem", { method: "POST" }); updateWalletBalance(res.coins); toast("Đã đổi voucher " + res.code); await loadWallet(); } catch (err) { toast(err.message, "error"); btn.disabled = false; }
});
let appliedCheckoutVoucher = null;

function parseVoucherCurrency(text) {
  const digits = String(text || "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function updateCheckoutSummary() {
  const subtotal = state.cart.reduce((n, i) => n + i.price * i.qty, 0);
  let discount = 0;
  if (appliedCheckoutVoucher) {
    discount = Math.min(subtotal, appliedCheckoutVoucher.discount);
  }
  const finalTotal = Math.max(0, subtotal - discount);
  $("#checkoutSubtotal").textContent = formatPrice(subtotal);
  const discountRow = $("#checkoutDiscountRow");
  if (discount > 0) {
    discountRow.hidden = false;
    $("#checkoutDiscount").textContent = "-" + formatPrice(discount);
  } else {
    discountRow.hidden = true;
  }
  $("#checkoutTotal").textContent = formatPrice(finalTotal);
}

function renderCheckoutVoucherSuggestions() {
  const container = $("#checkoutVoucherSuggestions");
  if (!container) return;
  const available = (walletData.vouchers || []).filter((v) => v.status === "available");
  if (!available.length) {
    container.innerHTML = `<p class="checkout-vouchers__empty">Bạn chưa có voucher khả dụng trong ví tích lũy xu.</p>`;
    return;
  }
  container.innerHTML = `
    <span class="checkout-vouchers__title">Voucher khả dụng trong ví của bạn:</span>
    <div class="checkout-vouchers__list">
      ${available
        .map((v) => {
          const isSelected = appliedCheckoutVoucher && appliedCheckoutVoucher.code === v.code;
          return `<button type="button" class="checkout-voucher-chip${isSelected ? " is-selected" : ""}" data-apply-voucher="${v.code}" title="${v.description || v.title}">
            <code>${v.code}</code>
            <span>${v.discount_text}</span>
          </button>`;
        })
        .join("")}
    </div>
  `;
}

function applyCheckoutVoucher(rawCode) {
  const code = String(rawCode || "").trim().toUpperCase();
  const statusEl = $("#voucherStatus");
  if (!code) {
    appliedCheckoutVoucher = null;
    statusEl.textContent = "";
    statusEl.className = "voucher-status";
    updateCheckoutSummary();
    renderCheckoutVoucherSuggestions();
    return;
  }
  const found = (walletData.vouchers || []).find(
    (v) => v.status === "available" && v.code.toUpperCase() === code,
  );
  if (!found) {
    appliedCheckoutVoucher = null;
    statusEl.textContent = "Mã voucher không hợp lệ hoặc không có trong ví khả dụng.";
    statusEl.className = "voucher-status is-error";
    updateCheckoutSummary();
    renderCheckoutVoucherSuggestions();
    return;
  }
  const subtotal = state.cart.reduce((n, i) => n + i.price * i.qty, 0);
  const minOrder = parseVoucherCurrency(found.description);
  if (minOrder > 0 && subtotal < minOrder) {
    appliedCheckoutVoucher = null;
    statusEl.textContent = `Voucher ${found.code} áp dụng cho đơn từ ${formatPrice(minOrder)}.`;
    statusEl.className = "voucher-status is-error";
    updateCheckoutSummary();
    renderCheckoutVoucherSuggestions();
    return;
  }
  const discount = parseVoucherCurrency(found.discount_text);
  appliedCheckoutVoucher = { code: found.code, discount, title: found.title };
  $("#voucherCode").value = found.code;
  statusEl.textContent = `Đã áp dụng ${found.code} (${found.discount_text}).`;
  statusEl.className = "voucher-status is-applied";
  updateCheckoutSummary();
  renderCheckoutVoucherSuggestions();
}

async function openCheckout() {
  appliedCheckoutVoucher = null;
  $("#customerName").value = currentUser?.name || "";
  $("#voucherCode").value = "";
  $("#voucherStatus").textContent = "";
  $("#voucherStatus").className = "voucher-status";
  $("#checkoutError").textContent = "";
  updateCheckoutSummary();
  renderCheckoutVoucherSuggestions();
  $("#checkoutModal").classList.add("is-open");
  $("#checkoutOverlay").classList.add("is-open");
  document.body.style.overflow = "hidden";
  if (authToken) {
    try {
      await loadWallet();
      renderCheckoutVoucherSuggestions();
    } catch {
      // Keep existing cached wallet data if refresh fails
    }
  }
}
function closeCheckout() {
  $("#checkoutModal").classList.remove("is-open");
  $("#checkoutOverlay").classList.remove("is-open");
  document.body.style.overflow = "";
}

async function openOrders() {
  closeUserMenu();
  const listEl = $("#ordersList");
  listEl.innerHTML = "<p>Đang tải đơn hàng...</p>";
  $("#ordersModal").classList.add("is-open");
  $("#ordersOverlay").classList.add("is-open");
  document.body.style.overflow = "hidden";
  try {
    const orders = await apiFetch("/orders");
    if ($("#accountModal").classList.contains("is-open")) {
      $("#orderCount").textContent = orders.filter(
        (o) => o.status !== "cancelled",
      ).length;
    }
    if (!orders.length) {
      listEl.innerHTML = "<p>Bạn chưa có đơn hàng nào.</p>";
      return;
    }
    listEl.innerHTML = orders
      .map(
        (o) => `
      <div class="order-card">
        <div class="order-card__head">
          <strong>Đơn hàng #${o.id}</strong>
          <span class="order-status order-status--${o.status}">${o.status}</span>
          ${
            o.status === "pending"
              ? o.payment_method === "online"
                ? `<a class="order-pay-again" href="/payment/qr?orderId=${o.id}" target="_blank" rel="noopener">Thanh toán</a> <button class="order-cancel" data-order-cancel="${o.id}">Hủy đơn</button>`
                : `<button class="order-cancel" data-order-cancel="${o.id}">Hủy đơn</button>`
              : o.status === "cancelled"
                ? `<button class="order-delete" data-order-delete="${o.id}">Xóa</button>`
                : ""
            }
        </div>
        <p class="order-card__addr">Giao tới: ${o.shipping_address} · ${new Date(o.created_at).toLocaleString("vi-VN")}</p>
        <p class="order-card__payment">
          <span>Thanh toán: ${o.payment_method === "online" ? "Thanh toán online" : "Tiền mặt khi nhận hàng (COD)"}</span>
          <span class="order-payment-status order-payment-status--${o.status === "paid" ? "paid" : "unpaid"}">${o.status === "paid" ? "Đã thanh toán" : o.payment_method === "online" ? "Chưa thanh toán" : "Thanh toán khi nhận hàng"}</span>
        </p>
        ${o.status !== "cancelled" ? `
        <div class="order-tracking">
          <p class="order-tracking__title">Theo dõi đơn hàng</p>
          <div class="order-tracking__steps">
            <div class="order-tracking__step ${o.status === "paid" || o.status === "shipping" || o.status === "completed" ? "active" : ""}" data-step="1">
              <span class="order-tracking__step-dot"></span>
              <span class="order-tracking__step-label">Xác nhận đơn</span>
            </div>
            <div class="order-tracking__step ${o.status === "shipping" || o.status === "completed" ? "active" : ""}" data-step="2">
              <span class="order-tracking__step-dot"></span>
              <span class="order-tracking__step-label">Đã lấy đơn</span>
            </div>
            <div class="order-tracking__step ${o.status === "shipping" ? "active" : o.status === "completed" ? "done" : ""}" data-step="3">
              <span class="order-tracking__step-dot"></span>
              <span class="order-tracking__step-label">Đang giao hàng</span>
            </div>
            <div class="order-tracking__step ${o.status === "completed" ? "active done" : ""}" data-step="4">
              <span class="order-tracking__step-dot"></span>
              <span class="order-tracking__step-label">Đã giao hàng</span>
            </div>
          </div>
          <a class="order-tracking__link" href="/tracking?orderId=${o.id}" target="_blank" rel="noopener">Xem chi tiết theo dõi <svg class="icon"><use href="#i-arrow" /></svg></a>
        </div>
        ` : ""}
        <div class="order-card__items">
          ${o.items
            .map(
              (i) => `
            <div class="order-card__item">
              <span>${i.name} × ${i.quantity}</span>
              <strong>${formatPrice(i.unit_price * i.quantity)}</strong>
            </div>`,
            )
            .join("")}
          <div class="order-card__item" style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(20,20,20,0.08)">
            <strong>Tổng cộng</strong>
            <strong>${formatPrice(o.total_amount)}</strong>
          </div>
        </div>
      </div>`,
      )
      .join("");
  } catch (err) {
    listEl.innerHTML = `<p class="form-error">${err.message}</p>`;
  }
}
function closeOrders() {
  $("#ordersModal").classList.remove("is-open");
  $("#ordersOverlay").classList.remove("is-open");
  document.body.style.overflow = "";
}

/* ======== Wishlist ======== */
function openWishlist() {
  closeUserMenu();
  renderWishlist();
  $("#wishlistModal").classList.add("is-open");
  $("#wishlistOverlay").classList.add("is-open");
  document.body.style.overflow = "hidden";
}
function closeWishlist() {
  $("#wishlistModal").classList.remove("is-open");
  $("#wishlistOverlay").classList.remove("is-open");
  document.body.style.overflow = "";
}
function renderWishlist() {
  const listEl = $("#wishlistList");
  const wished = products.filter((p) => state.wishlist.has(p.id));
  if (!wished.length) {
    listEl.innerHTML = `
      <div class="empty-state" style="display:block;text-align:center;padding:40px 20px">
        <svg class="icon icon--large"><use href="#i-heart"/></svg>
        <h3>Chưa có sản phẩm yêu thích</h3>
        <p>Nhấn vào tim trên sản phẩm để lưu lại nhé.</p>
      </div>
    `;
    return;
  }
  listEl.innerHTML = wished
    .map(
      (p) => `
    <div class="wishlist-item">
      <img class="wishlist-item-img" src="${p.image}" alt="${p.name}" loading="lazy" />
      <div class="wishlist-item-info">
        <h3>${p.name}</h3>
        <p>${p.brand} · ${formatPrice(p.price)}</p>
      </div>
      <button class="wishlist-remove" data-wish-remove="${p.id}" aria-label="Xóa ${p.name} khỏi yêu thích">
        <svg class="icon"><use href="#i-close"/></svg>
      </button>
    </div>
  `,
    )
    .join("");
}

/* ======== Account ======== */
async function openAccount() {
  closeUserMenu();
  if (!currentUser) return;
  $("#accountName").textContent = currentUser.name;
  $("#accountEmail").textContent = currentUser.email;
  $("#accountAvatar").textContent = currentUser.name.charAt(0).toUpperCase();
  $("#wishlistCount").textContent = state.wishlist.size;
  try {
    const me = await apiFetch("/auth/me");
    $("#accountMemberSince").textContent = new Date(
      me.created_at,
    ).toLocaleDateString("vi-VN");
    const orders = await apiFetch("/orders");
    $("#orderCount").textContent = orders.filter(
      (o) => o.status !== "cancelled",
    ).length;
  } catch {
    $("#accountMemberSince").textContent = "--";
    $("#orderCount").textContent = "0";
  }
  $("#accountModal").classList.add("is-open");
  $("#accountOverlay").classList.add("is-open");
  document.body.style.overflow = "hidden";
}
function closeAccount() {
  $("#accountModal").classList.remove("is-open");
  $("#accountOverlay").classList.remove("is-open");
  document.body.style.overflow = "";
}

$("#checkoutBtn").addEventListener("click", () => {
  if (!state.cart.length) return;
  if (!authToken) {
    closeCart();
    openAuth("login");
    toast("Vui lòng đăng nhập để đặt hàng", "error");
    return;
  }
  closeCart();
  openCheckout();
});
$("#customerPhone").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "");
});
$("#applyVoucherBtn").addEventListener("click", () => {
  applyCheckoutVoucher($("#voucherCode").value);
});
$("#checkoutVoucherSuggestions").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-apply-voucher]");
  if (!chip) return;
  const code = chip.dataset.applyVoucher;
  if (appliedCheckoutVoucher && appliedCheckoutVoucher.code === code) {
    $("#voucherCode").value = "";
    applyCheckoutVoucher("");
  } else {
    applyCheckoutVoucher(code);
  }
});
$("#closeCheckout").addEventListener("click", closeCheckout);
$("#checkoutOverlay").addEventListener("click", closeCheckout);
$("#checkoutForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const recipient_name = $("#customerName").value.trim();
  const phone = $("#customerPhone").value.replace(/\D/g, "");
  $("#customerPhone").value = phone;
  const shipping_address = $("#shippingAddress").value.trim();
  const note = $("#orderNote").value.trim();
  const payment_method = $("#checkoutForm").querySelector(
    'input[name="paymentMethod"]:checked',
  ).value;
  const errEl = $("#checkoutError");
  errEl.textContent = "";
  if (!recipient_name) {
    errEl.textContent = "Vui lòng nhập tên người nhận";
    return;
  }
  if (!/^\d{9,11}$/.test(phone)) {
    errEl.textContent = "Số điện thoại phải gồm 9–11 chữ số";
    $("#customerPhone").focus();
    return;
  }
  const typedVoucher = $("#voucherCode").value.trim().toUpperCase();
  if (typedVoucher && (!appliedCheckoutVoucher || appliedCheckoutVoucher.code !== typedVoucher)) {
    applyCheckoutVoucher(typedVoucher);
    if (!appliedCheckoutVoucher) {
      errEl.textContent = $("#voucherStatus").textContent || "Mã voucher chưa hợp lệ";
      return;
    }
  }
  try {
    const res = await apiFetch("/orders/checkout", {
      method: "POST",
      body: JSON.stringify({
        recipient_name,
        phone,
        shipping_address,
        note,
        payment_method,
        voucher_code: appliedCheckoutVoucher ? appliedCheckoutVoucher.code : "",
      }),
    });
    state.cart = [];
    appliedCheckoutVoucher = null;
    renderCart();
    closeCheckout();
    $("#checkoutForm").reset();
    if (authToken) loadWallet().catch(() => {});
    if (res.payment_url) {
      window.open(res.payment_url, "_blank");
      toast(
        `Đã tạo đơn hàng #${res.order_id} · +${res.coins_earned || 0} xu. Vui lòng hoàn tất thanh toán trên cửa sổ mới.`,
      );
    } else if (payment_method === "cod") {
      toast(`Đặt hàng thành công! Mã đơn #${res.order_id}. Xu sẽ được cộng khi giao thành công 🎉`);
    } else {
      toast(`Đặt hàng thành công! Mã đơn #${res.order_id} · +${res.coins_earned || 0} xu 🎉`);
    }
  } catch (err) {
    errEl.textContent = err.message;
  }
});

$("#myOrdersLink").addEventListener("click", (e) => {
  e.preventDefault();
  openOrders();
});
$("#myWishlistLink").addEventListener("click", (e) => {
  e.preventDefault();
  openWishlist();
});
$("#myAccountLink").addEventListener("click", (e) => {
  e.preventDefault();
  openAccount();
});
$("#closeOrders").addEventListener("click", closeOrders);
$("#ordersOverlay").addEventListener("click", closeOrders);

$("#closeWishlist").addEventListener("click", closeWishlist);
$("#wishlistOverlay").addEventListener("click", closeWishlist);

$("#closeAccount").addEventListener("click", closeAccount);
$("#accountOverlay").addEventListener("click", closeAccount);

// Quantity modal
function closeQty() {
  $("#qtyModal").classList.remove("is-open");
  $("#qtyOverlay").classList.remove("is-open");
  document.body.style.overflow = "";
  pendingAddProductId = null;
}
$("#closeQty").addEventListener("click", closeQty);
$("#qtyOverlay").addEventListener("click", closeQty);
$("#cancelQty").addEventListener("click", closeQty);
$("#confirmQty").addEventListener("click", async () => {
  const qty = Math.max(1, Number($("#qtyInput").value || 1));
  const productId = pendingAddProductId;
  const p = products.find((x) => x.id === productId);
  if (!p || qty > p.stock) {
    $("#qtyError").textContent = "Số lượng vượt quá tồn kho";
    return;
  }
  closeQty();
  addToCart(productId, qty);
});

$("#viewWishlistBtn").addEventListener("click", () => {
  closeAccount();
  openWishlist();
});
$("#viewOrdersBtn").addEventListener("click", () => {
  closeAccount();
  openOrders();
});

$("#newsletterBtn").addEventListener("click", async () => {
  const input = $("#newsletterEmail");
  const email = input.value.trim();
  if (!email) return toast("Vui lòng nhập email", "error");
  try {
    const res = await apiFetch("/newsletter", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    input.value = "";
    toast(res.message);
  } catch (err) {
    toast(err.message, "error");
  }
});

// Quick view
$("#closeQuick").addEventListener("click", closeQuick);
$("#quickOverlay").addEventListener("click", closeQuick);

// Account
$("#accountBtn").addEventListener("click", () => {
  if (currentUser) {
    openUserMenu();
  } else {
    openAuth("login");
  }
});
$("#closeAuth").addEventListener("click", closeAuth);
$("#authOverlay").addEventListener("click", closeAuth);

// Auth forms
$("#loginForm").addEventListener("submit", handleLogin);
$("#registerForm").addEventListener("submit", handleRegister);

// User menu
document.addEventListener("click", (e) => {
  if (e.target.closest("#logoutBtn")) {
    logout();
  }
});

// Collections
$("#playBtn").addEventListener("click", openCollections);
$("#closeCollections").addEventListener("click", closeCollections);
$("#collectionsOverlay").addEventListener("click", closeCollections);

// Password toggle
$$(".toggle-pass").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = btn.previousElementSibling;
    const isPass = input.type === "password";
    input.type = isPass ? "text" : "password";
    btn.textContent = isPass ? "Ẩn" : "Hiện";
  });
});

// Keyboard escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCart();
    closeQuick();
    closeAuth();
    closeCollections();
    closeCheckout();
    closeOrders();
    closeWishlist();
    closeAccount();
    closeWallet();
    closeUserMenu();
  }
});

/* ======== Scroll animations ======== */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
);

document.addEventListener("DOMContentLoaded", () => {
  // Observe sections
  $$(
    ".category-strip, .product-section, .feature-banner, .trust-section, .footer",
  ).forEach((el) => {
    el.classList.add("fade-up");
    observer.observe(el);
  });
});

/* ======== Init ======== */
async function initApp() {
  try {
    const [prodData, colData] = await Promise.all([
      apiFetch("/products"),
      apiFetch("/collections"),
    ]);
    products = prodData;
    collections = colData;
  } catch {
    products = fallbackProducts;
    collections = fallbackCollections;
  }
  updateAuthUI();
  renderProducts();
  renderCart();
  if (authToken) {
    await syncUserSession();
  }
}

initApp();
