import React from 'react';

/**
 * PermaDex-style Details section with sub-tabs.
 * Renders tab bar (Balances, Positions, Open Orders, Order History, Trade History, Deposits & Withdrawals)
 * and children as the active content. Parent controls activeTab and content.
 */
export function PortfolioDetailsTabs({
  activeTab,
  onTabChange,
  detailType,
  onDetailTypeChange,
  children,
}) {
  const tabs = [
    { id: 'balances', label: 'Balances' },
    { id: 'positions', label: 'Positions' },
    { id: 'openOrders', label: 'Open Orders' },
    { id: 'orderHistory', label: 'Order History' },
    { id: 'tradeHistory', label: 'Trade History' },
    { id: 'depositsWithdrawals', label: 'Deposits & Withdrawals' },
  ];

  return (
    <>
      <div className="flex items-center gap-4 md:gap-6 mb-4 flex-wrap">
        <h3 className="text-white text-lg font-normal">Details</h3>
        <div className="flex items-center border border-white/30 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => onDetailTypeChange && onDetailTypeChange('perp')}
            className={`px-4 py-1.5 text-sm font-medium transition-all bg-transparent ${
              detailType === 'perp' ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Perp
          </button>
          <div className="w-px h-6 bg-white/30" />
          <button
            type="button"
            onClick={() => onDetailTypeChange && onDetailTypeChange('spot')}
            className={`px-4 py-1.5 text-sm font-medium transition-all bg-transparent ${
              detailType === 'spot' ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Spot
          </button>
        </div>
      </div>

      <div className="w-full rounded-2xl border border-white/20 bg-[rgba(7,7,7,0.93)] overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 md:gap-6 mb-4 border-b border-white/20 pb-3 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange && onTabChange(tab.id)}
                className={`text-sm md:text-base font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[100px]">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
