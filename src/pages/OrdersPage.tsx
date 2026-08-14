import React, { useState, useEffect } from 'react';
import { Order, PaymentStatus } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { DeliveredCardDisplay } from '../components/DeliveredCardDisplay';
import { PackageCheck, Search, Clock, CheckCircle2, XCircle, ArrowRight, RefreshCw, Copy, ExternalLink, ShieldCheck } from 'lucide-react';

interface OrdersPageProps {
  onSelectOrderForPayment: (order: Order) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onSelectOrderForPayment }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [guestLookupId, setGuestLookupId] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (user) {
        const data = await api.getMyOrders();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleGuestLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestLookupId.trim()) return;
    try {
      setLookupLoading(true);
      setLookupError('');
      const ord = await api.getOrder(guestLookupId.trim().toUpperCase());
      setOrders([ord]);
    } catch (err: any) {
      setLookupError(err.message || 'Order not found. Please check your Order ID.');
    } finally {
      setLookupLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'All' && o.paymentStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        (o.transactionHash && o.transactionHash.toLowerCase().includes(q)) ||
        o.items.some(i => i.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
      case 'Pending Verification':
      case 'Payment Submitted':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-700 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{status}</span>
          </span>
        );
      case 'Rejected':
      case 'Cancelled':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-700 text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-950/80 text-blue-300 border border-blue-700 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Awaiting Payment</span>
          </span>
        );
    }
  };

  return (
    <div id="orders-page-container" className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-3.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <PackageCheck className="w-5 h-5 text-blue-400" />
            <span>My Orders & Payment Invoices</span>
          </h1>
          <p className="text-xs text-[#8e8e8e] mt-0.5">
            Track USDT TRC20 payment verifications and access delivered prepaid card details
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#161616] hover:bg-[#202020] border border-[#262626] text-xs font-medium text-[#d1d1d1] rounded transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Guest Lookup Box if not logged in */}
      {!user && (
        <div className="bg-[#141414] border border-[#262626] rounded-md p-3.5 space-y-2.5">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span>Track Guest Order by ID</span>
          </div>
          <form onSubmit={handleGuestLookup} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Order ID (e.g. ORD-98241)..."
              value={guestLookupId}
              onChange={(e) => setGuestLookupId(e.target.value)}
              className="flex-1 bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-xs font-mono text-white placeholder-[#525252] focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={lookupLoading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold disabled:opacity-50"
            >
              {lookupLoading ? 'Searching...' : 'Lookup Order'}
            </button>
          </form>
          {lookupError && (
            <p className="text-xs text-rose-400">{lookupError}</p>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1">
          {['All', 'Awaiting Payment', 'Pending Verification', 'Paid', 'Completed', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-xs font-medium border whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-[#161616] text-[#a3a3a3] border-[#262626] hover:bg-[#202020] hover:text-white'
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
            placeholder="Search orders or TXID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161616] border border-[#262626] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#525252] focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#737373] space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
          <span className="text-xs">Loading order records...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#141414] border border-[#262626] rounded-lg p-10 text-center text-[#737373] space-y-2.5">
          <PackageCheck className="w-8 h-8 text-[#525252] mx-auto" />
          <p className="text-xs font-semibold text-[#d1d1d1]">No orders found</p>
          <p className="text-[11px] text-[#737373]">
            {user ? "You haven't placed any orders matching this filter yet." : "Enter your Order ID above to track your payment status."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-[#141414] border border-[#262626] rounded-md overflow-hidden shadow-sm hover:border-[#333333] transition-all"
            >
              {/* Order Header */}
              <div className="bg-[#101010] border-b border-[#222222] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-extrabold text-white font-mono text-xs">{ord.id}</span>
                  <span className="text-[#737373] text-[11px]">
                    {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-[#737373] text-[10px] block">TOTAL AMOUNT</span>
                    <span className="text-xs font-black text-emerald-400 font-mono">
                      ${ord.totalUSDT.toFixed(2)} USDT
                    </span>
                  </div>
                  {getStatusBadge(ord.paymentStatus)}
                </div>
              </div>

              {/* Order Items & TXID */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Items */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider">
                      Purchased Cards:
                    </div>
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-[#101010] border border-[#222222] rounded p-2 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-blue-400 font-mono text-[10px] px-1 py-0.5 rounded bg-blue-950/80 border border-blue-800/60">
                            {item.brand}
                          </span>
                          <div>
                            <span className="font-semibold text-white text-xs">{item.name}</span>
                            <span className="text-[#737373] text-[10px] block">
                              Region: {item.region} · Type: {item.cardType || 'Prepaid'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <div className="text-white font-bold text-xs">{item.quantity}x @ ${item.price.toFixed(2)}</div>
                          <div className="text-[10px] text-[#737373]">${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Details & TXID */}
                  <div className="bg-[#101010] border border-[#222222] rounded p-2.5 text-xs space-y-2 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider">
                        Payment Information (TRC20):
                      </div>
                      <div className="text-[#d1d1d1] flex justify-between text-[11px]">
                        <span className="text-[#737373]">Method:</span>
                        <span className="font-mono text-emerald-400 font-medium">USDT on TRON</span>
                      </div>
                      <div className="text-[#d1d1d1] flex justify-between text-[11px]">
                        <span className="text-[#737373]">Customer:</span>
                        <span className="text-white truncate max-w-[180px]">{ord.userEmail}</span>
                      </div>
                      <div className="text-[#d1d1d1] space-y-0.5 pt-1">
                        <span className="text-[#737373] block text-[10px]">Submitted TXID:</span>
                        {ord.transactionHash ? (
                          <div className="bg-[#181818] border border-[#262626] p-1.5 rounded font-mono text-[10px] text-[#d1d1d1] break-all select-all flex items-center justify-between">
                            <span className="truncate">{ord.transactionHash}</span>
                            <a
                              href={`https://tronscan.org/#/transaction/${ord.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 p-0.5 shrink-0"
                              title="View on TronScan"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-amber-400 italic text-[10px]">
                            No TXID submitted yet. Complete transfer to start verification.
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      id={`view-payment-${ord.id}`}
                      onClick={() => onSelectOrderForPayment(ord)}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow mt-2"
                    >
                      <span>
                        {ord.paymentStatus === 'Awaiting Payment' ? 'Pay with USDT TRC20' : 'View Payment Invoice'}
                      </span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Delivered Cards Information if fulfilled */}
                {ord.deliveredCards && ord.deliveredCards.length > 0 && (
                  <DeliveredCardDisplay
                    cards={ord.deliveredCards}
                    deliveryNotes={ord.deliveryNotes}
                    orderId={ord.id}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
