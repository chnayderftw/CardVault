import {
  User,
  CardProduct,
  Order,
  Deposit,
  SupportTicket,
  Announcement,
  AuditLog,
  SiteSettings
} from '../types';

const TOKEN_KEY = 'enterprise_card_jwt_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => request<{ token: string; user: User }>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<User>('/api/auth/me'),
  changePassword: (body: any) => request<{ message: string }>('/api/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),

  // Public Settings & Products
  getSettings: () => request<SiteSettings>('/api/settings'),
  getProducts: () => request<CardProduct[]>('/api/products'),
  getProductById: (id: string) => request<CardProduct>(`/api/products/${id}`),
  getAnnouncements: () => request<Announcement[]>('/api/announcements'),

  // Orders
  getOrders: () => request<Order[]>('/api/orders'),
  getOrderById: (id: string) => request<Order>(`/api/orders/${id}`),
  createOrder: (body: { productId: string; quantity: number; paymentMethod: 'balance' | 'usdt'; txHash?: string }) =>
    request<Order>('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  submitOrderTrc20Tx: (orderId: string, txHash: string) =>
    request<{ message: string; order: Order }>(`/api/orders/${orderId}/pay-trc20`, { method: 'POST', body: JSON.stringify({ txHash }) }),

  // Deposits
  getDeposits: () => request<Deposit[]>('/api/deposits'),
  createDeposit: (amount: number, txHash: string) =>
    request<Deposit>('/api/deposits', { method: 'POST', body: JSON.stringify({ amount, txHash }) }),

  // Support Tickets
  getTickets: () => request<SupportTicket[]>('/api/support/tickets'),
  createTicket: (subject: string, message: string) =>
    request<SupportTicket>('/api/support/tickets', { method: 'POST', body: JSON.stringify({ subject, message }) }),
  sendMessageToTicket: (ticketId: string, content: string) =>
    request<SupportTicket>(`/api/support/tickets/${ticketId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),

  // Admin API
  adminGetUsers: () => request<User[]>('/api/admin/users'),
  adminAdjustBalance: (userId: string, balance: number) =>
    request<User>(`/api/admin/users/${userId}/balance`, { method: 'POST', body: JSON.stringify({ balance }) }),
  adminVerifyOrderPayment: (
    orderId: string,
    status: 'paid' | 'failed',
    fulfillmentData?: {
      cardNumber?: string;
      expDate?: string;
      cvv?: string;
      instructions?: string;
    }
  ) =>
    request<Order>(`/api/admin/orders/${orderId}/verify-payment`, {
      method: 'POST',
      body: JSON.stringify({ status, fulfillmentData })
    }),
  adminVerifyDeposit: (depositId: string, status: 'approved' | 'rejected') =>
    request<Deposit>(`/api/admin/deposits/${depositId}/verify`, { method: 'POST', body: JSON.stringify({ status }) }),
  adminGetProducts: () => request<CardProduct[]>('/api/admin/products'),
  adminCreateProduct: (body: any) => request<CardProduct>('/api/admin/products', { method: 'POST', body: JSON.stringify(body) }),
  adminUpdateProduct: (id: string, body: any) => request<CardProduct>(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDeleteProduct: (id: string) => request<{ message: string }>(`/api/admin/products/${id}`, { method: 'DELETE' }),
  adminCreateAnnouncement: (body: any) => request<Announcement>('/api/admin/announcements', { method: 'POST', body: JSON.stringify(body) }),
  adminDeleteAnnouncement: (id: string) => request<{ message: string }>(`/api/admin/announcements/${id}`, { method: 'DELETE' }),
  adminUpdateSettings: (body: Partial<SiteSettings>) => request<SiteSettings>('/api/admin/settings', { method: 'PUT', body: JSON.stringify(body) }),
  adminGetAuditLogs: () => request<AuditLog[]>('/api/admin/audit-logs'),
  adminGetStats: () => request<{
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalPaidOrders: number;
    totalVolumeUSD: number;
    pendingOrdersCount: number;
    pendingDepositsCount: number;
  }>('/api/admin/stats'),
};
