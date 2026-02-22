import { useMemo } from 'react';
import { useTradeHistory } from './useTradeHistory';

const PERIOD_MS = {
  '24h': 24 * 60 * 60 * 1000,
  '7D': 7 * 24 * 60 * 60 * 1000,
  '14D': 14 * 24 * 60 * 60 * 1000,
  '30D': 30 * 24 * 60 * 60 * 1000,
  allTime: Infinity,
};

/**
 * Perp summary stats for a given time period (PermaDex-style).
 * Uses Orderly trade history when connected.
 */
export function usePerpSummaryStats(summaryPeriod = '7D') {
  const { allTrades = [], isLoading: tradesLoading } = useTradeHistory();

  const stats = useMemo(() => {
    const timeWindowMs = PERIOD_MS[summaryPeriod] ?? PERIOD_MS['7D'];
    const cutoffTime = summaryPeriod === 'allTime' ? 0 : Date.now() - timeWindowMs;
    const filtered = (allTrades || []).filter((t) => (t.timestamp || 0) >= cutoffTime);

    const totalTrades = filtered.length;
    const longTrades = filtered.filter((t) => t.side === 'BUY').length;
    const shortTrades = filtered.filter((t) => t.side === 'SELL').length;

    let totalVolume = 0;
    let longVolume = 0;
    let shortVolume = 0;
    let totalCommission = 0;

    filtered.forEach((t) => {
      const vol = t.total ?? (t.price || 0) * (t.quantity || 0);
      totalVolume += vol;
      if (t.side === 'BUY') longVolume += vol;
      else shortVolume += vol;
      totalCommission += Math.abs(t.fee ?? 0);
    });

    const latestCommission = filtered.length ? Math.abs(filtered[0].fee ?? 0) : null;

    return {
      totalTrades,
      longTrades,
      shortTrades,
      totalVolume,
      longVolume,
      shortVolume,
      totalFundingFee: 0,
      latestFundingFee: null,
      totalCommission,
      latestCommission,
    };
  }, [allTrades, summaryPeriod]);

  return {
    ...stats,
    isLoading: tradesLoading,
  };
}
