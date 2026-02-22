import React, { useState, useMemo } from 'react';
import { OrderlySymbolImage } from '../ui/OrderlySymbolImage';
import { InfoTooltip } from '../ui/InfoTooltip';
import { SelectMarketModal } from './SelectMarketModal';

const POPULAR_SYMBOLS = [
  { symbol: 'PERP_ETH_USDC', display: 'ETH/USDC', baseAsset: 'ETH' },
  { symbol: 'PERP_BTC_USDC', display: 'BTC/USDC', baseAsset: 'BTC' },
  { symbol: 'PERP_SOL_USDC', display: 'SOL/USDC', baseAsset: 'SOL' },
  { symbol: 'PERP_ARB_USDC', display: 'ARB/USDC', baseAsset: 'ARB' },
];

export function FutureTradingHeader({ markets, symbol, onSymbolChange, ticker, fundingRate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isLoading = !ticker || ticker.isLoading;
  const lastPrice = ticker?.lastPrice || 0;
  const priceChange = ticker?.priceChange || 0;
  const priceChangePercent = ticker?.priceChangePercent || 0;
  const volume24h = ticker?.volume24h || 0;
  const high24h = ticker?.high24h || 0;
  const low24h = ticker?.low24h || 0;

  const mainPrice = isLoading
    ? '--'
    : lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  const mainPriceChangePercent =
    priceChangePercent >= 0
      ? `+${priceChangePercent.toFixed(2)}`
      : priceChangePercent.toFixed(2);
  const change24h = priceChange.toFixed(2);
  const change24hPercent =
    priceChangePercent >= 0
      ? `+${priceChangePercent.toFixed(2)}`
      : priceChangePercent.toFixed(2);
  const isMainPriceChangePositive = priceChangePercent >= 0;

  const availableSymbols = useMemo(() => {
    if (!markets || markets.length === 0) {
      return POPULAR_SYMBOLS;
    }
    return markets.map((m) => {
      const baseAsset = m.symbol?.split('_')[1] || '';
      const quoteAsset = m.symbol?.split('_')[2] || '';
      return {
        symbol: m.symbol || '',
        display: `${baseAsset}/${quoteAsset}`,
        baseAsset,
      };
    });
  }, [markets]);

  const currentDisplay = availableSymbols.find((s) => s.symbol === symbol)?.display || symbol;

  const volume24hFormatted = volume24h.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const quoteVolume24h = ticker?.quoteVolume24h ?? ticker?.['24h_amount'] ?? 0;
  const volume24hUsdFormatted =
    quoteVolume24h > 0
      ? quoteVolume24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : volume24hFormatted;

  const estFundingRate = fundingRate?.estFundingRate;
  const fundingDisplay =
    fundingRate?.isLoading || !estFundingRate
      ? '--'
      : `${parseFloat(estFundingRate) >= 0 ? '+' : ''}${(parseFloat(estFundingRate) * 100).toFixed(4)}%`;
  const fundingCountdown = fundingRate?.countdown || '--';
  const isFundingPositive = estFundingRate != null && parseFloat(estFundingRate) >= 0;
  const indexPrice = lastPrice;
  const indexFormatted = isLoading ? '--' : indexPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  return (
    <div className="w-full flex flex-col bg-[#080808] border-b border-[color:var(--color-border-strong)]" style={{ fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif' }}>
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[color:var(--color-border-strong)]">
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg bg-transparent hover:bg-white/5 transition-all duration-200 active:scale-[0.98]"
              aria-haspopup="dialog"
              aria-expanded={isModalOpen}
            >
              <OrderlySymbolImage symbol={symbol} size={20} className="shadow-lg ring-2 ring-black/20" />
              <div className="flex flex-col gap-0.5 items-start">
                <span className="text-white font-bold text-sm tracking-tight leading-none">{currentDisplay}</span>
                <span className="px-1.5 py-0.5 rounded text-[7px] font-extrabold tracking-widest bg-accent-gradient text-black uppercase leading-none">Perp</span>
              </div>
              <svg className="w-3 h-3 text-[#666666] transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-[#35D4CA] leading-tight tabular-nums">{isLoading ? '--' : `$${mainPrice}`}</div>
            <div className={`text-xs font-bold leading-tight tabular-nums ${isMainPriceChangePositive ? 'text-[#35D4CA]' : 'text-[#FF3B69]'}`}>{isLoading ? '--' : `${mainPriceChangePercent}%`}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 overflow-x-auto border-b border-[color:var(--color-border-strong)] scrollbar-hide">
          <div className="flex flex-col gap-0 flex-shrink-0">
            <span className="text-[9px] text-gray-400 leading-tight font-bold">24h Change</span>
            <span className={`text-xs font-bold tabular-nums leading-tight ${isMainPriceChangePositive ? 'text-[#35D4CA]' : 'text-[#FF3B69]'}`}>{isLoading ? '--' : `${change24h}`}</span>
          </div>
          <div className="flex flex-col gap-0 flex-shrink-0">
            <span className="text-[9px] text-gray-400 leading-tight font-bold">24h High</span>
            <span className="text-xs font-bold text-white tabular-nums leading-tight">{isLoading ? '--' : `$${Number(high24h || 0).toFixed(2)}`}</span>
          </div>
          <div className="flex flex-col gap-0 flex-shrink-0">
            <span className="text-[9px] text-gray-400 leading-tight font-bold">24h Low</span>
            <span className="text-xs font-bold text-white tabular-nums leading-tight">{isLoading ? '--' : `$${Number(low24h || 0).toFixed(2)}`}</span>
          </div>
          <div className="flex flex-col gap-0 flex-shrink-0">
            <span className="text-[9px] text-gray-400 leading-tight font-bold">24h Volume</span>
            <span className="text-xs font-bold text-white tabular-nums leading-tight">{isLoading ? '--' : volume24hFormatted}</span>
          </div>
          {fundingRate && (
            <div className="flex flex-col gap-0 flex-shrink-0">
              <InfoTooltip content="Funding is a periodic payment between longs and shorts. A positive rate means longs pay shorts; a negative rate means shorts pay longs." side="top">
                <span className="text-[9px] text-gray-400 leading-tight font-bold whitespace-nowrap">Funding / Countdown</span>
              </InfoTooltip>
              <div className="flex items-baseline gap-1">
                <span className={`text-xs font-bold tabular-nums leading-tight ${
                  estFundingRate && parseFloat(estFundingRate) >= 0 ? 'text-[#35D4CA]' : 'text-[#FF3B69]'
                }`}>{fundingDisplay}</span>
                <span className="text-[9px] text-[#555555] tabular-nums leading-tight whitespace-nowrap">/ {fundingCountdown}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="hidden lg:flex lg:flex-row lg:items-center w-full min-h-[92px] py-4 px-4 sm:px-6 lg:px-8 gap-4 lg:gap-6 border-r border-[color:var(--color-border-strong)] box-border"
        style={{
          background: 'linear-gradient(90deg, rgba(250, 204, 21, 0.2) -2.95%, rgba(0, 0, 0, 0) 38.6%)',
          borderWidth: '1px 0',
          borderStyle: 'solid',
          borderImageSource: 'linear-gradient(269.99deg, rgba(234, 179, 8, 0) 16.86%, #EAB308 50.3%, rgba(234, 179, 8, 0) 83.73%)',
          borderImageSlice: '1 0 1 0',
        }}
      >
        <div className="flex flex-shrink-0 flex-row items-start gap-3 sm:gap-4">
          <span className="hidden xl:block flex-shrink-0 w-6 h-6 text-white/80 self-center" aria-hidden>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
            </svg>
          </span>
          <div className="relative">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex flex-row items-start gap-3 sm:gap-4 py-0 rounded-lg bg-transparent hover:bg-white/5 transition-all duration-200 active:scale-[0.98]"
            aria-haspopup="dialog"
            aria-expanded={isModalOpen}
          >
            <div className="flex flex-row items-start gap-2.5 sm:gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-[#FACC15] ring-2 ring-black/20 shadow-lg flex items-center justify-center">
                <OrderlySymbolImage symbol={symbol} size={32} className="rounded-full object-cover" />
              </div>
              <div className="flex flex-col items-start gap-1 sm:gap-2">
                <span
                  className="text-xl sm:text-2xl font-bold leading-tight tracking-[-0.025em]"
                  style={{
                    background: 'linear-gradient(90deg, #FEF08A 0%, #EAB308 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {currentDisplay}
                </span>
                <span
                  className="flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold text-white flex-shrink-0 w-fit"
                  style={{
                    background: 'linear-gradient(90deg, rgba(202, 138, 4, 0.4) 0%, rgba(250, 204, 21, 0.4) 100%)',
                  }}
                >
                  PERP
                </span>
              </div>
            </div>
            <svg className="w-6 h-6 text-[#D9D9D9] flex-shrink-0 transition-transform duration-200 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          </div>
        </div>

        <div className="flex flex-1 flex-row items-center gap-4 lg:gap-5 xl:gap-6 min-w-0 flex-wrap">
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <div className="flex flex-row items-center gap-1 flex-wrap">
              <span className="text-xs font-light text-[#8E8E93] leading-tight">Mark</span>
              <span className="text-base font-normal text-[#FACC15]/80 font-mono leading-tight tabular-nums">
                {currentDisplay.split('/')[0]}
              </span>
            </div>
            <div className="flex flex-row items-center gap-1 flex-wrap">
              <span className="text-base font-normal text-white font-mono leading-tight tabular-nums">{isLoading ? '--' : `$${mainPrice}`}</span>
              <span className={`text-base font-normal font-mono leading-tight tabular-nums ${isMainPriceChangePositive ? 'text-[#FACC15]' : 'text-[#F43F5E]'}`} style={isMainPriceChangePositive ? { opacity: 0.9 } : undefined}>
                {isLoading ? '--' : `${mainPriceChangePercent}%`}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <span className="text-xs font-light text-[#8E8E93] leading-tight">24h Change</span>
            <span className={`text-base font-normal font-mono leading-tight tabular-nums ${isMainPriceChangePositive ? 'text-[#FACC15]' : 'text-[#F43F5E]'}`}>
              {isLoading ? '--' : `${change24h} (${change24hPercent}%)`}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <span className="text-xs font-light text-[#8E8E93] leading-tight">Index</span>
            <span className="text-base font-normal font-mono leading-tight tabular-nums text-white">{indexFormatted}</span>
          </div>
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <InfoTooltip content="Funding is a periodic payment between longs and shorts. A positive rate means longs pay shorts; a negative rate means shorts pay longs." side="top">
              <span className="text-xs font-light text-[#8E8E93] leading-tight cursor-help">Funding / Countdown</span>
            </InfoTooltip>
            <div className="flex flex-row items-center gap-1 font-mono text-base leading-tight tabular-nums">
              <span className={isFundingPositive ? 'text-[#0088FF]' : 'text-[#F43F5E]'}>{fundingDisplay}</span>
              <span className="text-[#999999]">/</span>
              <span className="text-[#999999]">{fundingCountdown}</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <span className="text-xs font-light text-[#8E8E93] leading-tight">24h Volume (USDT)</span>
            <span className="text-base font-normal font-mono leading-tight tabular-nums text-white">{isLoading ? '--' : volume24hUsdFormatted}</span>
          </div>
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <span className="text-xs font-light text-[#8E8E93] leading-tight">Open Interest (USDT)</span>
            <span className="text-base font-normal font-mono leading-tight tabular-nums text-white">--</span>
          </div>
        </div>
      </div>

      <SelectMarketModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        markets={markets}
        selectedSymbol={symbol}
        onSelect={(newSymbol) => {
          onSymbolChange(newSymbol);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
