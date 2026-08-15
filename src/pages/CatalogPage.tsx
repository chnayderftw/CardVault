import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '../types';
import { api } from '../api';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface CatalogPageProps {
  onSelectProduct: (product: Product) => void;
  onDirectBuy: (product: Product, quantity: number) => void;
}

const CATEGORY_TABS: ProductCategory[] = [
  'All',
  'Standard',
  'HQ',
  'UHQ',
  'Binance',
  'Visa',
  'Mastercard',
  'American Express',
];

export const CatalogPage: React.FC<CatalogPageProps> = ({
  onSelectProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'name'>('featured');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts({
        category: activeCategory,
        search: searchQuery,
      });
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [activeCategory]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Client-side region and sort filtering
  const filteredProducts = products
    .filter(p => {
      if (selectedRegion === 'All') return true;
      return p.region.toLowerCase() === selectedRegion.toLowerCase();
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div id="catalog-page-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
      {/* Main Title Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-3.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Products
          </h1>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#737373] absolute left-3 top-2.5 pointer-events-none" />
          <input
            id="catalog-search-input"
            type="text"
            placeholder="Search by brand, name, or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161616] border border-[#262626] rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-[#525252] focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-[#737373] hover:text-white text-xs font-mono"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center space-x-1.5 shrink-0">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              id={`cat-tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors border ${
                activeCategory === cat
                  ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                  : 'bg-[#161616] border-[#262626] text-[#a3a3a3] hover:bg-[#202020] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary filters: Region & Sort */}
        <div className="hidden lg:flex items-center space-x-2 shrink-0 text-xs">
          <div className="flex items-center space-x-1 bg-[#161616] border border-[#262626] rounded-md px-2 py-1 text-[#d1d1d1]">
            <SlidersHorizontal className="w-3 h-3 text-[#737373]" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-transparent text-xs text-[#d1d1d1] focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#161616]">All Regions</option>
              <option value="US" className="bg-[#161616]">United States (US)</option>
              <option value="Global" className="bg-[#161616]">Global Worldwide</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-[#161616] border border-[#262626] rounded-md px-2 py-1 text-[#d1d1d1]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-[#d1d1d1] focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-[#161616]">Featured First</option>
              <option value="price_asc" className="bg-[#161616]">Price: Low to High</option>
              <option value="price_desc" className="bg-[#161616]">Price: High to Low</option>
              <option value="name" className="bg-[#161616]">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-[#a3a3a3] space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
          <span className="text-sm font-medium">Loading cards...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-[#161616] border border-[#262626] rounded-lg p-12 text-center text-[#a3a3a3] space-y-3">
          <p className="text-base font-semibold text-white">No cards matched your filter</p>
          <p className="text-xs text-[#737373] max-w-sm mx-auto">
            Try clearing the search box or switching to the "All" category tab.
          </p>
          <button
            onClick={() => {
              setActiveCategory('All');
              setSearchQuery('');
              setSelectedRegion('All');
            }}
            className="px-4 py-2 bg-[#222222] hover:bg-[#2c2c2c] text-white rounded text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          id="products-grid"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};
