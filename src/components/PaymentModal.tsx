import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import { CardProduct, User, SiteSettings, Order } from '../types';
import { api } from '../lib/api';

interface PaymentModalProps {
  product: CardProduct | null;
  user: User | null;
  settings: SiteSettings;
  onClose: () => void;
  onSuccess: (order: Order) => void;
  onOpenAuth: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  product,
  user,
  settings,
  onClose,
  onSuccess,
  onOpenAuth
}) => {
  if (!product) return null;

  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const walletAddress = settings.trc20WalletAddress || 'TG1LiM1h3iLf654gAx1msadrDf65q2AbAC';

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      onOpenAuth();
      return;
    }

    if (!txHash.trim() || txHash.trim().length < 8) {
      setError('Please enter a valid TRC20 Transaction Hash (TXID).');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const order = await api.createOrder({
        productId: product.id,
        quantity: 1,
        paymentMethod: 'usdt',
        txHash: txHash.trim()
      });

      onSuccess(order);
    } catch (err: any) {
      setError(err.message || 'Payment submission failed. Please check your TXID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
      <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#1f1f1f] text-xs text-[#e0e0e0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-[#111111] border-b border-[#1f1f1f]">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-xs uppercase tracking-wider text-white">
              USDT TRC20 PAYMENT CHECKOUT
            </span>
          </div>
          <button onClick={onClose} className="text-[#888888] hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="bg-red-950/40 border border-red-800/60 p-2.5 text-red-400 text-[11px] flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Summary Box */}
          <div className="bg-[#121212] border border-[#222222] p-3 space-y-2">
            <div className="text-[9px] text-[#777777] uppercase font-bold">CARD PRODUCT SUMMARY</div>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-white font-bold text-sm">{product.name}</div>
                <div className="text-[10px] text-[#888888] mt-0.5">
                  {product.brand} • {product.cardType} • BIN {product.bin}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[8px] text-[#666666] block uppercase">AMOUNT DUE</span>
                <span className="text-base font-bold text-yellow-500 font-mono">
                  ${product.price.toFixed(2)} USDT
                </span>
              </div>
            </div>
          </div>

          {/* TRC20 Wallet Box */}
          <div className="bg-[#121212] border border-blue-900/40 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                TRC20 WALLET DEPOSIT ADDRESS (TRON)
              </span>
              <span className="text-[9px] bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 uppercase font-bold">
                TRC20 ONLY
              </span>
            </div>

            {/* Wallet Address Display with Copy */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2 bg-[#050505] border border-[#2a2a2a] p-2">
                <span className="font-mono text-xs text-emerald-400 font-bold break-all flex-1 select-all">
                  {walletAddress}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className={`px-3 py-1 text-[10px] font-bold uppercase transition flex items-center space-x-1 shrink-0 ${
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
            </div>

            {/* Instructions */}
            <div className="bg-[#0a0a0a] border border-[#222222] p-2.5 text-[10px] text-[#aaa] space-y-1">
              <p className="text-white font-bold uppercase text-[9px] flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>PAYMENT INSTRUCTIONS:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[#888888] leading-relaxed">
                <li>Copy the TRC20 wallet address above.</li>
                <li>Send exactly <strong className="text-yellow-400">${product.price.toFixed(2)} USDT</strong> over the TRON (TRC20) network.</li>
                <li>Paste your Transaction Hash (TXID) in the input below and click <strong className="text-white">SUBMIT PAYMENT</strong>.</li>
              </ol>
            </div>
          </div>

          {/* Form TXID */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-white block">
                TRANSACTION HASH (TXID) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Paste your 64-character TRC20 TXID hash here..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="w-full bg-[#121212] border border-[#2a2a2a] focus:border-blue-500 p-2 text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-[#222222] disabled:text-[#555555] text-white font-bold uppercase py-2.5 text-xs transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>SUBMITTING TRANSACTION...</span>
              ) : (
                <>
                  <span>SUBMIT PAYMENT & PLACE ORDER</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-[#111111] border-t border-[#1f1f1f] text-[9px] text-[#666666] text-center">
          Order will enter <span className="text-amber-400 font-bold">PENDING</span> status until verified and approved by admin.
        </div>
      </div>
    </div>
  );
};
