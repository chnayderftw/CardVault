import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Zap, Wallet, ShieldCheck, ArrowRight, Copy, Check } from 'lucide-react';
import { CardProduct, Order, User, SiteSettings } from '../types';
import { api } from '../lib/api';

interface CartModalProps {
  cart: { product: CardProduct; quantity: number }[];
  user: User | null;
  settings: SiteSettings;
  onClose: () => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOpenAuth: () => void;
  onOrderCreated: (order: Order) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  cart,
  user,
  settings,
  onClose,
  onRemoveItem,
  onClearCart,
  onOpenAuth,
  onOrderCreated
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'usdt'>('usdt');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const walletAddress = settings.trc20WalletAddress || 'TG1LiM1h3iLf654gAx1msadrDf65q2AbAC';

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckout = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (cart.length === 0) return;

    if (paymentMethod === 'usdt' && (!txHash.trim() || txHash.trim().length < 8)) {
      setError('Please enter a valid TRC20 Transaction Hash (TXID).');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Process checkout for each cart item
      for (const item of cart) {
        const order = await api.createOrder({
          productId: item.product.id,
          quantity: item.quantity,
          paymentMethod,
          txHash: paymentMethod === 'usdt' ? txHash.trim() : undefined
        });
        onOrderCreated(order);
      }
      onClearCart();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
      <div className="w-full max-w-xl bg-[#0a0a0a] border border-[#1f1f1f] text-xs text-[#e0e0e0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-[#111111] border-b border-[#1f1f1f]">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-xs uppercase tracking-wider text-white">SHOPPING CART ORDER REVIEW</span>
          </div>
          <button onClick={onClose} className="text-[#888888] hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="bg-red-950/40 border border-red-800/60 p-2.5 text-red-400 text-[11px]">
              {error}
            </div>
          )}

          {cart.length === 0 ? (
            <div className="py-12 text-center text-[#666666] space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto opacity-30" />
              <p>Your marketplace shopping cart is currently empty.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="bg-[#121212] border border-[#222222] p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="text-white font-bold">{product.name}</div>
                    <div className="text-[10px] text-[#777777]">
                      {product.brand} • BIN {product.bin} • {product.level}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-yellow-500 font-bold">${(product.price * quantity).toFixed(2)}</div>
                      <div className="text-[9px] text-[#666666]">Qty: {quantity}</div>
                    </div>
                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="text-[#777777] hover:text-red-400 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[#1f1f1f]">
              <div className="text-[10px] uppercase font-bold text-[#777777]">SELECT PAYMENT SETTLEMENT MODE</div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('balance')}
                  className={`p-2.5 border text-left transition ${
                    paymentMethod === 'balance'
                      ? 'bg-blue-600/10 border-blue-500 text-white'
                      : 'bg-[#121212] border-[#222222] text-[#888888] hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold text-xs">
                    <Wallet className="w-3.5 h-3.5 text-yellow-500" />
                    <span>ACCOUNT BALANCE</span>
                  </div>
                  <div className="text-[9px] text-[#666666] mt-1">
                    Available: {user ? `$${user.balance.toFixed(2)} USDT` : 'Sign in required'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('usdt')}
                  className={`p-2.5 border text-left transition ${
                    paymentMethod === 'usdt'
                      ? 'bg-blue-600/10 border-blue-500 text-white'
                      : 'bg-[#121212] border-[#222222] text-[#888888] hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold text-xs">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span>USDT TRC20 DIRECT</span>
                  </div>
                  <div className="text-[9px] text-[#666666] mt-1">
                    Instant TRON Blockchain Invoice
                  </div>
                </button>
              </div>

              {paymentMethod === 'usdt' && (
                <div className="bg-[#121212] border border-blue-900/40 p-3 space-y-2 mt-2">
                  <div className="text-[9px] font-bold text-blue-400 uppercase">
                    TRC20 WALLET ADDRESS (TRON NETWORK)
                  </div>
                  <div className="flex items-center space-x-2 bg-[#050505] border border-[#2a2a2a] p-2">
                    <span className="font-mono text-xs text-emerald-400 font-bold break-all flex-1 select-all">
                      {walletAddress}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className={`px-2.5 py-1 text-[9px] font-bold uppercase transition flex items-center space-x-1 shrink-0 ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>COPY ADDRESS</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-bold uppercase text-white block">
                      TRANSACTION HASH (TXID) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Paste your 64-character TRC20 TXID hash here..."
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      className="w-full bg-[#050505] border border-[#2a2a2a] focus:border-blue-500 p-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-3 bg-[#111111] border-t border-[#1f1f1f] flex items-center justify-between">
            <div>
              <span className="text-[9px] text-[#777777] block uppercase">Total Amount</span>
              <span className="text-base font-bold text-yellow-500">${totalPrice.toFixed(2)} USD</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onClearCart}
                className="px-2.5 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] text-[#888888] hover:text-white font-bold text-[10px] uppercase"
              >
                Clear
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-bold uppercase py-1.5 px-4 text-xs tracking-wider transition flex items-center space-x-1"
              >
                <span>{loading ? 'PROCESSING...' : user ? 'CONFIRM ORDER' : 'LOGIN TO CHECKOUT'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
