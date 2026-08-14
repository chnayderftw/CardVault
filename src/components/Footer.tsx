import React from 'react';
import { CreditCard, Wallet } from 'lucide-react';

interface FooterProps {
  onOpenInfo: (type: 'faq' | 'terms' | 'privacy' | 'payment_guide') => void;
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenInfo, onNavigate }) => {
  return (
    <footer className="bg-[#0e0e0e] border-t border-[#222222] text-[#8e8e8e] text-xs py-7 mt-10 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Brand Col */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                Card<span className="text-blue-400">Vault</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Marketplace
            </h4>
            <ul className="space-y-1 text-[11px]">
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-blue-400 transition-colors">
                  Cards Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('orders')} className="hover:text-blue-400 transition-colors">
                  Track Order / Invoice
                </button>
              </li>
              <li>
                <button onClick={() => onOpenInfo('payment_guide')} className="hover:text-blue-400 text-emerald-400 flex items-center space-x-1 transition-colors">
                  <Wallet className="w-3 h-3" />
                  <span>USDT TRC20 Guide</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Legal & Policies
            </h4>
            <ul className="space-y-1 text-[11px]">
              <li>
                <button onClick={() => onOpenInfo('faq')} className="hover:text-blue-400 transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onOpenInfo('terms')} className="hover:text-blue-400 transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onOpenInfo('privacy')} className="hover:text-blue-400 transition-colors">
                  Privacy & Data Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-3.5 border-t border-[#1f1f1f] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#737373] gap-2">
          <div>© 2026 CardVault Marketplace. All rights reserved.</div>
          <div className="flex items-center space-x-4">
            <span>Payment Network: TRON TRC20 (USDT)</span>
            <span>24/7 Verified Order Fulfillment</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
