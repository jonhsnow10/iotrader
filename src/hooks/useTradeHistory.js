import { useState, useMemo } from 'react';
import { usePrivateQuery, useAccount } from '@orderly.network/hooks';
import { AccountStatusEnum } from '@orderly.network/types';

const PAGE_SIZE = 10;

function normalizeTrade(trade) {
  return {
    timestamp: trade.executed_timestamp,
    side: trade.side,
    price: trade.executed_price,
    quantity: trade.executed_quantity,
    total: trade.executed_price * trade.executed_quantity,
  };
}

export function useTradeHistory({ symbol, pageSize = PAGE_SIZE } = {}) {
  const { state: { status } } = useAccount();
  const isConnected = status >= AccountStatusEnum.Connected;

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (symbol) params.set('symbol', symbol);
    params.set('size', '500');
    return `/v1/trades?${params.toString()}`;
  }, [symbol]);

  const { data, isLoading, error } = usePrivateQuery(
    isConnected ? queryString : null,
    { revalidateOnFocus: true, refreshInterval: 5000 }
  );

  const depsKey = `${symbol}-${status}`;
  const [pageState, setPageState] = useState({ key: depsKey, page: 1 });
  if (pageState.key !== depsKey) {
    setPageState({ key: depsKey, page: 1 });
  }
  const currentPage = pageState.page;
  const setCurrentPage = (page) => setPageState((s) => ({ ...s, page }));

  const sortedTrades = useMemo(() => {
    const rows = data?.rows ?? (Array.isArray(data) ? data : []);
    if (!rows || rows.length === 0) return [];
    return rows.map(normalizeTrade).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [data]);

  const totalTrades = sortedTrades.length;
  const totalPages = Math.ceil(totalTrades / pageSize);
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTrades.slice(start, start + pageSize);
  }, [sortedTrades, currentPage, pageSize]);

  return {
    paginatedTrades,
    allTrades: sortedTrades,
    currentPage,
    totalPages,
    totalTrades,
    pageSize,
    isLoading,
    isConnected,
    error,
    goToPage: (p) => setCurrentPage(Math.max(1, Math.min(p, totalPages))),
    nextPage: () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setCurrentPage((p) => Math.max(p - 1, 1)),
  };
}
