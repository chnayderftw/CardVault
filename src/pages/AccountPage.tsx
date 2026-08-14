import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Order } from '../types';
import { User, Mail, Calendar, Package, LogOut, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface AccountPageProps {
  onSelectOrder: (order: Order) => void;
  onNavigateToCatalog: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onSelectOrder, onNavigateToCatalog }) => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const data = await api.getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders in account:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) loadOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 bg-[#161a23] border border-[#273042] rounded-xl p-8 text-center space-y-4">
        <User className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Please Log In</h2>
        <p className="text-xs text-slate-400">
          You need to be logged in to view your CardVault user account details.
        </p>
        <button
          onClick={onNavigateToCatalog}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const completedOrders = orders.filter(o => o.paymentStatus === 'Paid' || o.paymentStatus === 'Completed');
  const pendingOrders = orders.filter(o => o.paymentStatus === 'Pending Verification' || o.paymentStatus === 'Awaiting Payment');
  const totalSpent = completedOrders.reduce((sum, o) => sum + o.totalUSDT, 0);

  return (
    <div id="account-page-container" className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Header Profile Card */}
      <div className="bg-[#141414] border border-[#262626] rounded-lg p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center space-x-4">
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-900 border border-blue-500/40 flex items-center justify-center text-white text-lg font-black shadow-inner">
            {user.fullName.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white">{user.fullName}</h1>
              {user.role === 'admin' && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold tracking-wider uppercase">
                  ADMINISTRATOR
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-[#8e8e8e]">
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-[#737373]" />
                <span>{user.email}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-[#737373]" />
                <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#181818] hover:bg-rose-950/60 hover:text-rose-300 border border-[#262626] text-xs font-semibold text-[#d1d1d1] rounded transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Account Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#141414] border border-[#262626] rounded-md p-3.5 space-y-0.5">
          <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">
            TOTAL ORDERS PLACED
          </span>
          <div className="text-xl font-bold text-white font-mono">{orders.length}</div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-md p-3.5 space-y-0.5">
          <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">
            ACTIVE / PENDING ORDERS
          </span>
          <div className="text-xl font-bold text-amber-400 font-mono">{pendingOrders.length}</div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-md p-3.5 space-y-0.5">
          <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">
            TOTAL VALUE BOUGHT
          </span>
          <div className="text-xl font-bold text-emerald-400 font-mono">${totalSpent.toFixed(2)} USDT</div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-[#141414] border border-[#262626] rounded-md overflow-hidden shadow-sm">
        <div className="bg-[#101010] border-b border-[#222222] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              Recent Order History
            </h3>
          </div>
          <span className="text-[11px] text-[#737373] font-mono">
            {orders.length} records
          </span>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8 text-xs text-[#737373]">Loading order history...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-[#737373] space-y-2">
              <p className="text-xs">No orders recorded yet.</p>
              <button
                onClick={onNavigateToCatalog}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => onSelectOrder(ord)}
                  className="bg-[#101010] hover:bg-[#181818] border border-[#222222] hover:border-[#333333] rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white font-mono text-xs">{ord.id}</span>
                      <span className="text-[11px] text-[#737373]">
                        ({new Date(ord.createdAt).toLocaleDateString()})
                      </span>
                    </div>
                    <div className="text-xs text-[#d1d1d1]">
                      {ord.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400 font-mono block">
                        ${ord.totalUSDT.toFixed(2)} USDT
                      </span>
                      <span className="text-[10px] text-[#737373] font-mono">
                        Status: {ord.paymentStatus}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#737373]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
