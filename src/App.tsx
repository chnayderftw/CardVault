import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CatalogPage } from './pages/CatalogPage';
import { OrdersPage } from './pages/OrdersPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { PaymentView } from './components/PaymentView';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { InfoModals } from './components/InfoModals';
import { Product, Order } from './types';
import { api } from './api';

function MainAppContent() {
  const { user, isAdmin } = useAuth();
  
  // Navigation & view states
  const [currentView, setCurrentView] = useState<'catalog' | 'orders' | 'account' | 'admin' | 'payment' | 'categories' | 'payments_info'>('catalog');
  
  // Selected entities for modals / views
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activePaymentOrder, setActivePaymentOrder] = useState<Order | null>(null);
  
  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Info modal state
  const [infoModalType, setInfoModalType] = useState<'faq' | 'terms' | 'privacy' | 'payment_guide' | null>(null);

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleNavigate = (view: string, extra?: any) => {
    if (view === 'payments_info') {
      setInfoModalType('payment_guide');
      return;
    }
    if (view === 'categories') {
      setCurrentView('catalog');
      return;
    }
    setCurrentView(view as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDirectBuy = async (product: Product, quantity: number) => {
    try {
      const orderPayload = {
        items: [{ productId: product.id, quantity }],
        customerEmail: user ? user.email : prompt('Please enter your email address for card delivery confirmation:') || '',
        customerName: user ? user.fullName : 'Valued Customer',
      };

      if (!orderPayload.customerEmail || !orderPayload.customerEmail.includes('@')) {
        alert('Valid email address is required to proceed with order creation.');
        return;
      }

      const order = await api.createOrder(orderPayload);
      setActivePaymentOrder(order);
      setCurrentView('payment');
    } catch (err: any) {
      alert(err.message || 'Failed to initiate direct checkout');
    }
  };

  const handleProceedToPayment = (order: Order) => {
    setActivePaymentOrder(order);
    setCurrentView('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#d1d1d1] flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentView === 'catalog' && (
          <CatalogPage
            onSelectProduct={(p) => setSelectedProduct(p)}
            onDirectBuy={handleDirectBuy}
          />
        )}

        {currentView === 'orders' && (
          <OrdersPage
            onSelectOrderForPayment={(ord) => {
              setActivePaymentOrder(ord);
              setCurrentView('payment');
            }}
          />
        )}

        {currentView === 'account' && (
          <AccountPage
            onSelectOrder={(ord) => {
              setActivePaymentOrder(ord);
              setCurrentView('payment');
            }}
            onNavigateToCatalog={() => setCurrentView('catalog')}
          />
        )}

        {currentView === 'admin' && <AdminDashboard />}

        {currentView === 'payment' && activePaymentOrder && (
          <PaymentView
            order={activePaymentOrder}
            onBackToShopping={() => setCurrentView('catalog')}
            onViewOrderDetails={(ord) => {
              setActivePaymentOrder(ord);
              setCurrentView('payment');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenInfo={(type) => setInfoModalType(type)}
        onNavigate={handleNavigate}
      />

      {/* Modals & Drawers */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onDirectBuy={handleDirectBuy}
      />

      <CartDrawer onProceedToPayment={handleProceedToPayment} />

      <AuthModal
        mode={authMode}
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />

      <InfoModals
        type={infoModalType}
        onClose={() => setInfoModalType(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AuthProvider>
  );
}
