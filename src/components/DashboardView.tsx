import React from 'react';
import {
  CreditCard,
  Zap,
  ShoppingBag,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Radio,
  ArrowRight,
  Award,
  Lock,
  Globe
} from 'lucide-react';
import { CardProduct, User, Announcement, SiteSettings } from '../types';

interface DashboardViewProps {
  user: User | null;
  products: CardProduct[];
  announcements: Announcement[];
  settings: SiteSettings;
  onNavigate: (tab: string) => void;
  onSelectProduct: (product: CardProduct) => void;
  onAddToCart: (product: CardProduct) => void;
  onBuyNow: (product: CardProduct) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  products,
  announcements,
  settings,
  onNavigate,
  onSelectProduct,
  onAddToCart,
  onBuyNow
}) => {
  const featuredProducts = products.filter(p => p.isFeatured || p.isPremium).slice(0, 4);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Marketplace Overview Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[#0a0a0a] p-4 border border-[#1f1f1f] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight uppercase">INVENTORY MARKETPLACE TERMINAL</h2>
            <span className="bg-blue-600/20 text-blue-400 text-[9px] font-bold px-1.5 py-0.5 border border-blue-500/30">
              v3.8 PRO
            </span>
          </div>
          <p className="text-[10px] text-[#777777] uppercase mt-0.5">
            Real-time inventory of verified virtual & gift prepaid solutions with 3DS support
          </p>
        </div>

        <div className="flex space-x-2 self-stretch md:self-auto justify-between">
          <div className="bg-[#101010] border border-[#1f1f1f] px-3 py-1.5 flex flex-col justify-center">
            <span className="text-[8px] uppercase text-[#666666]">System Status</span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>OPERATIONAL</span>
            </span>
          </div>
          <div className="bg-[#101010] border border-[#1f1f1f] px-3 py-1.5 flex flex-col justify-center">
            <span className="text-[8px] uppercase text-[#666666]">Market Volume</span>
            <span className="text-[10px] text-blue-400 font-bold">+12.4% / 24H</span>
          </div>
        </div>
      </div>

      {/* Account Balance & Quick Actions Banner */}
      {user ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-4 flex flex-col justify-between space-y-2">
            <span className="text-[9px] text-[#777777] uppercase">ACCOUNT BALANCE</span>
            <div className="text-xl font-bold text-yellow-500">
              ${user.balance.toFixed(2)} <span className="text-xs text-blue-400">USDT</span>
            </div>
            <button
              onClick={() => onNavigate('deposit')}
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase py-1 text-[10px] tracking-wider transition"
            >
              TOP UP BALANCE
            </button>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-4 flex flex-col justify-between space-y-2">
            <span className="text-[9px] text-[#777777] uppercase">ACTIVE ORDERS</span>
            <div className="text-xl font-bold text-white">0 PENDING</div>
            <button
              onClick={() => onNavigate('orders')}
              className="bg-[#151515] hover:bg-[#202020] border border-[#2a2a2a] text-white font-bold uppercase py-1 text-[10px] tracking-wider transition"
            >
              VIEW ORDER LOGS
            </button>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-4 flex flex-col justify-between space-y-2">
            <span className="text-[9px] text-[#777777] uppercase">SECURITY CLEARANCE</span>
            <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4" />
              <span>LEVEL 3 VERIFIED</span>
            </div>
            <button
              onClick={() => onNavigate('support')}
              className="bg-[#151515] hover:bg-[#202020] border border-[#2a2a2a] text-white font-bold uppercase py-1 text-[10px] tracking-wider transition"
            >
              CLIENT DESK
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border border-blue-500/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-white uppercase text-xs">ENTERPRISE CLIENT ACCESS</h3>
            <p className="text-[10px] text-[#888888]">
              Sign in or register an account to access instant TRC20 card purchases and dedicated inventory allocations.
            </p>
          </div>
          <button
            onClick={() => onNavigate('cards')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase py-2 px-6 text-xs whitespace-nowrap transition"
          >
            EXPLORE MARKETPLACE
          </button>
        </div>
      )}

      {/* Featured Offers & Quick Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-2">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>FEATURED & PREMIUM CARD INVENTORY</span>
          </h3>
          <button
            onClick={() => onNavigate('cards')}
            className="text-blue-400 hover:underline text-[10px] font-bold uppercase flex items-center space-x-1"
          >
            <span>VIEW ALL INVENTORY</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProduct(p)}
              className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-blue-500/60 p-3 flex flex-col justify-between transition cursor-pointer group space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-blue-400 uppercase bg-blue-950/40 px-1.5 py-0.5 border border-blue-800/40">
                    BIN {p.bin}
                  </span>
                  {p.isPremium && (
                    <span className="text-[8px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.5 border border-amber-400/30 uppercase">
                      PREMIUM
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-white text-xs group-hover:text-blue-400 transition truncate">
                    {p.name}
                  </h4>
                  <span className="text-[10px] text-[#777777] block">{p.issuer}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a] text-[10px]">
                  <div>
                    <span className="text-[8px] text-[#666666] block">LEVEL</span>
                    <span className="text-blue-400 font-bold">{p.level}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-[#666666] block">PRICE</span>
                    <span className="text-yellow-500 font-bold">${p.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-1 pt-2 border-t border-[#1f1f1f]" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onAddToCart(p)}
                  className="p-1.5 bg-[#151515] hover:bg-[#202020] text-amber-400 border border-[#2a2a2a] transition"
                  title="Add to Cart"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onBuyNow(p)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 text-[10px] uppercase transition"
                >
                  BUY NOW
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcements & USDT TRC20 Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Important Announcements */}
        <div className="bg-[#0a0a0a] border border-blue-500/30 p-3 flex items-start space-x-3">
          <div className="bg-blue-600/20 p-2 text-blue-400 border border-blue-500/30 flex-shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <h4 className="text-[10px] font-bold uppercase text-blue-400 mb-1">IMPORTANT ANNOUNCEMENT</h4>
            {announcements.length > 0 ? (
              <p className="text-[11px] text-[#888888] leading-tight">
                {announcements[0].title}: {announcements[0].content}
              </p>
            ) : (
              <p className="text-[11px] text-[#888888] leading-tight">
                New batch of United Kingdom & US Business Mastercards added to inventory. High 3DS authorization success rate.
              </p>
            )}
          </div>
        </div>

        {/* USDT TRC20 Quick Deposit Bar */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-3 flex flex-col justify-center space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-[#777777]">USDT TRC-20 QUICK DEPOSIT STATUS</span>
            <span className="text-[9px] text-blue-400 font-mono">
              {settings.trc20WalletAddress.substring(0, 6)}...{settings.trc20WalletAddress.slice(-4)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 flex-1 bg-[#151515] border border-[#2a2a2a]">
              <div className="h-full bg-blue-600 w-3/4"></div>
            </div>
            <span className="text-[10px] font-mono text-[#888888]">19 CONFIRMS VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
