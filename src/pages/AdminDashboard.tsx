import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Order, Product, User, Category, SiteSettings, AdminStats, DeliveredCardInfo } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  LayoutDashboard,
  Package,
  CreditCard,
  Layers,
  Users,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  RefreshCw,
  Search,
  Check,
  AlertTriangle,
  Lock,
  Wallet,
  Sparkles,
  Copy,
  Info,
} from 'lucide-react';

type AdminTab = 'overview' | 'orders' | 'products' | 'inventory' | 'users' | 'settings';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  
  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [orderFilter, setOrderFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');

  // Modals & form states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: 'Visa' as const,
    category: 'Visa',
    cardType: 'Standard' as const,
    value: 100,
    price: 95,
    region: 'US',
    image: '/cards/visa-100.png',
    description: '',
    terms: 'Non-reloadable prepaid card. Valid for 24 months from issuance.',
    availability: 'in_stock' as const,
    stockCount: 50,
    seller: 'CardVault Official',
    rating: 4.9,
    ratingCount: 15,
  });

  // Batch inventory modal
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [selectedProductForInventory, setSelectedProductForInventory] = useState('');
  const [batchTokensText, setBatchTokensText] = useState('');

  // Rejection modal
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Transaction hash could not be verified on the TRON TRC20 network.');

  // Approval & Card Typing Modal
  const [approvingOrder, setApprovingOrder] = useState<Order | null>(null);
  const [approvalCards, setApprovalCards] = useState<DeliveredCardInfo[]>([]);
  const [approvalDeliveryNotes, setApprovalDeliveryNotes] = useState('');
  const [quickPasteInput, setQuickPasteInput] = useState('');
  const [approvingLoading, setApprovingLoading] = useState(false);

  const openApprovalModal = (order: Order) => {
    // Generate initial card slots matching the items in the order
    const initialCards: DeliveredCardInfo[] = [];
    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        initialCards.push({
          id: 'card_' + Math.random().toString(36).substring(2, 9),
          cardName: item.name,
          brand: item.brand,
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardHolder: order.userName || 'VALUED CLIENT',
          pin: '',
          balance: item.value,
          notes: `${item.cardType || 'Standard'} card (${item.region})`,
        });
      }
    });

    if (initialCards.length === 0) {
      initialCards.push({
        id: 'card_' + Math.random().toString(36).substring(2, 9),
        cardName: 'Card',
        brand: 'Visa',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolder: order.userName || 'VALUED CLIENT',
        pin: '',
        balance: 100,
        notes: '',
      });
    }

    setApprovingOrder(order);
    setApprovalCards(initialCards);
    setApprovalDeliveryNotes('Your card information is active and ready for use. Thank you for your business with CardVault!');
    setQuickPasteInput('');
  };

  const handleCardFieldChange = (index: number, field: keyof DeliveredCardInfo, value: any) => {
    setApprovalCards(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddCardSlot = () => {
    setApprovalCards(prev => [
      ...prev,
      {
        id: 'card_' + Math.random().toString(36).substring(2, 9),
        cardName: 'Additional Card',
        brand: 'Visa',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolder: approvingOrder?.userName || 'VALUED CLIENT',
        pin: '',
        balance: 100,
        notes: '',
      }
    ]);
  };

  const handleRemoveCardSlot = (index: number) => {
    if (approvalCards.length <= 1) return;
    setApprovalCards(prev => prev.filter((_, idx) => idx !== index));
  };

  // Quick Paste multi-card parser
  // Supports: "4111111111111111|12/28|123|JOHN DOE" or "4111111111111111 12/28 123"
  const handleApplyQuickPaste = () => {
    if (!quickPasteInput.trim()) return;
    const lines = quickPasteInput
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) return;

    setApprovalCards(prev => {
      const updated = [...prev];
      lines.forEach((line, idx) => {
        // Delimiters can be |, :, or whitespace
        const parts = line.split(/[|;:]/).map(p => p.trim());
        const rawNumber = parts[0] || '';
        const rawExp = parts[1] || '';
        const rawCvv = parts[2] || '';
        const rawHolder = parts[3] || (approvingOrder?.userName || 'VALUED CLIENT');
        const rawPin = parts[4] || '';

        const cardData: DeliveredCardInfo = {
          id: 'card_' + Math.random().toString(36).substring(2, 9),
          cardName: (updated[idx]?.cardName) || `Card #${idx + 1}`,
          brand: rawNumber.startsWith('4') ? 'Visa' : rawNumber.startsWith('5') ? 'Mastercard' : rawNumber.startsWith('3') ? 'American Express' : (updated[idx]?.brand || 'Visa'),
          cardNumber: rawNumber,
          expiryDate: rawExp,
          cvv: rawCvv,
          cardHolder: rawHolder,
          pin: rawPin,
          balance: updated[idx]?.balance || 100,
          notes: updated[idx]?.notes || '',
        };

        if (idx < updated.length) {
          updated[idx] = { ...updated[idx], ...cardData };
        } else {
          updated.push(cardData);
        }
      });
      return updated;
    });

    showFeedback(`Parsed and applied ${lines.length} card detail line(s)!`);
    setQuickPasteInput('');
  };

  const handleSubmitApproveWithCards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingOrder) return;

    // Validate that at least one card has details entered
    const hasEmptyCards = approvalCards.some(c => !c.cardNumber.trim() || !c.cvv.trim() || !c.expiryDate.trim());
    if (hasEmptyCards) {
      if (!window.confirm('Some card fields (card number, expiry, or CVV) are empty. Do you still wish to proceed with approval?')) {
        return;
      }
    }

    try {
      setApprovingLoading(true);
      const res = await api.approveOrderPayment(approvingOrder.id, {
        deliveredCards: approvalCards,
        deliveryNotes: approvalDeliveryNotes,
      });

      showFeedback(`Order ${approvingOrder.id} successfully approved and ${approvalCards.length} card(s) delivered to ${approvingOrder.userEmail}!`);
      setApprovingOrder(null);
      loadAllAdminData();
    } catch (err: any) {
      showFeedback(err.message || 'Failed to approve order', 'error');
    } finally {
      setApprovingLoading(false);
    }
  };

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, productsData, invData, usersData, settingsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOrders(),
        api.getProducts(),
        api.getAdminInventory(),
        api.getAdminUsers(),
        api.getAdminSettings(),
      ]);

      setStats(statsData);
      setOrders(ordersData);
      setProducts(productsData);
      setInventory(invData);
      setUsers(usersData);
      setSettings(settingsData);
    } catch (err: any) {
      console.error('Failed to load admin dashboard data:', err);
      setActionMessage({ text: err.message || 'Failed to load admin data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Payment approval handler
  const handleApprovePayment = async (orderId: string) => {
    try {
      const res = await api.approveOrderPayment(orderId);
      showFeedback(`Order ${orderId} verified & approved! Fulfillment reference code assigned.`);
      loadAllAdminData();
    } catch (err: any) {
      showFeedback(err.message || 'Failed to approve payment', 'error');
    }
  };

  // Payment reject handler
  const handleRejectPayment = async () => {
    if (!rejectOrderId) return;
    try {
      await api.rejectOrderPayment(rejectOrderId, rejectReason);
      showFeedback(`Order ${rejectOrderId} rejected.`);
      setRejectOrderId(null);
      loadAllAdminData();
    } catch (err: any) {
      showFeedback(err.message || 'Failed to reject payment', 'error');
    }
  };

  // Product submit handler (Create or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productForm);
        showFeedback(`Product ${productForm.name} updated successfully!`);
      } else {
        await api.createProduct(productForm);
        showFeedback(`New product ${productForm.name} added to catalog!`);
      }
      setShowAddProductModal(false);
      setEditingProduct(null);
      loadAllAdminData();
    } catch (err: any) {
      showFeedback(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.deleteProduct(id);
      showFeedback(`Product "${name}" deleted.`);
      loadAllAdminData();
    } catch (err: any) {
      showFeedback(err.message || 'Failed to delete product', 'error');
    }
  };

  // Add inventory batch tokens
  const handleAddBatchTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForInventory || !batchTokensText.trim()) return;

    const tokenLines = batchTokensText
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (tokenLines.length === 0) return;

    try {
      await api.addInventoryTokens(selectedProductForInventory, tokenLines);
      showFeedback(`${tokenLines.length} inventory reference tokens added successfully!`);
      setShowAddInventoryModal(false);
      setBatchTokensText('');
      loadAllAdminData();
    } catch (err: any) {
      showFeedback(err.message || 'Failed to add inventory tokens', 'error');
    }
  };

  // User status toggle
  const handleToggleUserStatus = async (userObj: User) => {
    const nextStatus = userObj.status === 'active' ? 'disabled' : 'active';
    try {
      await api.updateUserStatus(userObj.id, nextStatus);
      showFeedback(`User ${userObj.email} status set to ${nextStatus}.`);
      loadAllAdminData();
    } catch (err: any) {
      showFeedback(err.message || 'Failed to update user status', 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const updated = await api.updateAdminSettings(settings);
      setSettings(updated);
      showFeedback('Store & USDT TRC20 settings saved successfully!');
    } catch (err: any) {
      showFeedback(err.message || 'Failed to update settings', 'error');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 bg-[#161a23] border border-[#273042] rounded-xl p-8 text-center space-y-4">
        <Lock className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400">
          You must log in with authorized administrator credentials to view this dashboard.
        </p>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => {
    if (orderFilter !== 'All' && o.paymentStatus !== orderFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return o.id.toLowerCase().includes(q) || o.userEmail.toLowerCase().includes(q) || (o.transactionHash && o.transactionHash.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div id="admin-dashboard-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4 select-none">
      {/* Top Header */}
      <div className="bg-[#141414] border border-[#262626] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-black text-white flex items-center space-x-2">
              <span>CardVault Administrator Console</span>
            </h1>
            <p className="text-[11px] text-[#737373] mt-0.5">
              USDT TRC20 Payment Verification & Catalog Management
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadAllAdminData}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#181818] hover:bg-[#202020] border border-[#262626] text-xs font-semibold text-[#d1d1d1] rounded transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {actionMessage && (
        <div
          className={`p-2.5 rounded border text-xs flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="font-mono text-xs ml-2">✕</button>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center space-x-1 border-b border-[#262626] overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-400 bg-[#161616]'
              : 'border-transparent text-[#8e8e8e] hover:text-white hover:bg-[#141414]'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-blue-500 text-blue-400 bg-[#161616]'
              : 'border-transparent text-[#8e8e8e] hover:text-white hover:bg-[#141414]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Orders & Payments</span>
          {stats && stats.pendingPayments > 0 && (
            <span className="bg-amber-500 text-black text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ml-1">
              {stats.pendingPayments}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-blue-500 text-blue-400 bg-[#161616]'
              : 'border-transparent text-[#8e8e8e] hover:text-white hover:bg-[#141414]'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Product Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'border-blue-500 text-blue-400 bg-[#161616]'
              : 'border-transparent text-[#8e8e8e] hover:text-white hover:bg-[#141414]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Card Stock & Inventory ({inventory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-blue-500 text-blue-400 bg-[#161616]'
              : 'border-transparent text-[#8e8e8e] hover:text-white hover:bg-[#141414]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Users ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-blue-500 text-blue-400 bg-[#161616]'
              : 'border-transparent text-[#8e8e8e] hover:text-white hover:bg-[#141414]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Store & USDT Settings</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#141414] border border-[#262626] rounded-md p-3.5 space-y-0.5">
              <span className="text-[10px] font-mono text-[#737373] uppercase">TOTAL VERIFIED REVENUE</span>
              <div className="text-xl font-black text-emerald-400 font-mono">${stats.totalRevenue.toFixed(2)} USDT</div>
              <span className="text-[10px] text-[#737373] font-mono">Completed settled payments</span>
            </div>

            <div className="bg-[#141414] border border-[#262626] rounded-md p-3.5 space-y-0.5">
              <span className="text-[10px] font-mono text-[#737373] uppercase">PENDING VERIFICATION</span>
              <div className="text-xl font-black text-amber-400 font-mono">{stats.pendingPayments}</div>
              <span className="text-[10px] text-[#737373] font-mono">Awaiting admin blockchain TXID check</span>
            </div>

            <div className="bg-[#141414] border border-[#262626] rounded-md p-3.5 space-y-0.5">
              <span className="text-[10px] font-mono text-[#737373] uppercase">ACTIVE PRODUCTS</span>
              <div className="text-xl font-black text-blue-400 font-mono">{stats.activeProducts}</div>
              <span className="text-[10px] text-[#737373] font-mono">In-stock prepaid catalog items</span>
            </div>

            <div className="bg-[#141414] border border-[#262626] rounded-md p-3.5 space-y-0.5">
              <span className="text-[10px] font-mono text-[#737373] uppercase">REGISTERED USERS</span>
              <div className="text-xl font-black text-slate-100 font-mono">{stats.totalUsers}</div>
              <span className="text-[10px] text-[#737373] font-mono">Customer & admin accounts</span>
            </div>
          </div>

          {/* Quick Pending Actions alert */}
          {stats.pendingPayments > 0 && (
            <div className="bg-amber-950/30 border border-amber-800/50 rounded-md p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-amber-300">
                    {stats.pendingPayments} Order(s) Awaiting USDT TRC20 Verification
                  </h4>
                  <p className="text-[11px] text-[#a3a3a3]">
                    Customers have submitted their transaction hashes. Verify on TRON network and approve to fulfill card credentials.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setOrderFilter('Pending Verification');
                  setActiveTab('orders');
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded"
              >
                Review Pending
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORDERS & PAYMENTS */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
              {['All', 'Pending Verification', 'Payment Submitted', 'Paid', 'Completed', 'Awaiting Payment', 'Rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border whitespace-nowrap ${
                    orderFilter === st
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-[#141414] text-[#d1d1d1] border-[#262626] hover:bg-[#181818]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#737373] absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search orders, buyer, or TXID..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full bg-[#101010] border border-[#262626] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-[#141414] border border-[#262626] rounded-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#d1d1d1]">
                <thead className="bg-[#101010] text-[10px] font-semibold text-[#8e8e8e] uppercase tracking-wider border-b border-[#222222]">
                  <tr>
                    <th className="px-3.5 py-2.5">Order ID & Date</th>
                    <th className="px-3.5 py-2.5">Customer</th>
                    <th className="px-3.5 py-2.5">Items</th>
                    <th className="px-3.5 py-2.5">Total Amount</th>
                    <th className="px-3.5 py-2.5">Submitted TXID</th>
                    <th className="px-3.5 py-2.5">Payment Status</th>
                    <th className="px-3.5 py-2.5 text-right">Verification Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-[#737373]">
                        No orders matching this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#181818] transition-colors">
                        <td className="px-3.5 py-2.5 font-mono">
                          <div className="font-bold text-white text-xs">{ord.id}</div>
                          <div className="text-[10px] text-[#737373]">{new Date(ord.createdAt).toLocaleDateString()}</div>
                        </td>

                        <td className="px-3.5 py-2.5">
                          <div className="font-medium text-white truncate max-w-[140px]">{ord.userName}</div>
                          <div className="text-[10px] text-[#737373] truncate max-w-[140px]">{ord.userEmail}</div>
                        </td>

                        <td className="px-3.5 py-2.5">
                          <div className="space-y-0.5 max-w-[180px]">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="truncate text-[11px] text-[#d1d1d1]">
                                {it.quantity}x {it.name}
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="px-3.5 py-2.5 font-mono font-bold text-emerald-400">
                          ${ord.totalUSDT.toFixed(2)} USDT
                        </td>

                        <td className="px-3.5 py-2.5 font-mono text-[11px]">
                          {ord.transactionHash ? (
                            <div className="flex items-center space-x-1.5">
                              <span className="truncate max-w-[120px] text-white">{ord.transactionHash}</span>
                              <a
                                href={`https://tronscan.org/#/transaction/${ord.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300"
                                title="Inspect on TronScan"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-[#737373] italic">None</span>
                          )}
                        </td>

                        <td className="px-3.5 py-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                              ord.paymentStatus === 'Paid' || ord.paymentStatus === 'Completed'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : ord.paymentStatus === 'Pending Verification'
                                ? 'bg-amber-950 text-amber-300 border-amber-800'
                                : ord.paymentStatus === 'Rejected'
                                ? 'bg-rose-950 text-rose-300 border-rose-800'
                                : 'bg-[#181818] text-[#d1d1d1] border-[#262626]'
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </td>

                        <td className="px-3.5 py-2.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {ord.paymentStatus !== 'Paid' && ord.paymentStatus !== 'Completed' && (
                              <button
                                onClick={() => openApprovalModal(ord)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold flex items-center space-x-1 shadow-sm transition-colors"
                                title="Type card information and approve order"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Approve & Deliver Card</span>
                              </button>
                            )}

                            {ord.paymentStatus !== 'Rejected' && (
                              <button
                                onClick={() => {
                                  setRejectOrderId(ord.id);
                                }}
                                className="px-2 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 rounded text-[11px] font-medium"
                                title="Reject transaction"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Manage Prepaid Card Catalog
            </h3>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  name: '',
                  brand: 'Visa',
                  category: 'Visa',
                  cardType: 'Standard',
                  value: 100,
                  price: 95,
                  region: 'US',
                  image: '/cards/visa-100.png',
                  description: '',
                  terms: 'Non-reloadable prepaid voucher.',
                  availability: 'in_stock',
                  stockCount: 50,
                  seller: 'CardVault Official',
                  rating: 4.9,
                  ratingCount: 10,
                });
                setShowAddProductModal(true);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Card Product</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-[#141414] border border-[#262626] rounded-md p-3.5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[9px] font-bold">
                      {p.brand} ({p.cardType})
                    </span>
                    <span className="text-[10px] text-[#737373] font-mono">{p.region}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-1.5">{p.name}</h4>

                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-sm font-bold text-emerald-400 font-mono">${p.price} USD</span>
                    <span className="text-[10px] text-[#737373] ml-auto font-mono">Stock: {p.stockCount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#222222]">
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setProductForm({
                        name: p.name,
                        brand: p.brand as any,
                        category: p.category,
                        cardType: p.cardType as any,
                        value: p.value,
                        price: p.price,
                        region: p.region,
                        image: p.image,
                        description: p.description,
                        terms: p.terms,
                        availability: p.availability,
                        stockCount: p.stockCount,
                        seller: p.seller,
                        rating: p.rating,
                        ratingCount: p.ratingCount,
                      });
                      setShowAddProductModal(true);
                    }}
                    className="p-1 bg-[#181818] hover:bg-[#202020] text-[#d1d1d1] border border-[#262626] rounded text-xs"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id, p.name)}
                    className="p-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded text-xs"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Prepaid Card Inventory & Stock
              </h3>
              <p className="text-xs text-[#737373]">
                Manage available card stock references and inventory allocations.
              </p>
            </div>
            <button
              onClick={() => setShowAddInventoryModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Batch Tokens</span>
            </button>
          </div>

          <div className="bg-[#141414] border border-[#262626] rounded-md overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-[#d1d1d1]">
              <thead className="bg-[#101010] text-[10px] font-semibold text-[#8e8e8e] uppercase tracking-wider border-b border-[#222222]">
                <tr>
                  <th className="px-3.5 py-2.5">Product Name</th>
                  <th className="px-3.5 py-2.5">Token Reference Code</th>
                  <th className="px-3.5 py-2.5">Status</th>
                  <th className="px-3.5 py-2.5">Assigned Order ID</th>
                  <th className="px-3.5 py-2.5">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#737373]">
                      No inventory tokens uploaded.
                    </td>
                  </tr>
                ) : (
                  inventory.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#181818]">
                      <td className="px-3.5 py-2 font-medium text-white">{inv.productName}</td>
                      <td className="px-3.5 py-2 font-mono text-emerald-400 font-bold">{inv.tokenReference}</td>
                      <td className="px-3.5 py-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                            inv.isAssigned
                              ? 'bg-blue-950 text-blue-300 border-blue-800'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          {inv.isAssigned ? 'Assigned' : 'Available in Stock'}
                        </span>
                      </td>
                      <td className="px-3.5 py-2 font-mono text-[#d1d1d1]">{inv.orderId || '—'}</td>
                      <td className="px-3.5 py-2 text-[10px] text-[#737373]">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Registered Users & Accounts
          </h3>

          <div className="bg-[#141414] border border-[#262626] rounded-md overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-[#d1d1d1]">
              <thead className="bg-[#101010] text-[10px] font-semibold text-[#8e8e8e] uppercase tracking-wider border-b border-[#222222]">
                <tr>
                  <th className="px-3.5 py-2.5">User</th>
                  <th className="px-3.5 py-2.5">Email</th>
                  <th className="px-3.5 py-2.5">Role</th>
                  <th className="px-3.5 py-2.5">Status</th>
                  <th className="px-3.5 py-2.5">Registered</th>
                  <th className="px-3.5 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#181818]">
                    <td className="px-3.5 py-2 font-bold text-white">{u.fullName}</td>
                    <td className="px-3.5 py-2 font-mono text-[#d1d1d1]">{u.email}</td>
                    <td className="px-3.5 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        u.role === 'admin' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-[#181818] text-[#d1d1d1]'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3.5 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                        u.status === 'active' ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-2 text-[10px] text-[#737373]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3.5 py-2 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.status === 'active'
                              ? 'bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800'
                          }`}
                        >
                          {u.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeTab === 'settings' && settings && (
        <div className="max-w-2xl bg-[#141414] border border-[#262626] rounded-md p-5 space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Store & USDT TRC20 Configuration</span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[#8e8e8e] font-semibold block">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-white font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#8e8e8e] font-semibold block">
                USDT TRC20 Merchant Receiving Address <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={settings.usdtTrc20Address}
                onChange={(e) => setSettings({ ...settings, usdtTrc20Address: e.target.value })}
                className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-white font-mono"
              />
              <span className="text-[10px] text-[#737373]">
                Default: TG1LiM1h3iLf654gAx1msadrDf65q2AbAC (TRON TRC20)
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[#8e8e8e] font-semibold block">Payment Instructions for Buyers</label>
              <textarea
                rows={3}
                value={settings.paymentInstructions}
                onChange={(e) => setSettings({ ...settings, paymentInstructions: e.target.value })}
                className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[#8e8e8e] font-semibold block">Support Contact Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#8e8e8e] font-semibold block">Telegram Support Handle</label>
                <input
                  type="text"
                  value={settings.telegramSupport}
                  onChange={(e) => setSettings({ ...settings, telegramSupport: e.target.value })}
                  className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold transition-colors"
            >
              Save Configuration
            </button>
          </form>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#141414] border border-[#262626] rounded-md p-5 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xs font-bold text-white uppercase">
              {editingProduct ? 'Edit Product' : 'Add New Prepaid Card Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[#8e8e8e] font-semibold">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Visa Prepaid $100"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[#8e8e8e] font-semibold">Brand</label>
                  <select
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value as any })}
                    className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-white"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="American Express">American Express</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#8e8e8e] font-semibold">Quality Tier</label>
                  <select
                    value={productForm.cardType}
                    onChange={(e) => setProductForm({ ...productForm, cardType: e.target.value as any })}
                    className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-white font-semibold text-blue-400"
                  >
                    <option value="Standard">Standard</option>
                    <option value="HQ">HQ (High Quality)</option>
                    <option value="UHQ">UHQ (Ultra High Quality)</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#8e8e8e] font-semibold">Category Tab</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-white"
                  >
                    <option value="Standard">Standard</option>
                    <option value="HQ">HQ</option>
                    <option value="UHQ">UHQ</option>
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="American Express">American Express</option>
                  </select>
                </div>
              </div>

              

                <div className="space-y-1">
                  <label className="text-[#8e8e8e] font-semibold">Selling Price ($)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#8e8e8e] font-semibold">Region</label>
                  <input
                    type="text"
                    value={productForm.region}
                    onChange={(e) => setProductForm({ ...productForm, region: e.target.value })}
                    className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#8e8e8e] font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-3 py-1.5 bg-[#181818] border border-[#262626] text-[#d1d1d1] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Batch Inventory Modal */}
      {showAddInventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#141414] border border-[#262626] rounded-md p-5 w-full max-w-md space-y-4">
            <h3 className="text-xs font-bold text-white uppercase">
              Add Inventory Stock Codes
            </h3>
            <p className="text-xs text-[#737373]">
              Enter one stock reference code per line (e.g. CV-VISA-100-REF-9812A).
            </p>

            <form onSubmit={handleAddBatchTokens} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[#8e8e8e] font-semibold">Select Product</label>
                <select
                  required
                  value={selectedProductForInventory}
                  onChange={(e) => setSelectedProductForInventory(e.target.value)}
                  className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-white"
                >
                  <option value="">Select a card product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (${p.value} {p.brand})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#8e8e8e] font-semibold">Tokens (One per line)</label>
                <textarea
                  rows={6}
                  required
                  placeholder="CV-REF-V100-849201-US&#10;CV-REF-V100-849202-US"
                  value={batchTokensText}
                  onChange={(e) => setBatchTokensText(e.target.value)}
                  className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-white font-mono text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddInventoryModal(false)}
                  className="px-3 py-1.5 bg-[#181818] border border-[#262626] text-[#d1d1d1] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold"
                >
                  Add Tokens
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Payment Reason Modal */}
      {rejectOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#141414] border border-[#262626] rounded-md p-5 w-full max-w-md space-y-3">
            <h3 className="text-xs font-bold text-rose-400 uppercase">
              Reject Order Payment #{rejectOrderId}
            </h3>
            <div className="space-y-1.5 text-xs">
              <label className="text-[#8e8e8e] font-semibold">Rejection Reason:</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setRejectOrderId(null)}
                className="px-3 py-1.5 bg-[#181818] border border-[#262626] text-[#d1d1d1] rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectPayment}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE & TYPE CARD INFORMATION MODAL */}
      {approvingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#141414] border border-[#2e2e2e] rounded-lg w-full max-w-3xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#101010] border-b border-[#262626] px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>Approve Order & Deliver Card Information</span>
                    <span className="font-mono text-xs text-blue-400 font-bold px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-800">
                      {approvingOrder.id}
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#8e8e8e]">
                    Customer: <span className="text-white font-medium">{approvingOrder.userEmail}</span> ({approvingOrder.userName}) · Total: <span className="text-emerald-400 font-mono font-bold">${approvingOrder.totalUSDT.toFixed(2)} USDT</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setApprovingOrder(null)}
                className="text-[#737373] hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitApproveWithCards} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Order Info & TXID Banner */}
              <div className="bg-[#101010] border border-[#262626] rounded-md p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#737373] block text-[10px] uppercase font-semibold">Ordered Products:</span>
                  <div className="space-y-0.5 mt-0.5">
                    {approvingOrder.items.map((it, idx) => (
                      <div key={idx} className="text-white font-medium">
                        • {it.quantity}x {it.name} (${it.value} face value)
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[#737373] block text-[10px] uppercase font-semibold">Payment TXID:</span>
                  <div className="font-mono text-emerald-400 text-[11px] truncate select-all mt-0.5">
                    {approvingOrder.transactionHash || 'No TXID submitted (Direct Admin Approval)'}
                  </div>
                </div>
              </div>

              {/* Quick Paste Bulk Parser */}
              <div className="bg-[#181818] border border-[#2e2e2e] rounded-md p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#d1d1d1]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quick Paste Autofill (Optional)</span>
                  </div>
                  <span className="text-[10px] text-[#737373]">
                    Format: <code className="text-blue-300">CARDNUMBER|EXP|CVV|NAME</code>
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 4532015099881122|12/28|456|JOHN DOE (or paste multiple lines)"
                    value={quickPasteInput}
                    onChange={(e) => setQuickPasteInput(e.target.value)}
                    className="flex-1 bg-[#101010] border border-[#2c2c2c] rounded px-3 py-1.5 text-xs font-mono text-white placeholder-[#555] focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyQuickPaste}
                    className="px-3 py-1.5 bg-[#262626] hover:bg-[#333] border border-[#3a3a3a] text-white font-medium rounded text-xs transition-colors shrink-0"
                  >
                    Apply to Fields
                  </button>
                </div>
              </div>

              {/* Card Inputs List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <span>Card Details to Deliver to Client ({approvalCards.length}):</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCardSlot}
                    className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Card</span>
                  </button>
                </div>

                {approvalCards.map((card, idx) => (
                  <div
                    key={card.id || idx}
                    className="bg-[#101010] border border-[#282828] rounded-md p-3.5 space-y-3 relative group"
                  >
                    {/* Card Item Top Bar */}
                    <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold uppercase font-mono">
                          Card #{idx + 1}
                        </span>
                        <span className="font-semibold text-white text-xs">
                          {card.cardName || `Card Item #${idx + 1}`}
                        </span>
                      </div>

                      {approvalCards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCardSlot(idx)}
                          className="text-[#737373] hover:text-rose-400 text-xs flex items-center space-x-1 p-1 transition-colors"
                          title="Remove card slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    {/* Card Fields Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Card Number */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[#a3a3a3] font-semibold text-[11px] flex items-center justify-between">
                          <span>Card Number (Digits / PAN) *</span>
                          <span className="text-[10px] text-[#737373]">16 digits</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="4532 0123 4567 8901"
                          value={card.cardNumber}
                          onChange={(e) => handleCardFieldChange(idx, 'cardNumber', e.target.value)}
                          className="w-full bg-[#161616] border border-[#2c2c2c] rounded px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Brand */}
                      <div className="space-y-1">
                        <label className="text-[#a3a3a3] font-semibold text-[11px]">Card Brand</label>
                        <select
                          value={card.brand || 'Visa'}
                          onChange={(e) => handleCardFieldChange(idx, 'brand', e.target.value as any)}
                          className="w-full bg-[#161616] border border-[#2c2c2c] rounded px-2.5 py-1.5 text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="Visa">Visa</option>
                          <option value="Mastercard">Mastercard</option>
                          <option value="American Express">American Express</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Expiry Date */}
                      <div className="space-y-1">
                        <label className="text-[#a3a3a3] font-semibold text-[11px]">Expiry Date (MM/YY) *</label>
                        <input
                          type="text"
                          required
                          placeholder="12/28"
                          value={card.expiryDate}
                          onChange={(e) => handleCardFieldChange(idx, 'expiryDate', e.target.value)}
                          className="w-full bg-[#161616] border border-[#2c2c2c] rounded px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* CVV */}
                      <div className="space-y-1">
                        <label className="text-[#a3a3a3] font-semibold text-[11px]">CVV / CVC (3-4 Digits) *</label>
                        <input
                          type="text"
                          required
                          placeholder="849"
                          value={card.cvv}
                          onChange={(e) => handleCardFieldChange(idx, 'cvv', e.target.value)}
                          className="w-full bg-[#161616] border border-[#2c2c2c] rounded px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Cardholder Name */}
                      <div className="space-y-1">
                        <label className="text-[#a3a3a3] font-semibold text-[11px]">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="JOHN DOE"
                          value={card.cardHolder || ''}
                          onChange={(e) => handleCardFieldChange(idx, 'cardHolder', e.target.value)}
                          className="w-full bg-[#161616] border border-[#2c2c2c] rounded px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* PIN Code */}
                      <div className="space-y-1">
                        <label className="text-[#a3a3a3] font-semibold text-[11px]">PIN Code (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. 1234"
                          value={card.pin || ''}
                          onChange={(e) => handleCardFieldChange(idx, 'pin', e.target.value)}
                          className="w-full bg-[#161616] border border-[#2c2c2c] rounded px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Card Balance */}
                      <div className="space-y-1">
                        <label className="text-[#a3a3a3] font-semibold text-[11px]">Face Balance ($ USD)</label>
                        <input
                          type="number"
                          placeholder="100"
                          value={card.balance ?? ''}
                          onChange={(e) => handleCardFieldChange(idx, 'balance', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#161616] border border-[#2c2c2c] rounded px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Extra Instructions / Billing Info */}
                      <div className="space-y-1">
                        <label className="text-[#a3a3a3] font-semibold text-[11px]">Billing / Activation Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. US Zip: 90210, 3DS pass"
                          value={card.notes || ''}
                          onChange={(e) => handleCardFieldChange(idx, 'notes', e.target.value)}
                          className="w-full bg-[#161616] border border-[#2c2c2c] rounded px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery / Fulfillment Note to Customer */}
              <div className="space-y-1 pt-1">
                <label className="text-[#a3a3a3] font-semibold text-[11px] flex items-center justify-between">
                  <span>Customer Fulfillment Note (Optional Message to Client):</span>
                </label>
                <textarea
                  rows={2}
                  value={approvalDeliveryNotes}
                  onChange={(e) => setApprovalDeliveryNotes(e.target.value)}
                  placeholder="e.g. Your card is active with $100 balance. Valid globally for online shopping."
                  className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="border-t border-[#262626] pt-3.5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setApprovingOrder(null)}
                  className="px-4 py-2 bg-[#181818] hover:bg-[#222] border border-[#2c2c2c] text-[#d1d1d1] rounded text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={approvingLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center space-x-1.5 shadow-md disabled:opacity-50 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{approvingLoading ? 'Processing Approval...' : 'Approve & Send to Client'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
