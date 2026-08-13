import React from 'react';
import { FilterState } from '../types';
import { Search, RotateCcw } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  issuers: string[];
  brands: string[];
  countries: string[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onReset,
  issuers,
  brands,
  countries
}) => {
  return (
    <aside className="bg-[#0a0a0a] border border-[#1f1f1f] flex flex-col p-3 space-y-4 font-mono text-xs">
      <div>
        <h3 className="text-[10px] font-bold uppercase text-[#777777] mb-3 tracking-widest flex items-center justify-between">
          <span>ADVANCED FILTERS</span>
          <button
            onClick={onReset}
            className="text-[9px] text-[#666666] hover:text-white flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET</span>
          </button>
        </h3>

        <div className="space-y-3">
          {/* Search cards */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-[#888888]">SEARCH CARDS</label>
            <input
              type="text"
              placeholder="BIN, Brand, Issuer..."
              value={filters.search}
              onChange={(e) => onChange({ search: e.target.value })}
              className="w-full bg-[#151515] border border-[#2a2a2a] p-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* BIN prefix */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-[#888888]">BIN / IIN PREFIX</label>
            <input
              type="text"
              placeholder="e.g. 4859"
              value={filters.bin}
              onChange={(e) => onChange({ bin: e.target.value })}
              className="w-full bg-[#151515] border border-[#2a2a2a] p-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Issuing country */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-[#888888]">ISSUING COUNTRY</label>
            <select
              value={filters.country}
              onChange={(e) => onChange({ country: e.target.value })}
              className="w-full bg-[#151515] border border-[#2a2a2a] p-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Brand select */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-[#888888]">CARD NETWORK BRAND</label>
            <select
              value={filters.brand}
              onChange={(e) => onChange({ brand: e.target.value })}
              className="w-full bg-[#151515] border border-[#2a2a2a] p-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Card Level Buttons */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase text-[#888888]">CARD LEVEL</label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: 'STANDARD', val: 'Standard' },
                { label: 'HQ', val: 'HQ' },
                { label: 'UHQ', val: 'UHQ' }
              ].map(({ label, val }) => {
                const selected = filters.level === val;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onChange({ level: selected ? '' : val })}
                    className={`text-[10px] py-1 border transition uppercase ${
                      selected
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold'
                        : 'bg-[#151515] border-[#2a2a2a] text-[#888888] hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* In Stock toggle */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] uppercase text-[#888888]">In Stock Only</span>
            <button
              type="button"
              onClick={() => onChange({ availability: filters.availability === 'in_stock' ? 'all' : 'in_stock' })}
              className={`w-8 h-4 rounded-full relative p-0.5 transition ${
                filters.availability === 'in_stock' ? 'bg-blue-600' : 'bg-[#222222]'
              }`}
            >
              <div
                className={`w-3 h-3 bg-white rounded-full transition-all ${
                  filters.availability === 'in_stock' ? 'ml-auto' : 'mr-auto'
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-[#1f1f1f] space-y-2">
        <button
          onClick={onReset}
          className="w-full bg-transparent border border-[#2a2a2a] py-2 text-xs font-bold uppercase text-[#888888] hover:text-white transition"
        >
          RESET ALL FILTERS
        </button>
      </div>
    </aside>
  );
};
