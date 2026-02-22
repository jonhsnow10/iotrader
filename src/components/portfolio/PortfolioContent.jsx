import React, { useState, useRef, useEffect } from 'react';
import { PortfolioSummary } from './PortfolioSummary';
import { PortfolioDetailsTabs } from './PortfolioDetailsTabs';
import { PnLCalendar } from './PnLCalendar';
import { MonthYearSelector } from './MonthYearSelector';
import { usePortfolioStats } from '../../hooks/usePortfolioStats';
import { usePerpSummaryStats } from '../../hooks/usePerpSummaryStats';
import { DepositModal } from '../futures/DepositModal';
import { WithdrawModal } from '../futures/WithdrawModal';

const formatValue = (value) => {
  if (value == null || Number.isNaN(value)) return '---';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * PermaDex-style portfolio content: Trade/Earn tabs, value card, chart/calendar, summary, details.
 * Can receive override totalValue from parent (e.g. dashboard portfolio value from positions+predictions).
 */
export function PortfolioContent({
  overrideTotalValue = null,
  isConnected: overrideConnected = null,
  renderDetailsContent,
  dailyPnL = {},
}) {
  const [activeTab, setActiveTab] = useState('trade');
  const [chartTab, setChartTab] = useState('chart');
  const [timePeriod, setTimePeriod] = useState('7D');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [summaryPeriod, setSummaryPeriod] = useState('7D');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [detailType, setDetailType] = useState('perp');
  const [detailsTab, setDetailsTab] = useState('positions');

  const dropdownRef = useRef(null);

  const { totalValue: orderlyTotalValue, pnl7d, volume7d, spotValue, isConnected: orderlyConnected } = usePortfolioStats();
  const perpStats = usePerpSummaryStats(summaryPeriod);

  const isConnected = overrideConnected !== null ? overrideConnected : orderlyConnected;
  const totalValue = overrideTotalValue !== null ? overrideTotalValue : orderlyTotalValue;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-0 pb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full mb-4 gap-4">
        <div className="flex flex-row gap-4 md:gap-6 items-center">
          <button
            type="button"
            onClick={() => setActiveTab('trade')}
            className={`text-[18px] md:text-[24px] leading-[24px] md:leading-[32px] font-semibold transition-all px-3 md:px-4 py-2 rounded-lg ${
              activeTab === 'trade'
                ? 'bg-[var(--color-accent-primary)] text-black'
                : 'text-white/60 hover:opacity-80'
            }`}
          >
            Trade
          </button>
          <div className="w-px h-6 md:h-8 bg-white/40" />
          <button
            type="button"
            onClick={() => setActiveTab('earn')}
            className={`text-[18px] md:text-[24px] leading-[24px] md:leading-[32px] font-semibold transition-all px-3 md:px-4 py-2 rounded-lg ${
              activeTab === 'earn'
                ? 'bg-[var(--color-accent-primary)] text-black'
                : 'text-white/60 hover:opacity-80'
            }`}
          >
            Earn
          </button>
        </div>
        <div className="flex flex-row gap-2 md:gap-3 items-center flex-wrap">
          <button
            type="button"
            onClick={() => setIsDepositModalOpen(true)}
            className="px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-white text-black text-xs md:text-sm font-medium hover:bg-[var(--color-accent-primary)] transition-all cursor-pointer whitespace-nowrap"
          >
            Deposit
          </button>
          <button
            type="button"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-transparent border border-white/60 text-white text-xs md:text-sm font-medium hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-all cursor-pointer whitespace-nowrap"
          >
            Withdraw
          </button>
        </div>
      </div>

      <div className="w-full bg-transparent rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-8 flex-wrap">
                <div className="flex flex-col gap-1">
                  <h3 className="text-white text-lg font-normal">Total Value</h3>
                  <div className="w-full h-px border-b border-dashed border-white/30" />
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-white/20 rounded-lg text-white text-sm font-normal hover:border-[var(--color-accent-primary)] transition-colors"
                  >
                    {selectedFilter}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-32 bg-[#1a1a1a] border border-white/20 rounded-lg shadow-xl z-50 overflow-hidden">
                      {['All', 'Deposit', 'Withdraw'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSelectedFilter(opt);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-white text-sm hover:bg-white/10 transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[var(--color-accent-primary)] text-2xl font-normal">
                ${formatValue(totalValue)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 md:flex-1 md:justify-center">
              <div className="flex flex-col gap-2 text-center min-w-[120px]">
                <span className="text-white/80 text-sm font-normal">PnL (7D)</span>
                <div className="w-full h-px border-b border-dashed border-white/30" />
                <span
                  className={`text-base font-normal ${
                    pnl7d == null ? 'text-white' : pnl7d >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
                  }`}
                >
                  {pnl7d == null ? '---' : `$${formatValue(pnl7d)}`}
                </span>
              </div>
              <div className="hidden sm:block w-px h-12 bg-white/20" />
              <div className="flex flex-col gap-2 text-center min-w-[120px]">
                <span className="text-white/80 text-sm font-normal">Volume (7D)</span>
                <div className="w-full h-px border-b border-dashed border-white/30" />
                <span className="text-white text-base font-normal">${formatValue(volume7d)}</span>
              </div>
              <div className="hidden sm:block w-px h-12 bg-white/20" />
              <div className="flex flex-col gap-2 text-center min-w-[120px]">
                <span className="text-white/80 text-sm font-normal">Perps</span>
                <div className="w-full h-px border-b border-dashed border-white/30" />
                <span className="text-white text-base font-normal">${formatValue(spotValue)}</span>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-white/20 my-4" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-row gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setChartTab('chart')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all bg-transparent border ${
                  chartTab === 'chart' ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' : 'border-white/40 text-white/70 hover:opacity-100'
                }`}
              >
                Total Value | PnL
              </button>
              <button
                type="button"
                onClick={() => setChartTab('calendar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all bg-transparent border ${
                  chartTab === 'calendar' ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' : 'border-white/40 text-white/70 hover:opacity-100'
                }`}
              >
                PnL Calendar
              </button>
            </div>
            {chartTab === 'calendar' ? (
              <MonthYearSelector selectedDate={calendarDate} onDateChange={setCalendarDate} />
            ) : (
              <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                {['24h', '7D', '14D', '30D', 'allTime'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTimePeriod(p)}
                    className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all bg-transparent border ${
                      timePeriod === p ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' : 'border-white/40 text-white/70 hover:opacity-100'
                    }`}
                  >
                    {p === 'allTime' ? 'All Time' : p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pt-1 pb-4 sm:p-4 h-[220px] sm:h-[260px]">
          {activeTab === 'earn' ? (
            <div className="text-white h-full flex items-center justify-center">
              <p className="text-white/80 text-center font-normal">Coming Soon</p>
            </div>
          ) : chartTab === 'calendar' ? (
            <PnLCalendar selectedDate={calendarDate} dailyPnL={dailyPnL} />
          ) : !isConnected ? (
            <div className="text-white h-full flex items-center justify-center">
              <p className="text-white/70 text-center font-normal">Please connect a wallet first</p>
            </div>
          ) : (
            <div className="text-white h-full flex items-center justify-center">
              <p className="text-white/70 text-center font-normal">No chart data available</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <PortfolioSummary
          summaryPeriod={summaryPeriod}
          onSummaryPeriodChange={setSummaryPeriod}
          stats={perpStats}
        />
      </div>

      <div className="mt-6">
        <PortfolioDetailsTabs
          activeTab={detailsTab}
          onTabChange={setDetailsTab}
          detailType={detailType}
          onDetailTypeChange={setDetailType}
        >
          {typeof renderDetailsContent === 'function'
            ? renderDetailsContent({
                detailsTab,
                detailType,
                setDetailsTab,
              })
            : (
              <div className="text-white/70 text-center py-8">Connect wallet to see details.</div>
            )}
        </PortfolioDetailsTabs>
      </div>

      <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
      <WithdrawModal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} />
    </div>
  );
}
