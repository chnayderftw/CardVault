import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  CardProduct,
  Order,
  Deposit,
  SupportTicket,
  Announcement,
  AuditLog,
  SiteSettings
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'marketplace.json');

interface DatabaseData {
  users: Array<User & { passwordHash: string }>;
  products: CardProduct[];
  orders: Order[];
  deposits: Deposit[];
  tickets: SupportTicket[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  settings: SiteSettings;
}

const DEFAULT_SETTINGS: SiteSettings = {
  trc20WalletAddress: process.env.TRC20_WALLET_ADDRESS || 'TG1LiM1h3iLf654gAx1msadrDf65q2AbAC',
  usdtExchangeRate: 1.0,
  minDeposit: 10.0,
  siteNotice: '',
};

const INITIAL_PRODUCTS: CardProduct[] = [
  {
    id: 'prod-001',
    brand: 'Visa',
    name: 'Visa Business Virtual Prepaid',
    bin: '411111',
    issuer: 'Bancorp Bank, N.A.',
    cardType: 'Virtual',
    level: 'UHQ',
    country: 'United States',
    currency: 'USD',
    region: 'North America',
    expirationPolicy: 'Valid 24 Months',
    features: ['Instant Portal Issuance', '3D Secure v2', 'Global USD Merchant Acceptance', 'Expense Reporting'],
    price: 520.0,
    stock: 45,
    isPremium: true,
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    deliveryMethod: 'Instant Encrypted Portal Code',
    terms: 'Legally issued prepaid product. Subject to Bancorp Bank user terms. Non-transferable once activated.',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-002',
    brand: 'Mastercard',
    name: 'Mastercard Executive Virtual',
    bin: '512345',
    issuer: 'MetaBank, N.A.',
    cardType: 'Virtual',
    level: 'HQ',
    country: 'United States',
    currency: 'USD',
    region: 'North America',
    expirationPolicy: 'Valid 18 Months',
    features: ['Instant Activation', 'Multi-currency Settlement', 'Online E-Commerce Ready'],
    price: 260.0,
    stock: 80,
    isPremium: true,
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80',
    deliveryMethod: 'Instant Encrypted Portal Code',
    terms: 'Legally issued virtual card. Redeemable at all worldwide Mastercard accepting merchants.',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-003',
    brand: 'Visa',
    name: 'Visa Everyday Prepaid Card',
    bin: '485210',
    issuer: 'Sutton Bank',
    cardType: 'Prepaid',
    level: 'Standard',
    country: 'United States',
    currency: 'USD',
    region: 'North America',
    expirationPolicy: 'Valid 12 Months',
    features: ['Standard Online Checkout', 'ATM Cash-Out Option', 'Zero Liability Protection'],
    price: 105.0,
    stock: 120,
    isPremium: false,
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=600&q=80',
    deliveryMethod: 'Digital Claim Key & Activation Guide',
    terms: 'Legally issued prepaid card by Sutton Bank. Valid for domestic & international transactions.',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-004',
    brand: 'Apple',
    name: 'Apple Corporate Digital Gift Card',
    bin: 'N/A',
    issuer: 'Apple Inc.',
    cardType: 'Gift',
    level: 'Standard',
    country: 'United States',
    currency: 'USD',
    region: 'North America',
    expirationPolicy: 'No Expiration',
    features: ['Instant Digital Code', 'Never Expires', 'Valid for Apple Store & App Store'],
    price: 198.0,
    stock: 50,
    isPremium: false,
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
    deliveryMethod: 'Instant Claim Code',
    terms: 'Legally issued Apple e-Gift card. Redeemable directly on Apple Store.',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-005',
    brand: 'American Express',
    name: 'AMEX Platinum Virtual Business',
    bin: '371234',
    issuer: 'American Express National Bank',
    cardType: 'Virtual',
    level: 'UHQ',
    country: 'United States',
    currency: 'USD',
    region: 'North America',
    expirationPolicy: 'Valid 36 Months',
    features: ['Concierge Services', 'Enterprise Spend Control', '3D Secure SafeKey Enabled'],
    price: 1035.0,
    stock: 20,
    isPremium: true,
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=600&q=80',
    deliveryMethod: 'Encrypted Digital Key & Certificate',
    terms: 'Legally issued AMEX corporate virtual payment card for business procurement.',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-006',
    brand: 'Visa',
    name: 'Visa Europe SEPA Virtual',
    bin: '428800',
    issuer: 'Solarisbank AG',
    cardType: 'Virtual',
    level: 'HQ',
    country: 'European Union',
    currency: 'EUR',
    region: 'Europe',
    expirationPolicy: 'Valid 12 Months',
    features: ['SEPA Instant Top-up', 'EUR Currency Native', '3DS2 Verified by Visa'],
    price: 258.0,
    stock: 65,
    isPremium: false,
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=600&q=80',
    deliveryMethod: 'Instant Digital Key',
    terms: 'Legally issued in EU by Solarisbank AG under Visa license.',
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-101',
    title: 'Welcome to the Dark-Mode Enterprise Card Portal',
    content: 'We are pleased to launch our upgraded trading terminal layout with instant TRC20 settlement, real-time balance tracking, and corporate card inventory.',
    category: 'Announcement',
    isImportant: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'ann-102',
    title: 'New AMEX Platinum & Visa Corporate Inventory Added',
    content: 'High-tier virtual cards from Bancorp Bank and American Express are now available in the Premium Cards tab with 3DS2 protection.',
    category: 'New Product',
    isImportant: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

class StorageEngine {
  private memoryData: DatabaseData = {
    users: [],
    products: [],
    orders: [],
    deposits: [],
    tickets: [],
    announcements: [],
    auditLogs: [],
    settings: DEFAULT_SETTINGS
  };

  constructor() {
    this.init();
  }

  private async init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.memoryData = JSON.parse(raw);
        await this.ensureAdminAccount();
      } else {
        await this.seedInitialData();
      }
    } catch (err) {
      console.error('Failed to load database, resetting cache:', err);
      await this.seedInitialData();
    }
  }

  private async ensureAdminAccount() {
    const adminEmail = 'admin.CC.adminv@gmail.com';
    const adminPassword = 'adminCC.adminV';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const existingAdmin = this.memoryData.users.find(u => u.email.toLowerCase() === adminEmail.toLowerCase());
    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.mustChangePassword = false;
    } else {
      this.memoryData.users.unshift({
        id: 'usr-admin-01',
        fullName: 'System Administrator',
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: 'admin',
        balance: 10000.0,
        mustChangePassword: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    if (!this.memoryData.settings) {
      this.memoryData.settings = { ...DEFAULT_SETTINGS };
    } else {
      this.memoryData.settings.trc20WalletAddress = 'TG1LiM1h3iLf654gAx1msadrDf65q2AbAC';
    }

    // Ensure Amazon is removed from brands/products
    if (this.memoryData.products) {
      this.memoryData.products = this.memoryData.products.filter(
        p => p.brand.toLowerCase() !== 'amazon' && !p.name.toLowerCase().includes('amazon')
      );
    }

    this.saveSync();
  }

  private async seedInitialData() {
    const adminEmail = 'admin.CC.adminv@gmail.com';
    const adminPassword = 'adminCC.adminV';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const initialAdmin: User & { passwordHash: string } = {
      id: 'usr-admin-01',
      fullName: 'System Administrator',
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: 'admin',
      balance: 10000.0,
      mustChangePassword: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Also seed a demo user for testing
    const demoPasswordHash = await bcrypt.hash('DemoUser123!', 10);
    const demoUser: User & { passwordHash: string } = {
      id: 'usr-demo-01',
      fullName: 'Enterprise Client',
      email: 'client@enterprise.com',
      passwordHash: demoPasswordHash,
      role: 'user',
      balance: 1250.0,
      mustChangePassword: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.memoryData = {
      users: [initialAdmin, demoUser],
      products: INITIAL_PRODUCTS,
      orders: [
        {
          id: 'ORD-109283',
          userId: demoUser.id,
          userEmail: demoUser.email,
          productId: 'prod-001',
          productName: 'Visa Business Virtual Prepaid',
          productBrand: 'Visa',
          productType: 'Virtual',
          cardValue: 500.0,
          amount: 520.0,
          quantity: 1,
          paymentStatus: 'paid',
          deliveryStatus: 'delivered',
          txHash: '7f91a2e38c4b501d2938a4c1209e8f7a6b5c4d3e2f109283746554321a987b6c',
          fulfillmentData: {
            claimCode: 'CLAIM-VBP-9982-3819-2026',
            instructions: 'Access portal claim key and redeem card balance directly with Bancorp Bank Virtual portal.'
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      deposits: [
        {
          id: 'DEP-883019',
          userId: demoUser.id,
          userEmail: demoUser.email,
          amount: 1500.0,
          network: 'TRC20',
          walletAddress: DEFAULT_SETTINGS.trc20WalletAddress,
          txHash: '3a12b34c56d78e90f123456789abcdef0123456789abcdef0123456789abcdef',
          status: 'approved',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString()
        }
      ],
      tickets: [
        {
          id: 'TCK-4001',
          userId: demoUser.id,
          userName: demoUser.fullName,
          userEmail: demoUser.email,
          subject: 'Corporate API & Bulk Card Order Inquiry',
          status: 'open',
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          messages: [
            {
              id: 'msg-01',
              senderId: demoUser.id,
              senderName: demoUser.fullName,
              senderRole: 'user',
              content: 'Hello Support, we are interested in placing a bulk order for 20 Visa Business Virtual cards next week. Is there volume discount available?',
              timestamp: new Date(Date.now() - 43200000).toISOString()
            },
            {
              id: 'msg-02',
              senderId: initialAdmin.id,
              senderName: initialAdmin.fullName,
              senderRole: 'admin',
              content: 'Hello! Yes, bulk corporate purchases above $10,000 receive a 2.5% discount on issuance fees. Please submit a deposit via TRC20 and notify us.',
              timestamp: new Date(Date.now() - 3600000).toISOString()
            }
          ]
        }
      ],
      announcements: INITIAL_ANNOUNCEMENTS,
      auditLogs: [
        {
          id: 'log-01',
          adminEmail: initialAdmin.email,
          action: 'SYSTEM_INITIALIZATION',
          details: 'Initial secure administrator account seeded.',
          timestamp: new Date().toISOString()
        }
      ],
      settings: DEFAULT_SETTINGS
    };

    this.saveSync();
  }

  private saveSync() {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.memoryData, null, 2));
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to save marketplace data atomically:', err);
    }
  }

  // Users
  public getUsers(): Array<User & { passwordHash: string }> {
    return this.memoryData.users;
  }

  public findUserByEmail(email: string): (User & { passwordHash: string }) | undefined {
    return this.memoryData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): (User & { passwordHash: string }) | undefined {
    return this.memoryData.users.find(u => u.id === id);
  }

  public createUser(user: User & { passwordHash: string }) {
    this.memoryData.users.push(user);
    this.saveSync();
  }

  public updateUser(id: string, updates: Partial<User & { passwordHash: string }>) {
    const idx = this.memoryData.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.memoryData.users[idx] = { ...this.memoryData.users[idx], ...updates, updatedAt: new Date().toISOString() };
      this.saveSync();
      return this.memoryData.users[idx];
    }
    return null;
  }

  // Products
  public getProducts(): CardProduct[] {
    return this.memoryData.products;
  }

  public findProductById(id: string): CardProduct | undefined {
    return this.memoryData.products.find(p => p.id === id);
  }

  public createProduct(product: CardProduct) {
    this.memoryData.products.unshift(product);
    this.saveSync();
    return product;
  }

  public updateProduct(id: string, updates: Partial<CardProduct>) {
    const idx = this.memoryData.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.memoryData.products[idx] = { ...this.memoryData.products[idx], ...updates };
      this.saveSync();
      return this.memoryData.products[idx];
    }
    return null;
  }

  public deleteProduct(id: string) {
    this.memoryData.products = this.memoryData.products.filter(p => p.id !== id);
    this.saveSync();
  }

  // Orders
  public getOrders(): Order[] {
    return this.memoryData.orders;
  }

  public getOrdersByUserId(userId: string): Order[] {
    return this.memoryData.orders.filter(o => o.userId === userId);
  }

  public findOrderById(id: string): Order | undefined {
    return this.memoryData.orders.find(o => o.id === id);
  }

  public createOrder(order: Order) {
    this.memoryData.orders.unshift(order);
    this.saveSync();
    return order;
  }

  public updateOrder(id: string, updates: Partial<Order>) {
    const idx = this.memoryData.orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      this.memoryData.orders[idx] = { ...this.memoryData.orders[idx], ...updates, updatedAt: new Date().toISOString() };
      this.saveSync();
      return this.memoryData.orders[idx];
    }
    return null;
  }

  // Deposits
  public getDeposits(): Deposit[] {
    return this.memoryData.deposits;
  }

  public getDepositsByUserId(userId: string): Deposit[] {
    return this.memoryData.deposits.filter(d => d.userId === userId);
  }

  public findDepositById(id: string): Deposit | undefined {
    return this.memoryData.deposits.find(d => d.id === id);
  }

  public createDeposit(deposit: Deposit) {
    this.memoryData.deposits.unshift(deposit);
    this.saveSync();
    return deposit;
  }

  public updateDeposit(id: string, updates: Partial<Deposit>) {
    const idx = this.memoryData.deposits.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.memoryData.deposits[idx] = { ...this.memoryData.deposits[idx], ...updates, updatedAt: new Date().toISOString() };
      this.saveSync();
      return this.memoryData.deposits[idx];
    }
    return null;
  }

  // Tickets
  public getTickets(): SupportTicket[] {
    return this.memoryData.tickets;
  }

  public getTicketsByUserId(userId: string): SupportTicket[] {
    return this.memoryData.tickets.filter(t => t.userId === userId);
  }

  public findTicketById(id: string): SupportTicket | undefined {
    return this.memoryData.tickets.find(t => t.id === id);
  }

  public createTicket(ticket: SupportTicket) {
    this.memoryData.tickets.unshift(ticket);
    this.saveSync();
    return ticket;
  }

  public addMessageToTicket(ticketId: string, message: SupportTicket['messages'][0]) {
    const ticket = this.findTicketById(ticketId);
    if (ticket) {
      ticket.messages.push(message);
      ticket.updatedAt = new Date().toISOString();
      this.saveSync();
      return ticket;
    }
    return null;
  }

  // Announcements
  public getAnnouncements(): Announcement[] {
    return this.memoryData.announcements;
  }

  public createAnnouncement(ann: Announcement) {
    this.memoryData.announcements.unshift(ann);
    this.saveSync();
    return ann;
  }

  public deleteAnnouncement(id: string) {
    this.memoryData.announcements = this.memoryData.announcements.filter(a => a.id !== id);
    this.saveSync();
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.memoryData.auditLogs;
  }

  public addAuditLog(log: AuditLog) {
    this.memoryData.auditLogs.unshift(log);
    this.saveSync();
  }

  // Settings
  public getSettings(): SiteSettings {
    return this.memoryData.settings;
  }

  public updateSettings(settings: Partial<SiteSettings>) {
    this.memoryData.settings = { ...this.memoryData.settings, ...settings };
    this.saveSync();
    return this.memoryData.settings;
  }
}

export const db = new StorageEngine();
