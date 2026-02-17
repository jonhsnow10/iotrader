import React, { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { usePositionStream, useMarginRatio } from '@orderly.network/hooks';
import { DepositModal } from './DepositModal';
import { WithdrawModal } from './WithdrawModal';
import { InfoTooltip } from '../ui/InfoTooltip';

export function AccountSection() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const { isConnected } = useAccount();

  const [{ rows: positions }] = usePositionStream('all');
  const { marginRatio, mmr } = useMarginRatio();

  const perpTotalValue = useMemo(() => {
    if (!isConnected || !positions || positions.length === 0) return null;
    try {
      const value = positions.reduce((total, p) => {
        if (!p.position_qty || !p.mark_price || isNaN(p.position_qty) || isNaN(p.mark_price)) return total;
        const n = Math.abs(p.position_qty) * p.mark_price;
        return isNaN(n) ? total : total + n;
      }, 0);
      return isNaN(value) ? null : value;
    } catch {
      return null;
    }
  }, [isConnected, positions]);

  const perpUnrealizedPnL = useMemo(() => {
    if (!isConnected || !positions || positions.length === 0) return null;
    try {
      const value = positions.reduce((total, p) => {
        if (!p.position_qty || p.average_open_price == null) return total;
        const pnl = p.position_qty * (p.mark_price - p.average_open_price);
        return isNaN(pnl) ? total : total + pnl;
      }, 0);
      return isNaN(value) ? null : value;
    } catch {
      return null;
    }
  }, [isConnected, positions]);

  const getMarginRatioRisk = useMemo(() => {
    if (!isConnected || marginRatio === 0 || isNaN(marginRatio)) return 'neutral';
    if (mmr == null || isNaN(mmr)) return 'safe';
    if (marginRatio <= mmr) return 'danger';
    if (marginRatio <= mmr + 0.1) return 'warning';
    return 'safe';
  }, [isConnected, marginRatio, mmr]);

  const formatUSD = (value) => {
    if (!isConnected || value == null || isNaN(value)) return '--';
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <>
      <div
        className="flex flex-col h-full p-4 space-y-3 bg-[#080808] overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="text-xs font-semibold text-[#999999] pb-2">Account</div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsDepositModalOpen(true)}
            className="flex-1 btn-primary-accent"
          >
            Deposit
          </button>
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex-1 px-3 py-1.5 rounded bg-transparent border border-white text-white text-xs font-semibold hover:border-[color:var(--color-accent-primary)] hover:text-[color:var(--color-accent-primary)] transition-colors cursor-pointer"
          >
            Withdraw
          </button>
        </div>

        <div>
          <div className="mb-3 mt-3">
            <InfoTooltip content="Account Equity includes your balance plus unrealized PnL. This is used to calculate margin ratio.">
              <div className="text-base font-semibold text-white">Account Equity</div>
            </InfoTooltip>
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#A3A3A3]">Perp total value</span>
              <span className="text-[#A3A3A3]">
                {perpTotalValue !== null ? `$${formatUSD(perpTotalValue)}` : '--'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <InfoTooltip content="Unrealized PnL is your position's profit/loss at the current mark price.">
                <span className="text-[#A3A3A3]">Perp Unrealized PNL</span>
              </InfoTooltip>
              <span
                className={
                  perpUnrealizedPnL === null
                    ? 'text-[#A3A3A3]'
                    : perpUnrealizedPnL >= 0
                      ? 'text-[#35D4CA]'
                      : 'text-[#FF3B69]'
                }
              >
                {perpUnrealizedPnL !== null
                  ? `${perpUnrealizedPnL >= 0 ? '+' : ''}$${formatUSD(Math.abs(perpUnrealizedPnL))}`
                  : '--'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-base font-semibold text-white mb-3">Margin</div>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <InfoTooltip content="Margin Ratio shows your account risk. If it falls below maintenance, positions may be liquidated.">
                <span className="text-[#A3A3A3]">Account Margin Ratio</span>
              </InfoTooltip>
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    getMarginRatioRisk === 'safe'
                      ? 'bg-[#35D4CA]'
                      : getMarginRatioRisk === 'warning'
                        ? 'bg-yellow-500'
                        : getMarginRatioRisk === 'danger'
                          ? 'bg-[#FF3B69]'
                          : 'bg-[#666666]'
                  }`}
                />
                <span
                  className={
                    getMarginRatioRisk === 'safe'
                      ? 'text-[#35D4CA]'
                      : getMarginRatioRisk === 'warning'
                        ? 'text-yellow-500'
                        : getMarginRatioRisk === 'danger'
                          ? 'text-[#FF3B69]'
                          : 'text-[#666666]'
                  }
                >
                  {isConnected && marginRatio != null && !isNaN(marginRatio)
                    ? `${(marginRatio * 100).toFixed(2)}%`
                    : '--'}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs">
              <InfoTooltip content="Maintenance Margin is the liquidation threshold.">
                <span className="text-[#A3A3A3]">Maintenance Margin Ratio</span>
              </InfoTooltip>
              <span className="text-[#FF8C00] font-semibold">
                {isConnected && mmr != null && !isNaN(mmr) ? `${(mmr * 100).toFixed(2)}%` : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
    </>
  );
}
