import { Product, Order, User, SiteSettings, Category, AdminStats, DeliveredCardInfo } from './types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('cardvault_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Public
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async getProducts(params?: { category?: string; search?: string; brand?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.brand && params.brand !== 'All') query.set('brand', params.brand);
    
    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  },

  async getPaymentQR(address: string, amount?: number): Promise<{ qrDataUrl: string; address: string }> {
    const query = new URLSearchParams({ address });
    if (amount) query.set('amount', amount.toString());
    const res = await fetch(`${API_BASE}/payment/qr?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to generate payment QR');
    return res.json();
  },

  // Auth
  async signup(data: { fullName: string; email: string; password: string; confirmPassword?: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Signup failed');
    return result;
  },

  async login(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Login failed');
    return result;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Session expired');
    return result;
  },

  // Orders
  async createOrder(data: {
    items: { productId: string; quantity: number }[];
    customerEmail?: string;
    customerName?: string;
    customerNotes?: string;
  }): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create order');
    return result;
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrder(orderId: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      headers: getAuthHeader(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch order');
    return result;
  },

  async submitTransactionHash(orderId: string, txHash: string): Promise<{ message: string; order: Order }> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/submit-txid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txHash }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to submit transaction hash');
    return result;
  },

  // Admin APIs
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeader(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Admin stats error');
    return result;
  },

  async getAdminOrders(params?: { status?: string; search?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const res = await fetch(`${API_BASE}/admin/orders?${query.toString()}`, {
      headers: getAuthHeader(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch admin orders');
    return result;
  },

  async approveOrderPayment(
    orderId: string,
    data?: { deliveredCards?: DeliveredCardInfo[]; deliveryNotes?: string }
  ): Promise<{ message: string; order: Order }> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/approve-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data || {}),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to approve payment');
    return result;
  },

  async rejectOrderPayment(orderId: string, reason: string): Promise<{ message: string; order: Order }> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/reject-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ reason }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to reject payment');
    return result;
  },

  async updateOrderStatus(orderId: string, status: { paymentStatus?: string; orderStatus?: string }): Promise<Order> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(status),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update order status');
    return result;
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(product),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create product');
    return result;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(product),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update product');
    return result;
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete product');
    return result;
  },

  async getAdminInventory(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/inventory`, {
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async addInventoryTokens(productId: string, tokens: string[]): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/inventory/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ productId, tokens }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to add inventory tokens');
    return result;
  },

  async getAdminUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async updateUserStatus(userId: string, status: 'active' | 'disabled'): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async getAdminSettings(): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async updateAdminSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(settings),
    });
    return res.json();
  }
};
