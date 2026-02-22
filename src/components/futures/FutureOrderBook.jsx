import React, { useState, useEffect } from 'react';
import { useOrderlyOrderBook, useOrderlyMarketTrades } from '../../hooks/orderly/useOrderlyMarkets';

const ORDERBOOK_DEPTH = 25;

export function FutureOrderBook({
  symbol,
  orderbook: orderbookProp,
  trades: tradesProp,
  onPriceClick,
}) {
  const [activeTab, setActiveTab] = useState('orderbook');
  const [orderBookView, setOrderBookView] = useState('both');
  const [grouping, setGrouping] = useState('0.0001');
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [dataError, setDataError] = useState(null);

  const liveOrderbook = useOrderlyOrderBook(symbol || '', ORDERBOOK_DEPTH);
  const liveTrades = useOrderlyMarketTrades(symbol || '', 20);

  const orderbook = orderbookProp ?? liveOrderbook;
  const trades = tradesProp ?? (liveTrades?.trades ?? []);

  const spread =
    bids.length > 0 && asks.length > 0
      ? (parseFloat(asks[0].price) + parseFloat(bids[0].price)) / 2
      : 0;
  const spreadDisplay = spread > 0 ? spread.toFixed(2) : '--';

  useEffect(() => {
    try {
      const hasBids = Array.isArray(orderbook?.bids) && orderbook.bids.length > 0;
      const hasAsks = Array.isArray(orderbook?.asks) && orderbook.asks.length > 0;
      const hasData = orderbook && !orderbook.isLoading && (hasBids || hasAsks);

      if (hasData) {
        const toNum = (v) => (typeof v === 'number' ? v : parseFloat(v));

        let bidCumulative = 0;
        const formattedBids = (orderbook.bids || []).map((bid) => {
          const price = toNum(Array.isArray(bid) ? bid[0] : bid?.price ?? 0);
          const size = toNum(Array.isArray(bid) ? bid[1] : bid?.quantity ?? 0);

          if (!Number.isFinite(price) || !Number.isFinite(size) || price < 0 || size < 0) {
            throw new Error('Invalid orderbook data');
          }

          bidCumulative += size;
          return {
            price: price.toFixed(2),
            size: size.toFixed(3),
            total: bidCumulative.toFixed(2),
          };
        });

        let askCumulative = 0;
        const formattedAsks = (orderbook.asks || []).map((ask) => {
          const price = toNum(Array.isArray(ask) ? ask[0] : ask?.price ?? 0);
          const size = toNum(Array.isArray(ask) ? ask[1] : ask?.quantity ?? 0);

          if (!Number.isFinite(price) || !Number.isFinite(size) || price < 0 || size < 0) {
            throw new Error('Invalid orderbook data');
          }

          askCumulative += size;
          return {
            price: price.toFixed(2),
            size: size.toFixed(3),
            total: askCumulative.toFixed(2),
          };
        });

        requestAnimationFrame(() => {
          setBids(formattedBids);
          setAsks(formattedAsks);
          setDataError(null);
        });
      }
    } catch (err) {
      console.error('[OrderBook] Data parsing error:', err);
      requestAnimationFrame(() => {
        setDataError('Order book data error. Reconnecting...');
      });
    }
  }, [symbol, orderbook]);

  const handlePriceClick = (price, side) => {
    if (typeof onPriceClick === 'function') onPriceClick(parseFloat(price), side);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#080808] border-r border-[rgba(60,60,67,0.6)]" style={{ fontFamily: 'var(--font-geist-sans), Inter, sans-serif' }}>
      <div
        className="flex flex-shrink-0 items-center gap-4 pl-2 pr-3 border-b"
        style={{ borderColor: 'rgba(60, 60, 67, 0.6)', minHeight: 40 }}
      >
        <button
          onClick={() => setActiveTab('orderbook')}
          className={`py-2 px-1 text-sm leading-6 transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'orderbook'
              ? 'text-white font-semibold border-[#EBB30B]'
              : 'text-[#737373] font-normal border-transparent hover:text-white'
          }`}
        >
          Order book
        </button>
        <button
          onClick={() => setActiveTab('trades')}
          className={`py-2 px-1 text-sm leading-6 transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'trades'
              ? 'text-white font-semibold border-[#EBB30B]'
              : 'text-[#737373] font-normal border-transparent hover:text-white'
          }`}
        >
          Trades
        </button>
      </div>

      {activeTab === 'orderbook' ? (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {dataError && (
            <div className="px-3 py-2 bg-[#FF3B69]/10 border-b border-[#FF3B69]/30">
              <p className="text-[#FF3B69] text-xs">{dataError}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 pl-2 pr-2 py-2 sm:pl-3 sm:pr-3 sm:gap-3 min-w-0">
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => { setOrderBookView('both'); setScrollEnabled(false); }}
                className={`p-1 rounded transition-all touch-manipulation ${
                  orderBookView === 'both' ? 'bg-[#EBB30B]/20' : 'hover:bg-[#1F1F1F]'
                }`}
                title="Show both buy and sell orders"
              >
                <img alt="Both buy and sell orders" width={16} height={16} className="w-4 h-4" src="/buy-sell-view.svg" />
              </button>
              <button
                type="button"
                onClick={() => { setOrderBookView('buy'); setScrollEnabled(false); }}
                className={`p-1 rounded transition-all touch-manipulation ${
                  orderBookView === 'buy' ? 'bg-[#EBB30B]/20' : 'hover:bg-[#1F1F1F]'
                }`}
                title="Show only buy orders"
              >
                <img alt="Buy only orders" width={16} height={16} className="w-4 h-4" src="/buy-view-orderbook.svg" />
              </button>
              <button
                type="button"
                onClick={() => { setOrderBookView('sell'); setScrollEnabled(true); }}
                className={`p-1 rounded transition-all touch-manipulation ${
                  orderBookView === 'sell' ? 'bg-[#EBB30B]/20' : 'hover:bg-[#1F1F1F]'
                }`}
                title="Show only sell orders"
              >
                <img alt="Sell only orders" width={16} height={16} className="w-4 h-4" src="/sell-view-orderbook.svg" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0">
              <select
                value={grouping}
                onChange={(e) => setGrouping(e.target.value)}
                className="min-w-0 px-2 py-1.5 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs bg-[#080808] border border-[#333333] sm:border-[#737373] rounded-md sm:rounded-lg text-white appearance-none cursor-pointer hover:border-[#555555] transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23D4D4D4' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 6px center',
                  paddingRight: '24px',
                }}
              >
                <option value="0.00001">0.00001</option>
                <option value="0.0001">0.0001</option>
                <option value="0.001">0.001</option>
                <option value="0.01">0.01</option>
                <option value="0.1">0.1</option>
                <option value="1">1</option>
              </select>
              <button
                type="button"
                className="p-1 sm:p-1.5 hover:bg-[#1F1F1F] rounded transition-colors touch-manipulation flex-shrink-0"
                title="Order book settings"
              >
                <img alt="Order book settings" width={16} height={16} className="w-4 h-4" src="/settings-order-book.svg" />
              </button>
            </div>
          </div>

          <div className="flex justify-between pl-3 pr-3 sm:pl-4 sm:pr-3 pb-0 text-xs font-medium text-[#9CA3AF]" style={{ fontWeight: 500 }}>
            <span className="min-w-0 truncate">Price (USDC)</span>
            <span className="min-w-0 truncate text-right">Size (USDT)</span>
            <span className="min-w-0 truncate text-right">Total (USDT)</span>
          </div>

          <div className="flex-1 flex flex-col min-h-0 -mt-1">
            {bids.length === 0 && asks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4 min-h-0">
                {orderbook?.isLoading ? (
                  <>
                    <div className="w-8 h-8 rounded-full border-2 border-[#EBB30B]/30 border-t-[#EBB30B] animate-spin" aria-hidden />
                    <span className="text-[10px] text-white">Loading order book…</span>
                  </>
                ) : (
                  <span className="text-[10px] text-[#A3A3A3]">No order book data</span>
                )}
              </div>
            ) : orderBookView === 'both' ? (
              <>
                <div className="flex-1 flex flex-col-reverse min-h-0 overflow-hidden">
                  {asks.slice(0, 11).map((ask, index) => {
                    const maxAskTotal = asks.length > 0 ? parseFloat(asks[asks.length - 1].total) : 1;
                    const depthPercent = (parseFloat(ask.total) / maxAskTotal) * 100;
                    return (
                      <div
                        key={`ask-${index}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => handlePriceClick(ask.price, 'sell')}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePriceClick(ask.price, 'sell'); }}
                        className={`relative flex justify-between pl-3 pr-3 sm:pl-4 sm:pr-3 text-xs hover:bg-[#1F1F1F] cursor-pointer transition-colors gap-2 ${
                          index === 0 ? 'pt-0 pb-0.5' : 'py-0.5'
                        }`}
                      >
                        <div className="absolute left-0 top-0 h-full bg-[#FF3B69] opacity-10" style={{ width: `${depthPercent}%` }} />
                        <span className="relative z-10 text-[#FF3B69] tabular-nums font-medium min-w-0 truncate">{ask.price}</span>
                        <span className="relative z-10 text-white tabular-nums min-w-0 truncate text-right">{ask.size}</span>
                        <span className="relative z-10 text-[#666666] tabular-nums min-w-0 truncate text-right">{ask.total}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex-shrink-0 flex justify-between items-center pl-3 pr-3 sm:pl-4 sm:pr-3 py-2 bg-[#0A0A0A]">
                  <span className="text-base font-bold text-[#35D4CA] tabular-nums">{spreadDisplay}</span>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  {bids.slice(0, 11).map((bid, index) => {
                    const maxBidTotal = bids.length > 0 ? parseFloat(bids[bids.length - 1].total) : 1;
                    const depthPercent = (parseFloat(bid.total) / maxBidTotal) * 100;
                    return (
                      <div
                        key={`bid-${index}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => handlePriceClick(bid.price, 'buy')}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePriceClick(bid.price, 'buy'); }}
                        className="relative flex justify-between pl-3 pr-3 sm:pl-4 sm:pr-3 py-0.5 text-xs hover:bg-[#1F1F1F] cursor-pointer transition-colors gap-2"
                      >
                        <div className="absolute left-0 top-0 h-full bg-[#00C853] opacity-10" style={{ width: `${depthPercent}%` }} />
                        <span className="relative z-10 text-[#00C853] tabular-nums font-medium min-w-0 truncate">{bid.price}</span>
                        <span className="relative z-10 text-white tabular-nums min-w-0 truncate text-right">{bid.size}</span>
                        <span className="relative z-10 text-[#666666] tabular-nums min-w-0 truncate text-right">{bid.total}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : orderBookView === 'buy' ? (
              <>
                <div className="flex-shrink-0 flex justify-between items-center pl-3 pr-3 sm:pl-4 sm:pr-3 py-2 bg-[#0A0A0A]">
                  <span className="text-base font-bold text-[#35D4CA] tabular-nums">{spreadDisplay}</span>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <div
                    className={`h-full min-h-0 ${scrollEnabled ? 'overflow-y-auto overscroll-contain' : 'overflow-hidden cursor-pointer'} touch-pan-y`}
                    onClick={() => setScrollEnabled(true)}
                    tabIndex={0}
                    onBlur={() => setScrollEnabled(false)}
                    style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
                  >
                    {bids.map((bid, index) => {
                      const maxBidTotal = bids.length > 0 ? parseFloat(bids[bids.length - 1].total) : 1;
                      const depthPercent = (parseFloat(bid.total) / maxBidTotal) * 100;
                      return (
                        <div
                          key={`bid-${index}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => handlePriceClick(bid.price, 'buy')}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePriceClick(bid.price, 'buy'); }}
                          className="relative flex justify-between pl-3 pr-3 sm:pl-4 sm:pr-3 py-0.5 text-xs hover:bg-[#1F1F1F] cursor-pointer transition-colors gap-2"
                        >
                          <div className="absolute left-0 top-0 h-full bg-[#00C853] opacity-10" style={{ width: `${depthPercent}%` }} />
                          <span className="relative z-10 text-[#00C853] tabular-nums font-medium min-w-0 truncate">{bid.price}</span>
                          <span className="relative z-10 text-white tabular-nums min-w-0 truncate text-right">{bid.size}</span>
                          <span className="relative z-10 text-[#666666] tabular-nums min-w-0 truncate text-right">{bid.total}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <div
                    className={`h-full min-h-0 ${scrollEnabled ? 'overflow-y-auto overscroll-contain' : 'overflow-hidden cursor-pointer'} touch-pan-y`}
                    onClick={() => setScrollEnabled(true)}
                    tabIndex={0}
                    onBlur={() => setScrollEnabled(false)}
                    style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
                  >
                    {asks.map((ask, index) => {
                      const maxAskTotal = asks.length > 0 ? parseFloat(asks[asks.length - 1].total) : 1;
                      const depthPercent = (parseFloat(ask.total) / maxAskTotal) * 100;
                      return (
                        <div
                          key={`ask-${index}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => handlePriceClick(ask.price, 'sell')}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePriceClick(ask.price, 'sell'); }}
                          className="relative flex justify-between pl-3 pr-3 sm:pl-4 sm:pr-3 py-0.5 text-xs hover:bg-[#1F1F1F] cursor-pointer transition-colors gap-2"
                        >
                          <div className="absolute left-0 top-0 h-full bg-[#FF3B69] opacity-10" style={{ width: `${depthPercent}%` }} />
                          <span className="relative z-10 text-[#FF3B69] tabular-nums font-medium min-w-0 truncate">{ask.price}</span>
                          <span className="relative z-10 text-white tabular-nums min-w-0 truncate text-right">{ask.size}</span>
                          <span className="relative z-10 text-[#666666] tabular-nums min-w-0 truncate text-right">{ask.total}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex-shrink-0 flex justify-between items-center pl-3 pr-3 sm:pl-4 sm:pr-3 py-2 bg-[#0A0A0A]">
                  <span className="text-base font-bold text-[#35D4CA] tabular-nums">{spreadDisplay}</span>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <TradesView trades={trades} symbol={symbol || 'PERP_ETH_USDC'} />
      )}
    </div>
  );
}

function TradesView({ trades, symbol }) {
  const [userTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'UTC';
    }
  });

  const formatTime = (timestamp) => {
    const tsInMs = timestamp > 10000000000 ? timestamp : timestamp * 1000;
    const date = new Date(tsInMs);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: userTimezone,
    });
  };

  const match = symbol.match(/^(?:PERP|SPOT)_([A-Z]+)_([A-Z]+)$/) || [];
  const base = match[1] || 'BASE';
  const quote = match[2] || 'USDC';

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex flex-shrink-0 justify-between pl-3 pr-3 sm:pl-4 sm:pr-3 pb-1 text-xs font-medium text-[#9CA3AF]" style={{ fontWeight: 500 }}>
        <span className="min-w-0 truncate">Price ({quote})</span>
        <span className="min-w-0 truncate text-right">Size ({base})</span>
        <span className="min-w-0 truncate text-right">Time</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
        {!trades || trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-12 text-center">
            <svg className="w-10 h-10 text-[#333333] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <p className="text-[#999999] text-xs">No recent trades</p>
            <p className="text-[#666666] text-[10px] mt-1">Waiting for market activity</p>
          </div>
        ) : (
          trades.map((trade, index) => {
            const price = trade.executed_price || trade.price || 0;
            const quantity = trade.executed_quantity || trade.quantity || 0;
            const timestamp = trade.executed_timestamp || trade.timestamp || trade.ts || trade.time || 0;
            const side = (trade.side || 'BUY').toUpperCase();
            return (
              <div
                key={`${timestamp}-${index}`}
                className="flex justify-between pl-3 pr-3 sm:pl-4 sm:pr-3 py-0.5 text-xs hover:bg-[#1F1F1F] cursor-pointer transition-colors gap-2"
              >
                <span className={`tabular-nums font-medium min-w-0 truncate ${side === 'BUY' ? 'text-[#00C853]' : 'text-[#FF3B69]'}`}>
                  {typeof price === 'number' ? price.toFixed(2) : price}
                </span>
                <span className="text-white tabular-nums min-w-0 truncate text-right">
                  {typeof quantity === 'number' ? quantity.toFixed(4) : quantity}
                </span>
                <span className="text-[#666666] tabular-nums min-w-0 truncate text-right flex-shrink-0">
                  {timestamp > 0 ? formatTime(timestamp) : '--:--:--'}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
