import {
  useMarkets,
  useTickerStream,
  useOrderbookStream,
  useMarketTradeStream,
  useFundingRate,
  useSymbolsInfo,
} from '@orderly.network/hooks';

export function useOrderlyMarkets() {
  const [markets] = useMarkets();
  const perpMarkets = markets?.filter((m) => m.symbol?.startsWith('PERP_')) || [];
  return {
    markets: perpMarkets,
    isLoading: !markets || markets.length === 0,
  };
}

export function useOrderlyPerpetualMarkets() {
  const [markets] = useMarkets();
  const perpMarkets = markets?.filter((m) => m.symbol?.startsWith('PERP_')) || [];
  return {
    markets: perpMarkets,
    isLoading: !markets || markets.length === 0,
  };
}

export function useOrderlyFundingRate(symbol) {
  const fundingRate = useFundingRate(symbol);
  return {
    estFundingRate: fundingRate?.est_funding_rate || null,
    lastFundingRate: fundingRate?.last_funding_rate || null,
    nextFundingTime: fundingRate?.est_funding_rate_timestamp || null,
    countdown: fundingRate?.countDown || '00:00:00',
    isLoading: !fundingRate,
  };
}

export function useOrderlyTicker(symbol) {
  const ticker = useTickerStream(symbol);
  if (!ticker) {
    return {
      symbol: '',
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
  const open = ticker['24h_open'] || 0;
  const close = ticker['24h_close'] || 0;
  const priceChange = close - open;
  const priceChangePercent = open !== 0 ? ((close - open) / open) * 100 : 0;
  return {
    symbol: ticker.symbol || '',
    lastPrice: close,
    priceChange,
    priceChangePercent,
    high24h: ticker['24h_high'] || 0,
    low24h: ticker['24h_low'] || 0,
    volume24h: ticker['24h_volume'] || 0,
    quoteVolume24h: ticker['24h_amount'] || 0,
    openPrice: open,
    isLoading: !ticker.symbol,
  };
}

export function useOrderlySymbolInfo(symbol) {
  const symbolsInfo = useSymbolsInfo();
  const info = symbolsInfo?.[symbol]?.() || {};
  return {
    symbol: info?.symbol || symbol,
    baseAsset: info?.base || symbol.split('_')[1] || 'ETH',
    quoteAsset: info?.quote || symbol.split('_')[2] || 'USDC',
    baseDp: info?.base_dp ?? 4,
    quoteDp: info?.quote_dp ?? 2,
    minNotional: info?.min_notional ?? 10,
    baseMin: info?.base_min ?? 0.001,
    baseMax: info?.base_max ?? 1000000,
    baseTick: info?.base_tick ?? 0.0001,
    quoteTick: info?.quote_tick ?? 0.01,
    isLoading: !symbolsInfo,
  };
}

export function useOrderlySymbolValidation(symbol) {
  const symbolInfo = useOrderlySymbolInfo(symbol);
  const orderbook = useOrderlyOrderBook(symbol, 1);
  const markPrice = orderbook.markPrice || 0;
  return {
    symbolInfo: {
      symbol: symbolInfo.symbol,
      minNotional: symbolInfo.minNotional,
      baseDp: symbolInfo.baseDp,
      quoteDp: symbolInfo.quoteDp,
      baseMin: symbolInfo.baseMin,
      baseMax: symbolInfo.baseMax,
      baseTick: symbolInfo.baseTick,
      quoteTick: symbolInfo.quoteTick,
    },
    markPrice,
    isReady: !symbolInfo.isLoading && !orderbook.isLoading && markPrice > 0,
  };
}

export function useOrderlyOrderBook(symbol, depth = 10) {
  const orderbookData = useOrderbookStream(symbol, undefined, { level: depth, padding: false });
  const streamValue = Array.isArray(orderbookData) ? orderbookData[0] : orderbookData;
  const streamControls = Array.isArray(orderbookData) ? orderbookData[1] : undefined;

  const bookAny =
    streamValue?.data ?? streamValue;
  const asks = Array.isArray(bookAny?.asks) ? bookAny.asks : [];
  const bids = Array.isArray(bookAny?.bids) ? bookAny.bids : [];
  const markPrice = typeof bookAny?.markPrice === 'number' ? bookAny.markPrice : 0;
  const hasBookShape = Array.isArray(bookAny?.asks) || Array.isArray(bookAny?.bids);
  const isLoading = (streamControls?.isLoading ?? streamValue?.isLoading ?? !hasBookShape) ?? true;

  return { asks, bids, markPrice, isLoading };
}

export function useOrderlyMarketTrades(symbol, limit = 20) {
  const result = useMarketTradeStream(symbol, { limit });
  if (!result) return { trades: [], isLoading: true };
  return {
    trades: result.data || [],
    isLoading: result.isLoading ?? true,
  };
}

export function useOrderlyMarketData(symbol) {
  const ticker = useOrderlyTicker(symbol);
  const orderbook = useOrderlyOrderBook(symbol, 25);
  const trades = useOrderlyMarketTrades(symbol);
  return {
    ticker,
    orderbook,
    trades,
    isLoading: ticker.isLoading || orderbook.isLoading || trades.isLoading,
  };
}
