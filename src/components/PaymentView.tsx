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
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [txHash, setTxHash] = useState(order.transactionHash || '');
  const [submittingTx, setSubmittingTx] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins

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

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(order.totalUSDT.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2500);
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

        {/* Payment Body Content */}
        <div className="p-5 space-y-6">
          {/* Top Payment Highlights: Address & Network Box */}
          <div className="bg-[#101010] border border-[#262626] rounded-lg p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222222] pb-3">
              <div className="inline-flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-400 tracking-wide font-mono">
                  NETWORK: TRON (TRC20) ONLY
                </span>
              </div>

              {order.paymentStatus === 'Awaiting Payment' && (
                <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-mono bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Invoice valid for: {formatTimer(timeLeft)}</span>
                </div>
              )}
            </div>

            {/* Merchant USDT Receiving Address */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Merchant USDT TRC20 Receiving Address:</span>
                <span className="text-[11px] text-amber-400 font-medium">Send TRC20 USDT only</span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#0a0a0a] border border-[#2e2e2e] rounded-md p-3">
                <code className="text-xs sm:text-sm font-mono text-emerald-300 break-all select-all font-semibold flex-1 tracking-wide">
                  {order.paymentAddress}
                </code>
                <button
                  id="copy-usdt-address-btn"
                  onClick={handleCopy}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center space-x-1.5 shrink-0 transition-colors shadow"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Address Copied!' : 'Copy Address'}</span>
                </button>
              </div>
            </div>

            {/* Amount confirmation */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141414] border border-[#222222] rounded-md px-3.5 py-2.5 text-xs">
              <div className="text-[#a3a3a3]">
                Exact Amount to Transfer: <span className="text-white font-mono font-bold">{order.totalUSDT.toFixed(2)} USDT</span>
              </div>
              <button
                onClick={handleCopyAmount}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center space-x-1 font-mono transition-colors"
              >
                {copiedAmount ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAmount ? 'Amount Copied' : 'Copy Exact Amount'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left/Main Column: TXID Submission & Card Delivery */}
            <div className="md:col-span-7 space-y-4">
              {/* Step: Submit TXID Section */}
              {(order.paymentStatus === 'Awaiting Payment' || order.paymentStatus === 'Payment Submitted' || order.paymentStatus === 'Pending Verification') && (
                <form onSubmit={handleSubmitTxHash} className="bg-[#181818] border border-[#262626] rounded-md p-4 space-y-3">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-white uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>Submit TRC20 Transaction Hash (TXID)</span>
                  </div>

                  <p className="text-xs text-[#8e8e8e] leading-relaxed">
                    After sending USDT from your wallet (TronLink, Binance, TrustWallet, etc.), paste your Transaction Hash (TXID) below to start verification:
                  </p>

                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 8f0923cb910948ac0192834baf571029384bc190..."
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      className="w-full bg-[#101010] border border-[#262626] rounded px-3 py-2 text-xs font-mono text-white placeholder-[#525252] focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {submitError && (
                    <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 rounded text-xs">
                      {submitError}
                    </div>
                  )}

                  {submitSuccess && (
                    <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded text-xs flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{submitSuccess}</span>
                    </div>
                  )}

                  <button
                    id="submit-txid-btn"
                    type="submit"
                    disabled={submittingTx}
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-semibold tracking-wide transition-colors shadow"
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
                    <div className="bg-emerald-950/30 border border-emerald-700/60 rounded-md p-4 space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Payment Verified & Order Approved!</span>
                      </div>

                      <p className="text-xs text-[#d1d1d1] leading-relaxed">
                        Your USDT TRC20 payment has been successfully confirmed. Your card information will appear here once processed by the administrator.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Rejection Notice */}
              {order.paymentStatus === 'Rejected' && (
                <div className="bg-rose-950/40 border border-rose-800 rounded-md p-4 space-y-2 text-xs text-rose-300">
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

            {/* Right Column: Order Items & Instructions */}
            <div className="md:col-span-5 space-y-4">
              {/* Order Items Snapshot */}
              <div className="bg-[#101010] border border-[#222222] rounded-md p-3.5 space-y-2.5 text-xs">
                <div className="font-semibold text-white flex items-center justify-between border-b border-[#222222] pb-2">
                  <span>Purchased Cards</span>
                  <span className="text-[#8e8e8e] font-mono">{order.items.length} item(s)</span>
                </div>
                <div className="space-y-2">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs font-mono">
                      <div className="text-[#d1d1d1] leading-tight">
                        <span className="text-white font-semibold">{it.quantity}x</span> {it.name}
                        <div className="text-[10px] text-[#737373] mt-0.5">{it.brand} • {it.region}</div>
                      </div>
                      <span className="text-emerald-400 font-semibold shrink-0 ml-2">
                        ${(it.price * it.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#222222] pt-2 flex justify-between font-bold text-xs">
                  <span className="text-[#a3a3a3]">Total</span>
                  <span className="text-emerald-400 font-mono">${order.totalUSD.toFixed(2)} USD ({order.totalUSDT.toFixed(2)} USDT)</span>
                </div>
              </div>

              {/* Quick instructions */}
              <div className="bg-[#101010] border border-[#222222] rounded-md p-3.5 space-y-2 text-xs text-[#8e8e8e]">
                <div className="font-semibold text-[#d1d1d1]">Payment Steps:</div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-[#a3a3a3] leading-relaxed">
                  <li>Copy the merchant USDT TRC20 address above.</li>
                  <li>Open your TRC20 wallet / exchange and transfer {order.totalUSDT.toFixed(2)} USDT.</li>
                  <li>Copy the transaction hash (TXID) from your wallet.</li>
                  <li>Paste the TXID in the form and click Submit.</li>
                </ol>
              </div>
            </div>
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
