import { useState, useEffect, useCallback } from 'react';
import {
  fetchContracts,
  fetchOrderbook,
  contractsBySymbol,
} from '../services/derivativesApi';

const CONTRACTS_POLL_MS = 10000;
const ORDERBOOK_POLL_MS = 5000;

export function useDerivativesContracts() {
  const [contractsMap, setContractsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const list = await fetchContracts();
      setContractsMap(contractsBySymbol(list));
    } catch (err) {
      console.error('[useDerivativesContracts]', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, CONTRACTS_POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  return { contractsMap, isLoading };
}

function parseContractToTicker(contract, symbol) {
  if (!contract) {
    return {
      symbol: symbol || '',
      lastPrice: 0,
      priceChange: 0,
      priceChangePercent: 0,
      high24h: 0,
      low24h: 0,
      volume24h: 0,
      quoteVolume24h: 0,
      openPrice: 0,
      isLoading: true,
    };
  }
  const lastPrice = contract.last_price || 0;
  const openPrice = contract.index_price || lastPrice;
  const priceChange = lastPrice - openPrice;
  const priceChangePercent = openPrice !== 0 ? (priceChange / openPrice) * 100 : 0;
  return {
    symbol: contract.symbol || symbol,
    lastPrice,
    priceChange,
    priceChangePercent,
    high24h: contract.high || 0,
    low24h: contract.low || 0,
    volume24h: contract.base_volume || 0,
    quoteVolume24h: contract.volume_24h_usd ?? contract.target_volume ?? 0,
    openPrice,
    isLoading: false,
  };
}

export function useDerivativesTicker(symbol, externalContractsMap = null) {
  const [internalMap, setInternalMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!symbol) {
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      const list = await fetchContracts();
      setInternalMap(contractsBySymbol(list));
    } catch (err) {
      console.error('[useDerivativesTicker]', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    if (externalContractsMap != null) {
      setIsLoading(false);
      return;
    }
    load();
    const t = setInterval(load, CONTRACTS_POLL_MS);
    return () => clearInterval(t);
  }, [load, externalContractsMap]);

  const contractsMap = externalContractsMap != null ? externalContractsMap : internalMap;
  const contract = contractsMap[symbol];
  const ticker = parseContractToTicker(contract, symbol);
  const loading = externalContractsMap != null ? !contract && Object.keys(contractsMap).length > 0 : isLoading;
  ticker.isLoading = (loading && !error) || false;
  return ticker;
}

export function useDerivativesOrderBook(symbol, depth = 25) {
  const [orderbook, setOrderbook] = useState({
    asks: [],
    bids: [],
    markPrice: 0,
    middlePrice: [],
    isLoading: true,
  });

  const tickerId = symbol ? `${symbol}-PERP` : '';

  const load = useCallback(async () => {
    if (!tickerId) {
      setOrderbook((prev) => ({ ...prev, isLoading: false }));
      return;
    }
    try {
      const data = await fetchOrderbook(tickerId);
      const rawBids = (data.bids || []).slice(0, depth);
      const rawAsks = (data.asks || []).slice(0, depth);
      const bids = rawBids.map((row) => [parseFloat(row[0]) || 0, parseFloat(row[1]) || 0]);
      const asks = rawAsks.map((row) => [parseFloat(row[0]) || 0, parseFloat(row[1]) || 0]);
      const bestBid = bids[0]?.[0];
      const bestAsk = asks[0]?.[0];
      const markPrice = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : 0;
      setOrderbook({
        asks,
        bids,
        markPrice,
        middlePrice: markPrice ? [markPrice] : [],
        isLoading: false,
      });
    } catch (err) {
      console.error('[useDerivativesOrderBook]', err);
      setOrderbook((prev) => ({ ...prev, asks: [], bids: [], isLoading: false }));
    }
  }, [tickerId, depth]);

  useEffect(() => {
    setOrderbook((prev) => ({ ...prev, isLoading: true }));
    load();
    const t = setInterval(load, ORDERBOOK_POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  return orderbook;
}

export function useDerivativesFunding(symbol, externalContractsMap = null) {
  const [internalMap, setInternalMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!symbol) {
      setIsLoading(false);
      return;
    }
    try {
      const list = await fetchContracts();
      setInternalMap(contractsBySymbol(list));
    } catch (err) {
      console.error('[useDerivativesFunding]', err);
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    if (externalContractsMap != null) {
      setIsLoading(false);
      return;
    }
    load();
    const t = setInterval(load, CONTRACTS_POLL_MS);
    return () => clearInterval(t);
  }, [load, externalContractsMap]);

  const contractsMap = externalContractsMap != null ? externalContractsMap : internalMap;
  const contract = contractsMap[symbol];
  const rate = contract?.funding_rate;
  const loading = externalContractsMap != null ? !contract && Object.keys(contractsMap).length > 0 : isLoading;
  return {
    estFundingRate: rate != null ? String(rate) : null,
    lastFundingRate: rate != null ? rate : null,
    nextFundingTime: null,
    countdown: 'Next in ~8h',
    isLoading: loading,
  };
}

export function useDerivativesMarketTrades(symbol, limit = 20) {
  return {
    trades: [],
    isLoading: false,
  };
}

export function useDerivativesMarketData(symbol, contractsMap = null) {
  const ticker = useDerivativesTicker(symbol, contractsMap);
  const orderbook = useDerivativesOrderBook(symbol, 25);
  const trades = useDerivativesMarketTrades(symbol);

  return {
    ticker,
    orderbook,
    trades,
    isLoading: ticker.isLoading || orderbook.isLoading || trades.isLoading,
  };
}
