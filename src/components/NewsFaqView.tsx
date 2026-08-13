import React, { useState } from 'react';
import {
  HelpCircle,
  Newspaper,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Mail,
  Lock,
  Globe,
  Radio
} from 'lucide-react';
import { Announcement } from '../types';

interface NewsFaqViewProps {
  announcements: Announcement[];
}

export const NewsFaqView: React.FC<NewsFaqViewProps> = ({ announcements }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "What types of card solutions are listed on the CardVault Marketplace?",
      a: "Our inventory features legally issued Virtual Reloadable Visa/Mastercards, Corporate Prepaid Business Cards, Platinum Debit solutions, and digital Gift Vouchers for global billing and SaaS expenditures."
    },
    {
      q: "How does the USDT TRC20 deposit and settlement mechanism function?",
      a: "Deposits are transferred directly via TRON (TRC20) blockchain. Upon submitting your 64-character transaction hash (TXID), our automated node verifies 19 block confirmations and credits your wallet balance instantly."
    },
    {
      q: "Are 3D Secure (3DS) SMS or OTP verification codes supported?",
      a: "Yes. All Virtual Reloadable products feature dynamic 3DS web portal access where you can retrieve live SMS verification passcodes for merchant transactions."
    },
    {
      q: "What is the policy regarding replacement or defective card claims?",
      a: "In the rare event of an unworkable card BIN or authorization error, clients can open a Support Ticket within 24 hours of purchase for automatic balance replacement or TRC20 refund."
    },
    {
      q: "Is personal identification (KYC) required to trade on the platform?",
      a: "CardVault operates strictly with crypto-denominated balances (USDT TRC20). No intrusive personal KYC documents are stored or requested for standard virtual card procurement."
    }
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Title Header */}
      <div className="bg-[#0a0a0a] p-4 border border-[#1f1f1f]">
        <h2 className="text-sm font-bold uppercase text-white tracking-wider flex items-center space-x-2">
          <Newspaper className="w-4 h-4 text-blue-400" />
          <span>CARDVAULT NEWS, SYSTEM UPDATES & FREQUENTLY ASKED QUESTIONS</span>
        </h2>
        <p className="text-[10px] text-[#777777] mt-0.5">
          Official platform press releases, BIN inventory additions, and client guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* News Stream */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] overflow-hidden flex flex-col">
          <div className="p-3 bg-[#111111] border-b border-[#1f1f1f] font-bold text-white uppercase text-xs flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>PLATINUM NEWS & ANNOUNCEMENTS</span>
          </div>

          <div className="p-4 space-y-4">
            {announcements.length === 0 ? (
              <p className="text-[#666666]">No news announcements available.</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="bg-[#121212] border border-[#222222] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs uppercase">{a.title}</span>
                    <span className="text-[9px] text-[#777777]">{new Date(a.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[11px] text-[#cbd5e1] leading-relaxed">{a.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] overflow-hidden flex flex-col">
          <div className="p-3 bg-[#111111] border-b border-[#1f1f1f] font-bold text-white uppercase text-xs flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-yellow-500" />
            <span>KNOWLEDGE BASE & FAQ</span>
          </div>

          <div className="p-4 space-y-2">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="bg-[#121212] border border-[#222222]">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-3 text-left font-bold text-white flex items-center justify-between transition hover:bg-[#181818]"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#777777]" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-3 pt-0 border-t border-[#1a1a1a] text-[11px] text-[#a0a0a0] leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
