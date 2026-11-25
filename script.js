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
          </div>
          <button class="add-btn" data-add="${p.id}" aria-label="Thêm ${p.name} vào giỏ">
            <svg class="icon"><use href="#i-bag"/></svg>
          </button>
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
        <div class="qty-control">
          <button data-minus="${item.id}">−</button>
          <span>${item.qty}</span>
          <button data-plus="${item.id}">+</button>
        </div>
      </div>
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

async function addToCart(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  if (authToken) {
    try {
      const res = await apiFetch("/cart", {
        method: "POST",
        body: JSON.stringify({ product_id: id, quantity: 1 }),
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
  if (found) found.qty++;
  else state.cart.push({ ...p, qty: 1 });
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
          </div>
          <button class="add-btn" data-add="${p.id}" aria-label="Thêm ${p.name} vào giỏ">
            <svg class="icon"><use href="#i-bag"/></svg>
          </button>
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
    addToCart(Number(add.dataset.add));
    return;
  }

  // Product card click -> quick view
  const card = e.target.closest(".product-card");
  if (card && !e.target.closest("button")) {
    openQuick(Number(card.querySelector("[data-add]").dataset.add));
    return;
  }

  // Quick view add
  const quickAdd = e.target.closest("[data-add-quick]");
  if (quickAdd) {
    addToCart(Number(quickAdd.dataset.addQuick));
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
$("#sortSelect").addEventListener("change", (e) => {
  state.sort = e.target.value;
  renderProducts();
});
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
$("#shopNow").addEventListener("click", () => {
  closeCart();
  $("#products").scrollIntoView({ behavior: "smooth" });
});
function openCheckout() {
  const total = state.cart.reduce((n, i) => n + i.price * i.qty, 0);
  $("#checkoutTotal").textContent = formatPrice(total);
  $("#checkoutError").textContent = "";
  $("#checkoutModal").classList.add("is-open");
  $("#checkoutOverlay").classList.add("is-open");
  document.body.style.overflow = "hidden";
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
              ? o.payment_method === "momo"
                ? `<a class="order-pay-again" href="/payment/qr?orderId=${o.id}" target="_blank" rel="noopener">Thanh toán</a> <button class="order-cancel" data-order-cancel="${o.id}">Hủy đơn</button>`
                : `<button class="order-cancel" data-order-cancel="${o.id}">Hủy đơn</button>`
              : o.status === "cancelled"
                ? `<button class="order-delete" data-order-delete="${o.id}">Xóa</button>`
                : ""
            }
        </div>
        <p class="order-card__addr">Giao tới: ${o.shipping_address} · ${new Date(o.created_at).toLocaleString("vi-VN")}</p>
        <p class="order-card__payment">
          <span>Thanh toán: ${o.payment_method === "momo" ? "MoMo online" : "Tiền mặt khi nhận hàng (COD)"}</span>
          <span class="order-payment-status order-payment-status--${o.status === "paid" ? "paid" : "unpaid"}">${o.status === "paid" ? "Đã thanh toán" : o.payment_method === "momo" ? "Chưa thanh toán" : "Thanh toán khi nhận hàng"}</span>
        </p>
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
$("#closeCheckout").addEventListener("click", closeCheckout);
$("#checkoutOverlay").addEventListener("click", closeCheckout);
$("#checkoutForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const shipping_address = $("#shippingAddress").value.trim();
  const note = $("#orderNote").value.trim();
  const payment_method = $("#checkoutForm").querySelector(
    'input[name="paymentMethod"]:checked',
  ).value;
  const errEl = $("#checkoutError");
  errEl.textContent = "";
  try {
    const res = await apiFetch("/orders/checkout", {
      method: "POST",
      body: JSON.stringify({ shipping_address, note, payment_method }),
    });
    state.cart = [];
    renderCart();
    closeCheckout();
    $("#checkoutForm").reset();
    if (res.payment_url) {
      window.open(res.payment_url, "_blank");
      toast(
        `Đã tạo đơn hàng #${res.order_id}. Vui lòng hoàn tất thanh toán trên cửa sổ mới.`,
      );
    } else {
      toast(`Đặt hàng thành công! Mã đơn #${res.order_id} 🎉`);
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
