import React from 'react';
import { CardBrand } from '../types';

interface CardVisualProps {
  brand: CardBrand;
  value?: number;
  region?: string;
  cardType?: string;
  className?: string;
}

export const CardVisual: React.FC<CardVisualProps> = ({
  brand,
  region = 'US',
  cardType,
  className = '',
}) => {
  // Styling matching the exact reference photo
  const getBrandStyling = () => {
    switch (brand) {
      case 'Visa':
        return {
          bg: 'bg-[#1853db]', // Rich royal blue
          border: 'border-[#2d68f0]/40',
        };
      case 'Mastercard':
        return {
          bg: 'bg-[#9e1b1b]', // Rich crimson red
          border: 'border-[#c22e2e]/40',
        };
      case 'American Express':
        return {
          bg: 'bg-[#006fcf]', // American Express Blue
          border: 'border-[#3894e6]/40',
        };
      case 'Binance':
        return {
          bg: 'bg-[#181a20]', // Binance Black/Dark Slate
          border: 'border-[#f0b90b]/50',
        };
      default:
        return {
          bg: 'bg-[#1f2937]',
          border: 'border-[#374151]/40',
        };
    }
  };

  const styling = getBrandStyling();
  const badgeLabel = cardType ? cardType.toUpperCase() : region;

  return (
    <div
      id={`card-visual-${brand.toLowerCase().replace(/\s+/g, '-')}`}
      className={`relative w-full aspect-[16/10] rounded-lg overflow-hidden ${styling.bg} border ${styling.border} p-3 flex flex-col justify-between shadow-md select-none group-hover:brightness-105 transition-all ${className}`}
    >
      {/* Top right pill badge matching screenshot */}
      <div className="flex justify-end w-full">
        {badgeLabel && (
          <span className="text-[8px] font-bold uppercase tracking-wider text-white/90 bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-sm">
            {badgeLabel}
          </span>
        )}
      </div>

      {/* Center prominent brand logo typography matching reference photo */}
      <div className="flex items-center justify-center my-auto py-2">
        {brand === 'Visa' && (
          <span className="text-2xl sm:text-3xl font-black italic tracking-widest text-white font-sans select-none drop-shadow-sm">
            VISA
          </span>
        )}
        {brand === 'Mastercard' && (
          <span className="text-xl sm:text-2xl font-bold italic tracking-tight text-white font-sans select-none drop-shadow-sm">
            mastercard
          </span>
        )}
        {brand === 'American Express' && (
          <span className="text-base sm:text-lg font-black italic tracking-normal text-white font-sans select-none drop-shadow-sm text-center leading-tight">
            AMERICAN EXPRESS
          </span>
        )}
        {brand === 'Binance' && (
          <div className="flex items-center justify-center space-x-1.5 drop-shadow-md select-none">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#F0B90B] shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.624 13.92L12 18.543l-4.624-4.623 1.62-1.62 3.004 3.004 3.004-3.004 1.62 1.62zm-4.624-11.464L16.624 7.08l-1.62 1.62-3.004-3.004-3.004 3.004-1.62-1.62L12 2.456zM2.456 12l4.624-4.624 1.62 1.62-3.004 3.004 3.004 3.004-1.62 1.62L2.456 12zm14.464-3.004l1.62-1.62L23.164 12l-4.624 4.624-1.62-1.62 3.004-3.004-3.004-3.004zm-3.004 3.004l-1.916-1.916-1.916 1.916 1.916 1.916 1.916-1.916z" />
            </svg>
            <span className="text-lg sm:text-xl font-black tracking-wider text-[#F0B90B] font-sans">
              BINANCE
            </span>
          </div>
        )}
        {brand === 'Other' && (
          <span className="text-xl font-bold italic tracking-wider text-white font-sans select-none drop-shadow-sm">
            CARD
          </span>
        )}
      </div>

      {/* Bottom spacer for balance */}
      <div className="h-2" />
    </div>
  );
};

