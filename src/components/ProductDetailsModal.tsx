import React, { useState } from 'react';
import { X, ShieldCheck, ShoppingBag, Zap, Globe, Building, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CardProduct, User } from '../types';
import { CardBrandLogo } from './CardBrandLogo';

interface ProductDetailsModalProps {
  product: CardProduct | null;
  user: User | null;
  onClose: () => void;
  onAddToCart: (product: CardProduct) => void;
  onBuyNow: (product: CardProduct) => void;
  onOpenAuth: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  user,
  onClose,
  onAddToCart,
  onBuyNow,
  onOpenAuth
}) => {
  if (!product) return null;

  const isVisa = product.brand.toLowerCase().includes('visa');
  const isMaster = product.brand.toLowerCase().includes('master');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
      <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#1f1f1f] text-xs text-[#e0e0e0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-[#111111] border-b border-[#1f1f1f]">
          <div className="flex items-center space-x-2.5">
            <CardBrandLogo brand={product.brand} size="sm" />
            <span className="font-bold text-xs uppercase tracking-wider text-white truncate max-w-[240px]">
              {product.name}
            </span>
          </div>
          <button onClick={onClose} className="text-[#888888] hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Card Preview Banner */}
          <div className="bg-gradient-to-br from-[#181818] to-[#0c0c0c] border border-[#2a2a2a] p-4 flex flex-col justify-between h-40 relative overflow-hidden rounded-lg shadow-xl">
            <div className="flex justify-between items-start z-10">
              <div className="space-y-1">
                <CardBrandLogo brand={product.brand} size="lg" />
                <span className="text-[9px] text-[#888888] uppercase block tracking-wider pt-1">{product.issuer}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-yellow-500 font-mono block">
                  BIN {product.bin}
                </span>
                <span className="text-[9px] text-[#777777] block">{product.country}</span>
              </div>
            </div>

            <div className="flex justify-between items-end z-10">
              <div>
                <span className="text-[8px] text-[#666666] uppercase block">Card Type & Level</span>
                <span className="text-xs font-bold text-blue-400">
                  {product.cardType} • {product.level}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[8px] text-[#666666] uppercase block">PURCHASE PRICE</span>
                <span className="text-base font-bold text-yellow-500 font-mono">${product.price.toFixed(2)} USDT</span>
              </div>
            </div>
          </div>

          {/* Technical Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#121212] p-3 border border-[#222222]">
            <div>
              <span className="text-[8px] text-[#777777] block uppercase">BIN / IIN PREFIX</span>
              <span className="text-white font-mono font-bold text-xs">{product.bin}</span>
            </div>
            <div>
              <span className="text-[8px] text-[#777777] block uppercase">ISSUING INSTITUTION</span>
              <span className="text-white font-bold text-xs truncate block">{product.issuer}</span>
            </div>
            <div>
              <span className="text-[8px] text-[#777777] block uppercase">COUNTRY REGION</span>
              <span className="text-white font-bold text-xs">{product.country}</span>
            </div>
            <div>
              <span className="text-[8px] text-[#777777] block uppercase">CURRENCY DENOMINATION</span>
              <span className="text-white font-bold text-xs">{product.currency}</span>
            </div>
            <div>
              <span className="text-[8px] text-[#777777] block uppercase">MARKETPLACE PRICE</span>
              <span className="text-yellow-500 font-bold text-xs">${product.price.toFixed(2)} USDT</span>
            </div>
            <div>
              <span className="text-[8px] text-[#777777] block uppercase">AVAILABILITY STOCK</span>
              <span className={`font-bold text-xs ${product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {product.stock > 0 ? `${product.stock} AVAILABLE` : 'SOLD OUT'}
              </span>
            </div>
          </div>

          {/* Product Description */}
          <div className="space-y-1">
            <span className="text-[9px] uppercase text-[#777777] block font-bold">SPECIFICATIONS & USAGE SCOPE</span>
            <p className="text-[11px] text-[#cbd5e1] leading-relaxed bg-[#121212] p-2.5 border border-[#222222]">
              {product.description || 'Verified enterprise virtual reloadable card. Supports 3DS OTP passcodes.'}
            </p>
          </div>

          {/* Compliance Banner */}
          <div className="bg-blue-950/20 border border-blue-800/40 p-3 space-y-1">
            <div className="flex items-center space-x-1.5 text-blue-400 font-bold text-[10px] uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>COMPLIANCE & LEGAL ASSURANCE</span>
            </div>
            <p className="text-[10px] text-[#888888] leading-tight">
              All listed products are legally issued by regulated banking partners. 100% replacement guarantee for unworkable BIN authorizations reported within 24 hours.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#111111] border-t border-[#1f1f1f] flex items-center justify-between">
          <div>
            <span className="text-[8px] text-[#777777] block uppercase">PRICE PER CARD</span>
            <span className="text-sm font-bold text-yellow-500">${product.price.toFixed(2)} USDT</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="p-2 bg-[#151515] hover:bg-[#202020] text-amber-400 border border-[#2a2a2a] transition flex items-center space-x-1"
              title="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase hidden sm:inline">ADD TO CART</span>
            </button>

            <button
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                  return;
                }
                onBuyNow(product);
                onClose();
              }}
              disabled={product.stock <= 0}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-[#222222] text-white font-bold uppercase px-4 py-2 text-xs transition"
            >
              INSTANT PURCHASE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
