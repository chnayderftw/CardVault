import React from 'react';
import { X, HelpCircle, FileText, ShieldAlert, Wallet, CheckCircle2 } from 'lucide-react';

interface InfoModalProps {
  type: 'faq' | 'terms' | 'privacy' | 'payment_guide' | null;
  onClose: () => void;
}

export const InfoModals: React.FC<InfoModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const renderContent = () => {
    switch (type) {
      case 'faq':
        return (
          <div className="space-y-3.5">
            <div className="flex items-center space-x-2 text-white font-bold text-sm border-b border-[#222222] pb-2">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>Frequently Asked Questions (FAQ)</span>
            </div>

            <div className="space-y-2.5 text-xs text-[#d1d1d1]">
              <div className="bg-[#101010] border border-[#262626] p-2.5 rounded space-y-1">
                <h4 className="font-bold text-white text-xs">What payment methods are supported?</h4>
                <p className="text-[#8e8e8e] text-[11px] leading-relaxed">
                  CardVault exclusively supports <strong className="text-[#d1d1d1]">USDT on the TRON (TRC20) network</strong>. This ensures near-zero transaction gas fees and fast blockchain confirmation.
                </p>
              </div>

              <div className="bg-[#101010] border border-[#262626] p-2.5 rounded space-y-1">
                <h4 className="font-bold text-white text-xs">How do I receive my card after paying?</h4>
                <p className="text-[#8e8e8e] text-[11px] leading-relaxed">
                  Once you send USDT to our merchant TRC20 wallet address and submit your Transaction Hash (TXID), our system and admin team verify the transfer on TronScan. Once confirmed, your full card details and credentials are automatically revealed on your payment invoice and order history.
                </p>
              </div>

              <div className="bg-[#101010] border border-[#262626] p-2.5 rounded space-y-1">
                <h4 className="font-bold text-white text-xs">Where can I spend these cards?</h4>
                <p className="text-[#8e8e8e] text-[11px] leading-relaxed">
                  US Region cards are valid across all US merchants accepting Visa, Mastercard, or American Express online and at supported payment gateways. Global cards can be used internationally.
                </p>
              </div>

              <div className="bg-[#101010] border border-[#262626] p-2.5 rounded space-y-1">
                <h4 className="font-bold text-white text-xs">How long does payment verification take?</h4>
                <p className="text-[#8e8e8e] text-[11px] leading-relaxed">
                  Verification usually takes between 5 to 15 minutes after submitting a valid TRON TXID with at least 1 network confirmation.
                </p>
              </div>
            </div>
          </div>
        );

      case 'payment_guide':
        return (
          <div className="space-y-3.5">
            <div className="flex items-center space-x-2 text-white font-bold text-sm border-b border-[#222222] pb-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>USDT TRC20 Payment Instructions</span>
            </div>

            <div className="space-y-2.5 text-xs text-[#d1d1d1]">
              <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/50 rounded space-y-1">
                <span className="font-bold text-emerald-300 text-xs">Merchant Receiving Address:</span>
                <code className="block bg-[#101010] p-2 rounded text-emerald-400 font-mono text-[11px] select-all break-all border border-[#262626]">
                  TG1LiM1h3iLf654gAx1msadrDf65q2AbAC
                </code>
                <span className="text-[10px] text-[#8e8e8e]">Network: TRON (TRC20)</span>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white uppercase text-[10px] tracking-wider text-[#8e8e8e]">Step-by-Step Payment Process:</h4>
                <ol className="list-decimal list-inside space-y-1 text-[#8e8e8e] text-[11px] leading-relaxed">
                  <li>Select your card items and proceed to the Checkout / Payment screen.</li>
                  <li>Copy the exact USDT amount and our TRC20 wallet address (or scan the QR code).</li>
                  <li>Open your crypto wallet (TronLink, Binance, TrustWallet, OKX, etc.) and choose <strong className="text-[#d1d1d1]">Withdraw / Send USDT (TRC20)</strong>.</li>
                  <li>After sending, copy the <strong className="text-[#d1d1d1]">Transaction Hash / TXID</strong> from your wallet or TronScan.</li>
                  <li>Paste the TXID into the Order Payment invoice and click <strong className="text-[#d1d1d1]">Submit Transaction Hash</strong>.</li>
                  <li>Our admin team verifies the blockchain transfer and approves your order to release your card details!</li>
                </ol>
              </div>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-3.5">
            <div className="flex items-center space-x-2 text-white font-bold text-sm border-b border-[#222222] pb-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Terms & Conditions</span>
            </div>

            <div className="space-y-2 text-[11px] text-[#8e8e8e] max-h-72 overflow-y-auto leading-relaxed pr-1">
              <p>
                1. <strong className="text-[#d1d1d1]">Acceptance of Terms:</strong> By purchasing cards through CardVault, you agree to these commercial terms.
              </p>
              <p>
                2. <strong className="text-[#d1d1d1]">Card Products:</strong> CardVault provides authenticated digital cards. All cards are subject to issuer guidelines and network compatibility.
              </p>
              <p>
                3. <strong className="text-[#d1d1d1]">Payment Settlement:</strong> Orders are final once card credentials are delivered. It is the buyer's responsibility to submit the correct TRC20 TXID.
              </p>
              <p>
                4. <strong className="text-[#d1d1d1]">Security & Compliance:</strong> CardVault does not hold, store, or sell unencrypted cardholder data or unauthorized card numbers.
              </p>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-3.5">
            <div className="flex items-center space-x-2 text-white font-bold text-sm border-b border-[#222222] pb-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Privacy & Security Policy</span>
            </div>

            <div className="space-y-2 text-[11px] text-[#8e8e8e] max-h-72 overflow-y-auto leading-relaxed pr-1">
              <p>
                CardVault prioritizes user privacy and transactional integrity. We collect only minimal contact information (email address) necessary to fulfill orders and communicate transaction status.
              </p>
              <p>
                Passwords are cryptographically hashed using standard bcrypt algorithms. Sensitive raw credit card credentials (PAN, CVV, PIN) are strictly forbidden in our databases.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#141414] border border-[#262626] rounded-md shadow-2xl overflow-hidden p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded text-[#8e8e8e] hover:text-white hover:bg-[#181818]"
        >
          <X className="w-4 h-4" />
        </button>

        {renderContent()}

        <div className="mt-4 pt-3 border-t border-[#222222] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#181818] hover:bg-[#222222] border border-[#262626] text-white rounded text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
