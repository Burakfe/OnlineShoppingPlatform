// Fake frontend-only data.
// No real backend, no database, no payment gateway.

let currentUser = null;

let users = [
  { id: 1, name: "Demo Customer", email: "customer@demo.com", password: "1234", role: "customer", status: "Active" },
  { id: 2, name: "System Admin", email: "admin@demo.com", password: "admin123", role: "admin", status: "Active" }
];

let products = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 89.99,
    stock: 12,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700",
    description: "Noise-reducing wireless headphones with long battery life.",
    reviews: [{ user: "Alice", rating: 5, text: "Very comfortable and high quality." }]
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    price: 129.99,
    stock: 5,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700",
    description: "Track fitness, notifications, and daily activity.",
    reviews: [{ user: "Mehmet", rating: 4, text: "Good value for the price." }]
  },
  {
    id: 3,
    name: "Cotton Hoodie",
    category: "Clothing",
    price: 49.99,
    stock: 20,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=700",
    description: "Soft casual hoodie suitable for everyday wear.",
    reviews: []
  },
  {
    id: 4,
    name: "Desk Lamp",
    category: "Home",
    price: 34.99,
    stock: 2,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700",
    description: "Modern LED desk lamp with adjustable brightness.",
    reviews: []
  },
  {
    id: 5,
    name: "Software Engineering Book",
    category: "Books",
    price: 59.99,
    stock: 0,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700",
    description: "A useful reference book for software engineering students.",
    reviews: []
  }
];

let cart = [];
let orders = [
  {
    id: 1001,
    userId: 1,
    items: [{ name: "Smart Watch", quantity: 1, price: 129.99 }],
    total: 129.99,
    status: "Shipped",
    date: "2026-05-01"
  }
];

function showPage(id) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  if (id === "home") renderProducts();
  if (id === "cart") renderCart();
  if (id === "checkout") renderCheckout();
  if (id === "orders") renderOrders();
}

function goHome() {
  showPage("home");
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.style.display = "block";
  setTimeout(() => el.style.display = "none", 2200);
}

function updateAuthUI() {
  const btn = document.getElementById("authButton");
  if (currentUser) {
    btn.textContent = `Logout (${currentUser.role})`;
    btn.onclick = logout;
  } else {
    btn.textContent = "Login";
    btn.onclick = () => showPage("login");
  }
}

function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    toast("Wrong password or user not found");
    return;
  }

  currentUser = user;
  updateAuthUI();
  toast("Login successful");

  if (user.role === "admin") {
    showPage("admin");
    renderAdmin("dashboard");
  } else {
    showPage("home");
  }
}

function register() {
  const email = document.getElementById("email").value.trim() || `newuser${users.length + 1}@demo.com`;
  const password = document.getElementById("password").value.trim() || "1234";

  const newUser = {
    id: users.length + 1,
    name: "New Customer",
    email,
    password,
    role: "customer",
    status: "Active"
  };

  users.push(newUser);
  currentUser = newUser;
  updateAuthUI();
  toast("Registration successful. Customer logged in.");
  showPage("home");
}

function logout() {
  currentUser = null;
  updateAuthUI();
  toast("Logged out successfully");
  showPage("home");
}

function tryAdmin() {
  if (!currentUser || currentUser.role !== "admin") {
    showPage("accessDenied");
    return;
  }
  showPage("admin");
  renderAdmin("dashboard");
}

function stockBadge(product) {
  if (product.stock === 0) return `<span class="badge out-stock">Out of Stock</span>`;
  if (product.stock <= 3) return `<span class="badge low-stock">Low Stock: ${product.stock}</span>`;
  return `<span class="badge in-stock">In Stock: ${product.stock}</span>`;
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  const search = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const category = document.getElementById("categoryFilter")?.value || "All";

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search);
    const matchesCategory = category === "All" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="panel"><h3>No products found</h3><p>Try another keyword or category.</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="card">
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p class="muted">${p.category}</p>
      <p><b>$${p.price.toFixed(2)}</b></p>
      ${stockBadge(p)}
      <div class="button-row">
        <button onclick="openProduct(${p.id})">View Details</button>
        <button class="primary" onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    </div>
  `).join("");
}

function openProduct(id) {
  const p = products.find(product => product.id === id);

  document.getElementById("detailContent").innerHTML = `
    <div class="detail-layout">
      <img class="detail-image" src="${p.image}" alt="${p.name}">
      <div class="panel">
        <h1>${p.name}</h1>
        <p class="muted">${p.category}</p>
        <h2>$${p.price.toFixed(2)}</h2>
        ${stockBadge(p)}
        <p>${p.description}</p>

        <h3>Reviews</h3>
        ${p.reviews.length ? p.reviews.map(r => `<p>⭐ ${r.rating}/5 - <b>${r.user}</b>: ${r.text}</p>`).join("") : "<p>No reviews yet.</p>"}

        <div class="button-row">
          <button class="primary" onclick="addToCart(${p.id})">Add to Cart</button>
          <button onclick="openReview(${p.id})">Write Review</button>
          <button onclick="showPage('home')">Back</button>
        </div>
      </div>
    </div>
  `;

  showPage("productDetail");
}

function addToCart(productId) {
  if (!currentUser) {
    toast("Please login before adding products to cart");
    showPage("login");
    return;
  }

  const product = products.find(p => p.id === productId);

  if (product.stock === 0) {
    toast("Out of stock, can\'t add to cart");
    return;
  }

  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  document.getElementById("cartCount").textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  toast("Product added to cart");
}

function renderCart() {
  const el = document.getElementById("cartContent");

  if (!currentUser) {
    el.innerHTML = `<div class="panel"><h2>Please login first</h2><button onclick="showPage('login')">Login</button></div>`;
    return;
  }

  if (cart.length === 0) {
    el.innerHTML = `<div class="panel"><h2>Your cart is empty</h2><button onclick="showPage('home')">Browse Products</button></div>`;
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  el.innerHTML = `
    <div class="panel">
      <table class="table">
        <tr>
          <th>Product</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Total</th>
          <th>Action</th>
        </tr>
        ${cart.map(item => `
          <tr>
            <td>${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>
              <button onclick="changeQuantity(${item.id}, -1)">-</button>
              ${item.quantity}
              <button onclick="changeQuantity(${item.id}, 1)">+</button>
            </td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
            <td><button class="danger" onclick="removeFromCart(${item.id})">Remove</button></td>
          </tr>
        `).join("")}
      </table>
      <h2>Total: $${total.toFixed(2)}</h2>
      <button class="primary" onclick="showPage('checkout')">Checkout</button>
    </div>
  `;
}

function changeQuantity(id, change) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  document.getElementById("cartCount").textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  toast("Cart quantity updated");
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  document.getElementById("cartCount").textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  toast("Product removed from cart");
  renderCart();
}

function renderCheckout() {
  const el = document.getElementById("checkoutSummary");

  if (!currentUser || cart.length === 0) {
    el.innerHTML = `<p>Checkout requires logged-in customer and non-empty cart.</p>`;
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  el.innerHTML = `
    ${cart.map(item => `<p>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</p>`).join("")}
    <hr>
    <h2>Total: $${total.toFixed(2)}</h2>
  `;
}

function simulatePayment(success) {
  if (!currentUser || cart.length === 0) {
    toast("Invalid checkout state");
    return;
  }

  if (!success) {
    toast("Payment failed, please retry");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const newOrder = {
    id: Math.floor(1000 + Math.random() * 9000),
    userId: currentUser.id,
    items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
    total,
    status: "Processing",
    date: new Date().toISOString().slice(0, 10)
  };

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (product) product.stock = Math.max(0, product.stock - item.quantity);
  });

  orders.push(newOrder);
  cart = [];
  document.getElementById("cartCount").textContent = 0;

  toast("Order created successfully");
  showPage("confirmation");
}

function renderOrders() {
  const el = document.getElementById("ordersContent");

  if (!currentUser) {
    el.innerHTML = `<div class="panel"><h2>Please login to view orders</h2></div>`;
    return;
  }

  const visibleOrders = currentUser.role === "admin" ? orders : orders.filter(o => o.userId === currentUser.id);

  if (visibleOrders.length === 0) {
    el.innerHTML = `<div class="panel"><h2>No orders found</h2></div>`;
    return;
  }

  el.innerHTML = visibleOrders.map(order => `
    <div class="panel" style="margin-bottom:16px;">
      <h2>Order #${order.id}</h2>
      <p>Date: ${order.date}</p>
      <p>Total: $${order.total.toFixed(2)}</p>
      <div class="order-status">
        <span class="step ${order.status === "Processing" ? "active" : ""}">Processing</span>
        <span class="step ${order.status === "Shipped" ? "active" : ""}">Shipped</span>
        <span class="step ${order.status === "Delivered" ? "active" : ""}">Delivered</span>
      </div>
      ${order.items.map(item => `<p>${item.name} x ${item.quantity}</p>`).join("")}
    </div>
  `).join("");
}

function openReview(productId) {
  const product = products.find(p => p.id === productId);

  if (!currentUser) {
    toast("Please login to write review");
    showPage("login");
    return;
  }

  document.getElementById("reviewContent").innerHTML = `
    <div class="panel">
      <h2>Write Review for ${product.name}</h2>
      <select id="reviewRating">
        <option value="5">5 Stars</option>
        <option value="4">4 Stars</option>
        <option value="3">3 Stars</option>
        <option value="2">2 Stars</option>
        <option value="1">1 Star</option>
      </select>
      <textarea id="reviewText" placeholder="Write your review...">Great product for demo purposes.</textarea>
      <button class="primary" onclick="submitReview(${productId})">Submit Review</button>
      <button onclick="openProduct(${productId})">Cancel</button>
    </div>
  `;

  showPage("reviews");
}

function submitReview(productId) {
  const product = products.find(p => p.id === productId);
  const rating = Number(document.getElementById("reviewRating").value);
  const text = document.getElementById("reviewText").value.trim();

  if (!text) {
    toast("Invalid input: review cannot be empty");
    return;
  }

  product.reviews.push({
    user: currentUser.name,
    rating,
    text
  });

  toast("Review submitted and recommendations updated");
  openProduct(productId);
}

function renderAdmin(section) {
  if (!currentUser || currentUser.role !== "admin") {
    showPage("accessDenied");
    return;
  }

  const el = document.getElementById("adminContent");

  if (section === "dashboard") {
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    el.innerHTML = `
      <h1>Admin Dashboard</h1>
      <div class="stats">
        <div class="stat-card"><h3>Revenue</h3><h2>$${revenue.toFixed(2)}</h2></div>
        <div class="stat-card"><h3>Orders</h3><h2>${orders.length}</h2></div>
        <div class="stat-card"><h3>Products</h3><h2>${products.length}</h2></div>
        <div class="stat-card"><h3>Users</h3><h2>${users.length}</h2></div>
      </div>
      <h2>Revenue Chart</h2>
      <div class="fake-chart">
        <div class="bar" style="height:45%"></div>
        <div class="bar" style="height:70%"></div>
        <div class="bar" style="height:35%"></div>
        <div class="bar" style="height:85%"></div>
        <div class="bar" style="height:55%"></div>
      </div>
      <p class="muted">Demo analytics: revenue, product performance, inventory status.</p>
    `;
  }

  if (section === "products") {
    el.innerHTML = `
      <h1>Product Management</h1>
      <button class="primary" onclick="addProduct()">Add Product</button>
      <table class="table">
        <tr><th>Name</th><th>Price</th><th>Stock</th><th>Stock Edit</th><th>Action</th></tr>
        ${products.map(p => `
          <tr>
            <td>${p.name}</td>
            <td>$${p.price.toFixed(2)}</td>
            <td>${p.stock}</td>
            <td>
              <button onclick="updateStock(${p.id}, -1)">-</button>
              <button onclick="updateStock(${p.id}, 1)">+</button>
            </td>
            <td>
              <button onclick="editProduct(${p.id})">Edit Price</button>
              <button class="danger" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
          </tr>
        `).join("")}
      </table>
      <p class="muted">Demo edit controls: admin can increase/decrease stock and edit price using fake frontend data.</p>
    `;
  }

  if (section === "orders") {
    el.innerHTML = `
      <h1>Order Management</h1>
      <table class="table">
        <tr><th>Order ID</th><th>Total</th><th>Status</th><th>Update</th></tr>
        ${orders.map(o => `
          <tr>
            <td>#${o.id}</td>
            <td>$${o.total.toFixed(2)}</td>
            <td>${o.status}</td>
            <td>
              <select onchange="updateOrderStatus(${o.id}, this.value)">
                <option ${o.status === "Processing" ? "selected" : ""}>Processing</option>
                <option ${o.status === "Shipped" ? "selected" : ""}>Shipped</option>
                <option ${o.status === "Delivered" ? "selected" : ""}>Delivered</option>
              </select>
            </td>
          </tr>
        `).join("")}
      </table>
    `;
  }

  if (section === "users") {
    el.innerHTML = `
      <h1>User Management</h1>
      <table class="table">
        <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr>
        ${users.map(u => `
          <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${u.status}</td>
            <td><button class="danger" onclick="deleteUser(${u.id})" ${u.role === "admin" ? "disabled" : ""}>Delete</button></td>
          </tr>
        `).join("")}
      </table>
    `;
  }
}

function addProduct() {
  const newProduct = {
    id: Date.now(),
    name: "New Demo Product",
    category: "Electronics",
    price: 99.99,
    stock: 10,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=700",
    description: "New product added by admin during prototype demo.",
    reviews: []
  };

  products.push(newProduct);
  toast("Product added successfully");
  renderAdmin("products");
}

function editProduct(id) {
  const product = products.find(p => p.id === id);
  const newPrice = prompt("Enter new price:", product.price.toFixed(2));

  if (newPrice === null) {
    toast("Edit cancelled");
    return;
  }

  const parsedPrice = Number(newPrice);

  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    toast("Invalid input: price must be a positive number");
    return;
  }

  product.price = parsedPrice;
  toast("Product updated successfully");
  renderAdmin("products");
}

function updateStock(id, change) {
  const product = products.find(p => p.id === id);

  if (!product) return;

  const newStock = product.stock + change;

  if (newStock < 0) {
    toast("Stock cannot be below 0");
    return;
  }

  product.stock = newStock;
  toast("Stock updated successfully");
  renderAdmin("products");
}

function deleteProduct(id) {
  products = products.filter(p => p.id !== id);
  toast("Product deleted successfully");
  renderAdmin("products");
}

function updateOrderStatus(orderId, status) {
  const order = orders.find(o => o.id === orderId);
  order.status = status;
  toast("Order status updated");
}

function deleteUser(id) {
  users = users.filter(u => u.id !== id);
  toast("User account deleted");
  renderAdmin("users");
}

renderProducts();
updateAuthUI();
