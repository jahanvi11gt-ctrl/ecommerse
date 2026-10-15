const products = [
  {id:1,name:"Everyday Canvas Tote",category:"Accessories",price:799,oldPrice:999,rating:4.8,tag:"BESTSELLER",image:"photo-1544816155-12df9643f363",description:"A versatile everyday tote with a clean design and plenty of room for your daily essentials."},
  {id:2,name:"Classic White Sneakers",category:"Fashion",price:1999,oldPrice:2499,rating:4.7,tag:"POPULAR",image:"photo-1542291026-7eec264c27ff",description:"Comfortable everyday sneakers designed to pair effortlessly with your favorite outfits."},
  {id:3,name:"Wireless Headphones",category:"Electronics",price:2499,oldPrice:3299,rating:4.9,tag:"TOP RATED",image:"photo-1505740420928-5e560c06d30e",description:"Enjoy your music with a stylish, comfortable pair of wireless headphones."},
  {id:4,name:"Minimal Desk Lamp",category:"Home",price:1299,oldPrice:1599,rating:4.6,tag:"NEW",image:"photo-1507473885765-e6ed057f782c",description:"A modern desk lamp that brings a warm, welcoming glow to your workspace."},
  {id:5,name:"Everyday Backpack",category:"Accessories",price:1599,oldPrice:1999,rating:4.7,tag:"FAVORITE",image:"photo-1553062407-98eeb64c6a62",description:"A practical backpack for work, study and weekend adventures."},
  {id:6,name:"Classic Wrist Watch",category:"Accessories",price:2199,oldPrice:2799,rating:4.5,tag:"TIMELESS",image:"photo-1523275335684-37898b6baf30",description:"A timeless watch with a minimal face and versatile styling."},
  {id:7,name:"Soft Knit Sweater",category:"Fashion",price:1799,oldPrice:2299,rating:4.8,tag:"COZY PICK",image:"photo-1576566588028-4147f3842f27",description:"A soft knit layer for relaxed weekends and everyday comfort."},
  {id:8,name:"Ceramic Coffee Set",category:"Home",price:999,oldPrice:1299,rating:4.6,tag:"GIFT IDEA",image:"photo-1514228742587-6b1558fcca3d",description:"A lovely ceramic set to make your morning coffee ritual feel special."},
  {id:9,name:"Sunglasses",category:"Fashion",price:899,oldPrice:1199,rating:4.4,tag:"TRENDING",image:"photo-1511499767150-a48a237f0083",description:"Versatile sunglasses that complete a casual or dressed-up look."},
  {id:10,name:"Bluetooth Speaker",category:"Electronics",price:1899,oldPrice:2399,rating:4.7,tag:"POPULAR",image:"photo-1608043152269-423dbba4e7e1",description:"Bring your favorite playlists to your desk, room or outdoor hangout."},
  {id:11,name:"Everyday Water Bottle",category:"Accessories",price:599,oldPrice:799,rating:4.5,tag:"ECO PICK",image:"photo-1602143407151-7111542de6e8",description:"A reusable water bottle to keep hydration close throughout the day."},
  {id:12,name:"Modern Table Vase",category:"Home",price:699,oldPrice:899,rating:4.3,tag:"NEW",image:"photo-1578500494198-246f612d3b3d",description:"A simple decorative vase for fresh flowers or a minimalist shelf."}
];

const money = n => "₹" + Math.round(n).toLocaleString("en-IN");
const imageUrl = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=650&q=80`;

function readStore(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

let cart = readStore("nova_cart", []);
let wishlist = readStore("nova_wishlist", []);
let orders = readStore("nova_orders", []);
let activeCategory = "All";
let searchTerm = "";
let sortMode = "featured";
let visibleCount = 8;
let discountRate = 0;
let currentProduct = null;
let toastTimer;

const $ = id => document.getElementById(id);

function saveState() {
  localStorage.setItem("nova_cart", JSON.stringify(cart));
  localStorage.setItem("nova_wishlist", JSON.stringify(wishlist));
  localStorage.setItem("nova_orders", JSON.stringify(orders));
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

function getFilteredProducts() {
  let list = products.filter(p => {
    const categoryMatch = activeCategory === "All" || p.category === activeCategory;
    const searchMatch = `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  if (sortMode === "low") list.sort((a,b) => a.price-b.price);
  if (sortMode === "high") list.sort((a,b) => b.price-a.price);
  if (sortMode === "rating") list.sort((a,b) => b.rating-a.rating);
  return list;
}

function renderProducts() {
  const list = getFilteredProducts();
  const visible = list.slice(0, visibleCount);

  $("productGrid").innerHTML = visible.map(p => `
    <article class="product-card">
      <div class="product-image" onclick="openProduct(${p.id})">
        <img src="${imageUrl(p.image)}" alt="${p.name}" loading="lazy">
        <span class="product-tag">${p.tag}</span>
        <button class="wish-button ${wishlist.includes(p.id) ? "selected" : ""}"
          aria-label="Toggle wishlist"
          onclick="event.stopPropagation();toggleWishlist(${p.id})">
          ${wishlist.includes(p.id) ? "♥" : "♡"}
        </button>
      </div>
      <div class="product-info">
        <span class="product-category">${p.category}</span>
        <h3 class="product-name" onclick="openProduct(${p.id})">${p.name}</h3>
        <div class="product-rating">★ ${p.rating} <span style="color:var(--muted)">· Customer favorite</span></div>
        <div class="product-price">${money(p.price)} <span class="old-price">${money(p.oldPrice)}</span></div>
        <button class="add-button" onclick="addToCart(${p.id})">Add to bag +</button>
      </div>
    </article>
  `).join("");

  $("resultCount").textContent = `${list.length} products`;
  $("emptyState").classList.toggle("hidden", list.length > 0);
  $("loadMore").classList.toggle("hidden", list.length <= visibleCount);
}

function filterCategory(category) {
  activeCategory = category;
  visibleCount = 8;

  document.querySelectorAll(".category").forEach(button => {
    button.classList.toggle("active", button.dataset.category === category);
  });

  renderProducts();
  $("shop").scrollIntoView({behavior:"smooth"});
}

function showHome() {
  activeCategory = "All";
  searchTerm = "";
  $("searchInput").value = "";
  filterCategory("All");
  window.scrollTo({top:0,behavior:"smooth"});
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty++;
  else cart.push({id,qty:1});

  saveState();
  renderCart();
  toast("Added to your bag!");
}

function changeQty(id, change) {
  const item = cart.find(p => p.id === id);
  if (!item) return;
  item.qty += change;
  if (item.qty <= 0) cart = cart.filter(p => p.id !== id);
  saveState();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(p => p.id !== id);
  saveState();
  renderCart();
  toast("Item removed from your bag.");
}

function getCartTotals() {
  const subtotal = cart.reduce((sum,item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  },0);

  const discount = Math.round(subtotal * discountRate);
  const shipping = subtotal === 0 || subtotal >= 1999 ? 0 : 99;
  return {subtotal,discount,shipping,total:subtotal-discount+shipping};
}

function renderCart() {
  const count = cart.reduce((sum,item) => sum + item.qty,0);
  $("cartCount").textContent = count;
  $("drawerCount").textContent = count ? `(${count})` : "";
  const totals = getCartTotals();

  if (!cart.length) {
    $("cartItems").innerHTML = `<div class="empty-state"><h3>Your bag is waiting</h3><p>Add something you love to get started.</p><button class="primary-button" onclick="closePanels();document.getElementById('shop').scrollIntoView({behavior:'smooth'})">Explore products</button></div>`;
  } else {
    $("cartItems").innerHTML = cart.map(item => {
      const p = products.find(product => product.id === item.id);
      if (!p) return "";
      return `<div class="cart-item">
        <img src="${imageUrl(p.image)}" alt="${p.name}">
        <div><h4>${p.name}</h4><p>${money(p.price)}</p>
          <div class="qty-controls">
            <button onclick="changeQty(${p.id},-1)" aria-label="Decrease quantity">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${p.id},1)" aria-label="Increase quantity">+</button>
          </div>
          <button class="remove-item" onclick="removeFromCart(${p.id})">Remove</button>
        </div>
        <strong>${money(p.price*item.qty)}</strong>
      </div>`;
    }).join("");
  }

  $("subtotal").textContent = money(totals.subtotal);
  $("discount").textContent = "-" + money(totals.discount);
  $("shipping").textContent = totals.shipping ? money(totals.shipping) : "FREE";
  $("total").textContent = money(totals.total);
}

function toggleWishlist(id) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(item => item !== id);
    toast("Removed from wishlist.");
  } else {
    wishlist.push(id);
    toast("Saved to your wishlist!");
  }

  saveState();
  $("wishCount").textContent = wishlist.length;
  renderProducts();

  if (!$("wishlistModal").classList.contains("hidden")) renderWishlist();
}

function renderWishlist() {
  const items = products.filter(p => wishlist.includes(p.id));
  $("wishlistContent").innerHTML = items.length ? `
    <div class="product-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:20px">
      ${items.map(p => `<article class="product-card">
        <div class="product-image" onclick="closePanels();openProduct(${p.id})"><img src="${imageUrl(p.image)}" alt="${p.name}"></div>
        <div class="product-info"><h3>${p.name}</h3><p>${money(p.price)}</p>
        <button class="add-button" onclick="addToCart(${p.id})">Add to bag</button>
        <button class="remove-item" onclick="toggleWishlist(${p.id})">Remove from wishlist</button></div>
      </article>`).join("")}
    </div>` : `<p class="empty-state">Your wishlist is empty. Save your favorite finds here.</p>`;
}

function openProduct(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;
  currentProduct = p;

  $("productDetail").innerHTML = `
    <div class="detail-grid">
      <img src="${imageUrl(p.image)}" alt="${p.name}">
      <div>
        <span class="eyebrow">${p.category.toUpperCase()}</span>
        <h2>${p.name}</h2>
        <div class="product-rating">★ ${p.rating} / 5</div>
        <p class="detail-price">${money(p.price)} <span class="old-price">${money(p.oldPrice)}</span></p>
        <p class="detail-description">${p.description}</p>
        <p class="detail-description">✓ Carefully selected<br>✓ Everyday versatility<br>✓ Easy online ordering</p>
        <button class="primary-button" onclick="addToCart(${p.id});closePanels();openCart()">Add to bag — ${money(p.price)}</button>
        <button class="secondary-button full-button" onclick="toggleWishlist(${p.id})">♡ Save to wishlist</button>
      </div>
    </div>`;

  openPanel("productModal");
}

function openPanel(id) {
  $("overlay").classList.remove("hidden");
  document.querySelectorAll(".drawer,.modal").forEach(el => el.classList.add("hidden"));
  $(id).classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closePanels() {
  $("overlay").classList.add("hidden");
  document.querySelectorAll(".drawer,.modal").forEach(el => el.classList.add("hidden"));
  document.body.style.overflow = "";
}

function openCart() {
  renderCart();
  openPanel("cartDrawer");
}

function applyCoupon(event) {
  event.preventDefault();
  const code = $("couponInput").value.trim().toUpperCase();

  if (code === "NOVA10") {
    discountRate = 0.10;
    $("couponMessage").textContent = "Success! 10% discount applied.";
  } else {
    discountRate = 0;
    $("couponMessage").textContent = code ? "Invalid code. Try NOVA10." : "Enter a discount code.";
  }
  renderCart();
}

function openCheckout() {
  if (!cart.length) {
    toast("Your bag is empty.");
    return;
  }

  const totals = getCartTotals();
  $("checkoutContent").innerHTML = `
    <form id="checkoutForm" class="form-stack">
      <span class="eyebrow">ALMOST YOURS</span>
      <h2>Checkout</h2>
      <p>Enter your delivery details to complete this demo order.</p>
      <div class="order-summary">
        <p><span>Items (${cart.reduce((s,i)=>s+i.qty,0)})</span><strong>${money(totals.subtotal)}</strong></p>
        <p><span>Discount</span><strong>-${money(totals.discount)}</strong></p>
        <p><span>Shipping</span><strong>${totals.shipping ? money(totals.shipping) : "FREE"}</strong></p>
        <p><strong>Total</strong><strong>${money(totals.total)}</strong></p>
      </div>
      <label>Full name<input name="name" required maxlength="80" autocomplete="name" placeholder="Your full name"></label>
      <label>Email address<input name="email" required type="email" autocomplete="email" placeholder="you@example.com"></label>
      <label>Phone number<input name="phone" required type="tel" pattern="[0-9+() -]{7,18}" autocomplete="tel" placeholder="Your contact number"></label>
      <label>Delivery address<textarea name="address" required maxlength="300" rows="3" autocomplete="street-address" placeholder="House number, street, city, PIN code"></textarea></label>
      <label>Payment method
        <select name="payment" required>
          <option value="Cash on Delivery">Cash on Delivery (demo)</option>
          <option value="Demo online payment">Online payment (demo only)</option>
        </select>
      </label>
      <p>Demo only: no payment is taken and no real order is sent to a seller.</p>
      <button class="primary-button full-button" type="submit">Place demo order — ${money(totals.total)}</button>
    </form>`;

  $("checkoutForm").addEventListener("submit", placeOrder);
  openPanel("checkoutModal");
}

function placeOrder(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const totals = getCartTotals();
  const order = {
    number: "NOVA-" + Date.now().toString().slice(-8),
    date: new Date().toLocaleDateString("en-IN"),
    name: data.get("name"),
    email: data.get("email"),
    payment: data.get("payment"),
    items: cart.map(item => ({...item})),
    total: totals.total
  };

  orders.unshift(order);
  saveState();
  cart = [];
  discountRate = 0;
  $("couponInput").value = "";
  $("couponMessage").textContent = "";
  renderCart();

  $("checkoutContent").innerHTML = `
    <div class="order-success">
      <div class="success-icon">✓</div>
      <span class="eyebrow">ORDER CONFIRMED</span>
      <h2>Thank you, ${escapeHtml(order.name)}!</h2>
      <p>Your demo order has been created successfully.</p>
      <div class="order-summary">
        <p><span>Order reference</span><strong>${order.number}</strong></p>
        <p><span>Total</span><strong>${money(order.total)}</strong></p>
        <p><span>Payment</span><strong>${escapeHtml(order.payment)}</strong></p>
      </div>
      <p class="detail-description">This is a demonstration. No real purchase or payment has occurred.</p>
      <button class="primary-button full-button" onclick="closePanels();showHome()">Continue shopping</button>
    </div>`;
  toast("Demo order placed!");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[char]));
}

function openAccount() {
  $("accountContent").innerHTML = `
    <div class="form-stack">
      <span class="eyebrow">YOUR NOVA SPACE</span>
      <h2>My account</h2>
      <p>This is a local demo profile. It does not create a real online account.</p>
      <label>Your name<input id="profileName" maxlength="80" placeholder="Enter your name" value="${escapeHtml(localStorage.getItem("nova_name") || "")}"></label>
      <label>Your email<input id="profileEmail" type="email" placeholder="you@example.com" value="${escapeHtml(localStorage.getItem("nova_email") || "")}"></label>
      <button class="primary-button full-button" onclick="saveProfile()">Save demo profile</button>
      <h3>Recent demo orders</h3>
      <div>${orders.length ? orders.slice(0,5).map(o => `<div class="order-summary" style="margin-bottom:10px"><p><strong>${o.number}</strong><strong>${money(o.total)}</strong></p><p><span>${o.date}</span><span>${o.items.reduce((s,i)=>s+i.qty,0)} item(s)</span></p></div>`).join("") : "<p>No orders yet.</p>"}</div>
    </div>`;
  openPanel("accountModal");
}

function saveProfile() {
  const name = $("profileName").value.trim();
  const email = $("profileEmail").value.trim();

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    toast("Please enter a name and valid email.");
    return;
  }

  localStorage.setItem("nova_name",name);
  localStorage.setItem("nova_email",email);
  toast("Demo profile saved on this device.");
}

$("searchForm").addEventListener("submit", event => {
  event.preventDefault();
  searchTerm = $("searchInput").value.trim();
  visibleCount = 12;
  renderProducts();
  $("shop").scrollIntoView({behavior:"smooth"});
});

$("categories").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (button) filterCategory(button.dataset.category);
});

$("sortSelect").addEventListener("change", event => {
  sortMode = event.target.value;
  renderProducts();
});

$("loadMore").addEventListener("click", () => {
  visibleCount += 4;
  renderProducts();
});

$("cartBtn").addEventListener("click", openCart);
$("wishlistBtn").addEventListener("click", () => {
  renderWishlist();
  openPanel("wishlistModal");
});
$("accountBtn").addEventListener("click", openAccount);
$("footerAccount").addEventListener("click", event => {
  event.preventDefault();
  openAccount();
});
$("couponForm").addEventListener("submit", applyCoupon);
$("checkoutBtn").addEventListener("click", openCheckout);
$("overlay").addEventListener("click", closePanels);

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", closePanels);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closePanels();
});

$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  $("themeBtn").textContent = isDark ? "☀" : "☾";
  localStorage.setItem("nova_theme",isDark ? "dark" : "light");
});

$("newsletterForm").addEventListener("submit", event => {
  event.preventDefault();
  const email = $("newsletterEmail").value.trim();
  if (!email) return;
  $("newsletterMessage").textContent = "Thanks for signing up! This demo does not send emails.";
  $("newsletterEmail").value = "";
});

function init() {
  $("year").textContent = new Date().getFullYear();
  $("wishCount").textContent = wishlist.length;

  if (localStorage.getItem("nova_theme") === "dark") {
    document.body.classList.add("dark");
    $("themeBtn").textContent = "☀";
  }

  renderProducts();
  renderCart();
}

init();