import { useMemo } from 'react';
import {
  useHoldingStream,
  useIndexPricesStream,
  useAccount,
  useCollateral,
} from '@orderly.network/hooks';
import { AccountStatusEnum } from '@orderly.network/types';

function normalizeAsset(holding, markPrice) {
  const total = holding.holding;
  const frozen = holding.frozen;
  const inOrders = frozen;
  const margin = 0;
  const available = total - frozen;
  const usdValue = total * markPrice;
  return {
    symbol: holding.token,
    total,
    available,
    inOrders,
    margin,
    usdValue,
  };
}

function normalizeWithCollateral(holdings, indexPrices, totalAvailableBalance) {
  return (holdings || []).map((holding) => {
    const priceKey = holding.token === 'USDC' ? 'USDC' : `PERP_${holding.token}_USDC`;
    const markPrice = holding.token === 'USDC' ? 1 : (indexPrices?.[priceKey] ?? 0);
    if (holding.token === 'USDC') {
      const total = holding.holding;
      const frozen = holding.frozen;
      const inOrders = frozen;
      const available = totalAvailableBalance ?? (total - frozen);
      const margin = total - available - inOrders;
      return {
        symbol: holding.token,
        total,
        available: Math.max(0, available),
        inOrders,
        margin: Math.max(0, margin),
        usdValue: total * markPrice,
      };
    }
    return normalizeAsset(holding, markPrice);
  });
}

function sortBalances(balances) {
  return [...balances].sort((a, b) => {
    if (a.symbol === 'USDC') return -1;
    if (b.symbol === 'USDC') return 1;
    return (b.usdValue || 0) - (a.usdValue || 0);
  });
}

function filterNonZero(balances, minUsd = 0.01) {
  return balances.filter((b) => {
    const has = b.total > 0 || b.inOrders > 0 || b.margin > 0;
    const meets = (b.usdValue || 0) >= minUsd;
    return has || meets;
  });
}

export function useAccountBalance({ includeZeroBalances = false, minUsdValue = 0.01 } = {}) {
  const { data: holdings, isLoading: holdingsLoading } = useHoldingStream();
  const { data: indexPrices } = useIndexPricesStream();
  const { availableBalance } = useCollateral();
  const { state: { status } } = useAccount();
  const isConnected = status >= AccountStatusEnum.Connected;

  const { assets, totalBalanceUSD } = useMemo(() => {
    if (!isConnected || !holdings || !indexPrices) {
      return { assets: [], totalBalanceUSD: 0 };
    }
    let normalized = normalizeWithCollateral(holdings, indexPrices, availableBalance);
    if (!includeZeroBalances) {
      normalized = filterNonZero(normalized, minUsdValue);
    }
    const sorted = sortBalances(normalized);
    const total = sorted.reduce((sum, b) => sum + (b.usdValue || 0), 0);
    return { assets: sorted, totalBalanceUSD: total };
  }, [holdings, indexPrices, isConnected, includeZeroBalances, minUsdValue, availableBalance]);

  return {
    assets,
    totalBalanceUSD,
    totalBalanceUSDC: totalBalanceUSD,
    isLoading: holdingsLoading,
    isConnected,
  };
}
