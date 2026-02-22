import React, { useState } from 'react';

const formatValue = (value) => {
  if (value == null || Number.isNaN(value)) return '---';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Perp/trading summary section (PermaDex-style).
 * Props: summaryPeriod, onSummaryPeriodChange, stats for the selected period.
 * stats: { totalTrades, longTrades, shortTrades, totalVolume, longVolume, shortVolume, totalFundingFee, latestFundingFee, totalCommission, latestCommission }
 */
export function PortfolioSummary({
  summaryPeriod = '7D',
  onSummaryPeriodChange,
  stats = {},
}) {
  const periods = ['24h', '7D', '14D', '30D', 'allTime'];
  const {
    totalTrades = 0,
    longTrades = 0,
    shortTrades = 0,
    totalVolume = 0,
    longVolume = 0,
    shortVolume = 0,
    totalFundingFee = 0,
    latestFundingFee = null,
    totalCommission = 0,
    latestCommission = null,
  } = stats;

  return (
    <>
      <div className="flex items-center gap-4 md:gap-6 mb-4">
        <span className="text-lg font-medium text-white border-b-2 border-[var(--color-accent-primary)] pb-1">
          Perp Summary
        </span>
      </div>

      <div className="w-full bg-transparent rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h3 className="text-white text-lg font-normal">Summary</h3>
            <div className="flex flex-row gap-1 md:gap-2 flex-wrap">
              {periods.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onSummaryPeriodChange && onSummaryPeriodChange(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-transparent border ${
                    summaryPeriod === p
                      ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]'
                      : 'border-white/40 text-white/70 hover:text-white hover:border-white/60'
                  }`}
                >
                  {p === 'allTime' ? 'All Time' : p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:divide-x md:divide-white/20">
            <div className="flex flex-col gap-3 pr-0 md:pr-6">
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm font-normal">Total no. of trades</span>
                <span className="text-white text-base font-normal">{totalTrades}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm font-normal">Long</span>
                <span className="text-[var(--color-accent-primary)] text-base font-normal">{longTrades}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm font-normal">Short</span>
                <span className="text-[#ef4444] text-base font-normal">{shortTrades}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 px-0 md:px-6">
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm font-normal">Total vol. of trades</span>
                <span className="text-white text-base font-normal">${formatValue(totalVolume)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm font-normal">Long</span>
                <span className="text-[var(--color-accent-primary)] text-base font-normal">${formatValue(longVolume)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm font-normal">Short</span>
                <span className="text-[#ef4444] text-base font-normal">${formatValue(shortVolume)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 px-0 md:px-6">
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm font-normal">Total funding fee</span>
                <span className="text-white text-base font-normal">${formatValue(totalFundingFee)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm font-normal">Latest funding fee</span>
                <span className="text-white text-base font-normal">{formatValue(latestFundingFee)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pl-0 md:pl-6">
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm font-normal">Total commission</span>
                <span className="text-white text-base font-normal">${formatValue(totalCommission)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm font-normal">Latest commission</span>
                <span className="text-white text-base font-normal">{formatValue(latestCommission)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
