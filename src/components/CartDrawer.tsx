import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Wallet } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Order } from '../types';

interface CartDrawerProps {
  onProceedToPayment: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToPayment }) => {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, clearCart, totalUSD, totalUSDT } = useCart();
  const { user } = useAuth();

  const [email, setEmail] = useState(user ? user.email : '');
  const [name, setName] = useState(user ? user.fullName : '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isCartOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    const customerEmail = user ? user.email : email;
    if (!customerEmail || !customerEmail.includes('@')) {
      setError('Please provide a valid email address for delivery confirmation');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const orderPayload = {
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        customerEmail,
        customerName: user ? user.fullName : (name || 'Guest Customer'),
        customerNotes: notes,
      };

      const order = await api.createOrder(orderPayload);
      clearCart();
      setIsCartOpen(false);
      onProceedToPayment(order);
    } catch (err: any) {
      setError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="cart-overlay"
      className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex justify-end select-none"
      onClick={() => setIsCartOpen(false)}
    >
      <div
        id="cart-drawer-panel"
        className="w-full max-w-md bg-[#141414] border-l border-[#262626] h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#222222] bg-[#111111]">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-bold text-white tracking-wide uppercase">
              Shopping Cart ({items.length})
            </h2>
          </div>
          <button
            id="close-cart-btn"
            onClick={() => setIsCartOpen(false)}
            className="p-1 rounded text-[#737373] hover:text-white hover:bg-[#1e1e1e]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded text-xs">
              {error}
            </div>
          )}

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-[#737373] space-y-3">
              <ShoppingBag className="w-10 h-10 text-[#525252] stroke-[1.5]" />
              <p className="text-xs font-medium text-[#d1d1d1]">Your cart is currently empty</p>
              <p className="text-[11px] text-[#737373] max-w-[200px]">
                Browse our cards and add items to your cart.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
              >
                Browse Cards
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="bg-[#181818] border border-[#262626] rounded-md p-2.5 flex items-center space-x-3"
              >
                {/* Brand mini badge */}
                <div className="w-11 h-8 rounded bg-[#101010] border border-[#282828] flex flex-col items-center justify-center p-1 text-center shrink-0">
                  <span className="text-[9px] font-bold text-blue-400 uppercase leading-none">
                    {item.product.brand.substring(0, 4)}
                  </span>
                  <span className="text-[8px] text-[#737373] font-mono mt-0.5">
                    {item.product.region}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">
                    {item.product.name}
                  </h4>
                  <div className="text-[10px] text-[#8e8e8e] font-mono mt-0.5">
                    ${item.product.price.toFixed(2)} each · {item.product.region}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-1 border border-[#262626] rounded bg-[#111111] px-1 py-0.5">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="px-1.5 text-[#737373] hover:text-white text-xs"
                  >
                    -
                  </button>
                  <span className="px-1 text-xs font-mono font-bold text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="px-1.5 text-[#737373] hover:text-white text-xs"
                  >
                    +
                  </button>
                </div>

                {/* Total & Delete */}
                <div className="text-right">
                  <div className="text-xs font-bold text-white font-mono">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-[#737373] hover:text-rose-400 p-0.5 text-[11px]"
                    title="Remove item"
                  >
                    <Trash2 className="w-3 h-3 inline" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Form & Summary */}
        {items.length > 0 && (
          <div className="border-t border-[#222222] bg-[#111111] p-4 space-y-3">
            {/* Customer information input for non-logged in users */}
            {!user && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#d1d1d1] block">
                  Delivery Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#181818] border border-[#262626] rounded px-3 py-1.5 text-xs text-white placeholder-[#525252] focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Price Summary */}
            <div className="space-y-1 text-xs pt-1 border-t border-[#222222]">
              <div className="flex justify-between text-[#8e8e8e]">
                <span>Subtotal (USD):</span>
                <span className="font-mono text-white">${totalUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8e8e8e]">
                <span>Payment Method:</span>
                <span className="font-medium text-emerald-400 font-mono">USDT TRC20</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-[#222222]">
                <span>Total Due:</span>
                <span className="text-emerald-400 font-mono">${totalUSDT.toFixed(2)} USDT</span>
              </div>
            </div>

            {/* Payment security badge */}
            <div className="flex items-center space-x-1.5 text-[10px] text-[#8e8e8e] bg-[#181818] p-2 rounded border border-[#262626]">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Direct TRC20 merchant settlement with TXID verification.</span>
            </div>

            {/* Checkout Action Button */}
            <button
              id="proceed-to-payment-btn"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white rounded-md text-xs font-semibold tracking-wide flex items-center justify-center space-x-2 transition-colors shadow"
            >
              {loading ? (
                <span>Generating Order...</span>
              ) : (
                <>
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Proceed to USDT TRC20 Payment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
