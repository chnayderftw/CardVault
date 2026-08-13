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
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var import_vite = require("vite");

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "marketplace.json");
var DEFAULT_SETTINGS = {
  trc20WalletAddress: process.env.TRC20_WALLET_ADDRESS || "TG1LiM1h3iLf654gAx1msadrDf65q2AbAC",
  usdtExchangeRate: 1,
  minDeposit: 10,
  siteNotice: ""
};
var INITIAL_PRODUCTS = [
  {
    id: "prod-001",
    brand: "Visa",
    name: "Visa Business Virtual Prepaid",
    bin: "411111",
    issuer: "Bancorp Bank, N.A.",
    cardType: "Virtual",
    level: "UHQ",
    country: "United States",
    currency: "USD",
    region: "North America",
    expirationPolicy: "Valid 24 Months",
    features: ["Instant Portal Issuance", "3D Secure v2", "Global USD Merchant Acceptance", "Expense Reporting"],
    price: 520,
    stock: 45,
    isPremium: true,
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80",
    deliveryMethod: "Instant Encrypted Portal Code",
    terms: "Legally issued prepaid product. Subject to Bancorp Bank user terms. Non-transferable once activated.",
    status: "active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "prod-002",
    brand: "Mastercard",
    name: "Mastercard Executive Virtual",
    bin: "512345",
    issuer: "MetaBank, N.A.",
    cardType: "Virtual",
    level: "HQ",
    country: "United States",
    currency: "USD",
    region: "North America",
    expirationPolicy: "Valid 18 Months",
    features: ["Instant Activation", "Multi-currency Settlement", "Online E-Commerce Ready"],
    price: 260,
    stock: 80,
    isPremium: true,
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80",
    deliveryMethod: "Instant Encrypted Portal Code",
    terms: "Legally issued virtual card. Redeemable at all worldwide Mastercard accepting merchants.",
    status: "active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "prod-003",
    brand: "Visa",
    name: "Visa Everyday Prepaid Card",
    bin: "485210",
    issuer: "Sutton Bank",
    cardType: "Prepaid",
    level: "Standard",
    country: "United States",
    currency: "USD",
    region: "North America",
    expirationPolicy: "Valid 12 Months",
    features: ["Standard Online Checkout", "ATM Cash-Out Option", "Zero Liability Protection"],
    price: 105,
    stock: 120,
    isPremium: false,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=600&q=80",
    deliveryMethod: "Digital Claim Key & Activation Guide",
    terms: "Legally issued prepaid card by Sutton Bank. Valid for domestic & international transactions.",
    status: "active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "prod-004",
    brand: "Apple",
    name: "Apple Corporate Digital Gift Card",
    bin: "N/A",
    issuer: "Apple Inc.",
    cardType: "Gift",
    level: "Standard",
    country: "United States",
    currency: "USD",
    region: "North America",
    expirationPolicy: "No Expiration",
    features: ["Instant Digital Code", "Never Expires", "Valid for Apple Store & App Store"],
    price: 198,
    stock: 50,
    isPremium: false,
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80",
    deliveryMethod: "Instant Claim Code",
    terms: "Legally issued Apple e-Gift card. Redeemable directly on Apple Store.",
    status: "active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "prod-005",
    brand: "American Express",
    name: "AMEX Platinum Virtual Business",
    bin: "371234",
    issuer: "American Express National Bank",
    cardType: "Virtual",
    level: "UHQ",
    country: "United States",
    currency: "USD",
    region: "North America",
    expirationPolicy: "Valid 36 Months",
    features: ["Concierge Services", "Enterprise Spend Control", "3D Secure SafeKey Enabled"],
    price: 1035,
    stock: 20,
    isPremium: true,
    isFeatured: true,
    imageUrl: "https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=600&q=80",
    deliveryMethod: "Encrypted Digital Key & Certificate",
    terms: "Legally issued AMEX corporate virtual payment card for business procurement.",
    status: "active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "prod-006",
    brand: "Visa",
    name: "Visa Europe SEPA Virtual",
    bin: "428800",
    issuer: "Solarisbank AG",
    cardType: "Virtual",
    level: "HQ",
    country: "European Union",
    currency: "EUR",
    region: "Europe",
    expirationPolicy: "Valid 12 Months",
    features: ["SEPA Instant Top-up", "EUR Currency Native", "3DS2 Verified by Visa"],
    price: 258,
    stock: 65,
    isPremium: false,
    isFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=600&q=80",
    deliveryMethod: "Instant Digital Key",
    terms: "Legally issued in EU by Solarisbank AG under Visa license.",
    status: "active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var INITIAL_ANNOUNCEMENTS = [
  {
    id: "ann-101",
    title: "Welcome to the Dark-Mode Enterprise Card Portal",
    content: "We are pleased to launch our upgraded trading terminal layout with instant TRC20 settlement, real-time balance tracking, and corporate card inventory.",
    category: "Announcement",
    isImportant: true,
    createdAt: new Date(Date.now() - 864e5 * 2).toISOString()
  },
  {
    id: "ann-102",
    title: "New AMEX Platinum & Visa Corporate Inventory Added",
    content: "High-tier virtual cards from Bancorp Bank and American Express are now available in the Premium Cards tab with 3DS2 protection.",
    category: "New Product",
    isImportant: false,
    createdAt: new Date(Date.now() - 864e5 * 1).toISOString()
  }
];
var StorageEngine = class {
  constructor() {
    this.memoryData = {
      users: [],
      products: [],
      orders: [],
      deposits: [],
      tickets: [],
      announcements: [],
      auditLogs: [],
      settings: DEFAULT_SETTINGS
    };
    this.init();
  }
  async init() {
    try {
      if (!import_fs.default.existsSync(DATA_DIR)) {
        import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (import_fs.default.existsSync(DB_FILE)) {
        const raw = import_fs.default.readFileSync(DB_FILE, "utf-8");
        this.memoryData = JSON.parse(raw);
        await this.ensureAdminAccount();
      } else {
        await this.seedInitialData();
      }
    } catch (err) {
      console.error("Failed to load database, resetting cache:", err);
      await this.seedInitialData();
    }
  }
  async ensureAdminAccount() {
    const adminEmail = "admin.CC.adminv@gmail.com";
    const adminPassword = "adminCC.adminV";
    const passwordHash = await import_bcryptjs.default.hash(adminPassword, 10);
    const existingAdmin = this.memoryData.users.find((u) => u.email.toLowerCase() === adminEmail.toLowerCase());
    if (existingAdmin) {
      existingAdmin.role = "admin";
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.mustChangePassword = false;
    } else {
      this.memoryData.users.unshift({
        id: "usr-admin-01",
        fullName: "System Administrator",
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: "admin",
        balance: 1e4,
        mustChangePassword: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    if (!this.memoryData.settings) {
      this.memoryData.settings = { ...DEFAULT_SETTINGS };
    } else {
      this.memoryData.settings.trc20WalletAddress = "TG1LiM1h3iLf654gAx1msadrDf65q2AbAC";
    }
    if (this.memoryData.products) {
      this.memoryData.products = this.memoryData.products.filter(
        (p) => p.brand.toLowerCase() !== "amazon" && !p.name.toLowerCase().includes("amazon")
      );
    }
    this.saveSync();
  }
  async seedInitialData() {
    const adminEmail = "admin.CC.adminv@gmail.com";
    const adminPassword = "adminCC.adminV";
    const passwordHash = await import_bcryptjs.default.hash(adminPassword, 10);
    const initialAdmin = {
      id: "usr-admin-01",
      fullName: "System Administrator",
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: "admin",
      balance: 1e4,
      mustChangePassword: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const demoPasswordHash = await import_bcryptjs.default.hash("DemoUser123!", 10);
    const demoUser = {
      id: "usr-demo-01",
      fullName: "Enterprise Client",
      email: "client@enterprise.com",
      passwordHash: demoPasswordHash,
      role: "user",
      balance: 1250,
      mustChangePassword: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.memoryData = {
      users: [initialAdmin, demoUser],
      products: INITIAL_PRODUCTS,
      orders: [
        {
          id: "ORD-109283",
          userId: demoUser.id,
          userEmail: demoUser.email,
          productId: "prod-001",
          productName: "Visa Business Virtual Prepaid",
          productBrand: "Visa",
          productType: "Virtual",
          cardValue: 500,
          amount: 520,
          quantity: 1,
          paymentStatus: "paid",
          deliveryStatus: "delivered",
          txHash: "7f91a2e38c4b501d2938a4c1209e8f7a6b5c4d3e2f109283746554321a987b6c",
          fulfillmentData: {
            claimCode: "CLAIM-VBP-9982-3819-2026",
            instructions: "Access portal claim key and redeem card balance directly with Bancorp Bank Virtual portal."
          },
          createdAt: new Date(Date.now() - 864e5).toISOString(),
          updatedAt: new Date(Date.now() - 864e5).toISOString()
        }
      ],
      deposits: [
        {
          id: "DEP-883019",
          userId: demoUser.id,
          userEmail: demoUser.email,
          amount: 1500,
          network: "TRC20",
          walletAddress: DEFAULT_SETTINGS.trc20WalletAddress,
          txHash: "3a12b34c56d78e90f123456789abcdef0123456789abcdef0123456789abcdef",
          status: "approved",
          createdAt: new Date(Date.now() - 1728e5).toISOString(),
          updatedAt: new Date(Date.now() - 1728e5).toISOString()
        }
      ],
      tickets: [
        {
          id: "TCK-4001",
          userId: demoUser.id,
          userName: demoUser.fullName,
          userEmail: demoUser.email,
          subject: "Corporate API & Bulk Card Order Inquiry",
          status: "open",
          createdAt: new Date(Date.now() - 432e5).toISOString(),
          updatedAt: new Date(Date.now() - 36e5).toISOString(),
          messages: [
            {
              id: "msg-01",
              senderId: demoUser.id,
              senderName: demoUser.fullName,
              senderRole: "user",
              content: "Hello Support, we are interested in placing a bulk order for 20 Visa Business Virtual cards next week. Is there volume discount available?",
              timestamp: new Date(Date.now() - 432e5).toISOString()
            },
            {
              id: "msg-02",
              senderId: initialAdmin.id,
              senderName: initialAdmin.fullName,
              senderRole: "admin",
              content: "Hello! Yes, bulk corporate purchases above $10,000 receive a 2.5% discount on issuance fees. Please submit a deposit via TRC20 and notify us.",
              timestamp: new Date(Date.now() - 36e5).toISOString()
            }
          ]
        }
      ],
      announcements: INITIAL_ANNOUNCEMENTS,
      auditLogs: [
        {
          id: "log-01",
          adminEmail: initialAdmin.email,
          action: "SYSTEM_INITIALIZATION",
          details: "Initial secure administrator account seeded.",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      settings: DEFAULT_SETTINGS
    };
    this.saveSync();
  }
  saveSync() {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      import_fs.default.writeFileSync(tempPath, JSON.stringify(this.memoryData, null, 2));
      import_fs.default.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error("Failed to save marketplace data atomically:", err);
    }
  }
  // Users
  getUsers() {
    return this.memoryData.users;
  }
  findUserByEmail(email) {
    return this.memoryData.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  findUserById(id) {
    return this.memoryData.users.find((u) => u.id === id);
  }
  createUser(user) {
    this.memoryData.users.push(user);
    this.saveSync();
  }
  updateUser(id, updates) {
    const idx = this.memoryData.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.memoryData.users[idx] = { ...this.memoryData.users[idx], ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      this.saveSync();
      return this.memoryData.users[idx];
    }
    return null;
  }
  // Products
  getProducts() {
    return this.memoryData.products;
  }
  findProductById(id) {
    return this.memoryData.products.find((p) => p.id === id);
  }
  createProduct(product) {
    this.memoryData.products.unshift(product);
    this.saveSync();
    return product;
  }
  updateProduct(id, updates) {
    const idx = this.memoryData.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.memoryData.products[idx] = { ...this.memoryData.products[idx], ...updates };
      this.saveSync();
      return this.memoryData.products[idx];
    }
    return null;
  }
  deleteProduct(id) {
    this.memoryData.products = this.memoryData.products.filter((p) => p.id !== id);
    this.saveSync();
  }
  // Orders
  getOrders() {
    return this.memoryData.orders;
  }
  getOrdersByUserId(userId) {
    return this.memoryData.orders.filter((o) => o.userId === userId);
  }
  findOrderById(id) {
    return this.memoryData.orders.find((o) => o.id === id);
  }
  createOrder(order) {
    this.memoryData.orders.unshift(order);
    this.saveSync();
    return order;
  }
  updateOrder(id, updates) {
    const idx = this.memoryData.orders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      this.memoryData.orders[idx] = { ...this.memoryData.orders[idx], ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      this.saveSync();
      return this.memoryData.orders[idx];
    }
    return null;
  }
  // Deposits
  getDeposits() {
    return this.memoryData.deposits;
  }
  getDepositsByUserId(userId) {
    return this.memoryData.deposits.filter((d) => d.userId === userId);
  }
  findDepositById(id) {
    return this.memoryData.deposits.find((d) => d.id === id);
  }
  createDeposit(deposit) {
    this.memoryData.deposits.unshift(deposit);
    this.saveSync();
    return deposit;
  }
  updateDeposit(id, updates) {
    const idx = this.memoryData.deposits.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this.memoryData.deposits[idx] = { ...this.memoryData.deposits[idx], ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      this.saveSync();
      return this.memoryData.deposits[idx];
    }
    return null;
  }
  // Tickets
  getTickets() {
    return this.memoryData.tickets;
  }
  getTicketsByUserId(userId) {
    return this.memoryData.tickets.filter((t) => t.userId === userId);
  }
  findTicketById(id) {
    return this.memoryData.tickets.find((t) => t.id === id);
  }
  createTicket(ticket) {
    this.memoryData.tickets.unshift(ticket);
    this.saveSync();
    return ticket;
  }
  addMessageToTicket(ticketId, message) {
    const ticket = this.findTicketById(ticketId);
    if (ticket) {
      ticket.messages.push(message);
      ticket.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      this.saveSync();
      return ticket;
    }
    return null;
  }
  // Announcements
  getAnnouncements() {
    return this.memoryData.announcements;
  }
  createAnnouncement(ann) {
    this.memoryData.announcements.unshift(ann);
    this.saveSync();
    return ann;
  }
  deleteAnnouncement(id) {
    this.memoryData.announcements = this.memoryData.announcements.filter((a) => a.id !== id);
    this.saveSync();
  }
  // Audit Logs
  getAuditLogs() {
    return this.memoryData.auditLogs;
  }
  addAuditLog(log) {
    this.memoryData.auditLogs.unshift(log);
    this.saveSync();
  }
  // Settings
  getSettings() {
    return this.memoryData.settings;
  }
  updateSettings(settings) {
    this.memoryData.settings = { ...this.memoryData.settings, ...settings };
    this.saveSync();
    return this.memoryData.settings;
  }
};
var db = new StorageEngine();

// server/middleware.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var JWT_SECRET = process.env.JWT_SECRET || "enterprise_marketplace_jwt_secret_key_2026";
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Authentication required. Please sign in." });
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    const user = db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User account not found or deactivated." });
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    };
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired session token." });
  }
}
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Administrator privileges required." });
  }
  next();
}
var rateLimitMap = /* @__PURE__ */ new Map();
function rateLimiter(maxRequests = 100, windowMs = 6e4) {
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const clientData = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
    } else {
      clientData.count++;
    }
    rateLimitMap.set(ip, clientData);
    if (clientData.count > maxRequests) {
      return res.status(429).json({ error: "Too many requests. Please slow down and try again." });
    }
    next();
  };
}
function sanitizeMessageContent(content) {
  const cardPattern = /\b(?:\d[ -]*?){13,19}\b/g;
  const sensitiveKeywords = /\b(cvv|cvc|exp date|pin number)\b/gi;
  if (cardPattern.test(content) || sensitiveKeywords.test(content)) {
    return "[REDACTED: Security Policy prohibits exchanging sensitive card numbers or CVV in private chat]";
  }
  return content;
}

// server.ts
var JWT_SECRET2 = process.env.JWT_SECRET || "enterprise_marketplace_jwt_secret_key_2026";
var PORT = 3e3;
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json({ limit: "10mb" }));
  app.use(rateLimiter(200, 6e4));
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { fullName, email, password, confirmPassword } = req.body;
      if (!fullName || !email || !password) {
        return res.status(400).json({ error: "Full name, email, and password are required." });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match." });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long." });
      }
      const existingUser = db.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "An account with this email address already exists." });
      }
      const passwordHash = await import_bcryptjs2.default.hash(password, 10);
      const newUser = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "user",
        balance: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.createUser(newUser);
      const token = import_jsonwebtoken2.default.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET2,
        { expiresIn: "7d" }
      );
      const { passwordHash: _, ...safeUser } = newUser;
      res.status(201).json({ token, user: safeUser });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ error: "Failed to create user account." });
    }
  });
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }
      const user = db.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email address or password." });
      }
      const isMatch = await import_bcryptjs2.default.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email address or password." });
      }
      const token = import_jsonwebtoken2.default.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET2,
        { expiresIn: "7d" }
      );
      const { passwordHash: _, ...safeUser } = user;
      res.json({ token, user: safeUser });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Failed to process login." });
    }
  });
  app.get("/api/auth/me", authenticateToken, (req, res) => {
    const user = db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  });
  app.post("/api/auth/change-password", authenticateToken, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = db.findUserById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found." });
      const isMatch = await import_bcryptjs2.default.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect." });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ error: "New password must be at least 8 characters long." });
      }
      const newHash = await import_bcryptjs2.default.hash(newPassword, 10);
      db.updateUser(user.id, { passwordHash: newHash, mustChangePassword: false });
      if (user.role === "admin") {
        db.addAuditLog({
          id: `log-${Date.now()}`,
          adminEmail: user.email,
          action: "ADMIN_PASSWORD_CHANGED",
          details: "Administrator updated default/initial security password.",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      res.json({ message: "Password changed successfully." });
    } catch (err) {
      res.status(500).json({ error: "Failed to update password." });
    }
  });
  app.get("/api/settings", (req, res) => {
    res.json(db.getSettings());
  });
  app.get("/api/products", (req, res) => {
    const products = db.getProducts().filter((p) => p.status === "active");
    res.json(products);
  });
  app.get("/api/products/:id", (req, res) => {
    const product = db.findProductById(req.params.id);
    if (!product || product.status !== "active") {
      return res.status(404).json({ error: "Product not found or unavailable." });
    }
    res.json(product);
  });
  app.get("/api/announcements", (req, res) => {
    res.json(db.getAnnouncements());
  });
  app.get("/api/orders", authenticateToken, (req, res) => {
    if (req.user.role === "admin") {
      return res.json(db.getOrders());
    }
    res.json(db.getOrdersByUserId(req.user.id));
  });
  app.get("/api/orders/:id", authenticateToken, (req, res) => {
    const order = db.findOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    if (req.user.role !== "admin" && order.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized order access." });
    }
    res.json(order);
  });
  app.post("/api/orders", authenticateToken, (req, res) => {
    try {
      const { productId, quantity = 1, paymentMethod = "balance", txHash } = req.body;
      const product = db.findProductById(productId);
      if (!product || product.status !== "active") {
        return res.status(404).json({ error: "Selected card product is no longer available." });
      }
      if (product.stock < quantity) {
        return res.status(400).json({ error: "Insufficient inventory in stock for this card product." });
      }
      const totalAmount = product.price * quantity;
      const user = db.findUserById(req.user.id);
      if (paymentMethod === "balance") {
        if (user.balance < totalAmount) {
          return res.status(400).json({ error: "Insufficient account balance. Please deposit funds or pay via USDT TRC20." });
        }
        db.updateUser(user.id, { balance: user.balance - totalAmount });
        db.updateProduct(product.id, { stock: product.stock - quantity });
        const order = {
          id: `ORD-${Math.floor(1e5 + Math.random() * 9e5)}`,
          userId: user.id,
          userEmail: user.email,
          productId: product.id,
          productName: product.name,
          productBrand: product.brand,
          productType: product.cardType,
          amount: totalAmount,
          quantity,
          paymentStatus: "paid",
          deliveryStatus: "delivered",
          fulfillmentData: {
            claimCode: `CLAIM-${product.brand.substring(0, 3).toUpperCase()}-${Math.floor(1e3 + Math.random() * 9e3)}-${Math.floor(1e3 + Math.random() * 9e3)}-2026`,
            instructions: `Use code to access official ${product.issuer} issuance portal and activate balance.`
          },
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        db.createOrder(order);
        return res.status(201).json(order);
      } else {
        const order = {
          id: `ORD-${Math.floor(1e5 + Math.random() * 9e5)}`,
          userId: user.id,
          userEmail: user.email,
          productId: product.id,
          productName: product.name,
          productBrand: product.brand,
          productType: product.cardType,
          amount: totalAmount,
          quantity,
          paymentStatus: "pending",
          deliveryStatus: "pending",
          txHash: txHash ? txHash.trim() : void 0,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        db.createOrder(order);
        return res.status(201).json(order);
      }
    } catch (err) {
      console.error("Create order error:", err);
      res.status(500).json({ error: "Failed to create order." });
    }
  });
  app.post("/api/orders/:id/pay-trc20", authenticateToken, (req, res) => {
    try {
      const { txHash } = req.body;
      if (!txHash || txHash.trim().length < 10) {
        return res.status(400).json({ error: "Valid TRC20 transaction hash is required." });
      }
      const order = db.findOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: "Order not found." });
      if (order.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized." });
      }
      const updatedOrder = db.updateOrder(order.id, {
        paymentStatus: "verifying",
        txHash: txHash.trim()
      });
      res.json({
        message: "Transaction hash submitted. Backend payment verification is pending.",
        order: updatedOrder
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to submit transaction hash." });
    }
  });
  app.get("/api/deposits", authenticateToken, (req, res) => {
    if (req.user.role === "admin") {
      return res.json(db.getDeposits());
    }
    res.json(db.getDepositsByUserId(req.user.id));
  });
  app.post("/api/deposits", authenticateToken, (req, res) => {
    try {
      const { amount, txHash } = req.body;
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < 10) {
        return res.status(400).json({ error: "Minimum deposit amount is $10.00 USDT." });
      }
      if (!txHash || txHash.trim().length < 10) {
        return res.status(400).json({ error: "A valid TRC20 transaction hash is required." });
      }
      const settings = db.getSettings();
      const deposit = {
        id: `DEP-${Math.floor(1e5 + Math.random() * 9e5)}`,
        userId: req.user.id,
        userEmail: req.user.email,
        amount: numAmount,
        network: "TRC20",
        walletAddress: settings.trc20WalletAddress,
        txHash: txHash.trim(),
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.createDeposit(deposit);
      res.status(201).json(deposit);
    } catch (err) {
      res.status(500).json({ error: "Failed to submit deposit request." });
    }
  });
  app.get("/api/support/tickets", authenticateToken, (req, res) => {
    if (req.user.role === "admin") {
      return res.json(db.getTickets());
    }
    res.json(db.getTicketsByUserId(req.user.id));
  });
  app.post("/api/support/tickets", authenticateToken, (req, res) => {
    try {
      const { subject, message } = req.body;
      if (!subject || !message) {
        return res.status(400).json({ error: "Subject and message are required." });
      }
      const cleanContent = sanitizeMessageContent(message);
      const ticket = {
        id: `TCK-${Math.floor(1e3 + Math.random() * 9e3)}`,
        userId: req.user.id,
        userName: req.user.fullName,
        userEmail: req.user.email,
        subject: subject.trim(),
        status: "open",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        messages: [
          {
            id: `msg-${Date.now()}`,
            senderId: req.user.id,
            senderName: req.user.fullName,
            senderRole: req.user.role,
            content: cleanContent,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        ]
      };
      db.createTicket(ticket);
      res.status(201).json(ticket);
    } catch (err) {
      res.status(500).json({ error: "Failed to create support ticket." });
    }
  });
  app.post("/api/support/tickets/:id/messages", authenticateToken, (req, res) => {
    try {
      const { content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ error: "Message content cannot be empty." });
      }
      const ticket = db.findTicketById(req.params.id);
      if (!ticket) return res.status(404).json({ error: "Support ticket not found." });
      if (req.user.role !== "admin" && ticket.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized ticket access." });
      }
      const cleanContent = sanitizeMessageContent(content);
      const newMsg = {
        id: `msg-${Date.now()}`,
        senderId: req.user.id,
        senderName: req.user.fullName,
        senderRole: req.user.role,
        content: cleanContent,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      const updated = db.addMessageToTicket(ticket.id, newMsg);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to send support message." });
    }
  });
  app.get("/api/admin/users", authenticateToken, requireAdmin, (req, res) => {
    const users = db.getUsers().map(({ passwordHash, ...user }) => user);
    res.json(users);
  });
  app.post("/api/admin/users/:id/balance", authenticateToken, requireAdmin, (req, res) => {
    try {
      const { balance } = req.body;
      const num = parseFloat(balance);
      if (isNaN(num) || num < 0) return res.status(400).json({ error: "Invalid balance amount." });
      const updated = db.updateUser(req.params.id, { balance: num });
      if (!updated) return res.status(404).json({ error: "User not found." });
      db.addAuditLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: "USER_BALANCE_ADJUSTED",
        details: `Set balance for user ${updated.email} to $${num.toFixed(2)}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      const { passwordHash: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (err) {
      res.status(500).json({ error: "Failed to adjust balance." });
    }
  });
  app.post("/api/admin/orders/:id/verify-payment", authenticateToken, requireAdmin, (req, res) => {
    try {
      const { status, fulfillmentData } = req.body;
      const order = db.findOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: "Order not found." });
      if (status === "paid") {
        const product = db.findProductById(order.productId);
        if (product && product.stock >= order.quantity) {
          db.updateProduct(product.id, { stock: product.stock - order.quantity });
        }
        const cardNumber = fulfillmentData?.cardNumber?.trim() || `4532 ${Math.floor(1e3 + Math.random() * 9e3)} ${Math.floor(1e3 + Math.random() * 9e3)} ${Math.floor(1e3 + Math.random() * 9e3)}`;
        const expDate = fulfillmentData?.expDate?.trim() || `12/28`;
        const cvv = fulfillmentData?.cvv?.trim() || `${Math.floor(100 + Math.random() * 900)}`;
        const instructions = fulfillmentData?.instructions?.trim() || `Virtual Card active. Ready for online card purchases & 3DS authorization.`;
        const updatedOrder = db.updateOrder(order.id, {
          paymentStatus: "paid",
          deliveryStatus: "delivered",
          fulfillmentData: {
            cardNumber,
            expDate,
            cvv,
            claimCode: cardNumber,
            instructions
          }
        });
        db.addAuditLog({
          id: `log-${Date.now()}`,
          adminEmail: req.user.email,
          action: "ORDER_PAYMENT_VERIFIED",
          details: `Confirmed TRC20 payment & issued card details for Order #${order.id} ($${order.amount.toFixed(2)} USDT)`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        return res.json(updatedOrder);
      } else {
        const updatedOrder = db.updateOrder(order.id, { paymentStatus: "failed", deliveryStatus: "failed" });
        return res.json(updatedOrder);
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to verify order payment." });
    }
  });
  app.post("/api/admin/deposits/:id/verify", authenticateToken, requireAdmin, (req, res) => {
    try {
      const { status } = req.body;
      const deposit = db.findDepositById(req.params.id);
      if (!deposit) return res.status(404).json({ error: "Deposit not found." });
      if (deposit.status !== "pending") {
        return res.status(400).json({ error: "Deposit has already been processed." });
      }
      if (status === "approved") {
        const user = db.findUserById(deposit.userId);
        if (user) {
          db.updateUser(user.id, { balance: user.balance + deposit.amount });
        }
        const updated = db.updateDeposit(deposit.id, { status: "approved" });
        db.addAuditLog({
          id: `log-${Date.now()}`,
          adminEmail: req.user.email,
          action: "DEPOSIT_APPROVED",
          details: `Approved TRC20 Deposit #${deposit.id} of $${deposit.amount.toFixed(2)} USDT for ${deposit.userEmail}`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        return res.json(updated);
      } else {
        const updated = db.updateDeposit(deposit.id, { status: "rejected" });
        return res.json(updated);
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to process deposit verification." });
    }
  });
  app.get("/api/admin/products", authenticateToken, requireAdmin, (req, res) => {
    res.json(db.getProducts());
  });
  app.post("/api/admin/products", authenticateToken, requireAdmin, (req, res) => {
    try {
      const newProd = {
        id: `prod-${Date.now()}`,
        brand: req.body.brand || "Visa",
        name: req.body.name,
        bin: req.body.bin || "400000",
        issuer: req.body.issuer || "Issuing Institution",
        cardType: req.body.cardType || "Prepaid",
        level: req.body.level || "Standard",
        country: req.body.country || "United States",
        currency: req.body.currency || "USD",
        region: req.body.region || "North America",
        expirationPolicy: req.body.expirationPolicy || "Valid 12 Months",
        features: Array.isArray(req.body.features) ? req.body.features : ["Instant Portal Issuance"],
        price: parseFloat(req.body.price) || 105,
        stock: parseInt(req.body.stock) || 50,
        isPremium: Boolean(req.body.isPremium),
        isFeatured: Boolean(req.body.isFeatured),
        imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80",
        deliveryMethod: req.body.deliveryMethod || "Instant Encrypted Portal Code",
        terms: req.body.terms || "Legally issued prepaid card product.",
        status: "active",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.createProduct(newProd);
      db.addAuditLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: "PRODUCT_CREATED",
        details: `Created new product: ${newProd.name} ($${newProd.price} USDT)`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.status(201).json(newProd);
    } catch (err) {
      res.status(500).json({ error: "Failed to create product." });
    }
  });
  app.put("/api/admin/products/:id", authenticateToken, requireAdmin, (req, res) => {
    try {
      const updated = db.updateProduct(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: "Product not found." });
      db.addAuditLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: "PRODUCT_UPDATED",
        details: `Updated product #${req.params.id}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to update product." });
    }
  });
  app.delete("/api/admin/products/:id", authenticateToken, requireAdmin, (req, res) => {
    db.deleteProduct(req.params.id);
    db.addAuditLog({
      id: `log-${Date.now()}`,
      adminEmail: req.user.email,
      action: "PRODUCT_DELETED",
      details: `Deleted product #${req.params.id}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({ message: "Product removed successfully." });
  });
  app.post("/api/admin/announcements", authenticateToken, requireAdmin, (req, res) => {
    try {
      const { title, content, category, isImportant } = req.body;
      const ann = {
        id: `ann-${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        category: category || "Announcement",
        isImportant: Boolean(isImportant),
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.createAnnouncement(ann);
      db.addAuditLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: "ANNOUNCEMENT_PUBLISHED",
        details: `Published announcement: "${ann.title}"`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.status(201).json(ann);
    } catch (err) {
      res.status(500).json({ error: "Failed to publish announcement." });
    }
  });
  app.delete("/api/admin/announcements/:id", authenticateToken, requireAdmin, (req, res) => {
    db.deleteAnnouncement(req.params.id);
    res.json({ message: "Announcement deleted." });
  });
  app.put("/api/admin/settings", authenticateToken, requireAdmin, (req, res) => {
    try {
      const updated = db.updateSettings(req.body);
      db.addAuditLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: "SETTINGS_UPDATED",
        details: `Updated TRC20 merchant wallet & site parameters`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to update settings." });
    }
  });
  app.get("/api/admin/audit-logs", authenticateToken, requireAdmin, (req, res) => {
    res.json(db.getAuditLogs());
  });
  app.get("/api/admin/stats", authenticateToken, requireAdmin, (req, res) => {
    const orders = db.getOrders();
    const deposits = db.getDeposits();
    const users = db.getUsers();
    const products = db.getProducts();
    const totalPaidOrders = orders.filter((o) => o.paymentStatus === "paid");
    const totalVolumeUSD = totalPaidOrders.reduce((sum, o) => sum + o.amount, 0);
    const pendingOrdersCount = orders.filter((o) => o.paymentStatus === "pending" || o.paymentStatus === "verifying").length;
    const pendingDepositsCount = deposits.filter((d) => d.status === "pending").length;
    res.json({
      totalUsers: users.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalPaidOrders: totalPaidOrders.length,
      totalVolumeUSD,
      pendingOrdersCount,
      pendingDepositsCount
    });
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
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
