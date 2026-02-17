import React from 'react';

const GREEN = '#35D4CA';
const RED = '#FF3B69';
const PANEL_BG = '#1F1F1F';
const INPUT_BORDER = '#2A2A2A';
const TEXT_MUTED = '#9CA3AF';
const ACCENT = '#fff800';

export function FutureOrderEntry({
  orderSide,
  setOrderSide,
  orderType,
  setOrderType,
  leverage,
  setLeverage,
  betAmount,
  setBetAmount,
  limitPrice,
  setLimitPrice,
  currentPrice,
  isPriceUp,
  priceChangePercent,
  onPlaceOrder,
  isConnected,
}) {
  const liqPrice =
    currentPrice > 0
      ? currentPrice * (orderSide === 'buy' ? 1 - 1 / leverage : 1 + 1 / leverage)
      : 0;
  const positionSize = (parseFloat(betAmount || 0) * leverage).toFixed(2);

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#080808]">
      <div className="flex flex-row items-center gap-2 p-2 md:p-3 flex-shrink-0">
        <button type="button" className="cross-btn flex-none">
          Cross
        </button>
        <button
          type="button"
          className="flex flex-1 justify-center items-center gap-2 py-2 px-4 h-9 min-w-[78px] rounded-lg text-white text-center transition-all cursor-pointer hover:bg-white/10 box-border"
          style={{
            background: 'rgba(120, 120, 120, 0.2)',
            fontFamily: 'Inter, var(--font-geist-sans), sans-serif',
            fontWeight: 700,
            fontSize: '13.3px',
            lineHeight: '20px',
          }}
        >
          {leverage}x
        </button>
      </div>

      <div className="flex items-center bg-[#080808] px-3 py-2 flex-shrink-0">
        <div className="flex gap-4 flex-1">
          <button
            type="button"
            onClick={() => setOrderType('market')}
            className={`text-xs font-sans font-medium transition-colors ${
              orderType === 'market' ? 'text-white' : 'text-[#999999] hover:text-white'
            }`}
          >
            Market
          </button>
          <button
            type="button"
            onClick={() => setOrderType('limit')}
            className={`text-xs font-sans font-medium transition-colors ${
              orderType === 'limit' ? 'text-white' : 'text-[#999999] hover:text-white'
            }`}
          >
            Limit
          </button>
        </div>
      </div>

      <div
        className="flex flex-row justify-center items-center gap-2 p-1 flex-shrink-0 w-full px-3 pt-3 pb-2"
        style={{
          fontFamily: 'Inter, var(--font-geist-sans), sans-serif',
        }}
      >
        <div
          className="flex flex-row justify-center items-center gap-2 p-1 rounded-lg w-full h-9"
          style={{ background: 'rgba(60, 60, 67, 0.6)' }}
        >
          <button
            type="button"
            onClick={() => setOrderSide('buy')}
            className="flex flex-1 flex-row justify-center items-center py-1.5 px-3 gap-2 rounded-lg transition-all cursor-pointer min-h-0"
            style={{
              fontFamily: 'Inter',
              fontWeight: 700,
              fontSize: 14,
              lineHeight: '16px',
              color: orderSide === 'buy' ? '#FFFFFF' : '#8E8E93',
              background: orderSide === 'buy' ? '#22C55E' : 'transparent',
              borderRadius: 8,
            }}
          >
            <span className="md:hidden">Long</span>
            <span className="hidden md:inline">Buy / Long</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderSide('sell')}
            className="flex flex-1 flex-row justify-center items-center py-1.5 px-3 gap-2 rounded-md transition-all cursor-pointer min-h-0"
            style={{
              fontFamily: 'Inter',
              fontWeight: 700,
              fontSize: 14,
              lineHeight: '16px',
              color: orderSide === 'sell' ? '#FFFFFF' : '#8E8E93',
              background: orderSide === 'sell' ? '#F43F5E' : 'transparent',
              borderRadius: 6,
            }}
          >
            <span className="md:hidden">Short</span>
            <span className="hidden md:inline">Sell / Short</span>
          </button>
        </div>
      </div>

      <div className="p-3 space-y-2 flex-1 min-h-0 overflow-y-auto overscroll-contain md:overflow-visible md:flex-initial">
        {orderType === 'limit' && (
          <div className={orderType === 'market' ? 'opacity-40' : 'opacity-100'}>
            <div className="relative">
              <input
                type="text"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder="Price"
                className="w-full px-3 py-2.5 text-sm bg-[#080808] rounded border border-[#313131] text-[#A3A3A3] font-sans font-normal focus:border-[#fff800] focus:outline-none transition-colors placeholder:text-[#A3A3A3]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#A3A3A3] font-sans font-normal">
                USDT
              </span>
            </div>
          </div>
        )}

        <div>
          <div className="relative">
            <input
              type="text"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder={orderType === 'market' ? 'Size (USDC)' : 'Size'}
              className="w-full px-3 py-2.5 text-sm bg-[#080808] border border-[#313131] rounded font-sans font-normal focus:border-[#fff800] focus:outline-none transition-colors text-[#A3A3A3] placeholder:text-[#A3A3A3]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#A3A3A3] font-sans font-normal">
              {orderType === 'market' ? 'USDT' : 'USDT'}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 relative">
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-[#1F1F1F] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#fff800] [&::-webkit-slider-thumb]:border-[2px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#fff800] [&::-moz-range-thumb]:border-[2px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer relative z-10"
                style={{
                  backgroundImage: `linear-gradient(to right, #fff800 0%, #fff800 ${leverage}%, #1F1F1F ${leverage}%, #1F1F1F 100%)`,
                }}
              />
            </div>
            <span className="text-xs font-sans font-normal text-[#A3A3A3] min-w-[35px]">{leverage}x</span>
          </div>
        </div>

        <div className="rounded-lg px-3 py-2.5 border border-[#2A2A2A] bg-[#080808]">
          <div className="text-xs mb-1 text-[#9CA3AF]">Mark Price</div>
          <div className="text-xl font-bold text-white">${currentPrice > 0 ? currentPrice.toFixed(2) : '--'}</div>
          <div className={`text-xs mt-1 ${isPriceUp ? 'text-[#35D4CA]' : 'text-[#FF3B69]'}`}>
            {isPriceUp ? '↑' : '↓'} {priceChangePercent}%
          </div>
          <div className="mt-3 pt-3 border-t border-[#313131]">
            <div className="text-xs mb-1 text-[#9CA3AF]">Est. Liquidation</div>
            <div className="text-lg font-bold text-[#FF3B69]">${liqPrice.toFixed(2)}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={!(parseFloat(betAmount || 0) > 0)}
          className={`w-full px-3 py-2.5 rounded-lg text-sm font-sans font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            orderSide === 'sell' ? 'bg-[#EF4444] text-white' : 'bg-[#22C55E] text-white'
          }`}
        >
          {!isConnected
            ? 'Connect Wallet'
            : orderType === 'market'
              ? orderSide === 'buy'
                ? 'Buy'
                : 'Sell'
              : orderSide === 'buy'
                ? 'Place Limit Buy'
                : 'Place Limit Sell'}
        </button>

        <div className="grid grid-cols-2 gap-4 pt-3 mt-3 border-t border-[#1F1F1F]">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[#A3A3A3]">Liq.Price</span>
              <span className="text-[#35D4CA]">{liqPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[#A3A3A3]">Position</span>
              <span className="text-[#35D4CA]">${positionSize}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[#A3A3A3]">Margin</span>
              <span className="text-[#A3A3A3]">${betAmount || '0'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[#A3A3A3]">Leverage</span>
              <span className="text-[#FF3B69]">{leverage}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
