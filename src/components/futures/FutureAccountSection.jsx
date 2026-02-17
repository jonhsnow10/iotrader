import React from 'react';

export function FutureAccountSection({ isConnected }) {
  return (
    <div
      className="flex flex-col h-full p-4 space-y-3 bg-[#080808] overflow-y-auto overscroll-contain"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="text-xs font-semibold text-[#999999] pb-2">Account</div>

      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 btn-primary-accent px-3 py-1.5"
        >
          Deposit
        </button>
        <button
          type="button"
          className="flex-1 px-3 py-1.5 rounded bg-transparent border border-[#FFFFFF] text-white text-xs font-sans font-semibold hover:border-[#fff800] hover:text-[#fff800] transition-colors cursor-pointer"
        >
          Withdraw
        </button>
      </div>

      <div>
        <div className="mb-3 mt-3">
          <div className="text-base font-sans font-semibold text-white">Account Equity</div>
        </div>
        <div className="space-y-2.5">
          <div className="flex justify-between text-xs">
            <span className="text-[#A3A3A3] font-sans font-normal">Perp total value</span>
            <span className="text-[#A3A3A3] font-sans font-normal">--</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#A3A3A3] font-sans font-normal">Perp Unrealized PNL</span>
            <span className="text-[#A3A3A3] font-sans font-normal">--</span>
          </div>
        </div>
      </div>

      <div>
        <div className="text-base font-sans font-semibold text-white mb-3">Margin</div>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#A3A3A3] font-sans font-normal">Account Margin Ratio</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#666666]" />
              <span className="text-[#666666] font-sans font-normal">--</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#A3A3A3] font-sans font-normal">Maintenance Margin Ratio</span>
            <span className="text-[#FF8C00] font-sans font-semibold">--</span>
          </div>
        </div>
      </div>
    </div>
  );
}
