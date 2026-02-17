import React, { useState } from 'react';

const GREEN = '#35D4CA';
const RED = '#FF3B69';

export function FutureBottomTabs({
  openOrders,
  positions,
  tradeHistory,
  selectedCrypto,
  onCancelOrder,
  onClosePosition,
  isConnected,
}) {
  const [activeTab, setActiveTab] = useState('orders');

  const tabs = [
    { key: 'orders', label: 'Open Orders' },
    { key: 'positions', label: 'Positions' },
    { key: 'trades', label: 'Trade History' },
    { key: 'assets', label: 'Assets' },
    { key: 'deposit-withdraw', label: 'Deposit & Withdrawals' },
  ];

  const filteredOrders = openOrders?.filter((o) => o.symbol === selectedCrypto) ?? [];

  return (
    <div
      className="flex flex-col h-full bg-[#080808] border border-[#313131]"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div
        className="flex flex-row items-center justify-start gap-4 px-8 overflow-x-auto overflow-y-hidden border-t border-b shrink-0"
        style={{
          height: 44,
          borderColor: 'rgba(60, 60, 67, 0.6)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                box-border flex flex-row items-center justify-start shrink-0 py-2 px-1 gap-2 text-left
                text-base font-normal leading-6 transition-colors whitespace-nowrap cursor-pointer
                border-b-2 -mb-px
                ${isActive
                  ? 'border-[#EBB30B] font-bold text-white'
                  : 'border-transparent font-light text-[#737373] hover:text-white'
                }
              `}
              style={{ height: 44 }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-[#080808]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {activeTab === 'positions' && (
          <div className="p-3">
            {(!positions || positions.length === 0) ? (
              <div className="flex flex-col items-center justify-center min-h-[320px] text-center">
                <svg
                  className="w-8 h-8 text-[#333333] mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-[#999999] text-[20px] leading-[24px]">No open positions</p>
                <p className="text-[#666666] text-[20px] leading-[24px] mt-2">Your positions will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {positions.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-2 px-2 rounded border border-[#313131]"
                  >
                    <div className="text-xs">
                      <span className="font-medium" style={{ color: p.side === 'buy' ? GREEN : RED }}>
                        {p.side === 'buy' ? 'Long' : 'Short'}
                      </span>
                      <span className="ml-1 text-white">{p.symbol}</span>
                      <span className="ml-1 text-[#999999]">
                        {p.size?.toFixed(2)} @ ${p.entryPrice?.toFixed(2)}
                      </span>
                      <span className="ml-1 text-white">{p.leverage}x</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onClosePosition?.(p.id)}
                      className="text-xs px-2 py-1 rounded text-white bg-[#FF3B69] hover:opacity-90"
                    >
                      Close
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="p-3">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[320px] text-center">
                <svg
                  className="w-8 h-8 text-[#333333] mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-[#999999] text-[20px] leading-[24px]">No open orders</p>
                <p className="text-[#666666] text-[20px] leading-[24px] mt-2">Your pending orders will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between py-2 px-2 rounded border border-[#313131]"
                  >
                    <div className="text-xs">
                      <span className="text-white font-medium">{o.side === 'buy' ? 'Buy' : 'Sell'}</span>
                      <span className="mx-1 text-[#999999]">{o.symbol}</span>
                      <span className="text-white">{o.size?.toFixed(2)}</span>
                      <span className="text-[#999999]"> @ ${o.price?.toFixed(2)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onCancelOrder?.(o.id)}
                      className="text-xs px-2 py-1 rounded border border-[#FF3B69] text-[#FF3B69] hover:bg-[#FF3B69]/10"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="p-3">
            {(!tradeHistory || tradeHistory.length === 0) ? (
              <div className="flex flex-col items-center justify-center min-h-[320px] text-center">
                <svg
                  className="w-8 h-8 text-[#333333] mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <p className="text-[#999999] text-[20px] leading-[24px]">No trade history</p>
                <p className="text-[#666666] text-[20px] leading-[24px] mt-2">Trade history will appear here</p>
              </div>
            ) : (
              <div className="space-y-1">
                {tradeHistory.slice(0, 30).map((t) => (
                  <div key={t.id} className="flex justify-between text-xs py-1">
                    <span style={{ color: t.side === 'buy' ? GREEN : RED }}>{t.side === 'buy' ? 'Buy' : 'Sell'}</span>
                    <span className="text-white">{t.size?.toFixed(2)}</span>
                    <span className="text-white">${t.price?.toFixed(2)}</span>
                    <span className="text-[#999999]">
                      {t.time ? new Date(t.time).toLocaleTimeString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="p-6">
            <div className="flex flex-col items-center justify-center min-h-[320px] text-center">
              <p className="text-[#999999] text-[20px] leading-[24px]">Account assets</p>
              <p className="text-[#666666] text-[20px] leading-[24px] mt-2">
                {isConnected ? 'Connect wallet to view balance' : 'Connect wallet to view balance'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'deposit-withdraw' && (
          <div className="p-6">
            <div className="flex flex-col items-center justify-center min-h-[320px] text-center">
              <p className="text-[#999999] text-[20px] leading-[24px]">Deposit & Withdraw</p>
              <p className="text-[#666666] text-[20px] leading-[24px] mt-2">Connect wallet to manage deposits</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
