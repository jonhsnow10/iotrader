import { useMemo } from 'react';
import { useCollateral } from '@orderly.network/hooks';
import { useTradeHistory } from './useTradeHistory';

/**
 * Portfolio stats for the PermaDex-style portfolio block.
 * Uses Orderly when connected; otherwise returns nulls.
 */
export function usePortfolioStats() {
  const { totalValue: orderlyTotalValue, unsettledPnL, availableBalance } = useCollateral({ dp: 2 });
  const { allTrades = [], isLoading: tradesLoading, isConnected } = useTradeHistory();

  const { pnl7d, volume7d } = useMemo(() => {
    if (!isConnected || !allTrades?.length) {
      return { pnl7d: null, volume7d: null };
    }
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent7d = allTrades.filter((t) => (t.timestamp || 0) >= sevenDaysAgo);
    if (recent7d.length === 0) return { pnl7d: 0, volume7d: 0 };

    const volume = recent7d.reduce((sum, t) => sum + (t.total || (t.price || 0) * (t.quantity || 0)), 0);
    const realizedPnl = recent7d.reduce((sum, t) => sum + (t.realized_pnl ?? 0), 0);
    const pnl = realizedPnl + (unsettledPnL || 0);

    return { pnl7d: pnl, volume7d: volume };
  }, [allTrades, isConnected, unsettledPnL]);

  return {
    totalValue: orderlyTotalValue ?? null,
    pnl7d,
    volume7d,
    spotValue: availableBalance ?? null,
    isLoading: tradesLoading,
    isConnected,
  };
}
