import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  ShoppingBag,
  Eye,
  LayoutGrid,
  List,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { CardProduct, FilterState } from '../types';
import { FilterPanel } from './FilterPanel';

interface MarketplaceProps {
  products: CardProduct[];
  categoryTab?: string;
  onSelectProduct: (product: CardProduct) => void;
  onAddToCart: (product: CardProduct) => void;
  onBuyNow: (product: CardProduct) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  products,
  categoryTab = 'all',
  onSelectProduct,
  onAddToCart,
  onBuyNow
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentCategory, setCurrentCategory] = useState<string>(categoryTab);

  const initialFilterState: FilterState = {
    bin: '',
    brand: '',
    cardType: '',
    level: '',
    issuer: '',
    country: '',
    currency: '',
    region: '',
    availability: 'all',
    category: 'all',
    search: ''
  };

  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // Extract unique filter dropdown values
  const issuers = useMemo(() => Array.from(new Set(products.map(p => p.issuer))).sort(), [products]);
  const brands = useMemo(() => Array.from(new Set(products.map(p => p.brand))).sort(), [products]);
  const countries = useMemo(() => Array.from(new Set(products.map(p => p.country))).sort(), [products]);

  // Category Tabs
  const categories = [
    { id: 'all', label: 'ALL CARDS' },
    { id: 'uhq', label: 'UHQ CARDS' },
    { id: 'hq', label: 'HQ CARDS' },
    { id: 'standard', label: 'STANDARD CARDS' },
    { id: 'virtual', label: 'VIRTUAL CARDS' },
    { id: 'gift', label: 'GIFT CARDS' },
    { id: 'regional', label: 'REGIONAL CARDS' },
    { id: 'featured', label: 'FEATURED OFFERS' },
  ];

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category Tab filter
      if (currentCategory === 'uhq' && p.level !== 'UHQ') return false;
      if (currentCategory === 'hq' && p.level !== 'HQ') return false;
      if (currentCategory === 'standard' && p.level !== 'Standard') return false;
      if (currentCategory === 'virtual' && p.cardType !== 'Virtual') return false;
      if (currentCategory === 'gift' && p.cardType !== 'Gift') return false;
      if (currentCategory === 'regional' && p.country === 'United States') return false;
      if (currentCategory === 'featured' && !p.isFeatured) return false;

      // Filter Panel options
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchBrand = p.brand.toLowerCase().includes(query);
        const matchBin = p.bin.includes(query);
        const matchIssuer = p.issuer.toLowerCase().includes(query);
        if (!matchName && !matchBrand && !matchBin && !matchIssuer) return false;
      }

      if (filters.bin && !p.bin.startsWith(filters.bin)) return false;
      if (filters.brand && p.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
      if (filters.cardType && p.cardType !== filters.cardType) return false;
      if (filters.level && p.level !== filters.level) return false;
      if (filters.issuer && p.issuer !== filters.issuer) return false;
      if (filters.country && p.country !== filters.country) return false;

      if (filters.availability === 'in_stock' && p.stock <= 0) return false;

      return true;
    });
  }, [products, currentCategory, filters]);

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Category Navigation Pills & View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0a0a0a] p-2.5 border border-[#1f1f1f]">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCurrentCategory(cat.id)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase transition whitespace-nowrap ${
                currentCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#151515] text-[#888888] hover:text-white hover:bg-[#202020]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 self-end md:self-auto text-[10px]">
          <span className="text-[#666666]">LAYOUT:</span>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1 border transition ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-[#151515] text-[#888888] border-[#2a2a2a] hover:text-white'
            }`}
            title="High Density Table View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 border transition ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-[#151515] text-[#888888] border-[#2a2a2a] hover:text-white'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: Advanced Filters Sidebar */}
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onChange={(updated) => setFilters(prev => ({ ...prev, ...updated }))}
            onReset={() => setFilters(initialFilterState)}
            issuers={issuers}
            brands={brands}
            countries={countries}
          />
        </div>

        {/* Right Column: High Density Table / Grid */}
        <div className="lg:col-span-3 space-y-3">
          {/* Status Header */}
          <div className="flex items-center justify-between text-[10px] text-[#888888] bg-[#0a0a0a] p-2 border border-[#1f1f1f]">
            <div>
              SHOWING <span className="text-white font-bold">{filteredProducts.length}</span> ACTIVE CARDS
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>3DS ENABLED • 100% LEGALLY ISSUED</span>
            </div>
          </div>

          {/* High Density Data Table View */}
          {viewMode === 'table' ? (
            <div className="border border-[#1f1f1f] bg-[#0a0a0a] overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#151515] border-b border-[#1f1f1f] text-[9px] uppercase font-bold text-[#888888]">
                      <th className="p-2">BRAND</th>
                      <th className="p-2">PRODUCT NAME</th>
                      <th className="p-2">BIN / IIN</th>
                      <th className="p-2">ISSUER</th>
                      <th className="p-2">COUNTRY</th>
                      <th className="p-2">LEVEL</th>
                      <th className="p-2">PRICE</th>
                      <th className="p-2 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#151515]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-[#666666]">
                          No card products match your current search parameters.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isVisa = p.brand.toLowerCase().includes('visa');
                        const isMaster = p.brand.toLowerCase().includes('master');
                        return (
                          <tr
                            key={p.id}
                            className={`p-2 items-center text-[11px] hover:bg-[#111111] cursor-pointer transition ${
                              p.isPremium ? 'bg-yellow-500/5 hover:bg-yellow-500/10' : ''
                            }`}
                            onClick={() => onSelectProduct(p)}
                          >
                            <td className="p-2">
                              {p.isPremium ? (
                                <span className="text-white font-bold bg-yellow-600 px-1 py-0.5 text-[9px] uppercase">
                                  PREMIUM
                                </span>
                              ) : (
                                <span
                                  className={`font-bold ${
                                    isVisa ? 'text-blue-500' : isMaster ? 'text-orange-500' : 'text-purple-400'
                                  }`}
                                >
                                  {p.brand.toUpperCase()}
                                </span>
                              )}
                            </td>

                            <td className="p-2 font-medium text-white truncate max-w-[180px]">
                              {p.name}
                            </td>

                            <td className="p-2 font-mono text-blue-400">
                              {p.bin}
                            </td>

                            <td className="p-2 text-[#888888] truncate max-w-[120px]">
                              {p.issuer}
                            </td>

                            <td className="p-2 text-[#cccccc]">
                              {p.country === 'United States' ? 'USA' : p.country}
                            </td>

                            <td className="p-2 font-bold font-mono">
                              <span className={`px-1.5 py-0.5 text-[9px] uppercase font-bold border ${
                                p.level === 'UHQ'
                                  ? 'bg-purple-950/60 border-purple-500 text-purple-300'
                                  : p.level === 'HQ'
                                  ? 'bg-blue-950/60 border-blue-500 text-blue-300'
                                  : 'bg-gray-800/60 border-gray-600 text-gray-300'
                              }`}>
                                {p.level}
                              </span>
                            </td>

                            <td className="p-2 font-bold font-mono text-yellow-500">
                              ${p.price.toFixed(2)}
                            </td>

                            <td className="p-2 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end space-x-1">
                                <button
                                  onClick={() => onAddToCart(p)}
                                  className="p-1 bg-[#151515] border border-[#2a2a2a] text-amber-400 hover:text-white"
                                  title="Add to Cart"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                </button>
                                {p.stock > 0 ? (
                                  <button
                                    onClick={() => onBuyNow(p)}
                                    className={`text-[9px] py-1 px-2.5 uppercase font-bold transition ${
                                      p.isPremium
                                        ? 'bg-yellow-600 text-black hover:bg-yellow-500'
                                        : 'bg-blue-600 text-white hover:bg-blue-500'
                                    }`}
                                  >
                                    PURCHASE
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="bg-[#222222] text-[9px] py-1 px-2 uppercase font-bold text-[#555555] cursor-not-allowed"
                                  >
                                    OUT STOCK
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Grid View Cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="bg-[#0a0a0a] border border-[#1f1f1f] hover:border-blue-500/60 p-4 transition cursor-pointer flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-950/40 border border-blue-800/40 px-1.5 py-0.5">
                        {p.brand.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-yellow-500">
                        BIN {p.bin}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition">{p.name}</h3>
                      <p className="text-[10px] text-[#777777]">{p.issuer} • {p.country}</p>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#151515] text-[#aaa] border border-[#2a2a2a]">
                        {p.cardType}
                      </span>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#151515] text-[#aaa] border border-[#2a2a2a]">
                        {p.level}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1f1f1f] flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <span className="text-[8px] text-[#666666] block uppercase">PURCHASE PRICE</span>
                      <span className="text-sm font-bold text-yellow-500 font-mono">${p.price.toFixed(2)} USD</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onAddToCart(p)}
                        className="p-1.5 bg-[#151515] border border-[#2a2a2a] text-amber-400 hover:text-white"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onBuyNow(p)}
                        disabled={p.stock <= 0}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-[#222222] text-white font-bold text-xs uppercase"
                      >
                        BUY
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
