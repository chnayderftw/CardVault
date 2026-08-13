import React from 'react';
import { ShieldCheck, Activity, Globe, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="h-8 bg-[#0a0a0a] border-t border-[#1f1f1f] flex items-center justify-between px-4 text-[9px] text-[#666666] uppercase font-mono font-bold select-none z-30">
      <div className="flex items-center space-x-4 overflow-x-auto scrollbar-none py-1">
        <span className="text-blue-500 flex items-center space-x-1 whitespace-nowrap">
          <Activity className="w-3 h-3 inline mr-1 text-emerald-400" />
          <span>LIVE MARKET DATA</span>
        </span>
        <span className="whitespace-nowrap">BTC/USD: $64,210.42</span>
        <span className="whitespace-nowrap text-yellow-500">USDT: $1.0000</span>
        <span className="whitespace-nowrap hidden sm:inline">GLOBAL INVENTORY: 12,402 CARDS</span>
      </div>

      <div className="hidden md:flex items-center space-x-4 text-[#777777] whitespace-nowrap">
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>SECURITY: ISO-27001 CERTIFIED</span>
        </span>
        <span>•</span>
        <span>© 2026 CARDVAULT TERMINAL LTD. ALL RIGHTS RESERVED.</span>
      </div>
    </footer>
  );
};
