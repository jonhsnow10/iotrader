import React, { useState, useMemo, useRef, useEffect } from 'react';
import { OrderlySymbolImage } from '../ui/OrderlySymbolImage';

function formatPrice(value) {
  if (value == null || value === '' || Number.isNaN(Number(value))) return '--';
  const n = Number(value);
  if (n >= 1000) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  if (n >= 0.01) return n.toFixed(4);
  if (n > 0) return n.toFixed(6);
  return '0';
}

function formatChangePercent(change) {
  if (change == null || Number.isNaN(Number(change))) return '--';
  const pct = Number(change) * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

export function SelectMarketModal({ open, onClose, markets, selectedSymbol, onSelect }) {
  const [search, setSearch] = useState('');
  const searchInputRef = useRef(null);

  const symbolsWithDisplay = useMemo(() => {
    if (!markets || markets.length === 0) return [];
    return markets.map((m) => {
      const baseAsset = m.symbol?.split('_')[1] || '';
      const quoteAsset = m.symbol?.split('_')[2] || '';
      return {
        symbol: m.symbol || '',
        display: `${baseAsset}/${quoteAsset}`,
        baseAsset,
        price: m['24h_close'],
        change: m.change,
      };
    });
  }, [markets]);

  const filtered = useMemo(() => {
    if (!search.trim()) return symbolsWithDisplay;
    const q = search.trim().toLowerCase();
    return symbolsWithDisplay.filter(
      (s) =>
        s.display?.toLowerCase().includes(q) ||
        s.baseAsset?.toLowerCase().includes(q)
    );
  }, [symbolsWithDisplay, search]);

  useEffect(() => {
    if (open) {
      setSearch('');
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyPosition = document.body.style.position;
    const prevBodyTop = document.body.style.top;
    const prevBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.position = prevBodyPosition;
      document.body.style.top = prevBodyTop;
      document.body.style.width = prevBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onClose]);

  if (!open) return null;

  const handleSelect = (item) => {
    onSelect(item.symbol);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      style={{ fontFamily: 'var(--font-geist-sans), Inter, sans-serif' }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="select-market-title"
    >
      <div
        className="relative w-full max-w-2xl mx-4 bg-[#0A0A0A] rounded-[10px] border border-[#EBB30B] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBB30B]/30">
          <h2
            id="select-market-title"
            className="text-lg font-bold tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #FEF08A 0%, #EAB308 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Select Market
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#999999] hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg active:scale-[0.98]"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-2 sm:p-4 border-b border-[#EBB30B]/30 sticky top-0 bg-[#0A0A0A] z-10">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search pairs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#080808] border border-[#2A2A2A] rounded-lg text-white text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#EBB30B] focus:border-[#EBB30B] transition-colors"
              aria-label="Search markets"
            />
          </div>
        </div>

        {/* Table header */}
        <div className="px-4 sm:px-6 py-3 border-b border-[#EBB30B]/30">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-[#8E8E93]">
            <div className="col-span-6">Market</div>
            <div className="col-span-3 text-right">Price (USDC)</div>
            <div className="col-span-3 text-right">24h Change</div>
          </div>
        </div>

        {/* List */}
        <div className="max-h-[500px] overflow-y-auto symbol-dropdown-list">
          <div className="divide-y divide-[#2A2A2A]">
            {filtered.map((item) => {
              const isSelected = item.symbol === selectedSymbol;
              const changeNum = item.change != null ? Number(item.change) : null;
              const isPositive = changeNum != null && changeNum >= 0;
              const changeColor = changeNum == null ? 'text-[#737373]' : isPositive ? 'text-[#35D4CA]' : 'text-[#FF3B69]';

              return (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full px-4 sm:px-6 py-3 hover:bg-white/5 transition-colors text-left active:scale-[0.99] ${
                    isSelected ? '!bg-[#EBB30B]/10 !text-[#EBB30B] hover:!bg-[#EBB30B]/15' : ''
                  }`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6 flex items-center gap-3">
                      <OrderlySymbolImage
                        symbol={item.symbol}
                        size={32}
                        className="rounded-full flex-shrink-0 shadow-md ring-2 ring-black/20"
                      />
                      <div className="flex flex-col items-start gap-0.5">
                        <span className={`font-medium text-sm tracking-tight ${isSelected ? 'text-[#EBB30B]' : 'text-white'}`}>
                          {item.display}
                        </span>
                        <span className="text-[#737373] text-xs">{item.baseAsset}</span>
                      </div>
                    </div>
                    <div className="col-span-3 text-right">
                      <span className="text-white text-sm font-mono tabular-nums">{formatPrice(item.price)}</span>
                    </div>
                    <div className={`col-span-3 text-right text-sm font-medium font-mono tabular-nums ${changeColor}`}>
                      {formatChangePercent(item.change)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-[#737373] font-medium">No pairs match your search.</div>
          )}
        </div>
      </div>

      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  );
}
