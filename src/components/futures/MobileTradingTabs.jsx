import React, { useState, Component } from 'react';
import { usePositionStream, useOrderStream, useSubAccountMutation } from '@orderly.network/hooks';
import { OrderSide, OrderStatus, OrderType } from '@orderly.network/types';

function DetailsContent({ symbol }) {
  const base = symbol?.match?.(/^(?:PERP|SPOT)_([A-Z]+)_([A-Z]+)$/)?.[1] || 'BTC';
  const details = [
    { label: 'Symbol', value: symbol },
    { label: 'Min Trade Amount', value: `0.001 ${base}` },
    { label: 'Min. Notional Value', value: '5 USDT' },
    { label: 'Max Market Order Amount', value: `120 ${base}` },
    { label: 'Max Limit Order Amount', value: `1000 ${base}` },
    { label: 'Max Number of Open Orders', value: '200' },
    { label: 'Max Number of Open Conditional Orders', value: '10' },
    { label: 'Min Price Movement', value: '0.1 USDT' },
    { label: 'Min Order Price', value: '1 USDT' },
    { label: 'Market Order Price Cap/Floor Ratio', value: '2%' },
    { label: 'Limit Order Price Cap', value: '2%' },
    { label: 'Limit Order Floor Ratio', value: '2%' },
    { label: 'Price Protection', value: '2%' },
    { label: 'Insurance Clearance Fee', value: '2.50%' },
  ];
  return (
    <div className="flex flex-col bg-[#080808]">
      {details.map((d, i) => (
        <div key={i} className="grid grid-cols-2 gap-3 px-3 py-2.5 border-b border-[#0A0A0A]">
          <span className="text-xs text-[#999999] truncate" title={d.label}>{d.label}</span>
          <span className="text-xs text-white text-right truncate" title={d.value}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function formatSymbol(s) {
  return s?.replace?.('PERP_', '')?.replace?.(/_/g, '/') ?? s;
}

class MobileErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(e, info) { console.error('MobileTradingTabs Error:', e, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-[#080808] p-8 text-center">
          <svg className="w-12 h-12 text-[#FF3B69] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-white text-sm font-medium mb-2">Something went wrong</p>
          <p className="text-[#999999] text-xs mb-4">Unable to load trading view. Please refresh the page.</p>
          <button onClick={() => window.location.reload()} className="btn-primary-accent px-4 py-2">
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function MobileTradingTabs({
  chart,
  orderBook,
  orderEntry,
  symbol,
  orderBookContainerClassName,
}) {
  const [positionsData] = usePositionStream();
  const positions = positionsData?.rows ?? [];
  const [orders, { cancelOrder }] = useOrderStream({ status: OrderStatus.INCOMPLETE });
  const [doCreateOrder, { isMutating }] = useSubAccountMutation('/v1/order', 'POST');
  const [closingSymbol, setClosingSymbol] = useState(null);

  const handleClosePosition = async (position) => {
    if (!position?.symbol || isMutating) return;
    const qty = Math.abs(Number(position.position_qty) || 0);
    if (qty <= 0) return;
    setClosingSymbol(position.symbol);
    try {
      await doCreateOrder({
        symbol: position.symbol,
        order_type: OrderType.MARKET,
        side: (position.position_qty ?? 0) > 0 ? OrderSide.SELL : OrderSide.BUY,
        order_quantity: qty,
        reduce_only: true,
      });
    } catch (e) {
      console.error('Close failed:', e);
    } finally {
      setClosingSymbol(null);
    }
  };

  const handleCancelOrder = async (orderId, s) => {
    try {
      await cancelOrder(orderId, s);
    } catch (e) {
      console.error('Cancel failed:', e);
    }
  };
  const [viewMode, setViewMode] = useState('trade');
  const [activeTab, setActiveTab] = useState('chart');
  const [activePositionTab, setActivePositionTab] = useState('positions');

  const tabs = [
    { key: 'chart', label: 'Chart' },
    { key: 'orderbook', label: 'Order book' },
    { key: 'depth', label: 'Depth' },
    { key: 'details', label: 'Details' },
  ];

  const positionTabs = [
    { key: 'positions', label: 'Positions' },
    { key: 'orders', label: 'Open orders' },
  ];

  return (
    <MobileErrorBoundary>
    <div className="flex flex-col bg-[#080808] w-full">
      <div className="w-full">
        {viewMode === 'trade' ? (
          <div className="grid w-full grid-cols-1 min-[360px]:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] min-h-[320px] max-h-[65vh] min-[360px]:max-h-[70vh]">
            <div className={`min-w-0 min-h-[240px] min-[360px]:min-h-[280px] border-b border-[color:var(--color-border-strong)] min-[360px]:border-b-0 min-[360px]:border-r flex flex-col min-h-0 overflow-hidden ${orderBookContainerClassName || ''}`}>
              {orderBook}
            </div>
            <div className="min-w-0 min-h-0 overflow-auto">{orderEntry}</div>
          </div>
        ) : (
          <div className="w-full">
            {activeTab === 'chart' && (
              <div className="w-full h-[460px]">{chart}</div>
            )}
            <div
              className={`w-full flex flex-col ${
                activeTab === 'orderbook' ? 'h-[520px] min-h-0 overflow-hidden' : 'hidden'
              }`}
            >
              <div className={`w-full h-full flex flex-col min-h-0 overflow-hidden ${orderBookContainerClassName || ''}`}>
                {orderBook}
              </div>
            </div>
            <div
              className={`w-full flex items-center justify-center py-10 ${
                activeTab === 'depth' ? '' : 'hidden'
              }`}
            >
              <p className="text-[#999999] text-sm">Depth chart coming soon</p>
            </div>
            <div className={`w-full ${activeTab === 'details' ? '' : 'hidden'}`}>
              <DetailsContent symbol={symbol || 'PERP_BTC_USDC'} />
            </div>
          </div>
        )}
      </div>

      {viewMode === 'chart' && (
        <div className="flex bg-[#080808] flex-shrink-0 gap-1 px-2 py-1.5 w-full">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-1.5 py-1.5 font-medium transition-all whitespace-nowrap rounded-md border cursor-pointer ${
                activeTab === tab.key
                  ? 'text-white bg-[#1A1A1A] border-[#333333]'
                  : 'text-[#999999] border-[#222222] hover:text-white hover:bg-[#0A0A0A] hover:border-[#333333]'
              }`}
              style={{ fontFamily: 'var(--font-geist-sans), sans-serif', fontSize: 'clamp(8px, 2.2vw, 11px)' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center py-2 bg-[#080808] flex-shrink-0">
        <div className="bg-[#080808] border border-[color:var(--color-border-strong)] rounded-full p-1 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode('trade')}
            className={`w-14 h-10 rounded-full flex items-center justify-center transition-colors border cursor-pointer ${
              viewMode === 'trade'
                ? 'text-white bg-[#222222] border-[color:var(--color-border-strong)]'
                : 'text-[#999999] bg-[#080808] border-transparent hover:text-white hover:bg-[#1A1A1A] hover:border-[color:var(--color-border-strong)]'
            }`}
            title="Trade"
            aria-pressed={viewMode === 'trade'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 6h13" />
              <path d="M8 12h13" />
              <path d="M8 18h13" />
              <path d="M3 6h.01" />
              <path d="M3 12h.01" />
              <path d="M3 18h.01" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('chart');
              setActiveTab('chart');
            }}
            className={`w-14 h-10 rounded-full flex items-center justify-center transition-colors border cursor-pointer ${
              viewMode === 'chart'
                ? 'text-white bg-[#222222] border-[color:var(--color-border-strong)]'
                : 'text-[#999999] bg-[#080808] border-transparent hover:text-white hover:bg-[#1A1A1A] hover:border-[color:var(--color-border-strong)]'
            }`}
            title="Chart"
            aria-pressed={viewMode === 'chart'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 4v16" />
              <path d="M9 8h4v8H9z" />
              <path d="M17 6v12" />
              <path d="M17 10h4v4h-4z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="w-full">
        <div className="flex flex-col bg-[#080808]">
          <div className="flex border-b border-[color:var(--color-border-strong)] bg-[#080808]">
            {positionTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActivePositionTab(tab.key)}
                className={`px-3 py-2.5 text-xs font-medium transition-all relative whitespace-nowrap cursor-pointer ${
                  activePositionTab === tab.key
                    ? 'text-white'
                    : 'text-[#999999] hover:text-white hover:bg-[#0A0A0A]'
                }`}
                style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
              >
                {tab.label}
                {activePositionTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-gradient" />
                )}
              </button>
            ))}
          </div>

          <div>
            {activePositionTab === 'positions' ? (
              <div className="p-3">
                {(!positions || positions.length === 0) ? (
                  <div className="flex flex-col items-center justify-center pt-8 text-center px-4">
                    <svg className="w-8 h-8 text-[#333333] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-[#999999] text-[10px]">No open positions</p>
                    <p className="text-[#666666] text-[9px] mt-0.5">Your positions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {positions.map((p, i) => {
                      const isBuy = (p.position_qty ?? 0) > 0;
                      return (
                        <div key={p.symbol || i} className="flex items-center justify-between py-2 px-2 rounded border border-[color:var(--color-border-strong)]">
                          <div className="text-xs">
                            <span className="font-medium" style={{ color: isBuy ? '#35D4CA' : '#FF3B69' }}>
                              {isBuy ? 'Long' : 'Short'}
                            </span>
                            <span className="ml-1 text-white">{formatSymbol(p.symbol)}</span>
                            <span className="ml-1 text-[#999999]">
                              {Math.abs(p.position_qty ?? 0).toFixed(2)} @ ${(p.average_open_price ?? 0).toFixed(2)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleClosePosition(p)}
                            disabled={isMutating || closingSymbol === p.symbol}
                            className="text-xs px-2 py-1 rounded text-white bg-[#FF3B69] disabled:opacity-50"
                          >
                            {closingSymbol === p.symbol ? 'Closing...' : 'Close'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3">
                {(!orders || orders.length === 0) ? (
                  <div className="flex flex-col items-center justify-center pt-8 text-center px-4">
                    <svg className="w-8 h-8 text-[#333333] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-[#999999] text-[10px]">No open orders</p>
                    <p className="text-[#666666] text-[9px] mt-0.5">Your open orders will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.map((o) => {
                      const isBuy = o.side === 'BUY';
                      return (
                        <div key={o.order_id} className="flex items-center justify-between py-2 px-2 rounded border border-[color:var(--color-border-strong)]">
                          <div className="text-xs">
                            <span className="text-white font-medium">{isBuy ? 'Buy' : 'Sell'}</span>
                            <span className="mx-1 text-[#999999]">{formatSymbol(o.symbol)}</span>
                            <span className="text-white">{(o.quantity ?? 0).toFixed(2)} @ ${(o.price ?? 0).toFixed(2)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(o.order_id, o.symbol)}
                            className="text-xs px-2 py-1 rounded border border-[#FF3B69] text-[#FF3B69]"
                          >
                            Cancel
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </MobileErrorBoundary>
  );
}
