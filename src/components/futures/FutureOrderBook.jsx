import React, { useState, useMemo } from 'react';

const GREEN = '#34D399';
const RED = '#F43F5E';

export function FutureOrderBook({
  orderbook,
  trades,
  onPriceClick,
  isLoading,
}) {
  const [activeTab, setActiveTab] = useState('orderbook');
  const [orderBookView, setOrderBookView] = useState('both');
  const [grouping, setGrouping] = useState('0.0001');

  const bids = useMemo(() => {
    if (!orderbook?.bids?.length) return [];
    let cum = 0;
    return orderbook.bids.slice(0, 12).map((row) => {
      const price = Array.isArray(row) ? row[0] : row.price;
      const size = Array.isArray(row) ? row[1] : row.quantity;
      const s = Number(size) || 0;
      cum += s;
      return { price: String(price), size: s.toFixed(3), total: cum.toFixed(2) };
    });
  }, [orderbook?.bids]);

  const asks = useMemo(() => {
    if (!orderbook?.asks?.length) return [];
    let cum = 0;
    return orderbook.asks.slice(0, 12).map((row) => {
      const price = Array.isArray(row) ? row[0] : row.price;
      const size = Array.isArray(row) ? row[1] : row.quantity;
      const s = Number(size) || 0;
      cum += s;
      return { price: String(price), size: s.toFixed(3), total: cum.toFixed(2) };
    });
  }, [orderbook?.asks]);

  const spread =
    bids.length > 0 && asks.length > 0
      ? (parseFloat(asks[0].price) + parseFloat(bids[0].price)) / 2
      : 0;
  const spreadDisplay = spread > 0 ? spread.toFixed(2) : '--';

  const handlePriceClick = (price, side) => {
    if (typeof onPriceClick === 'function') onPriceClick(parseFloat(price), side);
  };

  return (
    <div className="flex flex-col h-full bg-[#080808] border-r border-[rgba(60,60,67,0.6)] px-4 gap-8" style={{ fontFamily: 'Inter, var(--font-geist-sans), sans-serif' }}>
      <div className="flex flex-row items-center gap-4 h-11 px-0 pb-0">
        <button
          onClick={() => setActiveTab('orderbook')}
          className={`h-11 px-1 pb-2 flex items-center justify-center transition-colors text-base leading-6 cursor-pointer ${
            activeTab === 'orderbook'
              ? 'text-white font-medium border-b-2 border-[#EBB30B]'
              : 'text-[#737373] font-light hover:text-[#999999]'
          }`}
        >
          Order book
        </button>
        <button
          onClick={() => setActiveTab('trades')}
          className={`h-11 px-1 pb-2 flex items-center justify-center transition-colors text-base leading-6 cursor-pointer ${
            activeTab === 'trades'
              ? 'text-white font-medium border-b-2 border-[#EBB30B]'
              : 'text-[#737373] font-light hover:text-[#999999]'
          }`}
        >
          Trades
        </button>
      </div>

      {activeTab === 'orderbook' ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-wrap gap-[10px] items-center justify-between pl-3 pr-3 py-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setOrderBookView('both')}
                className={`p-1 rounded transition-all ${
                  orderBookView === 'both' ? 'bg-[rgba(255,248,0,0.2)]' : 'hover:bg-[#1F1F1F]'
                }`}
                title="Show both buy and sell orders"
              >
                <img alt="Both buy and sell orders" width={16} height={16} className="w-4 h-4" src="/buy-sell-view.svg" />
              </button>
              <button
                type="button"
                onClick={() => setOrderBookView('buy')}
                className={`p-1 rounded transition-all ${
                  orderBookView === 'buy' ? 'bg-[rgba(255,248,0,0.2)]' : 'hover:bg-[#1F1F1F]'
                }`}
                title="Show only buy orders"
              >
                <img alt="Buy only orders" width={16} height={16} className="w-4 h-4" src="/buy-view-orderbook.svg" />
              </button>
              <button
                type="button"
                onClick={() => setOrderBookView('sell')}
                className={`p-1 rounded transition-all ${
                  orderBookView === 'sell' ? 'bg-[rgba(255,248,0,0.2)]' : 'hover:bg-[#1F1F1F]'
                }`}
                title="Show only sell orders"
              >
                <img alt="Sell only orders" width={16} height={16} className="w-4 h-4" src="/sell-view-orderbook.svg" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={grouping}
                onChange={(e) => setGrouping(e.target.value)}
                className="px-2 py-1.5 text-xs bg-[#080808] border border-[#737373] rounded-md text-white font-normal leading-4 appearance-none cursor-pointer hover:border-[#555555] transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23D4D4D4' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  paddingRight: '28px',
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
                className="p-1.5 hover:bg-[#1F1F1F] rounded transition-colors"
                title="Order book settings"
              >
                <img alt="Order book settings" width={16} height={16} className="w-4 h-4" src="/settings-order-book.svg" />
              </button>
            </div>
          </div>

          <div className="flex justify-between pl-0 pr-0 pb-0 text-[12px] font-normal text-[#A3A3A3] leading-5">
            <span className="text-[12px]">Price (USDC)</span>
            <span className="text-[12px]">Size (USDT)</span>
            <span className="text-[12px]">Total (USDT)</span>
          </div>

          <div className="flex-1 flex flex-col min-h-0 -mt-1">
            {bids.length === 0 && asks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4 min-h-0">
                {isLoading ? (
                  <>
                    <div
                      className="w-8 h-8 rounded-full border-2 border-[#EBB30B]/30 border-t-[#EBB30B] animate-spin"
                      aria-hidden
                    />
                    <span className="text-[10px] text-white">Loading order book…</span>
                  </>
                ) : (
                  <span className="text-[10px] text-[#A3A3A3]">No order book data</span>
                )}
              </div>
            ) : orderBookView === 'both' ? (
              <>
                <div className="flex-1 flex flex-col-reverse overflow-hidden">
                  {asks.slice(0, 11).map((ask, i) => {
                    const maxAskTotal = asks.length ? parseFloat(asks[asks.length - 1].total) : 1;
                    const depthPercent = (parseFloat(ask.total) / maxAskTotal) * 100;
                    return (
                      <button
                        key={`ask-${i}`}
                        type="button"
                        onClick={() => handlePriceClick(ask.price, 'sell')}
                        className="relative flex justify-between pl-4 pr-3 text-xs leading-5 hover:bg-[#1F1F1F] cursor-pointer transition-colors py-0.5"
                      >
                        <div
                          className="absolute left-0 top-0 h-full opacity-10"
                          style={{ width: `${depthPercent}%`, backgroundColor: RED }}
                        />
                        <span className="relative z-10 tabular-nums font-medium" style={{ color: RED }}>{ask.price}</span>
                        <span className="relative z-10 text-white tabular-nums font-medium">{ask.size}</span>
                        <span className="relative z-10 text-white tabular-nums font-medium">{ask.total}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex-shrink-0 flex justify-between items-center pl-4 pr-3 py-2 bg-[#080808]">
                  <span className="text-base font-bold tabular-nums" style={{ color: GREEN }}>{spreadDisplay}</span>
                </div>

                <div className="flex-1 overflow-hidden">
                  {bids.slice(0, 11).map((bid, i) => {
                    const maxBidTotal = bids.length ? parseFloat(bids[bids.length - 1].total) : 1;
                    const depthPercent = (parseFloat(bid.total) / maxBidTotal) * 100;
                    return (
                      <button
                        key={`bid-${i}`}
                        type="button"
                        onClick={() => handlePriceClick(bid.price, 'buy')}
                        className="relative flex justify-between pl-4 pr-3 py-0.5 text-xs leading-5 hover:bg-[#1F1F1F] cursor-pointer transition-colors"
                      >
                        <div
                          className="absolute left-0 top-0 h-full opacity-10"
                          style={{ width: `${depthPercent}%`, backgroundColor: GREEN }}
                        />
                        <span className="relative z-10 tabular-nums font-medium" style={{ color: GREEN }}>{bid.price}</span>
                        <span className="relative z-10 text-white tabular-nums font-medium">{bid.size}</span>
                        <span className="relative z-10 text-white tabular-nums font-medium">{bid.total}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : orderBookView === 'buy' ? (
              <>
                <div className="flex-shrink-0 flex justify-between items-center pl-4 pr-3 py-2 bg-[#080808]">
                  <span className="text-base font-bold tabular-nums" style={{ color: GREEN }}>{spreadDisplay}</span>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {bids.map((bid, i) => {
                    const maxBidTotal = bids.length ? parseFloat(bids[bids.length - 1].total) : 1;
                    const depthPercent = (parseFloat(bid.total) / maxBidTotal) * 100;
                    return (
                      <button
                        key={`bid-${i}`}
                        type="button"
                        onClick={() => handlePriceClick(bid.price, 'buy')}
                        className="relative flex justify-between pl-4 pr-3 py-0.5 text-xs leading-5 hover:bg-[#1F1F1F] cursor-pointer transition-colors w-full text-left"
                      >
                        <div
                          className="absolute left-0 top-0 h-full opacity-10"
                          style={{ width: `${depthPercent}%`, backgroundColor: GREEN }}
                        />
                        <span className="relative z-10 tabular-nums font-medium" style={{ color: GREEN }}>{bid.price}</span>
                        <span className="relative z-10 text-white tabular-nums font-medium">{bid.size}</span>
                        <span className="relative z-10 text-white tabular-nums font-medium">{bid.total}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {asks.map((ask, i) => {
                    const maxAskTotal = asks.length ? parseFloat(asks[asks.length - 1].total) : 1;
                    const depthPercent = (parseFloat(ask.total) / maxAskTotal) * 100;
                    return (
                      <button
                        key={`ask-${i}`}
                        type="button"
                        onClick={() => handlePriceClick(ask.price, 'sell')}
                        className="relative flex justify-between pl-4 pr-3 py-0.5 text-xs leading-5 hover:bg-[#1F1F1F] cursor-pointer transition-colors w-full text-left"
                      >
                        <div
                          className="absolute left-0 top-0 h-full opacity-10"
                          style={{ width: `${depthPercent}%`, backgroundColor: RED }}
                        />
                        <span className="relative z-10 tabular-nums font-medium" style={{ color: RED }}>{ask.price}</span>
                        <span className="relative z-10 text-white tabular-nums font-medium">{ask.size}</span>
                        <span className="relative z-10 text-white tabular-nums font-medium">{ask.total}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex-shrink-0 flex justify-between items-center pl-4 pr-3 py-2 bg-[#080808]">
                  <span className="text-base font-bold tabular-nums" style={{ color: GREEN }}>{spreadDisplay}</span>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex justify-between pl-0 pr-0 pb-1 text-sm font-normal text-[#A3A3A3] leading-5">
            <span>Price (USDT)</span>
            <span>Size</span>
            <span>Time</span>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {(!trades || trades.length === 0) ? (
              <div className="flex flex-col items-center justify-center pt-12 text-center">
                <p className="text-[#999999] text-xs">No recent trades</p>
                <p className="text-[#666666] text-[10px] mt-1">Waiting for market activity</p>
              </div>
            ) : (
              trades.slice(0, 20).map((t, i) => {
                const price = t.executed_price ?? t.price ?? t.price;
                const qty = t.executed_quantity ?? t.quantity ?? t.size ?? 0;
                const ts = t.executed_timestamp ?? t.timestamp ?? t.time ?? 0;
                const side = (t.side || 'BUY').toUpperCase();
                const timeStr = ts
                  ? new Date(ts > 1e10 ? ts : ts * 1000).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })
                  : '--:--:--';
                return (
                  <div
                    key={`${ts}-${i}`}
                    className="flex justify-between pl-4 pr-3 py-0.5 text-xs hover:bg-[#1F1F1F]"
                  >
                    <span
                      className="tabular-nums font-medium"
                      style={{ color: side === 'BUY' ? GREEN : RED }}
                    >
                      {typeof price === 'number' ? price.toFixed(2) : price}
                    </span>
                    <span className="text-white tabular-nums">
                      {typeof qty === 'number' ? qty.toFixed(4) : qty}
                    </span>
                    <span className="text-[#666666] tabular-nums">{timeStr}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
