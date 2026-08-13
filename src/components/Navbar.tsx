import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Wallet,
  LogOut,
  LogIn,
  UserPlus,
  ShoppingBag,
  Menu,
  X,
  Lock,
  Vault,
  HelpCircle,
  Newspaper,
  PhoneCall,
  Bell
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  siteNotice?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  onOpenAuth,
  onLogout,
  siteNotice
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'cards', label: 'CARDS' },
    { id: 'premium', label: 'PREMIUM' },
    { id: 'standard', label: 'STANDARD' },
    { id: 'orders', label: 'ORDERS' },
    { id: 'deposit', label: 'DEPOSIT' },
    { id: 'support', label: 'SUPPORT' },
    { id: 'faq', label: 'FAQ' },
    { id: 'news', label: 'NEWS' },
    { id: 'contact', label: 'CONTACT' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a] border-b border-[#1f1f1f] text-xs font-mono">
      {/* Main Bar */}
      <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded flex items-center justify-center font-bold text-xs text-white shadow-md shadow-blue-900/30 border border-blue-400/40">
              <Vault className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline">
              <span className="font-extrabold text-sm tracking-tight uppercase text-white font-sans">
                CARD<span className="text-blue-500">VAULT</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[9px] text-[#777777] tracking-widest uppercase font-mono">
                TERMINAL
              </span>
            </div>
          </div>

          {/* Desktop Right Side Balance & Auth */}
          <div className="hidden lg:flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3 bg-[#121212] border border-[#222222] px-2.5 py-1">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] uppercase text-[#777777]">Account Balance</span>
                  <span className="text-xs font-mono font-bold text-yellow-500">
                    ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                    <span className="text-[9px] text-blue-400 font-normal">USDT</span>
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('deposit')}
                  className="bg-yellow-600 hover:bg-yellow-500 text-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition"
                >
                  DEPOSIT
                </button>
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative bg-[#151515] hover:bg-[#202020] border border-[#2a2a2a] p-1.5 transition text-[#aaaaaa] hover:text-white"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center border border-[#0a0a0a]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth / Admin actions */}
            {user ? (
              <div className="flex items-center space-x-2">
                {user.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`px-2 py-1 text-[10px] font-bold uppercase border transition ${
                      activeTab === 'admin'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-blue-950/40 text-blue-400 border-blue-800/60 hover:bg-blue-900/40'
                    }`}
                  >
                    <Lock className="w-3 h-3 inline-block mr-1" />
                    ADMIN
                  </button>
                )}

                <div className="flex items-center space-x-2 bg-[#121212] border border-[#222222] px-2 py-1">
                  <span className="text-[10px] text-white font-bold max-w-[100px] truncate">{user.fullName}</span>
                  <button
                    onClick={onLogout}
                    className="text-[#777777] hover:text-red-400 text-[10px] uppercase font-bold pl-1"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5 inline" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="bg-[#151515] border border-[#2a2a2a] px-2.5 py-1 text-[10px] uppercase font-bold text-[#cccccc] hover:text-white hover:bg-[#202020] transition"
                >
                  <LogIn className="w-3 h-3 inline mr-1 text-blue-400" />
                  LOGIN
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider transition"
                >
                  <UserPlus className="w-3 h-3 inline mr-1" />
                  SIGN UP
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu icon */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={onOpenCart}
              className="relative p-1.5 bg-[#151515] border border-[#2a2a2a] text-white"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 bg-[#151515] border border-[#2a2a2a] text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar Links */}
      <div className="bg-[#050505] border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none text-[10px] font-bold text-[#888888] uppercase tracking-wider">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2.5 py-1 transition whitespace-nowrap ${
                    isActive
                      ? 'text-white border-b-2 border-blue-500 font-extrabold bg-[#111111]'
                      : 'hover:text-white hover:bg-[#121212]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0a0a] border-b border-[#1f1f1f] p-4 space-y-3 font-mono">
          {user && (
            <div className="bg-[#121212] p-2 border border-[#222222] flex justify-between items-center mb-2">
              <div>
                <div className="text-[9px] text-[#777777] uppercase">Account Balance</div>
                <div className="text-sm font-bold text-yellow-500">${user.balance.toFixed(2)} USDT</div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('deposit');
                  setMobileMenuOpen(false);
                }}
                className="bg-yellow-600 text-black px-2 py-1 text-[10px] font-bold uppercase"
              >
                Deposit
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1 text-[10px] font-bold uppercase">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`p-2 text-left border ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-[#121212] text-[#888888] border-[#222222]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {!user ? (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="bg-[#151515] border border-[#2a2a2a] py-2 text-[10px] font-bold text-white uppercase"
              >
                Login
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register');
                  setMobileMenuOpen(false);
                }}
                className="bg-blue-600 py-2 text-[10px] font-bold text-white uppercase"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-red-950/40 border border-red-800/40 text-red-400 py-2 text-[10px] font-bold uppercase"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
};
