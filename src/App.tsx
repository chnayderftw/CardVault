import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Marketplace } from './components/Marketplace';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { DepositView } from './components/DepositView';
import { SupportView } from './components/SupportView';
import { NewsFaqView } from './components/NewsFaqView';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { CartModal } from './components/CartModal';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { PaymentModal } from './components/PaymentModal';
import { Footer } from './components/Footer';

import {
  CardProduct,
  User,
  Order,
  Deposit,
  Ticket,
  Announcement,
  SiteSettings
} from './types';
import { api, getStoredToken, removeStoredToken } from './lib/api';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');

  // App Data
  const [products, setProducts] = useState<CardProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    trc20WalletAddress: 'TG1LiM1h3iLf654gAx1msadrDf65q2AbAC',
    minDeposit: 10,
    supportEmail: 'support@cardvault.io',
    siteNotice: ''
  });

  // Cart & Modal states
  const [cart, setCart] = useState<{ product: CardProduct; quantity: number }[]>([]);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({
    open: false,
    mode: 'login'
  });
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CardProduct | null>(null);
  const [paymentProduct, setPaymentProduct] = useState<CardProduct | null>(null);

  // Initial Data Fetch
  const fetchData = async () => {
    try {
      const p = await api.getProducts();
      setProducts(p);

      const s = await api.getSettings();
      setSettings(s);

      const a = await api.getAnnouncements();
      setAnnouncements(a);

      const token = getStoredToken();
      if (token) {
        try {
          const u = await api.getMe();
          setUser(u);

          const o = await api.getOrders();
          setOrders(o);

          const d = await api.getDeposits();
          setDeposits(d);

          const t = await api.getTickets();
          setTickets(t);
        } catch (err) {
          removeStoredToken();
          setUser(null);
        }
      }
    } catch (e) {
      console.error('Error fetching marketplace data:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    removeStoredToken();
    setUser(null);
    setOrders([]);
    setDeposits([]);
    setTickets([]);
    setActiveTab('home');
  };

  // Cart Management
  const handleAddToCart = (product: CardProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleBuyNow = (product: CardProduct) => {
    if (!user) {
      setAuthModal({ open: true, mode: 'login' });
      return;
    }

    setPaymentProduct(product);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-mono flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setCartModalOpen(true)}
        onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
        onLogout={handleLogout}
        siteNotice={settings.siteNotice}
      />

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5">
        {activeTab === 'home' && (
          <DashboardView
            user={user}
            products={products}
            announcements={announcements}
            settings={settings}
            onNavigate={setActiveTab}
            onSelectProduct={setSelectedProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}

        {(activeTab === 'cards' || activeTab === 'premium' || activeTab === 'standard') && (
          <Marketplace
            products={products}
            categoryTab={activeTab === 'cards' ? 'all' : activeTab}
            onSelectProduct={setSelectedProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            settings={settings}
            onRefreshOrders={fetchData}
          />
        )}

        {activeTab === 'deposit' && (
          <DepositView
            user={user}
            deposits={deposits}
            settings={settings}
            onRefreshDeposits={fetchData}
            onOpenAuth={() => setAuthModal({ open: true, mode: 'login' })}
          />
        )}

        {activeTab === 'support' && (
          <SupportView
            user={user}
            tickets={tickets}
            onRefreshTickets={fetchData}
            onOpenAuth={() => setAuthModal({ open: true, mode: 'login' })}
          />
        )}

        {(activeTab === 'faq' || activeTab === 'news' || activeTab === 'contact') && (
          <NewsFaqView announcements={announcements} />
        )}

        {activeTab === 'admin' && user?.role === 'admin' && (
          <AdminPanel
            products={products}
            orders={orders}
            deposits={deposits}
            settings={settings}
            announcements={announcements}
            onRefreshAll={fetchData}
          />
        )}
      </main>

      {/* Modals */}
      {authModal.open && (
        <AuthModal
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ open: false, mode: 'login' })}
          onSuccess={(u) => {
            setUser(u);
            fetchData();
          }}
        />
      )}

      {cartModalOpen && (
        <CartModal
          cart={cart}
          user={user}
          settings={settings}
          onClose={() => setCartModalOpen(false)}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={handleClearCart}
          onOpenAuth={() => setAuthModal({ open: true, mode: 'login' })}
          onOrderCreated={() => {
            fetchData();
            setActiveTab('orders');
          }}
        />
      )}

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          user={user}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onOpenAuth={() => setAuthModal({ open: true, mode: 'login' })}
        />
      )}

      {paymentProduct && (
        <PaymentModal
          product={paymentProduct}
          user={user}
          settings={settings}
          onClose={() => setPaymentProduct(null)}
          onSuccess={(order) => {
            setPaymentProduct(null);
            fetchData();
            setActiveTab('orders');
          }}
          onOpenAuth={() => setAuthModal({ open: true, mode: 'login' })}
        />
      )}

      {/* Footer Ticker */}
      <Footer />
    </div>
  );
}
