import React, { useState } from 'react';
import { CreditCard, ShoppingCart, User as UserIcon, Shield, Menu, X, ArrowRight, Wallet, PackageCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, extra?: any) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, logout, isAdmin } = useAuth();
  const { totalCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#121212] border-b border-[#262626] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand / Logo */}
          <div className="flex items-center space-x-3">
            <button
              id="navbar-logo-btn"
              onClick={() => handleNavClick('catalog')}
              className="flex items-center space-x-2 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-500 transition-colors">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white flex items-center">
                  Card<span className="text-blue-400">Vault</span>
                </span>
                <span className="text-[9px] text-[#737373] font-mono -mt-1 tracking-wider uppercase">
                  Card Marketplace
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-medium">
            <button
              id="nav-link-products"
              onClick={() => handleNavClick('catalog')}
              className={`px-3 py-1.5 rounded transition-colors ${
                currentView === 'catalog'
                  ? 'bg-[#1e1e1e] text-blue-400 font-semibold'
                  : 'text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              Products
            </button>

            <button
              id="nav-link-categories"
              onClick={() => handleNavClick('catalog')}
              className={`px-3 py-1.5 rounded transition-colors ${
                currentView === 'categories'
                  ? 'bg-[#1e1e1e] text-blue-400 font-semibold'
                  : 'text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              Categories
            </button>

            <button
              id="nav-link-orders"
              onClick={() => {
                if (user) {
                  handleNavClick('orders');
                } else {
                  onOpenAuth('login');
                }
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
                currentView === 'orders'
                  ? 'bg-[#1e1e1e] text-blue-400 font-semibold'
                  : 'text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>My Orders</span>
            </button>

            <button
              id="nav-link-payments"
              onClick={() => handleNavClick('payments_info')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
                currentView === 'payments_info'
                  ? 'bg-[#1e1e1e] text-blue-400 font-semibold'
                  : 'text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>USDT TRC20</span>
            </button>

            {isAdmin && (
              <button
                id="nav-link-admin"
                onClick={() => handleNavClick('admin')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded border border-amber-500/40 text-amber-300 bg-amber-950/30 hover:bg-amber-900/40 transition-colors text-xs font-semibold`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center space-x-2.5">
            {/* Cart Button */}
            <button
              id="navbar-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#a3a3a3] hover:text-white hover:bg-[#1e1e1e] rounded-md transition-colors flex items-center border border-[#262626]"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Auth / Account */}
            {user ? (
              <div className="relative">
                <button
                  id="navbar-user-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 pl-2.5 bg-[#161616] hover:bg-[#202020] border border-[#262626] rounded-md text-xs text-[#d1d1d1] transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-medium max-w-[100px] truncate">{user.fullName.split(' ')[0]}</span>
                  {user.role === 'admin' && (
                    <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1 py-0.2 rounded border border-amber-500/40">Admin</span>
                  )}
                </button>

                {userDropdownOpen && (
                  <div
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-48 bg-[#161616] border border-[#262626] rounded-md shadow-xl py-1 z-50 text-xs"
                  >
                    <div className="px-3 py-2 border-b border-[#262626] text-[#a3a3a3]">
                      <p className="font-semibold text-white truncate">{user.fullName}</p>
                      <p className="truncate text-[10px] text-[#737373]">{user.email}</p>
                    </div>

                    <button
                      onClick={() => handleNavClick('account')}
                      className="w-full text-left px-3 py-2 text-[#d1d1d1] hover:bg-[#222222] flex items-center justify-between"
                    >
                      <span>My Account</span>
                      <ArrowRight className="w-3 h-3 text-[#737373]" />
                    </button>

                    <button
                      onClick={() => handleNavClick('orders')}
                      className="w-full text-left px-3 py-2 text-[#d1d1d1] hover:bg-[#222222] flex items-center justify-between"
                    >
                      <span>Order History</span>
                      <ArrowRight className="w-3 h-3 text-[#737373]" />
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full text-left px-3 py-2 text-amber-300 hover:bg-amber-950/50 flex items-center justify-between"
                      >
                        <span>Admin Dashboard</span>
                        <Shield className="w-3 h-3 text-amber-400" />
                      </button>
                    )}

                    <div className="border-t border-[#262626] my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/40"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  id="navbar-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-[#d1d1d1] hover:text-white bg-[#161616] hover:bg-[#222222] border border-[#262626] rounded transition-colors"
                >
                  Login
                </button>
                <button
                  id="navbar-signup-btn"
                  onClick={() => onOpenAuth('signup')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors shadow-sm"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              id="navbar-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] rounded"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#121212] border-b border-[#262626] px-4 py-3 space-y-2 text-sm">
          <button
            onClick={() => handleNavClick('catalog')}
            className="w-full text-left py-2 px-3 rounded text-[#d1d1d1] hover:bg-[#1f1f1f]"
          >
            Products Catalog
          </button>
          <button
            onClick={() => {
              if (user) handleNavClick('orders');
              else onOpenAuth('login');
            }}
            className="w-full text-left py-2 px-3 rounded text-[#d1d1d1] hover:bg-[#1f1f1f]"
          >
            My Orders
          </button>
          <button
            onClick={() => handleNavClick('payments_info')}
            className="w-full text-left py-2 px-3 rounded text-emerald-400 hover:bg-[#1f1f1f]"
          >
            USDT TRC20 Payments
          </button>
          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full text-left py-2 px-3 rounded text-amber-300 bg-amber-950/30 border border-amber-500/30"
            >
              Admin Panel
            </button>
          )}
        </div>
      )}
    </header>
  );
};
