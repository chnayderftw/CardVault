import React from 'react';
import { Product } from '../types';
import { CardVisual } from './CardVisual';
import { ShoppingCart, Eye, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickBuy?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
}) => {
  const { addItem, setIsCartOpen } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    setIsCartOpen(true);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product)}
      className="group bg-[#161616] hover:bg-[#1f1f1f] border border-[#262626] hover:border-[#3b82f6]/60 rounded-md p-2.5 flex flex-col justify-between transition-all duration-150 cursor-pointer shadow-sm"
    >
      {/* Top Section: Card Image / Visual */}
      <div className="relative mb-2.5">
        <CardVisual
          brand={product.brand}
          region={product.region}
          cardType={product.cardType}
        />
      </div>

      {/* Middle Section: Metadata */}
      <div className="flex-1 flex flex-col">
        {/* Product Name */}
        <h3 className="text-xs font-semibold text-white line-clamp-2 min-h-[32px] group-hover:text-blue-400 transition-colors leading-tight">
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="flex items-baseline space-x-1.5 mt-1">
          <span className="text-sm font-bold text-white font-mono">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-[9px] uppercase font-mono text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-800/40 ml-auto">
            {product.availability === 'in_stock' ? 'In Stock' : 'Low Stock'}
          </span>
        </div>

        {/* Short Product Information */}
        <div className="flex items-center justify-between text-[10px] text-[#8e8e8e] mt-1.5 pt-1.5 border-t border-[#262626]">
          <span>Region: <strong className="text-[#d1d1d1] font-medium">{product.region}</strong></span>
          <span>Type: <strong className="text-[#d1d1d1] font-medium">{product.cardType}</strong></span>
        </div>

        {/* Seller info without reviews */}
        <div className="flex items-center justify-between text-[10px] text-[#8e8e8e] mt-1 mb-2.5">
          <span className="truncate max-w-[130px] text-[#8e8e8e]">{product.seller}</span>
          <div className="flex items-center space-x-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] font-medium text-[#a3a3a3]">Verified</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Action Buttons */}
      <div className="grid grid-cols-5 gap-1.5 pt-0.5">
        <button
          id={`view-details-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
          title="View Details"
          className="col-span-1 flex items-center justify-center py-1.5 px-1 bg-[#222222] hover:bg-[#2c2c2c] text-[#a3a3a3] hover:text-white rounded text-xs font-medium border border-[#303030] transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        <button
          id={`add-to-cart-${product.id}`}
          onClick={handleAddToCart}
          className="col-span-4 flex items-center justify-center space-x-1.5 py-1.5 px-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded text-xs font-semibold tracking-wide transition-colors shadow"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};
