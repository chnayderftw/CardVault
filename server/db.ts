import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {
  Product,
  Order,
  User,
  Category,
  SiteSettings,
  InventoryReference,
  Payment,
  DeliveredCardInfo,
  AdminStats
} from '../src/types';

dotenv.config();

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  payments: Payment[];
  inventory: InventoryReference[];
  settings: SiteSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cardvault_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin.CC.adminv@gmail.com').toLowerCase().trim();
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminCC.adminV';
const DEFAULT_USDT_ADDRESS = process.env.USDT_TRC20_ADDRESS || 'TG1LiM1h3iLf654gAx1msadrDf65q2AbAC';

export class LocalStorageManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadInitialData();
  }

  private loadInitialData(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.payments) parsed.payments = [];
        return parsed;
      } catch (e) {
        console.warn('Could not parse local data file, resetting to defaults');
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, salt);
    const userHash = bcrypt.hashSync('password123', salt);

    const initialUsers: (User & { passwordHash: string })[] = [
      {
        id: 'usr_admin_01',
        email: DEFAULT_ADMIN_EMAIL,
        fullName: 'CardVault Administrator',
        role: 'admin',
        createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
        status: 'active',
        passwordHash: adminHash,
      },
      {
        id: 'usr_demo_02',
        email: 'buyer@example.com',
        fullName: 'Alex Reynolds',
        role: 'user',
        createdAt: new Date('2026-01-15T10:30:00Z').toISOString(),
        status: 'active',
        passwordHash: userHash,
      },
    ];

    const initialCategories: Category[] = [
      { id: 'cat_all', name: 'All', slug: 'all', description: 'All available cards', active: true },
      { id: 'cat_std', name: 'Standard', slug: 'standard', description: 'Standard quality cards ($1,425 - $4,225 Balance)', active: true },
      { id: 'cat_hq', name: 'HQ', slug: 'hq', description: 'High Quality (HQ) high-balance verified cards ($6,485 - $8,600 Balance)', active: true },
      { id: 'cat_uhq', name: 'UHQ', slug: 'uhq', description: 'Ultra High Quality (UHQ) top-tier instant balance cards ($18,000+ - $42,000+ Balance)', active: true },
      { id: 'cat_binance', name: 'Binance', slug: 'binance', description: 'Verified Binance Accounts with high pre-loaded balance ($42,000+ USD)', active: true },
      { id: 'cat_visa', name: 'Visa', slug: 'visa', description: 'Visa cards for worldwide use', active: true },
      { id: 'cat_mc', name: 'Mastercard', slug: 'mastercard', description: 'Mastercard cards for global shopping', active: true },
      { id: 'cat_amex', name: 'American Express', slug: 'american-express', description: 'American Express cards', active: true },
    ];

    const initialProducts: Product[] = [
      // Standard Category
      {
        id: 'prod_visa_std_1425',
        name: 'Visa Card Standard Balance : 1425 USD',
        brand: 'Visa',
        category: 'Standard',
        cardType: 'Standard',
        value: 1425,
        price: 40,
        region: 'US',
        image: '/cards/visa-100.png',
        description: 'Standard Visa Card pre-loaded with $1,425 USD balance. Accepted anywhere Visa debit cards are accepted in the United States and online. Includes secure reference delivery upon verified payment.',
        terms: 'Non-reloadable card. Valid for 24 months from activation. Instant digital issuance of card reference voucher upon payment approval.',
        availability: 'in_stock',
        stockCount: 48,
        seller: 'CardVault Official',
        rating: 4.95,
        ratingCount: 142,
        featured: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'prod_visa_std_1800',
        name: 'Visa Card Standard Balance : 1800+ USD',
        brand: 'Visa',
        category: 'Standard',
        cardType: 'Standard',
        value: 1800,
        price: 48,
        region: 'US',
        image: '/cards/visa-50.png',
        description: 'Standard Visa Card pre-funded with $1,800+ USD balance. Perfect for small online purchases, software subscriptions, and secure shopping.',
        terms: 'Valid across all US electronic merchants. Zero maintenance fees.',
        availability: 'in_stock',
        stockCount: 35,
        seller: 'CardVault Official',
        rating: 4.88,
        ratingCount: 89,
        featured: false,
        createdAt: '2026-01-02T00:00:00Z',
      },
      {
        id: 'prod_mc_std_2400',
        name: 'Mastercard Standard Balance : 2400+ USD',
        brand: 'Mastercard',
        category: 'Standard',
        cardType: 'Standard',
        value: 2400,
        price: 60,
        region: 'Global',
        image: '/cards/mc-100.png',
        description: 'Mastercard card with $2,400+ USD balance credit. Fast delivery, widely accepted worldwide at millions of online merchants.',
        terms: 'Usable globally at all digital POS accepting Mastercard debit.',
        availability: 'in_stock',
        stockCount: 60,
        seller: 'CardVault Official',
        rating: 4.90,
        ratingCount: 95,
        featured: false,
        createdAt: '2026-01-04T00:00:00Z',
      },
      {
        id: 'prod_amex_std_4225',
        name: 'American Express Standard Balance : 4225 USD',
        brand: 'American Express',
        category: 'Standard',
        cardType: 'Standard',
        value: 4225,
        price: 92,
        region: 'Global',
        image: '/cards/amex-200.png',
        description: 'American Express card pre-loaded with $4,225 USD balance. Ideal for SaaS subscriptions, digital advertising ad spend, and luxury merchant checkouts.',
        terms: 'Valid on all Amex-compatible payment gateways worldwide.',
        availability: 'in_stock',
        stockCount: 18,
        seller: 'Apex Digital LLC',
        rating: 4.92,
        ratingCount: 76,
        featured: false,
        createdAt: '2026-01-05T00:00:00Z',
      },

      // HQ Category
      {
        id: 'prod_mc_hq_6485',
        name: 'Mastercard HQ Balance : 6485 USD',
        brand: 'Mastercard',
        category: 'HQ',
        cardType: 'HQ',
        value: 6485,
        price: 135,
        region: 'Global',
        image: '/cards/mc-250.png',
        description: 'HQ High Quality Mastercard card with $6,485 USD balance. Global acceptance for travel, hotel reservations, and high-value online transactions.',
        terms: 'International worldwide coverage. Full 3D Secure / OTP enabled upon request.',
        availability: 'in_stock',
        stockCount: 22,
        seller: 'CardVault Premium',
        rating: 4.98,
        ratingCount: 210,
        featured: true,
        createdAt: '2026-01-03T00:00:00Z',
      },
      {
        id: 'prod_amex_hq_8600',
        name: 'American Express HQ Balance : 8600 USD',
        brand: 'American Express',
        category: 'HQ',
        cardType: 'HQ',
        value: 8600,
        price: 200,
        region: 'Global',
        image: '/cards/amex-200.png',
        description: 'High Quality American Express card loaded with $8,600 USD balance. High-limit verified card for premium transactions and global payments.',
        terms: 'HQ tier. Instant balance availability with full Amex merchant network compatibility.',
        availability: 'in_stock',
        stockCount: 16,
        seller: 'Apex Digital LLC',
        rating: 4.96,
        ratingCount: 138,
        featured: true,
        createdAt: '2026-01-05T12:00:00Z',
      },
      {
        id: 'prod_amex_hq_8000',
        name: 'American Express HQ Balance : 8000+ USD',
        brand: 'American Express',
        category: 'HQ',
        cardType: 'HQ',
        value: 8000,
        price: 200,
        region: 'Global',
        image: '/cards/amex-500.png',
        description: 'High Quality American Express card pre-funded with $8,000+ USD balance. Unrestricted global business and personal spending.',
        terms: 'HQ tier card. Instant digital delivery upon payment verification.',
        availability: 'in_stock',
        stockCount: 14,
        seller: 'Apex Digital LLC',
        rating: 4.94,
        ratingCount: 105,
        featured: false,
        createdAt: '2026-01-05T14:00:00Z',
      },

      // UHQ Category
      {
        id: 'prod_amex_uhq_20000',
        name: 'American Express UHQ Balance : 20,000+ USD',
        brand: 'American Express',
        category: 'UHQ',
        cardType: 'UHQ',
        value: 20000,
        price: 470,
        region: 'Global',
        image: '/cards/amex-500.png',
        description: 'Ultra High Quality American Express corporate-grade card with $20,000+ USD balance. High limit, seamless frictionless authorization.',
        terms: 'UHQ tier. Instant balance availability with zero monthly maintenance deduction.',
        availability: 'in_stock',
        stockCount: 12,
        seller: 'Apex Digital LLC',
        rating: 5.0,
        ratingCount: 164,
        featured: true,
        createdAt: '2026-01-06T00:00:00Z',
      },
      {
        id: 'prod_visa_uhq_40000',
        name: 'Visa UHQ Balance : 40,000+ USD',
        brand: 'Visa',
        category: 'UHQ',
        cardType: 'UHQ',
        value: 40000,
        price: 920,
        region: 'US',
        image: '/cards/visa-500.png',
        description: 'UHQ Ultra High Quality Visa card pre-loaded with $40,000+ USD balance. Perfect for enterprise SaaS billing, flight bookings, and bulk payments.',
        terms: 'Non-reloadable high limit digital card. Instant credential reveal upon payment confirmation.',
        availability: 'in_stock',
        stockCount: 15,
        seller: 'CardVault Official',
        rating: 4.99,
        ratingCount: 180,
        featured: true,
        createdAt: '2026-01-07T00:00:00Z',
      },
      {
        id: 'prod_mc_uhq_18000',
        name: 'Mastercard UHQ Balance : 18,000+ USD',
        brand: 'Mastercard',
        category: 'UHQ',
        cardType: 'UHQ',
        value: 18000,
        price: 465,
        region: 'Global',
        image: '/cards/mc-500.png',
        description: 'Mastercard UHQ card with $18,000+ USD total purchasing capacity. Unrestricted cross-border purchases.',
        terms: 'International global card with unlimited online transaction frequency up to balance.',
        availability: 'in_stock',
        stockCount: 14,
        seller: 'CardVault Premium',
        rating: 4.97,
        ratingCount: 112,
        featured: false,
        createdAt: '2026-01-08T00:00:00Z',
      },
      {
        id: 'prod_binance_std_2200',
        name: 'Binance Account Standard Balance : 2200+ USD',
        brand: 'Binance',
        category: 'Binance',
        cardType: 'Standard',
        value: 2200,
        price: 54,
        region: 'Global',
        image: '/cards/binance-2200.png',
        description: 'Verified Binance Account Standard pre-loaded with $2,200+ USD cryptocurrency balance. Fully verified account with clean transaction history and unrestricted trading limits.',
        terms: 'Instant digital delivery of Binance login credentials, security PIN, and 2FA recovery backup upon verified USDT payment.',
        availability: 'in_stock',
        stockCount: 20,
        seller: 'CardVault Official',
        rating: 4.95,
        ratingCount: 94,
        featured: false,
        createdAt: '2026-01-08T14:00:00Z',
      },
      {
        id: 'prod_binance_uhq_42000',
        name: 'Binance Account UHQ Balance : 42,000+ USD',
        brand: 'Binance',
        category: 'Binance',
        cardType: 'UHQ',
        value: 42000,
        price: 400,
        region: 'Global',
        image: '/cards/binance-42000.png',
        description: 'Verified Binance Account UHQ pre-loaded with $42,000+ USD cryptocurrency balance. Fully verified Level 2 account with instant withdrawal limits, clean security logs, and 2FA recovery backup.',
        terms: 'Complete account credentials, email login, seed phrase, and 2FA backup codes delivered immediately upon verified USDT payment.',
        availability: 'in_stock',
        stockCount: 10,
        seller: 'CardVault Official',
        rating: 5.0,
        ratingCount: 186,
        featured: true,
        createdAt: '2026-01-08T12:00:00Z',
      },
    ];

    const initialSettings: SiteSettings = {
      storeName: 'CardVault',
      usdtTrc20Address: DEFAULT_USDT_ADDRESS,
      paymentInstructions: 'Please transfer the exact USDT amount on the TRON (TRC20) network to our merchant address. After sending, paste your Transaction Hash (TXID) below to instantly submit verification.',
      supportEmail: 'support@cardvault.io',
      telegramSupport: '@CardVaultOfficial',
      exchangeRateUsdt: 1.0,
      minConfirmationBlocks: 1,
    };

    const initialInventory: InventoryReference[] = [
      { id: 'inv_01', productId: 'prod_visa_100', productName: 'Visa Card $100', tokenReference: 'CV-V100-REF-892401-US', isAssigned: false, createdAt: '2026-01-01T00:00:00Z' },
      { id: 'inv_02', productId: 'prod_visa_100', productName: 'Visa Card $100', tokenReference: 'CV-V100-REF-892402-US', isAssigned: false, createdAt: '2026-01-01T00:00:00Z' },
      { id: 'inv_03', productId: 'prod_mc_250', productName: 'Mastercard Card $250', tokenReference: 'CV-MC250-REF-712390-US', isAssigned: false, createdAt: '2026-01-01T00:00:00Z' },
    ];

    const initialData: DatabaseSchema = {
      users: initialUsers,
      products: initialProducts,
      categories: initialCategories,
      orders: [],
      payments: [],
      inventory: initialInventory,
      settings: initialSettings,
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving data:', err);
    }
  }

  // --------------------------------------------------------------------------
  // USERS
  // --------------------------------------------------------------------------

  async findUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const cleanEmail = email.toLowerCase().trim();
    return this.data.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  }

  async findUserById(id: string): Promise<User | null> {
    const u = this.data.users.find(user => user.id === id);
    if (!u) return null;
    const { passwordHash, ...safe } = u;
    return safe;
  }

  async createUser(user: User & { passwordHash: string }): Promise<User> {
    this.data.users.push(user);
    this.save();
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async getUsers(): Promise<User[]> {
    return this.data.users.map(({ passwordHash, ...safe }) => safe);
  }

  async updateUserStatus(userId: string, status: 'active' | 'disabled'): Promise<boolean> {
    const u = this.data.users.find(user => user.id === userId);
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

  async getProducts(params?: { category?: string; search?: string; brand?: string }): Promise<Product[]> {
    let prods = [...this.data.products];
    if (params?.category && params.category !== 'All') {
      const cat = params.category.toLowerCase();
      prods = prods.filter(pr =>
        pr.category.toLowerCase() === cat ||
        pr.brand.toLowerCase() === cat ||
        pr.cardType.toLowerCase() === cat
      );
    }
    if (params?.brand && params.brand !== 'All') {
      prods = prods.filter(pr => pr.brand.toLowerCase() === params.brand!.toLowerCase());
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      prods = prods.filter(pr =>
        pr.name.toLowerCase().includes(q) ||
        pr.description.toLowerCase().includes(q) ||
        pr.brand.toLowerCase().includes(q)
      );
    }
    return prods;
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.data.products.find(prod => prod.id === id) || null;
  }

  async createProduct(product: Product): Promise<Product> {
    this.data.products.unshift(product);
    this.save();
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const idx = this.data.products.findIndex(prod => prod.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.save();
    return this.data.products[idx];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const idx = this.data.products.findIndex(prod => prod.id === id);
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

  async createOrder(order: Order): Promise<Order> {
    this.data.orders.unshift(order);
    const payment: Payment = {
      id: 'pay_' + Math.random().toString(36).substring(2, 10),
      orderId: order.id,
      userId: order.userId,
      amount: order.totalUSDT,
      currency: 'USDT',
      network: 'TRC20',
      paymentAddress: order.paymentAddress,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.payments.unshift(payment);
    this.save();
    return order;
  }

  async getOrders(params?: { userId?: string; status?: string; search?: string }): Promise<Order[]> {
    let ords = [...this.data.orders];
    if (params?.userId) {
      ords = ords.filter(o => o.userId === params.userId);
    }
    if (params?.status && params.status !== 'All') {
      ords = ords.filter(o => o.paymentStatus === params.status || o.orderStatus === params.status);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      ords = ords.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.userEmail.toLowerCase().includes(q) ||
        (o.transactionHash && o.transactionHash.toLowerCase().includes(q))
      );
    }
    return ords;
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    return this.data.orders.find(o => o.id === orderId) || null;
  }

  async submitTransactionHash(orderId: string, txHash: string): Promise<Order | null> {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;

    order.transactionHash = txHash;
    order.paymentStatus = 'Pending Verification';
    order.txSubmittedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    const payment = this.data.payments.find(p => p.orderId === orderId);
    if (payment) {
      payment.transactionHash = txHash;
      payment.status = 'pending';
      payment.updatedAt = new Date().toISOString();
    }

    this.save();
    return order;
  }

  async approveOrderPayment(
    orderId: string,
    deliveryDetails?: { deliveredCards?: DeliveredCardInfo[]; deliveryNotes?: string }
  ): Promise<Order | null> {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;

    const deliveredTokens: string[] = [];
    order.items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        const token = `CV-${item.brand.substring(0, 2).toUpperCase()}${item.value}-REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${item.region}`;
        deliveredTokens.push(token);
      }
    });

    const cleanCards = deliveryDetails?.deliveredCards && Array.isArray(deliveryDetails.deliveredCards)
      ? deliveryDetails.deliveredCards.map(c => ({
          cardNumber: (c.cardNumber || '').trim(),
          expiryDate: (c.expiryDate || '').trim(),
          cvv: (c.cvv || '').trim(),
          cardHolder: (c.cardHolder || '').trim(),
          pin: (c.pin || '').trim(),
          balance: typeof c.balance === 'number' ? c.balance : undefined,
          notes: (c.notes || '').trim()
        }))
      : [];

    const deliveryNotes = deliveryDetails?.deliveryNotes || 'Order verified and credentials delivered.';

    order.paymentStatus = 'Paid';
    order.orderStatus = 'Completed';
    order.approvedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    order.deliveryTokens = deliveredTokens;
    order.deliveredCards = cleanCards;
    order.deliveryNotes = deliveryNotes;

    const payment = this.data.payments.find(p => p.orderId === orderId);
    if (payment) {
      payment.status = 'confirmed';
      payment.updatedAt = new Date().toISOString();
    }

    this.save();
    return order;
  }

  async rejectOrderPayment(orderId: string, reason: string): Promise<Order | null> {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;

    order.paymentStatus = 'Rejected';
    order.orderStatus = 'Cancelled';
    order.rejectedAt = new Date().toISOString();
    order.rejectionReason = reason;
    order.updatedAt = new Date().toISOString();

    const payment = this.data.payments.find(p => p.orderId === orderId);
    if (payment) {
      payment.status = 'failed';
      payment.updatedAt = new Date().toISOString();
    }

    this.save();
    return order;
  }

  async updateOrderStatus(orderId: string, status: { paymentStatus?: any; orderStatus?: any }): Promise<Order | null> {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;
    if (status.paymentStatus) order.paymentStatus = status.paymentStatus;
    if (status.orderStatus) order.orderStatus = status.orderStatus;
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  // --------------------------------------------------------------------------
  // PAYMENTS
  // --------------------------------------------------------------------------

  async getPayments(params?: { status?: string; search?: string }): Promise<Payment[]> {
    let pays = [...this.data.payments];
    if (params?.status && params.status !== 'All') {
      pays = pays.filter(py => py.status === params.status?.toLowerCase());
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      pays = pays.filter(py =>
        py.orderId.toLowerCase().includes(q) ||
        (py.transactionHash && py.transactionHash.toLowerCase().includes(q))
      );
    }
    return pays;
  }

  async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    return this.data.payments.find(p => p.orderId === orderId) || null;
  }

  // --------------------------------------------------------------------------
  // ADMIN SETTINGS
  // --------------------------------------------------------------------------

  async getSettings(): Promise<SiteSettings> {
    return this.data.settings;
  }

  async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  // --------------------------------------------------------------------------
  // INVENTORY & CATEGORIES
  // --------------------------------------------------------------------------

  getCategories(): Category[] {
    return this.data.categories;
  }

  async getInventory(): Promise<InventoryReference[]> {
    return this.data.inventory;
  }

  async addInventoryTokens(tokens: { productId: string; productName: string; tokenReference: string }[]): Promise<boolean> {
    tokens.forEach(t => {
      this.data.inventory.push({
        id: 'inv_' + Math.random().toString(36).substring(2, 9),
        productId: t.productId,
        productName: t.productName,
        tokenReference: t.tokenReference,
        isAssigned: false,
        createdAt: new Date().toISOString()
      });
    });
    this.save();
    return true;
  }

  // --------------------------------------------------------------------------
  // ADMIN STATS
  // --------------------------------------------------------------------------

  async getAdminStats(): Promise<AdminStats> {
    const totalOrders = this.data.orders.length;
    const completedOrders = this.data.orders.filter(o => o.orderStatus === 'Completed' || o.paymentStatus === 'Paid').length;
    const pendingPayments = this.data.orders.filter(o => o.paymentStatus === 'Pending Verification' || o.paymentStatus === 'Payment Submitted').length;
    const totalRevenue = this.data.orders
      .filter(o => o.paymentStatus === 'Paid' || o.orderStatus === 'Completed')
      .reduce((sum, o) => sum + (o.totalUSD || 0), 0);
    const activeProducts = this.data.products.filter(p => p.availability !== 'out_of_stock').length;
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
}

export const db = new LocalStorageManager();
