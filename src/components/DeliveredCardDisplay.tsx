import React, { useState } from 'react';
import { DeliveredCardInfo } from '../types';
import { CreditCard, Copy, Check, Eye, EyeOff, Download, ShieldCheck, Info, Sparkles, Key } from 'lucide-react';

interface DeliveredCardDisplayProps {
  cards?: DeliveredCardInfo[];
  deliveryNotes?: string;
  orderId: string;
}

export const DeliveredCardDisplay: React.FC<DeliveredCardDisplayProps> = ({
  cards = [],
  deliveryNotes,
  orderId,
}) => {
  const [revealedCards, setRevealedCards] = useState<Record<number, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleReveal = (index: number) => {
    setRevealedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleCopyFullFormat = (card: DeliveredCardInfo, index: number) => {
    const fullText = `${card.cardNumber}|${card.expiryDate}|${card.cvv}|${card.cardHolder || ''}${card.pin ? `|${card.pin}` : ''}`;
    handleCopyText(fullText, `card_full_${index}`);
  };

  const handleDownloadTxt = () => {
    let content = `=======================================================\n`;
    content += `CARDVAULT ORDER FULFILLMENT: #${orderId}\n`;
    content += `Issued At: ${new Date().toISOString()}\n`;
    content += `=======================================================\n\n`;

    if (deliveryNotes) {
      content += `ADMIN DELIVERY NOTES:\n${deliveryNotes}\n\n`;
      content += `-------------------------------------------------------\n\n`;
    }

    cards.forEach((c, idx) => {
      content += `CARD #${idx + 1}: ${c.cardName || 'Card'}\n`;
      content += `Brand: ${c.brand || 'Visa'}\n`;
      content += `Card Number: ${c.cardNumber}\n`;
      content += `Expiry Date: ${c.expiryDate}\n`;
      content += `CVV: ${c.cvv}\n`;
      if (c.cardHolder) content += `Cardholder: ${c.cardHolder}\n`;
      if (c.pin) content += `PIN: ${c.pin}\n`;
      if (c.balance) content += `Balance: $${c.balance}\n`;
      if (c.notes) content += `Instructions: ${c.notes}\n`;
      content += `Raw Line: ${c.cardNumber}|${c.expiryDate}|${c.cvv}|${c.cardHolder || ''}\n`;
      content += `\n-------------------------------------------------------\n\n`;
    });

    content += `Thank you for choosing CardVault.\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CardVault_Order_${orderId}_Cards.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#121815] border border-emerald-800/70 rounded-lg p-4 space-y-4 shadow-lg">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900/60 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <span>Fulfilled Card Details</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono">
                {cards.length} {cards.length === 1 ? 'Card' : 'Cards'}
              </span>
            </h4>
            <p className="text-[10px] text-[#9ca3af]">
              Card details provided by administrator upon payment verification
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadTxt}
          className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 rounded text-[11px] font-semibold transition-colors"
        >
          <Download className="w-3 h-3" />
          <span>Save as .TXT</span>
        </button>
      </div>

      {/* Admin Delivery Note if present */}
      {deliveryNotes && (
        <div className="bg-[#0f1412] border border-emerald-800/40 rounded p-2.5 flex items-start space-x-2 text-xs">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#86efac] font-bold uppercase tracking-wider">
              Fulfillment Message:
            </span>
            <p className="text-[#d1d5db] text-xs leading-relaxed">{deliveryNotes}</p>
          </div>
        </div>
      )}

      {/* Card Items List */}
      <div className="space-y-3">
        {cards.map((card, idx) => {
          const isRevealed = revealedCards[idx] || false;
          const displayDigits = isRevealed
            ? card.cardNumber
            : card.cardNumber.length >= 8
            ? card.cardNumber.slice(0, 4) + ' •••• •••• ' + card.cardNumber.slice(-4)
            : '•••• •••• •••• ••••';

          const brandGradient =
            card.brand === 'Mastercard'
              ? 'from-amber-950/40 via-red-950/30 to-[#121212]'
              : card.brand === 'American Express'
              ? 'from-blue-950/40 via-cyan-950/30 to-[#121212]'
              : 'from-blue-950/40 via-indigo-950/30 to-[#121212]';

          return (
            <div
              key={card.id || idx}
              className={`bg-gradient-to-br ${brandGradient} border border-emerald-700/50 rounded-lg p-3.5 space-y-3 relative overflow-hidden`}
            >
              {/* Card Top Strip */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-black/60 border border-[#333] text-[10px] font-mono font-bold text-white uppercase">
                    CARD #{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {card.cardName || `${card.brand || 'Visa'} Card`}
                  </span>
                  {card.balance && (
                    <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                      ${card.balance} USD
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => toggleReveal(idx)}
                    className="flex items-center space-x-1 px-2 py-0.5 bg-black/60 hover:bg-black text-[#d1d5db] border border-[#333] rounded text-[10px] font-medium transition-colors"
                  >
                    {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{isRevealed ? 'Hide' : 'Reveal'}</span>
                  </button>

                  <button
                    onClick={() => handleCopyFullFormat(card, idx)}
                    className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 rounded text-[10px] font-semibold transition-colors"
                    title="Copy CARD|EXP|CVV|NAME"
                  >
                    {copiedField === `card_full_${idx}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy All</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Card Main Numbers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Number */}
                <div className="sm:col-span-2 bg-black/60 border border-[#2c332e] rounded p-2 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-[#8e8e8e] block uppercase font-mono">
                      Card Number / Digits
                    </span>
                    <span className="font-mono text-sm font-bold text-white tracking-wider select-all">
                      {displayDigits}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyText(card.cardNumber, `card_num_${idx}`)}
                    className="p-1 bg-[#1f2622] hover:bg-[#2b352f] text-[#d1d5db] rounded text-xs transition-colors"
                    title="Copy Card Number"
                  >
                    {copiedField === `card_num_${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Expiration & CVV in 1 box */}
                <div className="grid grid-cols-2 gap-1.5">
                  {/* Expiration */}
                  <div className="bg-black/60 border border-[#2c332e] rounded p-2 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-[#8e8e8e] block uppercase font-mono">EXP</span>
                      <span className="font-mono text-xs font-bold text-emerald-300 select-all">
                        {card.expiryDate}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyText(card.expiryDate, `card_exp_${idx}`)}
                      className="p-1 bg-[#1f2622] hover:bg-[#2b352f] text-[#d1d5db] rounded text-xs"
                      title="Copy Expiry Date"
                    >
                      {copiedField === `card_exp_${idx}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* CVV */}
                  <div className="bg-black/60 border border-[#2c332e] rounded p-2 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-[#8e8e8e] block uppercase font-mono">CVV</span>
                      <span className="font-mono text-xs font-bold text-amber-300 select-all">
                        {isRevealed ? card.cvv : '•••'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyText(card.cvv, `card_cvv_${idx}`)}
                      className="p-1 bg-[#1f2622] hover:bg-[#2b352f] text-[#d1d5db] rounded text-xs"
                      title="Copy CVV"
                    >
                      {copiedField === `card_cvv_${idx}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Secondary Details Row (Holder, PIN, Notes) */}
              {(card.cardHolder || card.pin || card.notes) && (
                <div className="bg-black/40 border border-[#222c26] rounded p-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  {card.cardHolder && (
                    <div>
                      <span className="text-[9px] text-[#737373] block uppercase">Cardholder:</span>
                      <span className="text-white font-medium select-all">{card.cardHolder}</span>
                    </div>
                  )}

                  {card.pin && (
                    <div>
                      <span className="text-[9px] text-[#737373] block uppercase">PIN Code:</span>
                      <span className="font-mono text-white font-bold select-all">
                        {isRevealed ? card.pin : '••••'}
                      </span>
                    </div>
                  )}

                  {card.notes && (
                    <div className="sm:col-span-3 text-[10px] text-[#a3a3a3] border-t border-[#222] pt-1 mt-0.5">
                      <span className="text-[#8e8e8e] font-semibold">Activation Note: </span>
                      <span>{card.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
