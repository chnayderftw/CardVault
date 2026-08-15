var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_dotenv2 = __toESM(require("dotenv"), 1);
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_qrcode = __toESM(require("qrcode"), 1);
var import_vite = require("vite");

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "cardvault_db.json");
if (!import_fs.default.existsSync(DATA_DIR)) {
  import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
}
var DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin.CC.adminv@gmail.com").toLowerCase().trim();
var DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "adminCC.adminV";
var DEFAULT_USDT_ADDRESS = process.env.USDT_TRC20_ADDRESS || "TG1LiM1h3iLf654gAx1msadrDf65q2AbAC";
var LocalStorageManager = class {
  constructor() {
    this.data = this.loadInitialData();
  }
  loadInitialData() {
    if (import_fs.default.existsSync(DB_FILE)) {
      try {
        const raw = import_fs.default.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (!parsed.payments) parsed.payments = [];
        return parsed;
      } catch (e) {
        console.warn("Could not parse local data file, resetting to defaults");
      }
    }
    const salt = import_bcryptjs.default.genSaltSync(10);
    const adminHash = import_bcryptjs.default.hashSync(DEFAULT_ADMIN_PASSWORD, salt);
    const userHash = import_bcryptjs.default.hashSync("password123", salt);
    const initialUsers = [
      {
        id: "usr_admin_01",
        email: DEFAULT_ADMIN_EMAIL,
        fullName: "CardVault Administrator",
        role: "admin",
        createdAt: (/* @__PURE__ */ new Date("2026-01-01T00:00:00Z")).toISOString(),
        status: "active",
        passwordHash: adminHash
      },
      {
        id: "usr_demo_02",
        email: "buyer@example.com",
        fullName: "Alex Reynolds",
        role: "user",
        createdAt: (/* @__PURE__ */ new Date("2026-01-15T10:30:00Z")).toISOString(),
        status: "active",
        passwordHash: userHash
      }
    ];
    const initialCategories = [
      { id: "cat_all", name: "All", slug: "all", description: "All available cards", active: true },
      { id: "cat_std", name: "Standard", slug: "standard", description: "Standard quality cards ($1,425 - $4,225 Balance)", active: true },
      { id: "cat_hq", name: "HQ", slug: "hq", description: "High Quality (HQ) high-balance verified cards ($6,485 - $8,600 Balance)", active: true },
      { id: "cat_uhq", name: "UHQ", slug: "uhq", description: "Ultra High Quality (UHQ) top-tier instant balance cards ($18,000+ - $42,000+ Balance)", active: true },
      { id: "cat_binance", name: "Binance", slug: "binance", description: "Verified Binance Accounts with high pre-loaded balance ($42,000+ USD)", active: true },
      { id: "cat_visa", name: "Visa", slug: "visa", description: "Visa cards for worldwide use", active: true },
      { id: "cat_mc", name: "Mastercard", slug: "mastercard", description: "Mastercard cards for global shopping", active: true },
      { id: "cat_amex", name: "American Express", slug: "american-express", description: "American Express cards", active: true }
    ];
    const initialProducts = [
      // Standard Category
      {
        id: "prod_visa_std_1425",
        name: "Visa Card Standard Balance : 1425 USD",
        brand: "Visa",
        category: "Standard",
        cardType: "Standard",
        value: 1425,
        price: 40,
        region: "US",
        image: "/cards/visa-100.png",
        description: "Standard Visa Card pre-loaded with $1,425 USD balance. Accepted anywhere Visa debit cards are accepted in the United States and online. Includes secure reference delivery upon verified payment.",
        terms: "Non-reloadable card. Valid for 24 months from activation. Instant digital issuance of card reference voucher upon payment approval.",
        availability: "in_stock",
        stockCount: 48,
        seller: "CardVault Official",
        rating: 4.95,
        ratingCount: 142,
        featured: true,
        createdAt: "2026-01-01T00:00:00Z"
      },
      {
        id: "prod_visa_std_1800",
        name: "Visa Card Standard Balance : 1800+ USD",
        brand: "Visa",
        category: "Standard",
        cardType: "Standard",
        value: 1800,
        price: 48,
        region: "US",
        image: "/cards/visa-50.png",
        description: "Standard Visa Card pre-funded with $1,800+ USD balance. Perfect for small online purchases, software subscriptions, and secure shopping.",
        terms: "Valid across all US electronic merchants. Zero maintenance fees.",
        availability: "in_stock",
        stockCount: 35,
        seller: "CardVault Official",
        rating: 4.88,
        ratingCount: 89,
        featured: false,
        createdAt: "2026-01-02T00:00:00Z"
      },
      {
        id: "prod_mc_std_2400",
        name: "Mastercard Standard Balance : 2400+ USD",
        brand: "Mastercard",
        category: "Standard",
        cardType: "Standard",
        value: 2400,
        price: 60,
        region: "Global",
        image: "/cards/mc-100.png",
        description: "Mastercard card with $2,400+ USD balance credit. Fast delivery, widely accepted worldwide at millions of online merchants.",
        terms: "Usable globally at all digital POS accepting Mastercard debit.",
        availability: "in_stock",
        stockCount: 60,
        seller: "CardVault Official",
        rating: 4.9,
        ratingCount: 95,
        featured: false,
        createdAt: "2026-01-04T00:00:00Z"
      },
      {
        id: "prod_amex_std_4225",
        name: "American Express Standard Balance : 4225 USD",
        brand: "American Express",
        category: "Standard",
        cardType: "Standard",
        value: 4225,
        price: 92,
        region: "Global",
        image: "/cards/amex-200.png",
        description: "American Express card pre-loaded with $4,225 USD balance. Ideal for SaaS subscriptions, digital advertising ad spend, and luxury merchant checkouts.",
        terms: "Valid on all Amex-compatible payment gateways worldwide.",
        availability: "in_stock",
        stockCount: 18,
        seller: "Apex Digital LLC",
        rating: 4.92,
        ratingCount: 76,
        featured: false,
        createdAt: "2026-01-05T00:00:00Z"
      },
      // HQ Category
      {
        id: "prod_mc_hq_6485",
        name: "Mastercard HQ Balance : 6485 USD",
        brand: "Mastercard",
        category: "HQ",
        cardType: "HQ",
        value: 6485,
        price: 135,
        region: "Global",
        image: "/cards/mc-250.png",
        description: "HQ High Quality Mastercard card with $6,485 USD balance. Global acceptance for travel, hotel reservations, and high-value online transactions.",
        terms: "International worldwide coverage. Full 3D Secure / OTP enabled upon request.",
        availability: "in_stock",
        stockCount: 22,
        seller: "CardVault Premium",
        rating: 4.98,
        ratingCount: 210,
        featured: true,
        createdAt: "2026-01-03T00:00:00Z"
      },
      {
        id: "prod_amex_hq_8600",
        name: "American Express HQ Balance : 8600 USD",
        brand: "American Express",
        category: "HQ",
        cardType: "HQ",
        value: 8600,
        price: 200,
        region: "Global",
        image: "/cards/amex-200.png",
        description: "High Quality American Express card loaded with $8,600 USD balance. High-limit verified card for premium transactions and global payments.",
        terms: "HQ tier. Instant balance availability with full Amex merchant network compatibility.",
        availability: "in_stock",
        stockCount: 16,
        seller: "Apex Digital LLC",
        rating: 4.96,
        ratingCount: 138,
        featured: true,
        createdAt: "2026-01-05T12:00:00Z"
      },
      {
        id: "prod_amex_hq_8000",
        name: "American Express HQ Balance : 8000+ USD",
        brand: "American Express",
        category: "HQ",
        cardType: "HQ",
        value: 8e3,
        price: 200,
        region: "Global",
        image: "/cards/amex-500.png",
        description: "High Quality American Express card pre-funded with $8,000+ USD balance. Unrestricted global business and personal spending.",
        terms: "HQ tier card. Instant digital delivery upon payment verification.",
        availability: "in_stock",
        stockCount: 14,
        seller: "Apex Digital LLC",
        rating: 4.94,
        ratingCount: 105,
        featured: false,
        createdAt: "2026-01-05T14:00:00Z"
      },
      // UHQ Category
      {
        id: "prod_amex_uhq_20000",
        name: "American Express UHQ Balance : 20,000+ USD",
        brand: "American Express",
        category: "UHQ",
        cardType: "UHQ",
        value: 2e4,
        price: 470,
        region: "Global",
        image: "/cards/amex-500.png",
        description: "Ultra High Quality American Express corporate-grade card with $20,000+ USD balance. High limit, seamless frictionless authorization.",
        terms: "UHQ tier. Instant balance availability with zero monthly maintenance deduction.",
        availability: "in_stock",
        stockCount: 12,
        seller: "Apex Digital LLC",
        rating: 5,
        ratingCount: 164,
        featured: true,
        createdAt: "2026-01-06T00:00:00Z"
      },
      {
        id: "prod_visa_uhq_40000",
        name: "Visa UHQ Balance : 40,000+ USD",
        brand: "Visa",
        category: "UHQ",
        cardType: "UHQ",
        value: 4e4,
        price: 920,
        region: "US",
        image: "/cards/visa-500.png",
        description: "UHQ Ultra High Quality Visa card pre-loaded with $40,000+ USD balance. Perfect for enterprise SaaS billing, flight bookings, and bulk payments.",
        terms: "Non-reloadable high limit digital card. Instant credential reveal upon payment confirmation.",
        availability: "in_stock",
        stockCount: 15,
        seller: "CardVault Official",
        rating: 4.99,
        ratingCount: 180,
        featured: true,
        createdAt: "2026-01-07T00:00:00Z"
      },
      {
        id: "prod_mc_uhq_18000",
        name: "Mastercard UHQ Balance : 18,000+ USD",
        brand: "Mastercard",
        category: "UHQ",
        cardType: "UHQ",
        value: 18e3,
        price: 465,
        region: "Global",
        image: "/cards/mc-500.png",
        description: "Mastercard UHQ card with $18,000+ USD total purchasing capacity. Unrestricted cross-border purchases.",
        terms: "International global card with unlimited online transaction frequency up to balance.",
        availability: "in_stock",
        stockCount: 14,
        seller: "CardVault Premium",
        rating: 4.97,
        ratingCount: 112,
        featured: false,
        createdAt: "2026-01-08T00:00:00Z"
      },
      {
        id: "prod_binance_std_2200",
        name: "Binance Account Standard Balance : 2200+ USD",
        brand: "Binance",
        category: "Binance",
        cardType: "Standard",
        value: 2200,
        price: 54,
        region: "Global",
        image: "/cards/binance-2200.png",
        description: "Verified Binance Account Standard pre-loaded with $2,200+ USD cryptocurrency balance. Fully verified account with clean transaction history and unrestricted trading limits.",
        terms: "Instant digital delivery of Binance login credentials, security PIN, and 2FA recovery backup upon verified USDT payment.",
        availability: "in_stock",
        stockCount: 20,
        seller: "CardVault Official",
        rating: 4.95,
        ratingCount: 94,
        featured: false,
        createdAt: "2026-01-08T14:00:00Z"
      },
      {
        id: "prod_binance_uhq_42000",
        name: "Binance Account UHQ Balance : 42,000+ USD",
        brand: "Binance",
        category: "Binance",
        cardType: "UHQ",
        value: 42e3,
        price: 400,
        region: "Global",
        image: "/cards/binance-42000.png",
        description: "Verified Binance Account UHQ pre-loaded with $42,000+ USD cryptocurrency balance. Fully verified Level 2 account with instant withdrawal limits, clean security logs, and 2FA recovery backup.",
        terms: "Complete account credentials, email login, seed phrase, and 2FA backup codes delivered immediately upon verified USDT payment.",
        availability: "in_stock",
        stockCount: 10,
        seller: "CardVault Official",
        rating: 5,
        ratingCount: 186,
        featured: true,
        createdAt: "2026-01-08T12:00:00Z"
      }
    ];
    const initialSettings = {
      storeName: "CardVault",
      usdtTrc20Address: DEFAULT_USDT_ADDRESS,
      paymentInstructions: "Please transfer the exact USDT amount on the TRON (TRC20) network to our merchant address. After sending, paste your Transaction Hash (TXID) below to instantly submit verification.",
      supportEmail: "support@cardvault.io",
      telegramSupport: "@CardVaultOfficial",
      exchangeRateUsdt: 1,
      minConfirmationBlocks: 1
    };
    const initialInventory = [
      { id: "inv_01", productId: "prod_visa_100", productName: "Visa Card $100", tokenReference: "CV-V100-REF-892401-US", isAssigned: false, createdAt: "2026-01-01T00:00:00Z" },
      { id: "inv_02", productId: "prod_visa_100", productName: "Visa Card $100", tokenReference: "CV-V100-REF-892402-US", isAssigned: false, createdAt: "2026-01-01T00:00:00Z" },
      { id: "inv_03", productId: "prod_mc_250", productName: "Mastercard Card $250", tokenReference: "CV-MC250-REF-712390-US", isAssigned: false, createdAt: "2026-01-01T00:00:00Z" }
    ];
    const initialData = {
      users: initialUsers,
      products: initialProducts,
      categories: initialCategories,
      orders: [],
      payments: [],
      inventory: initialInventory,
      settings: initialSettings
    };
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }
  save() {
    try {
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Error saving data:", err);
    }
  }
  // --------------------------------------------------------------------------
  // USERS
  // --------------------------------------------------------------------------
  async findUserByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    return this.data.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  }
  async findUserById(id) {
    const u = this.data.users.find((user) => user.id === id);
    if (!u) return null;
    const { passwordHash, ...safe } = u;
    return safe;
  }
  async createUser(user) {
    this.data.users.push(user);
    this.save();
    const { passwordHash, ...safe } = user;
    return safe;
  }
  async getUsers() {
    return this.data.users.map(({ passwordHash, ...safe }) => safe);
  }
  async updateUserStatus(userId, status) {
    const u = this.data.users.find((user) => user.id === userId);
    if (u) {
      u.status = status;
      this.save();
      return true;
    }
    return false;
  }
  // --------------------------------------------------------------------------
  // PRODUCTS
  // --------------------------------------------------------------------------
  async getProducts(params) {
    let prods = [...this.data.products];
    if (params?.category && params.category !== "All") {
      const cat = params.category.toLowerCase();
      prods = prods.filter(
        (pr) => pr.category.toLowerCase() === cat || pr.brand.toLowerCase() === cat || pr.cardType.toLowerCase() === cat
      );
    }
    if (params?.brand && params.brand !== "All") {
      prods = prods.filter((pr) => pr.brand.toLowerCase() === params.brand.toLowerCase());
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      prods = prods.filter(
        (pr) => pr.name.toLowerCase().includes(q) || pr.description.toLowerCase().includes(q) || pr.brand.toLowerCase().includes(q)
      );
    }
    return prods;
  }
  async getProductById(id) {
    return this.data.products.find((prod) => prod.id === id) || null;
  }
  async createProduct(product) {
    this.data.products.unshift(product);
    this.save();
    return product;
  }
  async updateProduct(id, updates) {
    const idx = this.data.products.findIndex((prod) => prod.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.save();
    return this.data.products[idx];
  }
  async deleteProduct(id) {
    const idx = this.data.products.findIndex((prod) => prod.id === id);
    if (idx !== -1) {
      this.data.products.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }
  // --------------------------------------------------------------------------
  // ORDERS & PAYMENTS
  // --------------------------------------------------------------------------
  async createOrder(order) {
    this.data.orders.unshift(order);
    const payment = {
      id: "pay_" + Math.random().toString(36).substring(2, 10),
      orderId: order.id,
      userId: order.userId,
      amount: order.totalUSDT,
      currency: "USDT",
      network: "TRC20",
      paymentAddress: order.paymentAddress,
      status: "pending",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.payments.unshift(payment);
    this.save();
    return order;
  }
  async getOrders(params) {
    let ords = [...this.data.orders];
    if (params?.userId) {
      ords = ords.filter((o) => o.userId === params.userId);
    }
    if (params?.status && params.status !== "All") {
      ords = ords.filter((o) => o.paymentStatus === params.status || o.orderStatus === params.status);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      ords = ords.filter(
        (o) => o.id.toLowerCase().includes(q) || o.userEmail.toLowerCase().includes(q) || o.transactionHash && o.transactionHash.toLowerCase().includes(q)
      );
    }
    return ords;
  }
  async getOrderById(orderId) {
    return this.data.orders.find((o) => o.id === orderId) || null;
  }
  async submitTransactionHash(orderId, txHash) {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.transactionHash = txHash;
    order.paymentStatus = "Pending Verification";
    order.txSubmittedAt = (/* @__PURE__ */ new Date()).toISOString();
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const payment = this.data.payments.find((p) => p.orderId === orderId);
    if (payment) {
      payment.transactionHash = txHash;
      payment.status = "pending";
      payment.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    }
    this.save();
    return order;
  }
  async approveOrderPayment(orderId, deliveryDetails) {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    const deliveredTokens = [];
    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        const token = `CV-${item.brand.substring(0, 2).toUpperCase()}${item.value}-REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${item.region}`;
        deliveredTokens.push(token);
      }
    });
    const cleanCards = deliveryDetails?.deliveredCards && Array.isArray(deliveryDetails.deliveredCards) ? deliveryDetails.deliveredCards.map((c) => ({
      cardNumber: (c.cardNumber || "").trim(),
      expiryDate: (c.expiryDate || "").trim(),
      cvv: (c.cvv || "").trim(),
      cardHolder: (c.cardHolder || "").trim(),
      pin: (c.pin || "").trim(),
      balance: typeof c.balance === "number" ? c.balance : void 0,
      notes: (c.notes || "").trim()
    })) : [];
    const deliveryNotes = deliveryDetails?.deliveryNotes || "Order verified and credentials delivered.";
    order.paymentStatus = "Paid";
    order.orderStatus = "Completed";
    order.approvedAt = (/* @__PURE__ */ new Date()).toISOString();
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    order.deliveryTokens = deliveredTokens;
    order.deliveredCards = cleanCards;
    order.deliveryNotes = deliveryNotes;
    const payment = this.data.payments.find((p) => p.orderId === orderId);
    if (payment) {
      payment.status = "confirmed";
      payment.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    }
    this.save();
    return order;
  }
  async rejectOrderPayment(orderId, reason) {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.paymentStatus = "Rejected";
    order.orderStatus = "Cancelled";
    order.rejectedAt = (/* @__PURE__ */ new Date()).toISOString();
    order.rejectionReason = reason;
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const payment = this.data.payments.find((p) => p.orderId === orderId);
    if (payment) {
      payment.status = "failed";
      payment.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    }
    this.save();
    return order;
  }
  async updateOrderStatus(orderId, status) {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    if (status.paymentStatus) order.paymentStatus = status.paymentStatus;
    if (status.orderStatus) order.orderStatus = status.orderStatus;
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.save();
    return order;
  }
  // --------------------------------------------------------------------------
  // PAYMENTS
  // --------------------------------------------------------------------------
  async getPayments(params) {
    let pays = [...this.data.payments];
    if (params?.status && params.status !== "All") {
      pays = pays.filter((py) => py.status === params.status?.toLowerCase());
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      pays = pays.filter(
        (py) => py.orderId.toLowerCase().includes(q) || py.transactionHash && py.transactionHash.toLowerCase().includes(q)
      );
    }
    return pays;
  }
  async getPaymentByOrderId(orderId) {
    return this.data.payments.find((p) => p.orderId === orderId) || null;
  }
  // --------------------------------------------------------------------------
  // ADMIN SETTINGS
  // --------------------------------------------------------------------------
  async getSettings() {
    return this.data.settings;
  }
  async updateSettings(updates) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }
  // --------------------------------------------------------------------------
  // INVENTORY & CATEGORIES
  // --------------------------------------------------------------------------
  getCategories() {
    return this.data.categories;
  }
  async getInventory() {
    return this.data.inventory;
  }
  async addInventoryTokens(tokens) {
    tokens.forEach((t) => {
      this.data.inventory.push({
        id: "inv_" + Math.random().toString(36).substring(2, 9),
        productId: t.productId,
        productName: t.productName,
        tokenReference: t.tokenReference,
        isAssigned: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    });
    this.save();
    return true;
  }
  // --------------------------------------------------------------------------
  // ADMIN STATS
  // --------------------------------------------------------------------------
  async getAdminStats() {
    const totalOrders = this.data.orders.length;
    const completedOrders = this.data.orders.filter((o) => o.orderStatus === "Completed" || o.paymentStatus === "Paid").length;
    const pendingPayments = this.data.orders.filter((o) => o.paymentStatus === "Pending Verification" || o.paymentStatus === "Payment Submitted").length;
    const totalRevenue = this.data.orders.filter((o) => o.paymentStatus === "Paid" || o.orderStatus === "Completed").reduce((sum, o) => sum + (o.totalUSD || 0), 0);
    const activeProducts = this.data.products.filter((p) => p.availability !== "out_of_stock").length;
    const totalUsers = this.data.users.length;
    return {
      totalRevenue,
      totalOrders,
      pendingPayments,
      activeProducts,
      totalUsers,
      completedOrders
    };
  }
};
var db = new LocalStorageManager();

// server/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var JWT_SECRET = process.env.JWT_SECRET || "cardvault_super_secret_jwt_key_982341";
function generateToken(user) {
  return import_jsonwebtoken.default.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication token required" });
  }
  const token = authHeader.substring(7);
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    const user = await db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }
    if (user.status === "disabled") {
      return res.status(403).json({ error: "Account has been disabled" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired authentication token" });
  }
}
async function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
      const user = await db.findUserById(decoded.id);
      if (user && user.status !== "disabled") {
        req.user = user;
      }
    } catch {
    }
  }
  next();
}
function requireAdmin(req, res, next) {
  authenticate(req, res, () => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Administrator access required" });
    }
    next();
  });
}

// server.ts
import_dotenv2.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  app.use(import_express.default.json());
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      time: (/* @__PURE__ */ new Date()).toISOString(),
      store: "CardVault"
    });
  });
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await db.getSettings();
      res.json(settings);
    } catch (err) {
      res.status(500).json({ error: "Failed to load settings" });
    }
  });
  app.get("/api/categories", (req, res) => {
    const categories = db.getCategories();
    res.json(categories);
  });
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, brand } = req.query;
      const products = await db.getProducts({ category, search, brand });
      res.json(products);
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await db.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (err) {
      console.error("Error fetching product details:", err);
      res.status(500).json({ error: "Failed to fetch product details" });
    }
  });
  app.get("/api/payment/qr", async (req, res) => {
    try {
      const settings = await db.getSettings();
      const address = req.query.address || settings.usdtTrc20Address;
      const amount = req.query.amount;
      const qrData = amount ? `tron:${address}?amount=${amount}` : address;
      const qrDataUrl = await import_qrcode.default.toDataURL(qrData, {
        width: 280,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      });
      res.json({ qrDataUrl, address });
    } catch (err) {
      console.error("QR code generation error:", err);
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  });
  const handleRegister = async (req, res) => {
    try {
      const { fullName, email, password, confirmPassword } = req.body;
      if (!fullName || !email || !password) {
        return res.status(400).json({ error: "Please provide full name, email, and password" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }
      const existing = await db.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "An account with this email already exists" });
      }
      const salt = import_bcryptjs2.default.genSaltSync(10);
      const passwordHash = import_bcryptjs2.default.hashSync(password, salt);
      const newUser = {
        id: "usr_" + Math.random().toString(36).substring(2, 10),
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        role: "user",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "active",
        passwordHash
      };
      const safeUser = await db.createUser(newUser);
      const token = generateToken(safeUser);
      res.status(201).json({ user: safeUser, token });
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ error: err.message || "Signup failed" });
    }
  };
  app.post("/api/auth/signup", handleRegister);
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Please provide email and password" });
      }
      const userRecord = await db.findUserByEmail(email);
      if (!userRecord) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const match = import_bcryptjs2.default.compareSync(password, userRecord.passwordHash);
      if (!match) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      if (userRecord.status === "disabled") {
        return res.status(403).json({ error: "Account has been disabled. Please contact support." });
      }
      const { passwordHash, ...safeUser } = userRecord;
      const token = generateToken(safeUser);
      res.json({ user: safeUser, token });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  });
  app.get("/api/auth/me", authenticate, (req, res) => {
    res.json({ user: req.user });
  });
  const handleCreateOrder = async (req, res) => {
    try {
      const { items, customerEmail, customerName, customerNotes } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Order must contain at least one item" });
      }
      const user = req.user;
      const email = user ? user.email : customerEmail;
      const name = user ? user.fullName : customerName || "Customer";
      if (!email) {
        return res.status(400).json({ error: "Email address is required to create an order" });
      }
      let totalUSD = 0;
      const validatedItems = [];
      for (const it of items) {
        const product = await db.getProductById(it.productId);
        if (!product) {
          return res.status(400).json({ error: `Product not found: ${it.productId}` });
        }
        if (product.availability === "out_of_stock") {
          return res.status(400).json({ error: `${product.name} is currently out of stock` });
        }
        const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
        const itemTotal = product.price * qty;
        totalUSD += itemTotal;
        validatedItems.push({
          productId: product.id,
          name: product.name,
          brand: product.brand,
          cardType: product.cardType,
          value: product.value,
          price: product.price,
          quantity: qty,
          image: product.image,
          region: product.region
        });
      }
      const settings = await db.getSettings();
      const exchangeRate = settings.exchangeRateUsdt || 1;
      const totalUSDT = parseFloat((totalUSD * exchangeRate).toFixed(2));
      const orderId = "ORD-" + Math.floor(1e5 + Math.random() * 9e5);
      const newOrder = {
        id: orderId,
        userId: user ? user.id : "guest_" + Math.random().toString(36).substring(2, 9),
        userEmail: email.toLowerCase().trim(),
        userName: name,
        items: validatedItems,
        totalUSD: parseFloat(totalUSD.toFixed(2)),
        totalUSDT,
        paymentMethod: "USDT_TRC20",
        paymentAddress: settings.usdtTrc20Address,
        paymentStatus: "Awaiting Payment",
        orderStatus: "Pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        customerNotes: customerNotes || ""
      };
      const created = await db.createOrder(newOrder);
      res.status(201).json(created);
    } catch (err) {
      console.error("Create order error:", err);
      res.status(500).json({ error: err.message || "Failed to create order" });
    }
  };
  app.post("/api/orders/create", optionalAuthenticate, handleCreateOrder);
  app.post("/api/orders", optionalAuthenticate, handleCreateOrder);
  const handleGetMyOrders = async (req, res) => {
    try {
      const orders = await db.getOrders({ userId: req.user.id });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch user orders" });
    }
  };
  app.get("/api/orders/my-orders", authenticate, handleGetMyOrders);
  app.get("/api/orders", authenticate, handleGetMyOrders);
  app.get("/api/orders/:orderId", optionalAuthenticate, async (req, res) => {
    try {
      const order = await db.getOrderById(req.params.orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  app.post("/api/orders/:orderId/submit-txid", async (req, res) => {
    try {
      const { txHash } = req.body;
      if (!txHash || txHash.trim().length < 10) {
        return res.status(400).json({ error: "Please provide a valid TRON transaction hash (TXID)" });
      }
      const order = await db.submitTransactionHash(req.params.orderId, txHash.trim());
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json({
        message: "Transaction hash submitted successfully. Payment is now Pending Verification.",
        order
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to submit transaction hash" });
    }
  });
  app.post("/api/payments", optionalAuthenticate, async (req, res) => {
    try {
      const { orderId, amount, currency, network, paymentAddress, transactionHash } = req.body;
      if (!orderId || !amount || !paymentAddress) {
        return res.status(400).json({ error: "orderId, amount, and paymentAddress are required" });
      }
      const payment = {
        id: "pay_" + Math.random().toString(36).substring(2, 10),
        orderId,
        userId: req.user ? req.user.id : void 0,
        amount: parseFloat(amount),
        currency: currency || "USDT",
        network: network || "TRC20",
        paymentAddress,
        transactionHash: transactionHash || void 0,
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.status(201).json(payment);
    } catch (err) {
      res.status(500).json({ error: "Failed to record payment" });
    }
  });
  app.get("/api/payments/:id", optionalAuthenticate, async (req, res) => {
    try {
      const payment = await db.getPaymentByOrderId(req.params.id);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (err) {
      res.status(500).json({ error: "Failed to get payment status" });
    }
  });
  app.get("/api/payments/order/:orderId", optionalAuthenticate, async (req, res) => {
    try {
      const payment = await db.getPaymentByOrderId(req.params.orderId);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (err) {
      res.status(500).json({ error: "Failed to get payment" });
    }
  });
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await db.getAdminStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: "Failed to load stats" });
    }
  });
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const { status, search } = req.query;
      const orders = await db.getOrders({ status, search });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: "Failed to load admin orders" });
    }
  });
  app.get("/api/admin/orders/:orderId", requireAdmin, async (req, res) => {
    try {
      const order = await db.getOrderById(req.params.orderId);
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: "Failed to load order" });
    }
  });
  app.post("/api/admin/orders/:orderId/approve-payment", requireAdmin, async (req, res) => {
    try {
      const { deliveredCards, deliveryNotes } = req.body || {};
      const order = await db.approveOrderPayment(req.params.orderId, { deliveredCards, deliveryNotes });
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json({ message: "Payment approved. Card credentials successfully delivered to client.", order });
    } catch (err) {
      res.status(500).json({ error: "Failed to approve payment" });
    }
  });
  app.post("/api/admin/orders/:orderId/reject-payment", requireAdmin, async (req, res) => {
    try {
      const { reason } = req.body;
      const order = await db.rejectOrderPayment(req.params.orderId, reason || "Transaction could not be verified on TRC20 network");
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json({ message: "Payment rejected.", order });
    } catch (err) {
      res.status(500).json({ error: "Failed to reject payment" });
    }
  });
  app.put("/api/admin/orders/:orderId/status", requireAdmin, async (req, res) => {
    try {
      const { paymentStatus, orderStatus } = req.body;
      const order = await db.updateOrderStatus(req.params.orderId, { paymentStatus, orderStatus });
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });
  app.get("/api/admin/payments", requireAdmin, async (req, res) => {
    try {
      const { status, search } = req.query;
      const payments = await db.getPayments({ status, search });
      res.json(payments);
    } catch (err) {
      res.status(500).json({ error: "Failed to load payments" });
    }
  });
  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const p = req.body;
      if (!p.name || !p.price || !p.value) {
        return res.status(400).json({ error: "Product name, value, and price are required" });
      }
      const newProduct = {
        id: "prod_" + Math.random().toString(36).substring(2, 9),
        name: p.name,
        brand: p.brand || "Visa",
        category: p.category || "Visa",
        cardType: p.cardType || "Standard",
        value: parseFloat(p.value),
        price: parseFloat(p.price),
        region: p.region || "US",
        image: p.image || "/cards/visa-100.png",
        description: p.description || "",
        terms: p.terms || "Standard card terms apply.",
        availability: p.availability || "in_stock",
        stockCount: parseInt(p.stockCount, 10) || 50,
        seller: p.seller || "CardVault Official",
        rating: parseFloat(p.rating) || 4.9,
        ratingCount: parseInt(p.ratingCount, 10) || 10,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const created = await db.createProduct(newProduct);
      res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });
  app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await db.updateProduct(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: "Product not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });
  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const success = await db.deleteProduct(req.params.id);
      if (!success) return res.status(404).json({ error: "Product not found" });
      res.json({ message: "Product removed successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });
  app.get("/api/admin/inventory", requireAdmin, async (req, res) => {
    try {
      const inv = await db.getInventory();
      res.json(inv);
    } catch (err) {
      res.status(500).json({ error: "Failed to load inventory" });
    }
  });
  app.post("/api/admin/inventory/add", requireAdmin, async (req, res) => {
    try {
      const { productId, tokens } = req.body;
      const product = await db.getProductById(productId);
      if (!product) return res.status(404).json({ error: "Product not found" });
      if (!tokens || !Array.isArray(tokens)) return res.status(400).json({ error: "Tokens array is required" });
      const entries = tokens.map((token) => ({
        productId,
        productName: product.name,
        tokenReference: token.trim()
      }));
      await db.addInventoryTokens(entries);
      res.json({ message: `${entries.length} reference tokens added successfully` });
    } catch (err) {
      res.status(500).json({ error: "Failed to add inventory tokens" });
    }
  });
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await db.getUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Failed to load users" });
    }
  });
  app.put("/api/admin/users/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const ok = await db.updateUserStatus(req.params.id, status);
      if (!ok) return res.status(404).json({ error: "User not found" });
      res.json({ message: `User status updated to ${status}` });
    } catch (err) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });
  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const s = await db.getSettings();
      res.json(s);
    } catch (err) {
      res.status(500).json({ error: "Failed to load settings" });
    }
  });
  app.put("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const updated = await db.updateSettings(req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CardVault server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
