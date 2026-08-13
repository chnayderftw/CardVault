import React, { useState } from 'react';

interface CardBrandLogoProps {
  brand: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showText?: boolean;
}

export const getCardLogoUrl = (brand: string): string => {
  const b = brand.toLowerCase();
  if (b.includes('visa')) return '/logos/visa_logo.jpg';
  if (b.includes('master')) return '/logos/mastercard_logo.jpg';
  if (b.includes('american') || b.includes('amex') || b.includes('express')) return '/logos/amex_logo.jpg';
  return '/logos/visa_logo.jpg';
};

export const CardBrandLogo: React.FC<CardBrandLogoProps> = ({
  brand,
  className = '',
  size = 'md',
  showText = false
}) => {
  const [imgError, setImgError] = useState(false);
  const b = brand.toLowerCase();
  const isVisa = b.includes('visa');
  const isMaster = b.includes('master');
  const isAmex = b.includes('american') || b.includes('amex') || b.includes('express');

  const sizeMap = {
    xs: 'h-5 w-auto rounded object-contain bg-white px-1 py-0.5 shadow-sm',
    sm: 'h-7 w-auto rounded object-contain bg-white px-1.5 py-0.5 shadow-sm',
    md: 'h-9 w-auto rounded object-contain bg-white px-2 py-1 shadow-md',
    lg: 'h-12 w-auto rounded-md object-contain bg-white px-2.5 py-1 shadow-lg',
    xl: 'h-16 w-auto rounded-md object-contain bg-white px-3 py-1.5 shadow-xl',
    full: 'w-full h-auto max-h-24 rounded-md object-contain bg-white p-2 shadow-xl'
  };

  const logoImgUrl = isVisa
    ? '/logos/visa_logo.jpg'
    : isMaster
    ? '/logos/mastercard_logo.jpg'
    : isAmex
    ? '/logos/amex_logo.jpg'
    : '/logos/visa_logo.jpg';

  const svgUrl = isVisa
    ? '/logos/visa.svg'
    : isMaster
    ? '/logos/mastercard.svg'
    : isAmex
    ? '/logos/amex.svg'
    : '/logos/visa.svg';

  const activeSrc = !imgError ? logoImgUrl : svgUrl;
  const brandName = isVisa ? 'Visa' : isMaster ? 'MasterCard' : isAmex ? 'American Express' : brand;

  const imgClass = `${sizeMap[size]} ${className}`;

  return (
    <div className="inline-flex items-center space-x-2">
      <img
        src={activeSrc}
        alt={brandName}
        className={imgClass}
        onError={() => setImgError(true)}
        referrerPolicy="no-referrer"
      />
      {showText && <span className="font-bold text-white uppercase text-xs tracking-wide">{brandName}</span>}
    </div>
  );
};

