import React, { useState } from 'react';
import { Product } from '../types';
import { CardVisual } from './CardVisual';
import { X, ShoppingCart, ShieldCheck, CheckCircle2, Zap, Globe2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onDirectBuy: (product: Product, quantity: number) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onDirectBuy,
}) => {
  const { addItem, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setIsCartOpen(true);
    onClose();
  };

  const handleBuyNow = () => {
    onDirectBuy(product, quantity);
    onClose();
  };

  return (
    <div
      id="product-details-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#141414] border border-[#262626] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#222222] bg-[#111111]">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-600/40">
              {product.brand}
            </span>
            <span className="text-xs text-[#737373] font-mono">ID: {product.id}</span>
          </div>
          <button
            id="close-product-details-btn"
            onClick={onClose}
            className="p-1 rounded text-[#737373] hover:text-white hover:bg-[#1e1e1e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Visual Card Representation */}
            <div className="flex flex-col space-y-3">
              <CardVisual
                brand={product.brand}
                value={product.value}
                region={product.region}
                cardType={product.cardType}
                className="shadow-md"
              />

              <div className="bg-[#181818] border border-[#262626] rounded-md p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[#a3a3a3]">
                  <span>Seller:</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-white">{product.seller}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[#a3a3a3]">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-medium">Verified Active Balance</span>
                </div>
                <div className="flex items-center justify-between text-[#a3a3a3]">
                  <span>Fulfillment Method:</span>
                  <span className="text-emerald-400 font-medium">Digital Instant Reference</span>
                </div>
                <div className="flex items-center justify-between text-[#a3a3a3]">
                  <span>Payment Network:</span>
                  <span className="text-emerald-400 font-mono font-medium">USDT TRC20</span>
                </div>
              </div>
            </div>

            {/* Product Meta & Pricing */}
            <div className="flex flex-col justify-between space-y-3.5">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {product.name}
                </h2>

                <div className="flex items-baseline space-x-2.5 mt-1.5">
                  <span className="text-2xl font-extrabold text-white font-mono">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center space-x-2 text-[#a3a3a3]">
                    <Globe2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Usable Region: <strong className="text-white">{product.region} (Online & In-store where supported)</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-[#a3a3a3]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Status: <strong className="text-emerald-400">Pre-funded & Ready for Activation</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-[#a3a3a3]">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Card Format: <strong className="text-white">{product.cardType} Card</strong></span>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-3 pt-2.5 border-t border-[#222222]">
                  <h4 className="text-xs font-semibold text-[#d1d1d1] uppercase tracking-wider mb-1">
                    Description
                  </h4>
                  <p className="text-xs text-[#8e8e8e] leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Quantity selector & buy buttons */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-[#a3a3a3] font-medium">Quantity:</span>
                  <div className="flex items-center border border-[#262626] rounded bg-[#181818]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2.5 py-1 text-[#737373] hover:text-white hover:bg-[#222222] text-sm"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-mono font-semibold text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2.5 py-1 text-[#737373] hover:text-white hover:bg-[#222222] text-sm"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-[#8e8e8e] font-mono">
                    Total: <strong className="text-white">${(product.price * quantity).toFixed(2)} USDT</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="modal-add-cart-btn"
                    onClick={handleAddToCart}
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-[#202020] hover:bg-[#2a2a2a] text-white border border-[#303030] rounded-md text-xs font-semibold transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    id="modal-buy-now-btn"
                    onClick={handleBuyNow}
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors shadow-md"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Buy Now with USDT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and conditions */}
          <div className="bg-[#181818] border border-[#262626] rounded-md p-3 text-xs text-[#8e8e8e] space-y-1">
            <div className="flex items-center space-x-1.5 text-[#d1d1d1] font-semibold mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Card Terms & Delivery Notice</span>
            </div>
            <p className="text-[11px] leading-normal">{product.terms}</p>
            <p className="text-[10px] text-[#737373] italic mt-1">
              Notice: All cards are securely delivered directly to your account and payment invoice upon admin verification of your USDT TRC20 transfer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
