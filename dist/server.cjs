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
var import_dotenv = __toESM(require("dotenv"), 1);
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_qrcode = __toESM(require("qrcode"), 1);
var import_vite = require("vite");

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "cardvault_db.json");
if (!import_fs.default.existsSync(DATA_DIR)) {
  import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
}
var DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin.CC.adminv@gmail.com";
var DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "adminCC.adminV";
var DEFAULT_USDT_ADDRESS = process.env.USDT_TRC20_ADDRESS || "TG1LiM1h3iLf654gAx1msadrDf65q2AbAC";
function getInitialData() {
  const salt = import_bcryptjs.default.genSaltSync(10);
  const adminHash = import_bcryptjs.default.hashSync(DEFAULT_ADMIN_PASSWORD, salt);
  const userHash = import_bcryptjs.default.hashSync("password123", salt);
  const initialUsers = [
    {
      id: "usr_admin_01",
      email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
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
    { id: "cat_std", name: "Standard", slug: "standard", description: "Standard quality cards ($25 - $100)", active: true },
    { id: "cat_hq", name: "HQ", slug: "hq", description: "High Quality (HQ) high-balance verified cards", active: true },
    { id: "cat_uhq", name: "UHQ", slug: "uhq", description: "Ultra High Quality (UHQ) top-tier instant balance cards", active: true },
    { id: "cat_visa", name: "Visa", slug: "visa", description: "Visa cards for worldwide use", active: true },
    { id: "cat_mc", name: "Mastercard", slug: "mastercard", description: "Mastercard cards for global shopping", active: true },
    { id: "cat_amex", name: "American Express", slug: "american-express", description: "American Express cards", active: true }
  ];
  const initialProducts = [
    {
      id: "prod_visa_100",
      name: "Visa Prepaid $100",
      brand: "Visa",
      category: "Standard",
      cardType: "Standard",
      value: 100,
      price: 95,
      region: "US",
      image: "/cards/visa-100.png",
      description: "Standard Visa Prepaid Card loaded with $100 USD value. Accepted anywhere Visa debit cards are accepted in the United States and online. Includes secure reference delivery upon verified payment.",
      terms: "Non-reloadable prepaid card. Valid for 24 months from activation. Instant digital issuance of card reference voucher upon payment approval.",
      availability: "in_stock",
      stockCount: 85,
      seller: "CardVault Official",
      rating: 4.9,
      ratingCount: 342,
      featured: true,
      createdAt: (/* @__PURE__ */ new Date("2026-01-01T00:00:00Z")).toISOString()
    },
    {
      id: "prod_visa_50",
      name: "Visa Prepaid $50",
      brand: "Visa",
      category: "Standard",
      cardType: "Standard",
      value: 50,
      price: 48,
      region: "US",
      image: "/cards/visa-50.png",
      description: "Standard Visa Prepaid card pre-funded with $50. Perfect for small online purchases, software subscriptions, and secure shopping.",
      terms: "Usable online and in-store across US merchant terminals. Instant reference code delivery.",
      availability: "in_stock",
      stockCount: 120,
      seller: "CardVault Official",
      rating: 4.8,
      ratingCount: 215,
      featured: false,
      createdAt: (/* @__PURE__ */ new Date("2026-01-02T00:00:00Z")).toISOString()
    },
    {
      id: "prod_mc_250",
      name: "Mastercard HQ Prepaid $250",
      brand: "Mastercard",
      category: "HQ",
      cardType: "HQ",
      value: 250,
      price: 235,
      region: "US",
      image: "/cards/mastercard-250.png",
      description: "HQ High Quality Mastercard Prepaid card with $250 USD value. Global acceptance for travel, hotel reservations, and high-value online transactions.",
      terms: "Zero monthly fees for the first 12 months. Delivered with unique digital voucher reference.",
      availability: "in_stock",
      stockCount: 42,
      seller: "CardVault Official",
      rating: 4.9,
      ratingCount: 189,
      featured: true,
      createdAt: (/* @__PURE__ */ new Date("2026-01-03T00:00:00Z")).toISOString()
    },
    {
      id: "prod_mc_100",
      name: "Mastercard Standard $100",
      brand: "Mastercard",
      category: "Standard",
      cardType: "Standard",
      value: 100,
      price: 95,
      region: "US",
      image: "/cards/mastercard-100.png",
      description: "Mastercard Prepaid card with $100 USD credit. Fast delivery, widely accepted worldwide at millions of online merchants.",
      terms: "Standard digital card reference. No verification delays once USDT TRC20 payment is verified.",
      availability: "in_stock",
      stockCount: 65,
      seller: "CardVault Official",
      rating: 4.8,
      ratingCount: 164,
      featured: false,
      createdAt: (/* @__PURE__ */ new Date("2026-01-04T00:00:00Z")).toISOString()
    },
    {
      id: "prod_amex_50",
      name: "American Express Standard $50",
      brand: "American Express",
      category: "Standard",
      cardType: "Standard",
      value: 50,
      price: 48,
      region: "US",
      image: "/cards/amex-50.png",
      description: "American Express Gift Card with $50 value. Usable virtually everywhere American Express cards are accepted in the US.",
      terms: "Funds do not expire. Issued via secure encrypted voucher token upon payment settlement.",
      availability: "in_stock",
      stockCount: 50,
      seller: "CardVault Official",
      rating: 4.8,
      ratingCount: 98,
      featured: true,
      createdAt: (/* @__PURE__ */ new Date("2026-01-05T00:00:00Z")).toISOString()
    },
    {
      id: "prod_amex_100",
      name: "American Express HQ $100",
      brand: "American Express",
      category: "HQ",
      cardType: "HQ",
      value: 100,
      price: 94,
      region: "US",
      image: "/cards/amex-100.png",
      description: "American Express HQ $100 denomination card. Ideal for retail stores, electronics, and digital payments.",
      terms: "Pre-activated balance. Ready for immediate use once order is approved.",
      availability: "in_stock",
      stockCount: 77,
      seller: "CardVault Official",
      rating: 4.9,
      ratingCount: 220,
      featured: false,
      createdAt: (/* @__PURE__ */ new Date("2026-01-06T00:00:00Z")).toISOString()
    },
    {
      id: "prod_visa_500",
      name: "Visa UHQ Prepaid $500",
      brand: "Visa",
      category: "UHQ",
      cardType: "UHQ",
      value: 500,
      price: 470,
      region: "Global",
      image: "/cards/visa-500.png",
      description: "Ultra High Quality (UHQ) Visa card loaded with $500. High spending limits, global 3D-secure enabled merchant compatibility.",
      terms: "UHQ tier allocation. Fast priority verification for payments exceeding 400 USDT.",
      availability: "in_stock",
      stockCount: 25,
      seller: "CardVault Prime",
      rating: 5,
      ratingCount: 112,
      featured: true,
      createdAt: (/* @__PURE__ */ new Date("2026-01-07T00:00:00Z")).toISOString()
    },
    {
      id: "prod_mc_500",
      name: "Mastercard UHQ Prepaid $500",
      brand: "Mastercard",
      category: "UHQ",
      cardType: "UHQ",
      value: 500,
      price: 465,
      region: "Global",
      image: "/cards/mastercard-500.png",
      description: "Mastercard UHQ prepaid voucher with $500 total purchasing capacity. Unrestricted cross-border purchases.",
      terms: "Global region enabled. Secure delivery reference code provided on approval.",
      availability: "in_stock",
      stockCount: 30,
      seller: "CardVault Prime",
      rating: 4.9,
      ratingCount: 95,
      featured: false,
      createdAt: (/* @__PURE__ */ new Date("2026-01-08T00:00:00Z")).toISOString()
    },
    {
      id: "prod_amex_200",
      name: "American Express HQ $200",
      brand: "American Express",
      category: "HQ",
      cardType: "HQ",
      value: 200,
      price: 188,
      region: "US",
      image: "/cards/amex-200.png",
      description: "American Express HQ card loaded with $200 USD. Suitable for airline bookings, luxury dining, and retail checkout.",
      terms: "Valid at US merchants accepting American Express. No maintenance fees.",
      availability: "in_stock",
      stockCount: 40,
      seller: "CardVault Official",
      rating: 4.9,
      ratingCount: 140,
      featured: false,
      createdAt: (/* @__PURE__ */ new Date("2026-01-09T00:00:00Z")).toISOString()
    },
    {
      id: "prod_visa_uhq_1000",
      name: "Visa UHQ Elite $1000",
      brand: "Visa",
      category: "UHQ",
      cardType: "UHQ",
      value: 1e3,
      price: 920,
      region: "Global",
      image: "/cards/visa-1000.png",
      description: "Top-tier UHQ Ultra High Quality Visa Card loaded with $1000 USD balance. Instant priority activation and maximum spending limits.",
      terms: "UHQ Priority allocation. Immediate dispatch of digital reference token upon payment confirmation.",
      availability: "in_stock",
      stockCount: 15,
      seller: "CardVault Prime",
      rating: 5,
      ratingCount: 88,
      featured: true,
      createdAt: (/* @__PURE__ */ new Date("2026-01-10T00:00:00Z")).toISOString()
    },
    {
      id: "prod_gift_visa_25",
      name: "Visa Standard $25",
      brand: "Visa",
      category: "Standard",
      cardType: "Standard",
      value: 25,
      price: 24,
      region: "Global",
      image: "/cards/visa-25.png",
      description: "Standard balance Visa card for everyday gaming, in-app purchases, and micro-subscriptions.",
      terms: "Digital voucher reference code. Instant fulfillment.",
      availability: "in_stock",
      stockCount: 200,
      seller: "CardVault Official",
      rating: 4.7,
      ratingCount: 410,
      featured: false,
      createdAt: (/* @__PURE__ */ new Date("2026-01-10T00:00:00Z")).toISOString()
    },
    {
      id: "prod_gift_mc_75",
      name: "Mastercard Standard $75",
      brand: "Mastercard",
      category: "Standard",
      cardType: "Standard",
      value: 75,
      price: 71,
      region: "US",
      image: "/cards/mastercard-75.png",
      description: "Mastercard card pre-loaded with $75. Great balance size for retail fashion, tech gear, and streaming services.",
      terms: "Issued as authenticated voucher reference. Valid nationwide.",
      availability: "in_stock",
      stockCount: 88,
      seller: "CardVault Official",
      rating: 4.8,
      ratingCount: 155,
      featured: false,
      createdAt: (/* @__PURE__ */ new Date("2026-01-11T00:00:00Z")).toISOString()
    }
  ];
  const initialInventory = [
    { id: "inv_01", productId: "prod_visa_100", productName: "Visa Prepaid $100", tokenReference: "CV-V100-REF-892401-US", isAssigned: true, orderId: "ORD-98241", assignedAt: "2026-02-10T14:30:00Z", createdAt: "2026-01-01T00:00:00Z" },
    { id: "inv_02", productId: "prod_visa_100", productName: "Visa Prepaid $100", tokenReference: "CV-V100-REF-892402-US", isAssigned: false, createdAt: "2026-01-01T00:00:00Z" },
    { id: "inv_03", productId: "prod_visa_100", productName: "Visa Prepaid $100", tokenReference: "CV-V100-REF-892403-US", isAssigned: false, createdAt: "2026-01-01T00:00:00Z" },
    { id: "inv_04", productId: "prod_mc_250", productName: "Mastercard Prepaid $250", tokenReference: "CV-MC250-REF-712390-US", isAssigned: false, createdAt: "2026-01-01T00:00:00Z" },
    { id: "inv_05", productId: "prod_mc_250", productName: "Mastercard Prepaid $250", tokenReference: "CV-MC250-REF-712391-US", isAssigned: false, createdAt: "2026-01-01T00:00:00Z" },
    { id: "inv_06", productId: "prod_amex_50", productName: "American Express Gift Card $50", tokenReference: "CV-AM50-REF-349811-US", isAssigned: false, createdAt: "2026-01-01T00:00:00Z" },
    { id: "inv_07", productId: "prod_visa_500", productName: "Visa Premium Prepaid $500", tokenReference: "CV-V500-REF-190422-GL", isAssigned: false, createdAt: "2026-01-01T00:00:00Z" },
    { id: "inv_08", productId: "prod_amex_100", productName: "American Express Gift Card $100", tokenReference: "CV-AM100-REF-551982-US", isAssigned: false, createdAt: "2026-01-01T00:00:00Z" }
  ];
  const initialOrders = [
    {
      id: "ORD-98241",
      userId: "usr_demo_02",
      userEmail: "buyer@example.com",
      userName: "Alex Reynolds",
      items: [
        {
          productId: "prod_visa_100",
          name: "Visa Prepaid $100",
          brand: "Visa",
          cardType: "Standard",
          value: 100,
          price: 95,
          quantity: 1,
          image: "/cards/visa-100.png",
          region: "US"
        }
      ],
      totalUSD: 95,
      totalUSDT: 95,
      paymentMethod: "USDT_TRC20",
      paymentAddress: DEFAULT_USDT_ADDRESS,
      paymentStatus: "Completed",
      orderStatus: "Completed",
      transactionHash: "b4a8e5792c8172901cfba982410a83e0984cfb7218ea0294871908234cb012a9",
      txSubmittedAt: "2026-02-10T14:15:00Z",
      approvedAt: "2026-02-10T14:30:00Z",
      createdAt: "2026-02-10T14:00:00Z",
      updatedAt: "2026-02-10T14:30:00Z",
      deliveredCards: [
        {
          id: "card_demo_01",
          cardName: "Visa Prepaid $100",
          brand: "Visa",
          cardNumber: "4532890123456789",
          expiryDate: "09/28",
          cvv: "638",
          cardHolder: "Alex Reynolds",
          pin: "4419",
          balance: 100,
          notes: "US Billing Zip: 90210"
        }
      ],
      deliveryNotes: "Your Visa $100 prepaid card is activated and ready for use.",
      customerNotes: "Please process fast"
    },
    {
      id: "ORD-98284",
      userId: "usr_demo_02",
      userEmail: "buyer@example.com",
      userName: "Alex Reynolds",
      items: [
        {
          productId: "prod_mc_250",
          name: "Mastercard Prepaid $250",
          brand: "Mastercard",
          cardType: "Premium",
          value: 250,
          price: 235,
          quantity: 1,
          image: "/cards/mastercard-250.png",
          region: "US"
        }
      ],
      totalUSD: 235,
      totalUSDT: 235,
      paymentMethod: "USDT_TRC20",
      paymentAddress: DEFAULT_USDT_ADDRESS,
      paymentStatus: "Pending Verification",
      orderStatus: "Processing",
      transactionHash: "8f0923cb910948ac0192834baf571029384bc19028374619028374619028374a",
      txSubmittedAt: "2026-02-12T18:40:00Z",
      createdAt: "2026-02-12T18:30:00Z",
      updatedAt: "2026-02-12T18:40:00Z",
      customerNotes: "Sent 235 USDT via Tronlink wallet"
    }
  ];
  const initialSettings = {
    storeName: "CardVault",
    usdtTrc20Address: DEFAULT_USDT_ADDRESS,
    paymentInstructions: "Send the exact USDT amount to the TRC20 wallet address below. Once your transaction is confirmed on the TRON network, copy the TXID (transaction hash) and paste it into the verification box to complete your order.",
    supportEmail: "support@cardvault.io",
    telegramSupport: "@CardVaultSupport",
    exchangeRateUsdt: 1,
    minConfirmationBlocks: 1
  };
  return {
    users: initialUsers,
    products: initialProducts,
    categories: initialCategories,
    orders: initialOrders,
    inventory: initialInventory,
    settings: initialSettings
  };
}
var Database = class {
  constructor() {
    this.data = this.loadData();
  }
  loadData() {
    try {
      if (import_fs.default.existsSync(DB_FILE)) {
        const raw = import_fs.default.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.products && parsed.settings) {
          return parsed;
        }
      }
    } catch (err) {
      console.error("Error loading database, resetting to defaults:", err);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }
  saveData(data) {
    try {
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to write database to disk:", err);
    }
  }
  save() {
    this.saveData(this.data);
  }
  // Users
  getUsers() {
    return this.data.users.map(({ passwordHash, ...user }) => user);
  }
  findUserByEmail(email) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  findUserById(id) {
    const u = this.data.users.find((u2) => u2.id === id);
    if (!u) return null;
    const { passwordHash, ...safeUser } = u;
    return safeUser;
  }
  createUser(user) {
    this.data.users.push(user);
    this.save();
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
  updateUserStatus(id, status) {
    const user = this.data.users.find((u) => u.id === id);
    if (user) {
      user.status = status;
      this.save();
      return true;
    }
    return false;
  }
  // Products
  getProducts(filters) {
    let result = [...this.data.products];
    if (filters?.category && filters.category !== "All") {
      const catLower = filters.category.toLowerCase();
      result = result.filter(
        (p) => p.category.toLowerCase() === catLower || p.brand.toLowerCase() === catLower || p.cardType.toLowerCase() === catLower
      );
    }
    if (filters?.brand && filters.brand !== "All") {
      result = result.filter((p) => p.brand.toLowerCase() === filters.brand?.toLowerCase());
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.region.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    return result;
  }
  getProductById(id) {
    return this.data.products.find((p) => p.id === id) || null;
  }
  createProduct(product) {
    this.data.products.unshift(product);
    this.save();
    return product;
  }
  updateProduct(id, updates) {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.data.products[index] = { ...this.data.products[index], ...updates };
      this.save();
      return this.data.products[index];
    }
    return null;
  }
  deleteProduct(id) {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    this.save();
    return this.data.products.length < initialLen;
  }
  // Categories
  getCategories() {
    return this.data.categories;
  }
  createCategory(category) {
    this.data.categories.push(category);
    this.save();
    return category;
  }
  deleteCategory(id) {
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    this.save();
    return true;
  }
  // Orders
  getOrders(filters) {
    let result = [...this.data.orders];
    if (filters?.userId) {
      result = result.filter((o) => o.userId === filters.userId);
    }
    if (filters?.status && filters.status !== "All") {
      result = result.filter((o) => o.paymentStatus === filters.status || o.orderStatus === filters.status);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (o) => o.id.toLowerCase().includes(q) || o.userEmail.toLowerCase().includes(q) || o.transactionHash && o.transactionHash.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  getOrderById(id) {
    return this.data.orders.find((o) => o.id === id) || null;
  }
  createOrder(order) {
    this.data.orders.unshift(order);
    this.save();
    return order;
  }
  submitTransactionHash(orderId, txHash) {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.transactionHash = txHash.trim();
    order.paymentStatus = "Pending Verification";
    order.orderStatus = "Processing";
    order.txSubmittedAt = (/* @__PURE__ */ new Date()).toISOString();
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.save();
    return order;
  }
  approveOrderPayment(orderId, options) {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.paymentStatus = "Paid";
    order.orderStatus = "Completed";
    order.approvedAt = (/* @__PURE__ */ new Date()).toISOString();
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (options?.deliveryNotes) {
      order.deliveryNotes = options.deliveryNotes.trim();
    }
    if (options?.deliveredCards && Array.isArray(options.deliveredCards) && options.deliveredCards.length > 0) {
      order.deliveredCards = options.deliveredCards.map((c) => ({
        id: c.id || "card_" + Math.random().toString(36).substring(2, 9),
        cardName: c.cardName || "",
        brand: c.brand || "Visa",
        cardNumber: (c.cardNumber || "").trim(),
        expiryDate: (c.expiryDate || "").trim(),
        cvv: (c.cvv || "").trim(),
        cardHolder: (c.cardHolder || "").trim(),
        pin: (c.pin || "").trim(),
        balance: typeof c.balance === "number" ? c.balance : void 0,
        notes: (c.notes || "").trim()
      }));
    }
    const deliveredTokens = [];
    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        const availableInv = this.data.inventory.find((inv) => inv.productId === item.productId && !inv.isAssigned);
        if (availableInv) {
          availableInv.isAssigned = true;
          availableInv.orderId = order.id;
          availableInv.assignedAt = (/* @__PURE__ */ new Date()).toISOString();
          deliveredTokens.push(availableInv.tokenReference);
        } else {
          const token = `CV-${item.brand.substring(0, 2).toUpperCase()}${item.value}-REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${item.region}`;
          this.data.inventory.push({
            id: "inv_" + Math.random().toString(36).substring(2, 9),
            productId: item.productId,
            productName: item.name,
            tokenReference: token,
            isAssigned: true,
            orderId: order.id,
            assignedAt: (/* @__PURE__ */ new Date()).toISOString(),
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          deliveredTokens.push(token);
        }
      }
    });
    order.deliveryTokens = deliveredTokens;
    this.save();
    return order;
  }
  rejectOrderPayment(orderId, reason) {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.paymentStatus = "Rejected";
    order.orderStatus = "Cancelled";
    order.rejectedAt = (/* @__PURE__ */ new Date()).toISOString();
    order.rejectionReason = reason;
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.save();
    return order;
  }
  updateOrderStatus(orderId, status) {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;
    if (status.paymentStatus) order.paymentStatus = status.paymentStatus;
    if (status.orderStatus) order.orderStatus = status.orderStatus;
    order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    this.save();
    return order;
  }
  // Inventory
  getInventory() {
    return this.data.inventory;
  }
  addInventoryTokens(tokens) {
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
  // Settings
  getSettings() {
    return this.data.settings;
  }
  updateSettings(updates) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }
  // Admin stats
  getAdminStats() {
    const totalOrders = this.data.orders.length;
    const completedOrders = this.data.orders.filter((o) => o.orderStatus === "Completed" || o.paymentStatus === "Paid" || o.paymentStatus === "Completed").length;
    const pendingPayments = this.data.orders.filter((o) => o.paymentStatus === "Pending Verification" || o.paymentStatus === "Payment Submitted").length;
    const totalRevenue = this.data.orders.filter((o) => o.paymentStatus === "Paid" || o.paymentStatus === "Completed").reduce((sum, o) => sum + (o.totalUSD || 0), 0);
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
var db = new Database();

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
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication token required" });
  }
  const token = authHeader.substring(7);
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    const user = db.findUserById(decoded.id);
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
function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
      const user = db.findUserById(decoded.id);
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
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  app.use(import_express.default.json());
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString(), store: "CardVault" });
  });
  app.get("/api/settings", (req, res) => {
    const settings = db.getSettings();
    res.json(settings);
  });
  app.get("/api/categories", (req, res) => {
    const categories = db.getCategories();
    res.json(categories);
  });
  app.get("/api/products", (req, res) => {
    const { category, search, brand } = req.query;
    const products = db.getProducts({ category, search, brand });
    res.json(products);
  });
  app.get("/api/products/:id", (req, res) => {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  });
  app.get("/api/payment/qr", async (req, res) => {
    try {
      const address = req.query.address || db.getSettings().usdtTrc20Address;
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
  app.post("/api/auth/signup", async (req, res) => {
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
      const existing = db.findUserByEmail(email);
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
      const safeUser = db.createUser(newUser);
      const token = generateToken(safeUser);
      res.status(201).json({ user: safeUser, token });
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ error: err.message || "Signup failed" });
    }
  });
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Please provide email and password" });
      }
      const userRecord = db.findUserByEmail(email);
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
  app.post("/api/orders/create", optionalAuthenticate, async (req, res) => {
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
        const product = db.getProductById(it.productId);
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
      const settings = db.getSettings();
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
      const created = db.createOrder(newOrder);
      res.status(201).json(created);
    } catch (err) {
      console.error("Create order error:", err);
      res.status(500).json({ error: err.message || "Failed to create order" });
    }
  });
  app.get("/api/orders/my-orders", authenticate, (req, res) => {
    const orders = db.getOrders({ userId: req.user.id });
    res.json(orders);
  });
  app.get("/api/orders/:orderId", optionalAuthenticate, (req, res) => {
    const order = db.getOrderById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  });
  app.post("/api/orders/:orderId/submit-txid", async (req, res) => {
    const { txHash } = req.body;
    if (!txHash || txHash.trim().length < 10) {
      return res.status(400).json({ error: "Please provide a valid TRON transaction hash (TXID)" });
    }
    const order = db.submitTransactionHash(req.params.orderId, txHash.trim());
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({
      message: "Transaction hash submitted successfully. Payment is now Pending Verification.",
      order
    });
  });
  app.get("/api/admin/stats", requireAdmin, (req, res) => {
    const stats = db.getAdminStats();
    res.json(stats);
  });
  app.get("/api/admin/orders", requireAdmin, (req, res) => {
    const { status, search } = req.query;
    const orders = db.getOrders({ status, search });
    res.json(orders);
  });
  app.get("/api/admin/orders/:orderId", requireAdmin, (req, res) => {
    const order = db.getOrderById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  });
  app.post("/api/admin/orders/:orderId/approve-payment", requireAdmin, (req, res) => {
    const { deliveredCards, deliveryNotes } = req.body || {};
    const order = db.approveOrderPayment(req.params.orderId, { deliveredCards, deliveryNotes });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Payment approved. Card information successfully delivered to client.", order });
  });
  app.post("/api/admin/orders/:orderId/reject-payment", requireAdmin, (req, res) => {
    const { reason } = req.body;
    const order = db.rejectOrderPayment(req.params.orderId, reason || "Transaction could not be verified on TRC20 network");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Payment rejected.", order });
  });
  app.put("/api/admin/orders/:orderId/status", requireAdmin, (req, res) => {
    const { paymentStatus, orderStatus } = req.body;
    const order = db.updateOrderStatus(req.params.orderId, { paymentStatus, orderStatus });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  });
  app.post("/api/admin/products", requireAdmin, (req, res) => {
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
      terms: p.terms || "Standard prepaid card terms apply.",
      availability: p.availability || "in_stock",
      stockCount: parseInt(p.stockCount, 10) || 50,
      seller: p.seller || "CardVault Official",
      rating: parseFloat(p.rating) || 4.9,
      ratingCount: parseInt(p.ratingCount, 10) || 10,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const created = db.createProduct(newProduct);
    res.status(201).json(created);
  });
  app.put("/api/admin/products/:id", requireAdmin, (req, res) => {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(updated);
  });
  app.delete("/api/admin/products/:id", requireAdmin, (req, res) => {
    const success = db.deleteProduct(req.params.id);
    if (!success) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  });
  app.get("/api/admin/inventory", requireAdmin, (req, res) => {
    const inv = db.getInventory();
    res.json(inv);
  });
  app.post("/api/admin/inventory/add", requireAdmin, (req, res) => {
    const { productId, tokens } = req.body;
    const product = db.getProductById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (!tokens || !Array.isArray(tokens)) return res.status(400).json({ error: "Tokens array is required" });
    const entries = tokens.map((token) => ({
      productId,
      productName: product.name,
      tokenReference: token.trim()
    }));
    db.addInventoryTokens(entries);
    res.json({ message: `${entries.length} reference tokens added successfully` });
  });
  app.get("/api/admin/users", requireAdmin, (req, res) => {
    const users = db.getUsers();
    res.json(users);
  });
  app.put("/api/admin/users/:id/status", requireAdmin, (req, res) => {
    const { status } = req.body;
    const ok = db.updateUserStatus(req.params.id, status);
    if (!ok) return res.status(404).json({ error: "User not found" });
    res.json({ message: `User status updated to ${status}` });
  });
  app.get("/api/admin/settings", requireAdmin, (req, res) => {
    res.json(db.getSettings());
  });
  app.put("/api/admin/settings", requireAdmin, (req, res) => {
    const updated = db.updateSettings(req.body);
    res.json(updated);
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
