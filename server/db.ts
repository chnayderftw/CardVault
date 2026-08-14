import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Product, Order, User, Category, SiteSettings, InventoryReference } from '../src/types';

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  inventory: InventoryReference[];
  settings: SiteSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cardvault_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin.CC.adminv@gmail.com';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminCC.adminV';
const DEFAULT_USDT_ADDRESS = process.env.USDT_TRC20_ADDRESS || 'TG1LiM1h3iLf654gAx1msadrDf65q2AbAC';

function getInitialData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, salt);
  const userHash = bcrypt.hashSync('password123', salt);

  const initialUsers: (User & { passwordHash: string })[] = [
    {
      id: 'usr_admin_01',
      email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
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
    { id: 'cat_std', name: 'Standard', slug: 'standard', description: 'Standard quality cards ($25 - $100)', active: true },
    { id: 'cat_hq', name: 'HQ', slug: 'hq', description: 'High Quality (HQ) high-balance verified cards', active: true },
    { id: 'cat_uhq', name: 'UHQ', slug: 'uhq', description: 'Ultra High Quality (UHQ) top-tier instant balance cards', active: true },
    { id: 'cat_visa', name: 'Visa', slug: 'visa', description: 'Visa cards for worldwide use', active: true },
    { id: 'cat_mc', name: 'Mastercard', slug: 'mastercard', description: 'Mastercard cards for global shopping', active: true },
    { id: 'cat_amex', name: 'American Express', slug: 'american-express', description: 'American Express cards', active: true },
  ];

  const initialProducts: Product[] = [
    {
      id: 'prod_visa_100',
      name: 'Visa Prepaid $100',
      brand: 'Visa',
      category: 'Standard',
      cardType: 'Standard',
      value: 100,
      price: 95,
      region: 'US',
      image: '/cards/visa-100.png',
      description: 'Standard Visa Prepaid Card loaded with $100 USD value. Accepted anywhere Visa debit cards are accepted in the United States and online. Includes secure reference delivery upon verified payment.',
      terms: 'Non-reloadable prepaid card. Valid for 24 months from activation. Instant digital issuance of card reference voucher upon payment approval.',
      availability: 'in_stock',
      stockCount: 85,
      seller: 'CardVault Official',
      rating: 4.9,
      ratingCount: 342,
      featured: true,
      createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
    },
    {
      id: 'prod_visa_50',
      name: 'Visa Prepaid $50',
      brand: 'Visa',
      category: 'Standard',
      cardType: 'Standard',
      value: 50,
      price: 48,
      region: 'US',
      image: '/cards/visa-50.png',
      description: 'Standard Visa Prepaid card pre-funded with $50. Perfect for small online purchases, software subscriptions, and secure shopping.',
      terms: 'Usable online and in-store across US merchant terminals. Instant reference code delivery.',
      availability: 'in_stock',
      stockCount: 120,
      seller: 'CardVault Official',
      rating: 4.8,
      ratingCount: 215,
      featured: false,
      createdAt: new Date('2026-01-02T00:00:00Z').toISOString(),
    },
    {
      id: 'prod_mc_250',
      name: 'Mastercard HQ Prepaid $250',
      brand: 'Mastercard',
      category: 'HQ',
      cardType: 'HQ',
      value: 250,
      price: 235,
      region: 'US',
      image: '/cards/mastercard-250.png',
      description: 'HQ High Quality Mastercard Prepaid card with $250 USD value. Global acceptance for travel, hotel reservations, and high-value online transactions.',
      terms: 'Zero monthly fees for the first 12 months. Delivered with unique digital voucher reference.',
      availability: 'in_stock',
      stockCount: 42,
      seller: 'CardVault Official',
      rating: 4.9,
      ratingCount: 189,
      featured: true,
      createdAt: new Date('2026-01-03T00:00:00Z').toISOString(),
    },
    {
      id: 'prod_mc_100',
      name: 'Mastercard Standard $100',
      brand: 'Mastercard',
      category: 'Standard',
      cardType: 'Standard',
      value: 100,
      price: 95,
      region: 'US',
      image: '/cards/mastercard-100.png',
      description: 'Mastercard Prepaid card with $100 USD credit. Fast delivery, widely accepted worldwide at millions of online merchants.',
      terms: 'Standard digital card reference. No verification delays once USDT TRC20 payment is verified.',
      availability: 'in_stock',
      stockCount: 65,
      seller: 'CardVault Official',
      rating: 4.8,
      ratingCount: 164,
      featured: false,
      createdAt: new Date('2026-01-04T00:00:00Z').toISOString(),
    },
    {
      id: 'prod_amex_50',
      name: 'American Express Standard $50',
      brand: 'American Express',
      category: 'Standard',
      cardType: 'Standard',
      value: 50,
      price: 48,
      region: 'US',
      image: '/cards/amex-50.png',
      description: 'American Express Gift Card with $50 value. Usable virtually everywhere American Express cards are accepted in the US.',
      terms: 'Funds do not expire. Issued via secure encrypted voucher token upon payment settlement.',
      availability: 'in_stock',
      stockCount: 50,
      seller: 'CardVault Official',
      rating: 4.8,
      ratingCount: 98,
      featured: true,
      createdAt: new Date('2026-01-05T00:00:00Z').toISOString(),
    },
    {
      id: 'prod_amex_100',
      name: 'American Express HQ $100',
      brand: 'American Express',
      category: 'HQ',
      cardType: 'HQ',
      value: 100,
      price: 94,
      region: 'US',
      image: '/cards/amex-100.png',
      description: 'American Express HQ $100 denomination card. Ideal for retail stores, electronics, and digital payments.',
      terms: 'Pre-activated balance. Ready for immediate use once order is approved.',
      availability: 'in_stock',
      stockCount: 77,
      seller: 'CardVault Official',
      rating: 4.9,
      ratingCount: 220,
      featured: false,
      createdAt: new Date('2026-01-06T00:00:00Z').toISOString(),
    },
    {
      id: 'prod_visa_500',
      name: 'Visa UHQ Prepaid $500',
      brand: 'Visa',
      category: 'UHQ',
      cardType: 'UHQ',
      value: 500,
      price: 470,
      region: 'Global',
      image: '/cards/visa-500.png',
      description: 'Ultra High Quality (UHQ) Visa card loaded with $500. High spending limits, global 3D-secure enabled merchant compatibility.',
      terms: 'UHQ tier allocation. Fast priority verification for payments exceeding 400 USDT.',
      availability: 'in_stock',
      stockCount: 25,
      seller: 'CardVault Prime',
      rating: 5.0,
      ratingCount: 112,
      featured: true,
      createdAt: new Date('2026-01-07T00:00:00Z').toISOString(),
    },
    {
      id: 'prod_mc_500',
      name: 'Mastercard UHQ Prepaid $500',
      brand: 'Mastercard',
      category: 'UHQ',
      cardType: 'UHQ',
      value: 500,
      price: 465,
      region: 'Global',
      image: '/cards/mastercard-500.png',
      description: 'Mastercard UHQ prepaid voucher with $500 total purchasing capacity. Unrestricted cross-border purchases.',
      terms: 'Global region enabled. Secure delivery reference code provided on approval.',
      availability: 'in_stock',
      stockCount: 30,
      seller: 'CardVault Prime',
      rating: 4.9,
      ratingCount: 95,
      featured: false,
      createdAt: new Date('2026-01-08T00:00:00Z').toISOString(),
    },
    {
      id: 'prod_amex_200',
      name: 'American Express HQ $200',
      brand: 'American Express',
      category: 'HQ',
      cardType: 'HQ',
      value: 200,
      price: 188,
      region: 'US',
      image: '/cards/amex-200.png',
      description: 'American Express HQ card loaded with $200 USD. Suitable for airline bookings, luxury dining, and retail checkout.',
      terms: 'Valid at US merchants accepting American Express. No maintenance fees.',
      availability: 'in_stock',
      stockCount: 40,
      seller: 'CardVault Official',
      rating: 4.9,
      ratingCount: 140,
      featured: false,
      createdAt: new Date('2026-01-09T00:00:00Z').toISOString(),
    },
    {
      id: 'prod_visa_uhq_1000',
      name: 'Visa UHQ Elite $1000',
      brand: 'Visa',
      category: 'UHQ',
      cardType: 'UHQ',
      value: 1000,
      price: 920,
      region: 'Global',
      image: '/cards/visa-1000.png',
      description: 'Top-tier UHQ Ultra High Quality Visa Card loaded with $1000 USD balance. Instant priority activation and maximum spending limits.',
      terms: 'UHQ Priority allocation. Immediate dispatch of digital reference token upon payment confirmation.',
      availability: 'in_stock',
      stockCount: 15,
      seller: 'CardVault Prime',
      rating: 5.0,
      ratingCount: 88,
      featured: true,
      createdAt: new Date('2026-01-10T00:00:00Z').toISOString(),
    },
    {
      id: 'prod_gift_visa_25',
      name: 'Visa Standard $25',
      brand: 'Visa',
      category: 'Standard',
      cardType: 'Standard',
      value: 25,
      price: 24,
      region: 'Global',
      image: '/cards/visa-25.png',
      description: 'Standard balance Visa card for everyday gaming, in-app purchases, and micro-subscriptions.',
      terms: 'Digital voucher reference code. Instant fulfillment.',
      availability: 'in_stock',
      stockCount: 200,
      seller: 'CardVault Official',
      rating: 4.7,
      ratingCount: 410,
      featured: false,
      createdAt: new Date('2026-01-10T00:00:00Z').toISOString(),
    },
    {
      id: 'prod_gift_mc_75',
      name: 'Mastercard Standard $75',
      brand: 'Mastercard',
      category: 'Standard',
      cardType: 'Standard',
      value: 75,
      price: 71,
      region: 'US',
      image: '/cards/mastercard-75.png',
      description: 'Mastercard card pre-loaded with $75. Great balance size for retail fashion, tech gear, and streaming services.',
      terms: 'Issued as authenticated voucher reference. Valid nationwide.',
      availability: 'in_stock',
      stockCount: 88,
      seller: 'CardVault Official',
      rating: 4.8,
      ratingCount: 155,
      featured: false,
      createdAt: new Date('2026-01-11T00:00:00Z').toISOString(),
    }
  ];

  const initialInventory: InventoryReference[] = [
    { id: 'inv_01', productId: 'prod_visa_100', productName: 'Visa Prepaid $100', tokenReference: 'CV-V100-REF-892401-US', isAssigned: true, orderId: 'ORD-98241', assignedAt: '2026-02-10T14:30:00Z', createdAt: '2026-01-01T00:00:00Z' },
    { id: 'inv_02', productId: 'prod_visa_100', productName: 'Visa Prepaid $100', tokenReference: 'CV-V100-REF-892402-US', isAssigned: false, createdAt: '2026-01-01T00:00:00Z' },
    { id: 'inv_03', productId: 'prod_visa_100', productName: 'Visa Prepaid $100', tokenReference: 'CV-V100-REF-892403-US', isAssigned: false, createdAt: '2026-01-01T00:00:00Z' },
    { id: 'inv_04', productId: 'prod_mc_250', productName: 'Mastercard Prepaid $250', tokenReference: 'CV-MC250-REF-712390-US', isAssigned: false, createdAt: '2026-01-01T00:00:00Z' },
    { id: 'inv_05', productId: 'prod_mc_250', productName: 'Mastercard Prepaid $250', tokenReference: 'CV-MC250-REF-712391-US', isAssigned: false, createdAt: '2026-01-01T00:00:00Z' },
    { id: 'inv_06', productId: 'prod_amex_50', productName: 'American Express Gift Card $50', tokenReference: 'CV-AM50-REF-349811-US', isAssigned: false, createdAt: '2026-01-01T00:00:00Z' },
    { id: 'inv_07', productId: 'prod_visa_500', productName: 'Visa Premium Prepaid $500', tokenReference: 'CV-V500-REF-190422-GL', isAssigned: false, createdAt: '2026-01-01T00:00:00Z' },
    { id: 'inv_08', productId: 'prod_amex_100', productName: 'American Express Gift Card $100', tokenReference: 'CV-AM100-REF-551982-US', isAssigned: false, createdAt: '2026-01-01T00:00:00Z' }
  ];

  const initialOrders: Order[] = [
    {
      id: 'ORD-98241',
      userId: 'usr_demo_02',
      userEmail: 'buyer@example.com',
      userName: 'Alex Reynolds',
      items: [
        {
          productId: 'prod_visa_100',
          name: 'Visa Prepaid $100',
          brand: 'Visa',
          cardType: 'Standard',
          value: 100,
          price: 95,
          quantity: 1,
          image: '/cards/visa-100.png',
          region: 'US'
        }
      ],
      totalUSD: 95,
      totalUSDT: 95,
      paymentMethod: 'USDT_TRC20',
      paymentAddress: DEFAULT_USDT_ADDRESS,
      paymentStatus: 'Completed',
      orderStatus: 'Completed',
      transactionHash: 'b4a8e5792c8172901cfba982410a83e0984cfb7218ea0294871908234cb012a9',
      txSubmittedAt: '2026-02-10T14:15:00Z',
      approvedAt: '2026-02-10T14:30:00Z',
      createdAt: '2026-02-10T14:00:00Z',
      updatedAt: '2026-02-10T14:30:00Z',
      deliveredCards: [
        {
          id: 'card_demo_01',
          cardName: 'Visa Prepaid $100',
          brand: 'Visa',
          cardNumber: '4532890123456789',
          expiryDate: '09/28',
          cvv: '638',
          cardHolder: 'Alex Reynolds',
          pin: '4419',
          balance: 100,
          notes: 'US Billing Zip: 90210'
        }
      ],
      deliveryNotes: 'Your Visa $100 prepaid card is activated and ready for use.',
      customerNotes: 'Please process fast'
    },
    {
      id: 'ORD-98284',
      userId: 'usr_demo_02',
      userEmail: 'buyer@example.com',
      userName: 'Alex Reynolds',
      items: [
        {
          productId: 'prod_mc_250',
          name: 'Mastercard Prepaid $250',
          brand: 'Mastercard',
          cardType: 'Premium',
          value: 250,
          price: 235,
          quantity: 1,
          image: '/cards/mastercard-250.png',
          region: 'US'
        }
      ],
      totalUSD: 235,
      totalUSDT: 235,
      paymentMethod: 'USDT_TRC20',
      paymentAddress: DEFAULT_USDT_ADDRESS,
      paymentStatus: 'Pending Verification',
      orderStatus: 'Processing',
      transactionHash: '8f0923cb910948ac0192834baf571029384bc19028374619028374619028374a',
      txSubmittedAt: '2026-02-12T18:40:00Z',
      createdAt: '2026-02-12T18:30:00Z',
      updatedAt: '2026-02-12T18:40:00Z',
      customerNotes: 'Sent 235 USDT via Tronlink wallet'
    }
  ];

  const initialSettings: SiteSettings = {
    storeName: 'CardVault',
    usdtTrc20Address: DEFAULT_USDT_ADDRESS,
    paymentInstructions: 'Send the exact USDT amount to the TRC20 wallet address below. Once your transaction is confirmed on the TRON network, copy the TXID (transaction hash) and paste it into the verification box to complete your order.',
    supportEmail: 'support@cardvault.io',
    telegramSupport: '@CardVaultSupport',
    exchangeRateUsdt: 1.0,
    minConfirmationBlocks: 1,
  };

  return {
    users: initialUsers,
    products: initialProducts,
    categories: initialCategories,
    orders: initialOrders,
    inventory: initialInventory,
    settings: initialSettings,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.products && parsed.settings) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading database, resetting to defaults:', err);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database to disk:', err);
    }
  }

  private save() {
    this.saveData(this.data);
  }

  // Users
  getUsers() {
    return this.data.users.map(({ passwordHash, ...user }) => user);
  }

  findUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string) {
    const u = this.data.users.find(u => u.id === id);
    if (!u) return null;
    const { passwordHash, ...safeUser } = u;
    return safeUser;
  }

  createUser(user: User & { passwordHash: string }) {
    this.data.users.push(user);
    this.save();
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  updateUserStatus(id: string, status: 'active' | 'disabled') {
    const user = this.data.users.find(u => u.id === id);
    if (user) {
      user.status = status;
      this.save();
      return true;
    }
    return false;
  }

  // Products
  getProducts(filters?: { category?: string; search?: string; brand?: string }) {
    let result = [...this.data.products];
    if (filters?.category && filters.category !== 'All') {
      const catLower = filters.category.toLowerCase();
      result = result.filter(p => 
        p.category.toLowerCase() === catLower ||
        p.brand.toLowerCase() === catLower ||
        p.cardType.toLowerCase() === catLower
      );
    }
    if (filters?.brand && filters.brand !== 'All') {
      result = result.filter(p => p.brand.toLowerCase() === filters.brand?.toLowerCase());
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return result;
  }

  getProductById(id: string) {
    return this.data.products.find(p => p.id === id) || null;
  }

  createProduct(product: Product) {
    this.data.products.unshift(product);
    this.save();
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>) {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.data.products[index] = { ...this.data.products[index], ...updates };
      this.save();
      return this.data.products[index];
    }
    return null;
  }

  deleteProduct(id: string) {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.save();
    return this.data.products.length < initialLen;
  }

  // Categories
  getCategories() {
    return this.data.categories;
  }

  createCategory(category: Category) {
    this.data.categories.push(category);
    this.save();
    return category;
  }

  deleteCategory(id: string) {
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.save();
    return true;
  }

  // Orders
  getOrders(filters?: { userId?: string; status?: string; search?: string }) {
    let result = [...this.data.orders];
    if (filters?.userId) {
      result = result.filter(o => o.userId === filters.userId);
    }
    if (filters?.status && filters.status !== 'All') {
      result = result.filter(o => o.paymentStatus === filters.status || o.orderStatus === filters.status);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(o => 
        o.id.toLowerCase().includes(q) ||
        o.userEmail.toLowerCase().includes(q) ||
        (o.transactionHash && o.transactionHash.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string) {
    return this.data.orders.find(o => o.id === id) || null;
  }

  createOrder(order: Order) {
    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  submitTransactionHash(orderId: string, txHash: string) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;
    order.transactionHash = txHash.trim();
    order.paymentStatus = 'Pending Verification';
    order.orderStatus = 'Processing';
    order.txSubmittedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  approveOrderPayment(orderId: string, options?: { deliveredCards?: any[]; deliveryNotes?: string }) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;
    
    order.paymentStatus = 'Paid';
    order.orderStatus = 'Completed';
    order.approvedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    
    if (options?.deliveryNotes) {
      order.deliveryNotes = options.deliveryNotes.trim();
    }

    if (options?.deliveredCards && Array.isArray(options.deliveredCards) && options.deliveredCards.length > 0) {
      order.deliveredCards = options.deliveredCards.map(c => ({
        id: c.id || 'card_' + Math.random().toString(36).substring(2, 9),
        cardName: c.cardName || '',
        brand: c.brand || 'Visa',
        cardNumber: (c.cardNumber || '').trim(),
        expiryDate: (c.expiryDate || '').trim(),
        cvv: (c.cvv || '').trim(),
        cardHolder: (c.cardHolder || '').trim(),
        pin: (c.pin || '').trim(),
        balance: typeof c.balance === 'number' ? c.balance : undefined,
        notes: (c.notes || '').trim()
      }));
    }

    // Assign inventory reference tokens for each item
    const deliveredTokens: string[] = [];
    order.items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        // Find unassigned token or generate secure voucher reference
        const availableInv = this.data.inventory.find(inv => inv.productId === item.productId && !inv.isAssigned);
        if (availableInv) {
          availableInv.isAssigned = true;
          availableInv.orderId = order.id;
          availableInv.assignedAt = new Date().toISOString();
          deliveredTokens.push(availableInv.tokenReference);
        } else {
          // Generate legitimate voucher token
          const token = `CV-${item.brand.substring(0, 2).toUpperCase()}${item.value}-REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${item.region}`;
          this.data.inventory.push({
            id: 'inv_' + Math.random().toString(36).substring(2, 9),
            productId: item.productId,
            productName: item.name,
            tokenReference: token,
            isAssigned: true,
            orderId: order.id,
            assignedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          });
          deliveredTokens.push(token);
        }
      }
    });

    order.deliveryTokens = deliveredTokens;
    this.save();
    return order;
  }

  rejectOrderPayment(orderId: string, reason: string) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;
    order.paymentStatus = 'Rejected';
    order.orderStatus = 'Cancelled';
    order.rejectedAt = new Date().toISOString();
    order.rejectionReason = reason;
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  updateOrderStatus(orderId: string, status: { paymentStatus?: any; orderStatus?: any }) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;
    if (status.paymentStatus) order.paymentStatus = status.paymentStatus;
    if (status.orderStatus) order.orderStatus = status.orderStatus;
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  // Inventory
  getInventory() {
    return this.data.inventory;
  }

  addInventoryTokens(tokens: { productId: string; productName: string; tokenReference: string }[]) {
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

  // Settings
  getSettings() {
    return this.data.settings;
  }

  updateSettings(updates: Partial<SiteSettings>) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  // Admin stats
  getAdminStats() {
    const totalOrders = this.data.orders.length;
    const completedOrders = this.data.orders.filter(o => o.orderStatus === 'Completed' || o.paymentStatus === 'Paid' || o.paymentStatus === 'Completed').length;
    const pendingPayments = this.data.orders.filter(o => o.paymentStatus === 'Pending Verification' || o.paymentStatus === 'Payment Submitted').length;
    const totalRevenue = this.data.orders
      .filter(o => o.paymentStatus === 'Paid' || o.paymentStatus === 'Completed')
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

export const db = new Database();
