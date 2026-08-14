export type CardBrand = 'Visa' | 'Mastercard' | 'American Express' | 'Other';
export type CardType = 'Standard' | 'HQ' | 'UHQ' | 'Premium' | 'Virtual' | 'Physical';
export type ProductCategory = 'All' | 'Standard' | 'HQ' | 'UHQ' | 'Visa' | 'Mastercard' | 'American Express';
export type CardAvailability = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  name: string;
  brand: CardBrand;
  category: string; // 'Visa' | 'Mastercard' | 'American Express' | 'Standard' | 'HQ' | 'UHQ'
  cardType: CardType;
  value: number; // Face value in USD, e.g. 100
  price: number; // Selling price in USD, e.g. 95
  region: string; // e.g. 'US', 'Global', 'EU', 'UK'
  image: string; // Image URL or SVG identifier
  description: string;
  terms: string;
  availability: CardAvailability;
  stockCount: number;
  seller: string;
  rating: number;
  ratingCount: number;
  featured?: boolean;
  createdAt: string;
}

export type PaymentStatus = 
  | 'Awaiting Payment' 
  | 'Payment Submitted' 
  | 'Pending Verification' 
  | 'Paid' 
  | 'Processing' 
  | 'Completed' 
  | 'Cancelled' 
  | 'Rejected';

export type OrderStatus = 
  | 'Pending' 
  | 'Processing' 
  | 'Completed' 
  | 'Cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  brand: CardBrand;
  cardType: string;
  value: number;
  price: number;
  quantity: number;
  image: string;
  region: string;
}

export interface InventoryReference {
  id: string;
  productId: string;
  productName: string;
  tokenReference: string; // Secure token ID, e.g., 'CV-REF-V100-9842A1' (Never contains sensitive PAN/CVV)
  isAssigned: boolean;
  orderId?: string;
  assignedAt?: string;
  createdAt: string;
}

export interface DeliveredCardInfo {
  id?: string;
  cardName?: string;
  brand?: CardBrand;
  cardNumber: string; // 16 digits or card number
  expiryDate: string; // MM/YY or MM/YYYY
  cvv: string; // 3-4 digit CVV/CVC
  cardHolder?: string; // Cardholder Name
  pin?: string; // Optional PIN
  balance?: number; // Balance on card
  notes?: string; // Extra instructions, billing zip, activation guide
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  totalUSD: number;
  totalUSDT: number;
  paymentMethod: 'USDT_TRC20';
  paymentAddress: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  transactionHash?: string;
  txSubmittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  deliveryTokens?: string[]; // Delivered fulfillment reference codes
  deliveredCards?: DeliveredCardInfo[]; // Full card information inputted by admin upon approval
  deliveryNotes?: string; // Overall fulfillment notes from admin
  customerNotes?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  createdAt: string;
  status: 'active' | 'disabled';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
}

export interface SiteSettings {
  storeName: string;
  usdtTrc20Address: string;
  paymentInstructions: string;
  supportEmail: string;
  telegramSupport: string;
  exchangeRateUsdt: number; // 1 USD = 1 USDT default
  minConfirmationBlocks: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingPayments: number;
  activeProducts: number;
  totalUsers: number;
  completedOrders: number;
}

export interface Payment {
  id: string;
  orderId: string;
  userId?: string;
  amount: number;
  currency: string;
  network: string;
  paymentAddress: string;
  transactionHash?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'expired';
  createdAt: string;
  updatedAt: string;
}
