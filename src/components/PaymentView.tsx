import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { api } from '../api';
import { DeliveredCardDisplay } from './DeliveredCardDisplay';
import { Copy, Check, Clock, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, XCircle, ArrowLeft, ExternalLink } from 'lucide-react';

interface PaymentViewProps {
  order: Order;
  onBackToShopping: () => void;
  onViewOrderDetails?: (order: Order) => void;
}

export const PaymentView: React.FC<PaymentViewProps> = ({
  order: initialOrder,
  onBackToShopping,
}) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [txHash, setTxHash] = useState(order.transactionHash || '');
  const [submittingTx, setSubmittingTx] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins

  // Load QR code and refresh order status
  useEffect(() => {
    async function loadQR() {
      try {
        const qr = await api.getPaymentQR(order.paymentAddress, order.totalUSDT);
        setQrCodeUrl(qr.qrDataUrl);
      } catch (err) {
        console.error('Failed to load QR:', err);
      }
    }
    loadQR();
  }, [order.paymentAddress, order.totalUSDT]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(order.paymentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRefreshOrder = async () => {
    try {
      setRefreshing(true);
      const updated = await api.getOrder(order.id);
      setOrder(updated);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmitTxHash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash || txHash.trim().length < 10) {
      setSubmitError('Please enter a valid TRON TRC20 Transaction Hash (TXID).');
      return;
    }

    try {
      setSubmittingTx(true);
      setSubmitError('');
      setSubmitSuccess('');
      const res = await api.submitTransactionHash(order.id, txHash.trim());
      setOrder(res.order);
      setSubmitSuccess('Transaction hash submitted successfully! Status updated to Pending Verification.');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit transaction hash');
    } finally {
      setSubmittingTx(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Paid & Fulfilled</span>
          </span>
        );
      case 'Pending Verification':
      case 'Payment Submitted':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-700 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Pending Verification</span>
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
    <div id="payment-page-container" className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      {/* Back button & Title */}
      <div className="flex items-center justify-between border-b border-[#222222] pb-3.5">
        <button
          onClick={onBackToShopping}
          className="flex items-center space-x-1.5 text-xs text-[#a3a3a3] hover:text-white bg-[#161616] hover:bg-[#202020] border border-[#262626] px-3 py-1.5 rounded transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefreshOrder}
            disabled={refreshing}
            className="flex items-center space-x-1 text-xs text-[#d1d1d1] hover:text-white bg-[#161616] px-2.5 py-1.5 rounded border border-[#262626] transition-colors"
            title="Refresh order payment status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
          {getStatusBadge(order.paymentStatus)}
        </div>
      </div>

      {/* Main Payment Card */}
      <div className="bg-[#141414] border border-[#262626] rounded-lg shadow-lg overflow-hidden">
        {/* Header strip */}
        <div className="bg-[#101010] border-b border-[#222222] p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">
              ORDER PAYMENT INVOICE
            </div>
            <h1 className="text-lg font-extrabold text-white font-mono flex items-center space-x-2 mt-0.5">
              <span>{order.id}</span>
            </h1>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono text-[#737373] uppercase">AMOUNT PAYABLE</div>
            <div className="text-xl font-black text-emerald-400 font-mono leading-none">
              {order.totalUSDT.toFixed(2)} <span className="text-xs font-normal text-white">USDT</span>
            </div>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: QR Code & Wallet Address */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-[#101010] border border-[#222222] rounded-md p-4 text-center">
            <div className="text-xs font-semibold text-[#d1d1d1] uppercase tracking-wider mb-2.5">
              Scan to Pay (TRC20)
            </div>

            {/* QR Code Container */}
            <div className="p-2 bg-white rounded shadow border border-slate-300">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="USDT TRC20 QR Code"
                  className="w-44 h-44 object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Network Indicator */}
            <div className="mt-3 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>NETWORK: TRON / TRC20 ONLY</span>
            </div>

            {/* Expiration Timer */}
            {order.paymentStatus === 'Awaiting Payment' && (
              <div className="mt-2.5 flex items-center space-x-1.5 text-xs text-amber-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>Invoice valid for: {formatTimer(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Right Column: Address Details & TXID Submission */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            {/* Step 1: Receiving Wallet Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#d1d1d1] flex items-center justify-between">
                <span>Merchant USDT TRC20 Receiving Address:</span>
                <span className="text-[10px] text-amber-400 font-normal">Send TRC20 USDT only</span>
              </label>

              <div className="flex items-center space-x-2 bg-[#101010] border border-[#262626] rounded-md p-2">
                <code className="text-xs font-mono text-[#d1d1d1] break-all flex-1 select-all font-semibold">
                  {order.paymentAddress}
                </code>
                <button
                  id="copy-usdt-address-btn"
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center space-x-1 shrink-0 transition-colors shadow"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Order Items Snapshot */}
            <div className="bg-[#101010] border border-[#222222] rounded-md p-2.5 space-y-1.5 text-xs">
              <div className="font-semibold text-[#d1d1d1]">Items in this Order:</div>
              <div className="space-y-1">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[#8e8e8e] font-mono text-[11px]">
                    <span className="truncate max-w-[240px] text-[#d1d1d1]">
                      {it.quantity}x {it.name} ({it.brand})
                    </span>
                    <span>${(it.price * it.quantity).toFixed(2)} USD</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Submit TXID Section */}
            {(order.paymentStatus === 'Awaiting Payment' || order.paymentStatus === 'Payment Submitted' || order.paymentStatus === 'Pending Verification') && (
              <form onSubmit={handleSubmitTxHash} className="bg-[#181818] border border-[#262626] rounded-md p-3.5 space-y-2.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-white uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Submit TRC20 Transaction Hash (TXID)</span>
                </div>

                <p className="text-[11px] text-[#8e8e8e] leading-tight">
                  After completing the transfer in your crypto wallet (e.g. TronLink, Binance, TrustWallet), paste your Transaction ID (TXID) below to start admin verification:
                </p>

                <div className="space-y-1">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8f0923cb910948ac0192834baf571029384bc190..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-1.5 text-xs font-mono text-white placeholder-[#525252] focus:outline-none focus:border-blue-500"
                  />
                </div>

                {submitError && (
                  <div className="p-2 bg-rose-950/60 border border-rose-800 text-rose-300 rounded text-[11px]">
                    {submitError}
                  </div>
                )}

                {submitSuccess && (
                  <div className="p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded text-[11px] flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{submitSuccess}</span>
                  </div>
                )}

                <button
                  id="submit-txid-btn"
                  type="submit"
                  disabled={submittingTx}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-semibold tracking-wide transition-colors shadow"
                >
                  {submittingTx ? 'Submitting TXID...' : 'Submit Transaction Hash for Verification'}
                </button>
              </form>
            )}

            {/* Delivered Cards Information (When Paid/Completed) */}
            {(order.paymentStatus === 'Paid' || order.paymentStatus === 'Completed') && (
              <div className="space-y-3">
                {order.deliveredCards && order.deliveredCards.length > 0 ? (
                  <DeliveredCardDisplay
                    cards={order.deliveredCards}
                    deliveryNotes={order.deliveryNotes}
                    orderId={order.id}
                  />
                ) : (
                  <div className="bg-emerald-950/30 border border-emerald-700/60 rounded-md p-3.5 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Payment Verified & Order Approved!</span>
                    </div>

                    <p className="text-xs text-[#d1d1d1] leading-normal">
                      Your USDT TRC20 payment has been successfully confirmed. Your card information will appear here once processed by the administrator.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Rejection Notice */}
            {order.paymentStatus === 'Rejected' && (
              <div className="bg-rose-950/40 border border-rose-800 rounded-md p-3.5 space-y-1.5 text-xs text-rose-300">
                <div className="flex items-center space-x-2 font-bold text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Payment Verification Rejected</span>
                </div>
                <p>
                  Reason: {order.rejectionReason || 'The submitted transaction hash could not be verified on the TRON network.'}
                </p>
                <p className="text-[11px] text-[#8e8e8e]">
                  Please verify your transfer on TronScan and submit a valid USDT TRC20 transaction hash (TXID).
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info bar */}
        <div className="bg-[#101010] border-t border-[#222222] p-3 text-xs text-[#8e8e8e] flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Important: Please ensure you transfer exact USDT on TRON (TRC20) network. Do not send ERC20 or BEP20.
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span>Need help?</span>
            <a
              href="https://tronscan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>TronScan Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
