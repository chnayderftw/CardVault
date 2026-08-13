import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  ShoppingBag,
  Wallet,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Bell,
  Activity,
  FileText
} from 'lucide-react';
import { CardProduct, Order, Deposit, User, SiteSettings, Announcement } from '../types';
import { api } from '../lib/api';

interface AdminPanelProps {
  products: CardProduct[];
  orders: Order[];
  deposits: Deposit[];
  settings: SiteSettings;
  announcements: Announcement[];
  onRefreshAll: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  orders,
  deposits,
  settings,
  announcements,
  onRefreshAll
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'deposits' | 'settings' | 'users' | 'announcements' | 'logs'>('orders');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Form states for adding product
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: 'Visa',
    bin: '4859 10**',
    issuer: 'JPMorgan Chase',
    cardType: 'Virtual',
    level: 'Standard',
    country: 'United States',
    price: 105,
    stock: 50,
    isPremium: false,
    isFeatured: false,
    description: 'Enterprise virtual prepaid solution'
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);

  // User list state
  const [usersList, setUsersList] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceAdjustment, setBalanceAdjustment] = useState('');

  // Announcement state
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');

  // Fulfillment modal state
  const [selectedOrderForFulfill, setSelectedOrderForFulfill] = useState<Order | null>(null);
  const [cardNumberInput, setCardNumberInput] = useState('');
  const [expDateInput, setExpDateInput] = useState('');
  const [cvvInput, setCvvInput] = useState('');
  const [instructionsInput, setInstructionsInput] = useState('');

  const handleOpenFulfillModal = (order: Order) => {
    setSelectedOrderForFulfill(order);
    const binPrefix = order.productBrand.toLowerCase().includes('visa') ? '4532' : '5241';
    const r1 = Math.floor(1000 + Math.random() * 9000);
    const r2 = Math.floor(1000 + Math.random() * 9000);
    const r3 = Math.floor(1000 + Math.random() * 9000);
    setCardNumberInput(`${binPrefix} ${r1} ${r2} ${r3}`);
    setExpDateInput(`12/28`);
    setCvvInput(`${Math.floor(100 + Math.random() * 900)}`);
    setInstructionsInput('Card activated and ready for online purchases & 3DS authorization.');
  };

  const handleGenerateRandomCardData = () => {
    if (!selectedOrderForFulfill) return;
    const binPrefix = selectedOrderForFulfill.productBrand.toLowerCase().includes('visa') ? '4532' : '5241';
    const r1 = Math.floor(1000 + Math.random() * 9000);
    const r2 = Math.floor(1000 + Math.random() * 9000);
    const r3 = Math.floor(1000 + Math.random() * 9000);
    setCardNumberInput(`${binPrefix} ${r1} ${r2} ${r3}`);
    const month = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
    const year = String(28 + Math.floor(Math.random() * 3));
    setExpDateInput(`${month}/${year}`);
    setCvvInput(`${Math.floor(100 + Math.random() * 900)}`);
  };

  const fetchUsers = async () => {
    try {
      const u = await api.adminGetUsers();
      setUsersList(u);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      await api.adminCreateProduct({
        ...newProduct,
        imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=600'
      });
      setMsg('Product created successfully!');
      onRefreshAll();
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this card product?')) return;
    try {
      await api.adminDeleteProduct(id);
      onRefreshAll();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleApproveDeposit = async (id: string) => {
    try {
      await api.adminVerifyDeposit(id, 'approved');
      onRefreshAll();
      setMsg('Deposit approved and user balance credited.');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRejectDeposit = async (id: string) => {
    try {
      await api.adminVerifyDeposit(id, 'rejected');
      onRefreshAll();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      await api.adminVerifyOrderPayment(orderId, 'paid', {
        cardNumber: cardNumberInput,
        expDate: expDateInput,
        cvv: cvvInput,
        instructions: instructionsInput
      });
      setSelectedOrderForFulfill(null);
      setCardNumberInput('');
      setExpDateInput('');
      setCvvInput('');
      setInstructionsInput('');
      onRefreshAll();
      setMsg('Order approved and card credentials delivered to client.');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adminUpdateSettings(settingsForm);
      onRefreshAll();
      setMsg('Site settings updated successfully.');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !balanceAdjustment) return;
    try {
      await api.adminAdjustBalance(selectedUser.id, parseFloat(balanceAdjustment));
      setBalanceAdjustment('');
      setSelectedUser(null);
      fetchUsers();
      onRefreshAll();
      setMsg('User account balance updated.');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceTitle || !announceContent) return;
    try {
      await api.adminCreateAnnouncement({
        title: announceTitle,
        content: announceContent,
        category: 'Announcement',
        isImportant: false
      });
      setAnnounceTitle('');
      setAnnounceContent('');
      onRefreshAll();
      setMsg('Announcement posted.');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const pendingOrders = orders.filter(o => o.paymentStatus === 'pending' || o.paymentStatus === 'verifying');
  const pendingDeposits = deposits.filter(d => d.status === 'pending');

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="bg-[#0a0a0a] p-4 border border-[#1f1f1f] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-sm font-bold uppercase text-white tracking-wider flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>ENTERPRISE ADMINISTRATOR CONTROL TERMINAL</span>
          </h2>
          <p className="text-[10px] text-[#777777]">
            Full platform authority: Manage inventory, verify TRC20 payments, adjust balances, and update settings.
          </p>
        </div>

        <div className="flex space-x-2">
          <span className="bg-red-950/40 text-red-400 border border-red-800/40 px-2.5 py-1 text-[10px] font-bold">
            ADMIN ROOT MODE
          </span>
        </div>
      </div>

      {msg && (
        <div className="bg-blue-950/40 border border-blue-800/60 p-2.5 text-blue-300 text-[11px]">
          {msg}
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-3 space-y-1">
          <span className="text-[9px] uppercase text-[#777777] block">PENDING ORDERS</span>
          <span className="text-base font-bold text-amber-400">{pendingOrders.length}</span>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-3 space-y-1">
          <span className="text-[9px] uppercase text-[#777777] block">PENDING DEPOSITS</span>
          <span className="text-base font-bold text-yellow-500">{pendingDeposits.length}</span>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-3 space-y-1">
          <span className="text-[9px] uppercase text-[#777777] block">TOTAL CARD PRODUCTS</span>
          <span className="text-base font-bold text-blue-400">{products.length}</span>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-3 space-y-1">
          <span className="text-[9px] uppercase text-[#777777] block">SYSTEM ANNOUNCEMENTS</span>
          <span className="text-base font-bold text-emerald-400">{announcements.length}</span>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex space-x-1 overflow-x-auto bg-[#0a0a0a] p-1.5 border border-[#1f1f1f]">
        {[
          { id: 'orders', label: `ORDERS (${pendingOrders.length})` },
          { id: 'deposits', label: `DEPOSITS (${pendingDeposits.length})` },
          { id: 'products', label: 'CARD INVENTORY' },
          { id: 'users', label: 'USER BALANCES' },
          { id: 'settings', label: 'SETTINGS' },
          { id: 'announcements', label: 'ANNOUNCEMENTS' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-[#121212] text-[#888888] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Approval Tab */}
      {activeTab === 'orders' && (
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] overflow-hidden">
          <div className="p-3 bg-[#111111] border-b border-[#1f1f1f] font-bold text-white uppercase text-xs">
            PENDING & COMPLETED ORDERS MANAGEMENT
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#cbd5e1]">
              <thead>
                <tr className="bg-[#151515] text-[#777777] border-b border-[#1f1f1f] uppercase font-bold text-[9px]">
                  <th className="py-2.5 px-3">ORDER ID</th>
                  <th className="py-2.5 px-3">CLIENT</th>
                  <th className="py-2.5 px-3">PRODUCT</th>
                  <th className="py-2.5 px-3">AMOUNT</th>
                  <th className="py-2.5 px-3">TXHASH</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#111111] transition">
                    <td className="py-2.5 px-3 font-bold text-blue-400 font-mono">{o.id}</td>
                    <td className="py-2.5 px-3 text-white">{o.userName}</td>
                    <td className="py-2.5 px-3">{o.productName}</td>
                    <td className="py-2.5 px-3 font-bold text-yellow-500">${o.amount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-[#777777] truncate max-w-[120px]">
                      {o.txHash || 'None'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[#1e293b] text-[#cbd5e1]">
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      {o.paymentStatus !== 'paid' && (
                        <button
                          onClick={() => handleOpenFulfillModal(o)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 text-[10px] uppercase transition"
                        >
                          APPROVE & ENTER CARD DETAILS
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

      {/* Deposit Approvals Tab */}
      {activeTab === 'deposits' && (
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] overflow-hidden">
          <div className="p-3 bg-[#111111] border-b border-[#1f1f1f] font-bold text-white uppercase text-xs">
            PENDING & HISTORICAL TRC20 DEPOSITS
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#cbd5e1]">
              <thead>
                <tr className="bg-[#151515] text-[#777777] border-b border-[#1f1f1f] uppercase font-bold text-[9px]">
                  <th className="py-2.5 px-3">DEPOSIT ID</th>
                  <th className="py-2.5 px-3">USER</th>
                  <th className="py-2.5 px-3">AMOUNT</th>
                  <th className="py-2.5 px-3">TRC20 TXHASH</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {deposits.map((d) => (
                  <tr key={d.id} className="hover:bg-[#111111] transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{d.id}</td>
                    <td className="py-2.5 px-3 text-white">{d.userName}</td>
                    <td className="py-2.5 px-3 font-bold text-yellow-500">${d.amount.toFixed(2)} USDT</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-[#777777] truncate max-w-[140px]">
                      {d.txHash}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[#1e293b] text-[#cbd5e1]">
                        {d.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      {d.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveDeposit(d.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 text-[10px] uppercase"
                          >
                            APPROVE DEPOSIT
                          </button>
                          <button
                            onClick={() => handleRejectDeposit(d.id)}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold px-2 py-1 text-[10px] uppercase"
                          >
                            REJECT
                          </button>
                        </>
                      )}
                    </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Card Products Inventory Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Add Product Form */}
          <form onSubmit={handleAddProduct} className="bg-[#0a0a0a] border border-[#1f1f1f] p-4 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase border-b border-[#1f1f1f] pb-2">
              ADD NEW CARD PRODUCT TO INVENTORY
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] text-[#888888] uppercase">PRODUCT NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Virtual Platinum"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-[#151515] border border-[#2a2a2a] p-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] text-[#888888] uppercase">BRAND</label>
                <select
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  className="w-full bg-[#151515] border border-[#2a2a2a] p-1.5 text-xs text-white font-mono"
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="American Express">American Express</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] text-[#888888] uppercase">BIN / IIN PREFIX</label>
                <input
                  type="text"
                  required
                  placeholder="4859 10**"
                  value={newProduct.bin}
                  onChange={(e) => setNewProduct({ ...newProduct, bin: e.target.value })}
                  className="w-full bg-[#151515] border border-[#2a2a2a] p-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] text-[#888888] uppercase">ISSUING INSTITUTION</label>
                <input
                  type="text"
                  required
                  placeholder="JPMorgan Chase"
                  value={newProduct.issuer}
                  onChange={(e) => setNewProduct({ ...newProduct, issuer: e.target.value })}
                  className="w-full bg-[#151515] border border-[#2a2a2a] p-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] text-[#888888] uppercase">CARD LEVEL</label>
                <select
                  value={newProduct.level}
                  onChange={(e) => setNewProduct({ ...newProduct, level: e.target.value })}
                  className="w-full bg-[#151515] border border-[#2a2a2a] p-1.5 text-xs text-white font-mono"
                >
                  <option value="Standard">Standard</option>
                  <option value="HQ">HQ</option>
                  <option value="UHQ">UHQ</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] text-[#888888] uppercase">PRICE ($)</label>
                <input
                  type="number"
                  required
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#151515] border border-[#2a2a2a] p-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 text-xs uppercase"
            >
              PUBLISH NEW PRODUCT
            </button>
          </form>

          {/* Current Products Table */}
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] overflow-hidden">
            <div className="p-3 bg-[#111111] border-b border-[#1f1f1f] font-bold text-white uppercase text-xs">
              INVENTORY CATALOG ({products.length} ITEMS)
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#cbd5e1]">
                <thead>
                  <tr className="bg-[#151515] text-[#777777] border-b border-[#1f1f1f] uppercase font-bold text-[9px]">
                    <th className="py-2.5 px-3">BRAND</th>
                    <th className="py-2.5 px-3">NAME</th>
                    <th className="py-2.5 px-3">BIN</th>
                    <th className="py-2.5 px-3">ISSUER</th>
                    <th className="py-2.5 px-3">LEVEL</th>
                    <th className="py-2.5 px-3">PRICE</th>
                    <th className="py-2.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f1f]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#111111]">
                      <td className="py-2.5 px-3 font-bold text-blue-400">{p.brand}</td>
                      <td className="py-2.5 px-3 text-white font-medium">{p.name}</td>
                      <td className="py-2.5 px-3 font-mono">{p.bin}</td>
                      <td className="py-2.5 px-3">{p.issuer}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 text-[9px] uppercase font-bold border ${
                          p.level === 'UHQ'
                            ? 'bg-purple-950/60 border-purple-500 text-purple-300'
                            : p.level === 'HQ'
                            ? 'bg-blue-950/60 border-blue-500 text-blue-300'
                            : 'bg-gray-800/60 border-gray-600 text-gray-300'
                        }`}>
                          {p.level}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-yellow-500 font-bold">${p.price.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="text-red-400 hover:text-red-300 font-bold text-[10px]"
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-[#0a0a0a] border border-[#1f1f1f] p-4 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase border-b border-[#1f1f1f] pb-2">
            GLOBAL SITE CONFIGURATION & SETTLEMENT SETTINGS
          </h3>

          <div className="space-y-3 max-w-xl">
            <div>
              <label className="text-[9px] text-[#888888] uppercase block">MERCHANT TRC20 WALLET ADDRESS</label>
              <input
                type="text"
                required
                value={settingsForm.trc20WalletAddress}
                onChange={(e) => setSettingsForm({ ...settingsForm, trc20WalletAddress: e.target.value })}
                className="w-full bg-[#151515] border border-[#2a2a2a] p-2 text-xs text-yellow-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[9px] text-[#888888] uppercase block">MINIMUM DEPOSIT LIMIT (USDT)</label>
              <input
                type="number"
                required
                value={settingsForm.minDeposit}
                onChange={(e) => setSettingsForm({ ...settingsForm, minDeposit: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#151515] border border-[#2a2a2a] p-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[9px] text-[#888888] uppercase block">SUPPORT CONTACT EMAIL</label>
              <input
                type="email"
                required
                value={settingsForm.supportEmail}
                onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                className="w-full bg-[#151515] border border-[#2a2a2a] p-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[9px] text-[#888888] uppercase block">TOP ANNOUNCEMENT BANNER TEXT</label>
              <input
                type="text"
                value={settingsForm.siteNotice}
                onChange={(e) => setSettingsForm({ ...settingsForm, siteNotice: e.target.value })}
                className="w-full bg-[#151515] border border-[#2a2a2a] p-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 text-xs uppercase"
          >
            SAVE CONFIGURATION
          </button>
        </form>
      )}

      {/* User Balances Tab */}
      {activeTab === 'users' && (
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] overflow-hidden space-y-4 p-4">
          <h3 className="text-xs font-bold text-white uppercase border-b border-[#1f1f1f] pb-2">
            CLIENT USERS & WALLET BALANCE ADJUSTMENTS
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#cbd5e1]">
              <thead>
                <tr className="bg-[#151515] text-[#777777] border-b border-[#1f1f1f] uppercase font-bold text-[9px]">
                  <th className="py-2.5 px-3">FULL NAME</th>
                  <th className="py-2.5 px-3">EMAIL</th>
                  <th className="py-2.5 px-3">ROLE</th>
                  <th className="py-2.5 px-3">BALANCE</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-[#111111]">
                    <td className="py-2.5 px-3 text-white font-bold">{u.fullName}</td>
                    <td className="py-2.5 px-3 text-[#aaa]">{u.email}</td>
                    <td className="py-2.5 px-3 uppercase text-blue-400 font-bold">{u.role}</td>
                    <td className="py-2.5 px-3 font-bold text-yellow-500">${u.balance.toFixed(2)} USDT</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setBalanceAdjustment(u.balance.toString());
                        }}
                        className="bg-[#151515] border border-[#2a2a2a] px-2 py-1 text-[10px] text-yellow-400 font-bold"
                      >
                        EDIT BALANCE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedUser && (
            <form onSubmit={handleAdjustBalance} className="bg-[#121212] p-4 border border-[#222222] space-y-3">
              <div className="font-bold text-white text-xs">
                ADJUST BALANCE FOR: {selectedUser.fullName} ({selectedUser.email})
              </div>
              <div className="flex space-x-2">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={balanceAdjustment}
                  onChange={(e) => setBalanceAdjustment(e.target.value)}
                  className="bg-[#050505] border border-[#2a2a2a] p-2 text-xs text-white font-mono flex-1"
                />
                <button
                  type="submit"
                  className="bg-yellow-600 text-black font-bold uppercase px-4 py-2 text-xs"
                >
                  UPDATE BALANCE
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="bg-[#202020] text-white font-bold uppercase px-3 py-2 text-xs"
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <form onSubmit={handlePostAnnouncement} className="bg-[#0a0a0a] border border-[#1f1f1f] p-4 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase border-b border-[#1f1f1f] pb-2">
            POST NEWS ANNOUNCEMENT TO PLATFORM
          </h3>

          <div className="space-y-3 max-w-xl">
            <div>
              <label className="text-[9px] text-[#888888] uppercase block">ANNOUNCEMENT TITLE</label>
              <input
                type="text"
                required
                placeholder="e.g. New Batch of UK Platinum Cards Available"
                value={announceTitle}
                onChange={(e) => setAnnounceTitle(e.target.value)}
                className="w-full bg-[#151515] border border-[#2a2a2a] p-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[9px] text-[#888888] uppercase block">CONTENT BODY</label>
              <textarea
                rows={4}
                required
                placeholder="Write news announcement..."
                value={announceContent}
                onChange={(e) => setAnnounceContent(e.target.value)}
                className="w-full bg-[#151515] border border-[#2a2a2a] p-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 text-xs uppercase"
          >
            PUBLISH ANNOUNCEMENT
          </button>
        </form>
      )}

      {/* Fulfillment Modal Drawer - Enter Card Credentials */}
      {selectedOrderForFulfill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
          <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#1f1f1f] text-xs text-[#e0e0e0] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
              <div>
                <h3 className="font-bold text-white uppercase text-xs">
                  APPROVE & ISSUE CARD CREDENTIALS
                </h3>
                <p className="text-[10px] text-[#777777] mt-0.5">
                  Order #{selectedOrderForFulfill.id} • {selectedOrderForFulfill.productName} (${selectedOrderForFulfill.amount.toFixed(2)} USDT)
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForFulfill(null)}
                className="text-[#777777] hover:text-white text-xs font-bold"
              >
                [X]
              </button>
            </div>

            <div className="flex justify-between items-center bg-[#121212] p-2.5 border border-[#222222]">
              <span className="text-[10px] text-[#aaa]">Fill card details below for the client:</span>
              <button
                type="button"
                onClick={handleGenerateRandomCardData}
                className="bg-blue-900/50 hover:bg-blue-800/60 text-blue-300 border border-blue-700/50 text-[9px] font-bold uppercase px-2 py-1"
              >
                AUTO-GENERATE TEST CARD
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleApproveOrder(selectedOrderForFulfill.id);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[9px] text-[#888888] uppercase block font-bold mb-1">
                  CARD NUMBER (16 DIGITS) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="4532 8910 2341 8765"
                  value={cardNumberInput}
                  onChange={(e) => setCardNumberInput(e.target.value)}
                  className="w-full bg-[#151515] border border-[#2a2a2a] focus:border-blue-500 p-2 text-xs text-yellow-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-[#888888] uppercase block font-bold mb-1">
                    EXPIRATION DATE (MM/YY) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="12/28"
                    value={expDateInput}
                    onChange={(e) => setExpDateInput(e.target.value)}
                    className="w-full bg-[#151515] border border-[#2a2a2a] focus:border-blue-500 p-2 text-xs text-yellow-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-[#888888] uppercase block font-bold mb-1">
                    CVV / CVC CODE <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="492"
                    value={cvvInput}
                    onChange={(e) => setCvvInput(e.target.value)}
                    className="w-full bg-[#151515] border border-[#2a2a2a] focus:border-blue-500 p-2 text-xs text-yellow-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-[#888888] uppercase block font-bold mb-1">
                  INSTRUCTIONS / NOTES FOR CLIENT
                </label>
                <textarea
                  rows={2}
                  placeholder="Card activated for online purchases and 3DS authorization..."
                  value={instructionsInput}
                  onChange={(e) => setInstructionsInput(e.target.value)}
                  className="w-full bg-[#151515] border border-[#2a2a2a] focus:border-blue-500 p-2 text-xs text-white font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#1f1f1f]">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForFulfill(null)}
                  className="bg-[#202020] text-white px-3 py-1.5 font-bold uppercase text-[10px]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase px-4 py-1.5 text-[10px] transition"
                >
                  APPROVE ORDER & DELIVER CARD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
