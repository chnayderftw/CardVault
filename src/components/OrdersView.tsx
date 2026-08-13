import React, { useState } from 'react';
import {
  ShoppingBag,
  Zap,
  CheckCircle2,
  Clock,
  Download,
  Key,
  ExternalLink,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  CreditCard,
  Lock,
  AlertCircle
} from 'lucide-react';
import { Order, SiteSettings } from '../types';
import { api } from '../lib/api';

interface OrdersViewProps {
  orders: Order[];
  settings: SiteSettings;
  onRefreshOrders: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, settings, onRefreshOrders }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [txHashInput, setTxHashInput] = useState('');
  const [submittingTx, setSubmittingTx] = useState(false);
  const [message, setMessage] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Card credential copy states
  const [copiedNum, setCopiedNum] = useState(false);
  const [copiedExp, setCopiedExp] = useState(false);
  const [copiedCvv, setCopiedCvv] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const handlePayTrc20 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !txHashInput.trim()) return;

    setSubmittingTx(true);
    setMessage('');

    try {
      const res = await api.submitOrderTrc20Tx(selectedOrder.id, txHashInput);
      setMessage(res.message);
      setTxHashInput('');
      onRefreshOrders();
      setSelectedOrder(res.order);
    } catch (err: any) {
      setMessage(err.message || 'Failed to submit transaction hash.');
    } finally {
      setSubmittingTx(false);
    }
  };

  const handleDownloadInvoice = (order: Order) => {
    const cardNum = order.fulfillmentData?.cardNumber || order.fulfillmentData?.claimCode || 'Pending Verification';
    const expDate = order.fulfillmentData?.expDate || 'N/A';
    const cvv = order.fulfillmentData?.cvv || 'N/A';
    const instructions = order.fulfillmentData?.instructions || 'Awaiting confirmation';

    const text = `
==================================================
CARDVAULT TERMINAL - OFFICIAL CARD RECEIPT
==================================================
Order ID:        ${order.id}
Date:            ${new Date(order.createdAt).toLocaleString()}
Product:         ${order.productName} (${order.productBrand})
Type:            ${order.productType}
Face Value:      $${order.cardValue.toFixed(2)} USD
Quantity:        ${order.quantity}
Total Amount:    $${order.amount.toFixed(2)} USDT
Payment Status:  ${order.paymentStatus.toUpperCase()}
Delivery Status: ${order.deliveryStatus.toUpperCase()}
${order.txHash ? `TRC20 Tx Hash:  ${order.txHash}` : ''}

==================================================
DELIVERED CARD CREDENTIALS
==================================================
Card Number:     ${cardNum}
Expiration Date: ${expDate}
CVV / CVC:       ${cvv}
Instructions:    ${instructions}

Issuer Notice:   Legally issued virtual/prepaid product. Store securely.
==================================================
    `;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CardVault_Invoice_${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(settings.trc20WalletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyCardNum = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNum(true);
    setTimeout(() => setCopiedNum(false), 2000);
  };

  const handleCopyCardExp = (exp: string) => {
    navigator.clipboard.writeText(exp);
    setCopiedExp(true);
    setTimeout(() => setCopiedExp(false), 2000);
  };

  const handleCopyCardCvv = (cvv: string) => {
    navigator.clipboard.writeText(cvv);
    setCopiedCvv(true);
    setTimeout(() => setCopiedCvv(false), 2000);
  };

  const handleCopyAllDetails = (cardNum: string, exp: string, cvv: string) => {
    const fullText = `Card Number: ${cardNum}\nEXP: ${exp}\nCVV: ${cvv}`;
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex items-center justify-between bg-[#0a0a0a] p-3 border border-[#1f1f1f]">
        <div>
          <h2 className="text-sm font-bold uppercase text-white tracking-wider">CLIENT ORDER HISTORY & SETTLEMENT</h2>
          <p className="text-[10px] text-[#777777]">View orders, submit TRC20 transaction hashes, and retrieve fulfillment keys.</p>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-[#666666] block uppercase">Total Orders</span>
          <span className="text-sm font-bold text-blue-400">{orders.length} Records</span>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#cbd5e1] border-collapse">
            <thead>
              <tr className="bg-[#151515] text-[#777777] border-b border-[#1f1f1f] uppercase font-bold text-[9px]">
                <th className="py-2.5 px-3">ORDER ID</th>
                <th className="py-2.5 px-3">PRODUCT</th>
                <th className="py-2.5 px-3">DATE</th>
                <th className="py-2.5 px-3">AMOUNT</th>
                <th className="py-2.5 px-3">PAYMENT STATUS</th>
                <th className="py-2.5 px-3">DELIVERY</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#666666]">
                    No purchase history found. Explore the CARDS marketplace to place an order.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#111111] transition">
                    <td className="py-2.5 px-3 font-bold text-blue-400 font-mono">{o.id}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{o.productName}</td>
                    <td className="py-2.5 px-3 text-[#777777]">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3 font-bold text-yellow-500">${o.amount.toFixed(2)} USDT</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border ${
                          o.paymentStatus === 'paid'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                            : o.paymentStatus === 'verifying'
                            ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                            : 'bg-blue-950/40 text-blue-400 border-blue-800/40'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] text-[#aaa]">{o.deliveryStatus.toUpperCase()}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="bg-[#151515] border border-[#2a2a2a] px-2 py-1 text-[10px] uppercase font-bold text-white hover:bg-[#202020]"
                      >
                        DETAILS
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(o)}
                        className="bg-[#151515] border border-[#2a2a2a] px-1.5 py-1 text-[10px] text-amber-400 hover:text-white"
                        title="Download Receipt"
                      >
                        <Download className="w-3 h-3 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Order Modal / TRC20 Verification Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#1f1f1f] text-xs text-[#e0e0e0] shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f1f1f]">
              <div className="flex items-center space-x-2">
                <span className="bg-blue-600 text-white font-bold text-[10px] px-1.5 py-0.5">ORDER #{selectedOrder.id}</span>
                <span className="text-white font-bold">{selectedOrder.productName}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-[#888888] hover:text-white">
                CLOSE [X]
              </button>
            </div>

            {message && (
              <div className="bg-blue-950/40 border border-blue-800/60 p-2.5 text-blue-300 text-[11px]">
                {message}
              </div>
            )}

            {/* Order Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#121212] p-3 border border-[#222222]">
              <div>
                <span className="text-[9px] text-[#777777] block">CARD BRAND</span>
                <span className="text-white font-bold">{selectedOrder.productBrand}</span>
              </div>
              <div>
                <span className="text-[9px] text-[#777777] block">CARD TYPE</span>
                <span className="text-blue-400 font-bold">{selectedOrder.productType}</span>
              </div>
              <div>
                <span className="text-[9px] text-[#777777] block">PAYMENT DUE</span>
                <span className="text-yellow-500 font-bold">${selectedOrder.amount.toFixed(2)} USDT</span>
              </div>
              <div>
                <span className="text-[9px] text-[#777777] block">STATUS</span>
                <span className="text-blue-400 font-bold uppercase">{selectedOrder.paymentStatus}</span>
              </div>
            </div>

            {/* Delivered Card Details Box (If Paid) */}
            {selectedOrder.paymentStatus === 'paid' && selectedOrder.fulfillmentData ? (
              <div className="bg-[#0b1219] border border-emerald-800/60 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-900/50 pb-2">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>DELIVERED CARD CREDENTIALS</span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopyAllDetails(
                        selectedOrder.fulfillmentData?.cardNumber || selectedOrder.fulfillmentData?.claimCode || '',
                        selectedOrder.fulfillmentData?.expDate || '',
                        selectedOrder.fulfillmentData?.cvv || ''
                      )
                    }
                    className="bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/50 px-2.5 py-1 text-[9px] font-bold uppercase transition flex items-center space-x-1"
                  >
                    {copiedAll ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAll ? 'COPIED ALL' : 'COPY ALL DETAILS'}</span>
                  </button>
                </div>

                {/* Card Visual Graphic */}
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border border-blue-800/50 rounded-lg p-4 text-white shadow-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase font-mono">
                      {selectedOrder.productBrand} VIRTUAL CARD
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                      ACTIVE • DELIVERED
                    </span>
                  </div>

                  <div className="pt-2">
                    <span className="text-[9px] text-slate-400 block font-mono">CARD NUMBER</span>
                    <div className="text-sm font-bold font-mono tracking-widest text-yellow-400">
                      {selectedOrder.fulfillmentData.cardNumber || selectedOrder.fulfillmentData.claimCode}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                    <div>
                      <span className="text-[8px] text-slate-400 block">VALID THRU (EXP)</span>
                      <span className="font-bold text-white">
                        {selectedOrder.fulfillmentData.expDate || '12/28'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block">CVV / CVC</span>
                      <span className="font-bold text-white">
                        {selectedOrder.fulfillmentData.cvv || '***'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Individual Card Details Inputs & Copy Buttons */}
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">
                      CARD NUMBER (16 DIGITS)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={selectedOrder.fulfillmentData.cardNumber || selectedOrder.fulfillmentData.claimCode || ''}
                        className="flex-1 bg-[#050505] border border-[#2a2a2a] p-2 text-xs text-yellow-400 font-mono font-bold select-all"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyCardNum(
                            selectedOrder.fulfillmentData?.cardNumber || selectedOrder.fulfillmentData?.claimCode || ''
                          )
                        }
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1 text-[10px] uppercase transition flex items-center space-x-1"
                      >
                        {copiedNum ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedNum ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">
                        EXPIRATION DATE (EXP)
                      </label>
                      <div className="flex space-x-1.5">
                        <input
                          type="text"
                          readOnly
                          value={selectedOrder.fulfillmentData.expDate || '12/28'}
                          className="flex-1 bg-[#050505] border border-[#2a2a2a] p-2 text-xs text-white font-mono font-bold select-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopyCardExp(selectedOrder.fulfillmentData?.expDate || '12/28')}
                          className="bg-[#202020] hover:bg-[#303030] text-white px-2.5 py-1 text-[10px] uppercase transition flex items-center"
                        >
                          {copiedExp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">
                        CVV / CVC CODE
                      </label>
                      <div className="flex space-x-1.5">
                        <input
                          type="text"
                          readOnly
                          value={selectedOrder.fulfillmentData.cvv || '492'}
                          className="flex-1 bg-[#050505] border border-[#2a2a2a] p-2 text-xs text-white font-mono font-bold select-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopyCardCvv(selectedOrder.fulfillmentData?.cvv || '492')}
                          className="bg-[#202020] hover:bg-[#303030] text-white px-2.5 py-1 text-[10px] uppercase transition flex items-center"
                        >
                          {copiedCvv ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.fulfillmentData.instructions && (
                    <div className="bg-[#050505] border border-[#222] p-2.5 mt-2">
                      <span className="text-[9px] text-slate-500 uppercase block font-bold mb-0.5">
                        CARD REDEMPTION / ISSUER NOTES
                      </span>
                      <p className="text-[10px] text-[#ccc] leading-relaxed">
                        {selectedOrder.fulfillmentData.instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* TRC20 Payment Instructions (If Pending) */
              <div className="bg-[#121212] border border-[#222222] p-4 space-y-3">
                <div className="flex items-center justify-between text-yellow-500 font-bold text-xs">
                  <span>USDT TRC20 SETTLEMENT INSTRUCTIONS</span>
                  <span>NETWORK: TRON (TRC20)</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#050505] p-3 border border-[#1f1f1f]">
                  <div className="w-24 h-24 bg-white p-1 border border-gray-700 flex-shrink-0 flex items-center justify-center text-black text-[9px] font-bold text-center">
                    {/* Simulated SVG QR */}
                    <QrCode className="w-20 h-20 text-black" />
                  </div>

                  <div className="space-y-2 flex-1 w-full">
                    <div>
                      <span className="text-[9px] text-[#777777] block">MERCHANT TRC20 WALLET ADDRESS</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          type="text"
                          readOnly
                          value={settings.trc20WalletAddress}
                          className="bg-[#151515] border border-[#2a2a2a] p-1.5 text-[10px] text-yellow-400 font-mono w-full"
                        />
                        <button
                          onClick={copyAddress}
                          className="bg-[#202020] border border-[#303030] p-1.5 text-white hover:bg-blue-600 transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {copiedAddress && <span className="text-[9px] text-emerald-400">Copied to clipboard!</span>}
                    </div>

                    <div className="text-[10px] text-[#888888]">
                      Exact Amount Required: <strong className="text-yellow-500">${selectedOrder.amount.toFixed(2)} USDT</strong>
                    </div>
                  </div>
                </div>

                {/* Submit Tx Hash Form */}
                <form onSubmit={handlePayTrc20} className="space-y-2 pt-2 border-t border-[#1f1f1f]">
                  <label className="text-[9px] uppercase text-[#888888]">
                    SUBMIT TRANSACTION HASH (TXID) FOR BACKEND VERIFICATION
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 7f91a2e38c4b501d2938a4c1209e8f7a..."
                      value={txHashInput}
                      onChange={(e) => setTxHashInput(e.target.value)}
                      className="flex-1 bg-[#050505] border border-[#2a2a2a] p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={submittingTx}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase px-4 py-2 text-xs"
                    >
                      {submittingTx ? 'VERIFYING...' : 'SUBMIT TXHASH'}
                    </button>
                  </div>
                  <p className="text-[9px] text-[#666666]">
                    Note: Backend node automated verification checks TRON ledger before releasing fulfillment keys.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
