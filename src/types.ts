export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  balance: number;
  mustChangePassword?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CardType = 'Prepaid' | 'Virtual' | 'Gift' | 'Debit';
export type CardLevel = 'Standard' | 'HQ' | 'UHQ';

export interface CardProduct {
  id: string;
  brand: string; // e.g. Visa, Mastercard, Amazon
  name: string;
  bin: string; // 6-digit BIN e.g. 411111
  issuer: string; // e.g. Bancorp Bank
  cardType: CardType;
  level: CardLevel;
  country: string;
  currency: string;
  region: string;
  expirationPolicy: string;
  features: string[];
  price: number; // Purchase price
  stock: number;
  isPremium: boolean;
  isFeatured: boolean;
  imageUrl: string;
  deliveryMethod: string;
  terms: string;
  status: 'active' | 'disabled';
  createdAt: string;
  description?: string;
}

export type PaymentStatus = 'pending' | 'verifying' | 'paid' | 'failed' | 'cancelled';
export type DeliveryStatus = 'pending' | 'delivered' | 'failed';

export interface FulfillmentData {
  cardNumber?: string;
  expDate?: string;
  cvv?: string;
  claimCode?: string;
  serialNumber?: string;
  instructions?: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  productId: string;
  productName: string;
  productBrand: string;
  productType: string;
  cardValue?: number;
  amount: number;
  quantity: number;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  txHash?: string;
  fulfillmentData?: FulfillmentData;
  createdAt: string;
  updatedAt: string;
}

export type DepositStatus = 'pending' | 'approved' | 'rejected';

export interface Deposit {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  network: 'TRC20';
  walletAddress: string;
  txHash: string;
  status: DepositStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  status: 'open' | 'closed' | 'pending_admin';
  updatedAt: string;
  createdAt: string;
  messages: SupportMessage[];
}

export type Ticket = SupportTicket;

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Announcement' | 'Maintenance' | 'New Product' | 'Promotion' | 'Update';
  isImportant: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SiteSettings {
  trc20WalletAddress: string;
  usdtExchangeRate: number;
  minDeposit: number;
  siteNotice: string;
}

export interface FilterState {
  bin: string;
  brand: string;
  cardType: string;
  level: string;
  issuer: string;
  country: string;
  currency: string;
  region: string;
  availability: 'all' | 'in_stock' | 'out_of_stock';
  category: 'all' | 'uhq' | 'hq' | 'standard' | 'virtual' | 'gift' | 'regional' | 'featured';
  search: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
