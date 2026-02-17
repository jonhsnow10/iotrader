import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useChainId } from 'wagmi';
import Header from '../components/Header';
import SEO from '../components/SEO';
import { useWallet } from '../hooks/useWallet';
import { OrderlyConnect } from '../components/OrderlyConnect';
import {
  useOrderlyMarketData,
  useOrderlyFundingRate,
  useOrderlyPerpetualMarkets,
} from '../hooks/orderly/useOrderlyMarkets';
import { TradingLayout } from '../components/futures/TradingLayout';
import { FutureTradingHeader } from '../components/futures/FutureTradingHeader';
import { FutureOrderBook } from '../components/futures/FutureOrderBook';
import { AccountSection } from '../components/futures/AccountSection';
import { PerpOrderEntry } from '../components/futures/PerpOrderEntry';
import { CustomBottomTabs } from '../components/futures/CustomBottomTabs';
import { MobileTradingTabs } from '../components/futures/MobileTradingTabs';
import { CustomTradingView } from '../components/futures/TradingView';

const ORDERLY_SUPPORTED_CHAINS = [
  { evmChainId: 1 },
  { evmChainId: 42161 },
  { evmChainId: 56 },
  { evmChainId: 11155111 },
];

const timeframes = [
  { value: '1M', label: '1M' },
  { value: '5M', label: '5M' },
  { value: '15M', label: '15M' },
  { value: '1H', label: '1H' },
  { value: '1D', label: '1D' },
];

const FutureTrading = () => {
  const chainId = useChainId();
  const [symbol, setSymbol] = useState('PERP_ETH_USDC');
  const [timeframe, setTimeframe] = useState('5M');
  const { isConnected } = useWallet();

  const { markets } = useOrderlyPerpetualMarkets();
  const { ticker, orderbook: ob, trades } = useOrderlyMarketData(symbol);
  const fundingRate = useOrderlyFundingRate(symbol);

  const isChainSupported = ORDERLY_SUPPORTED_CHAINS.some((c) => c.evmChainId === chainId);

  const chartInterval = { '1M': '1', '5M': '5', '15M': '15', '1H': '60', '1D': '1D' }[timeframe] || '5';

  const handleOrderbookPriceClick = useCallback((price, side) => {
  }, []);

  const handleSymbolChange = useCallback((newSymbol) => {
    setSymbol(newSymbol);
  }, []);

  const lastOrderbookRef = useRef({ bids: [], asks: [], isLoading: true });
  useEffect(() => {
    if (ob?.bids?.length || ob?.asks?.length) {
      lastOrderbookRef.current = {
        bids: ob.bids || [],
        asks: ob.asks || [],
        isLoading: ob?.isLoading ?? false,
      };
    }
  }, [ob?.bids, ob?.asks, ob?.isLoading]);

  const orderbookData = useMemo(() => {
    const hasData = ob?.bids?.length || ob?.asks?.length;
    if (hasData) {
      return { bids: ob.bids || [], asks: ob.asks || [], isLoading: ob?.isLoading };
    }
    const last = lastOrderbookRef.current;
    const hasStale = last.bids?.length || last.asks?.length;
    if (hasStale) {
      return { bids: last.bids, asks: last.asks, isLoading: ob?.isLoading ?? false };
    }
    return { bids: [], asks: [], isLoading: ob?.isLoading ?? true };
  }, [ob?.bids, ob?.asks, ob?.isLoading]);

  const tradesData = useMemo(() => {
    if (trades?.trades?.length) {
      return trades.trades.map((t, i) => ({
        id: t.executed_timestamp ?? t.timestamp ?? i,
        side: (t.side || 'BUY').toUpperCase(),
        executed_price: t.executed_price ?? t.price,
        price: t.executed_price ?? t.price,
        executed_quantity: t.executed_quantity ?? t.quantity,
        quantity: t.executed_quantity ?? t.quantity,
        executed_timestamp: t.executed_timestamp ?? t.timestamp,
        timestamp: t.executed_timestamp ?? t.timestamp,
      }));
    }
    return [];
  }, [trades?.trades]);

  const chartEl = (
    <div className="relative w-full h-full">
      <div className="absolute top-2 left-8 flex flex-row items-center gap-2 z-20 pb-2">
        <span className="flex items-center text-xs font-medium text-gray-400 shrink-0">
          Time Range
        </span>
        {timeframes.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={`flex flex-row justify-center items-center px-1 py-0.5 rounded transition-all cursor-pointer shrink-0 ${
              timeframe === tf.value
                ? 'bg-yellow-500 text-black text-sm font-bold'
                : 'bg-white/5 text-gray-400 text-sm font-normal hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>
      <CustomTradingView
        symbol={symbol}
        interval={chartInterval}
        showCustomToolbar
      />
    </div>
  );

  const orderEntryEl = <PerpOrderEntry symbol={symbol} />;

  const orderBookEl = (
    <FutureOrderBook
      orderbook={orderbookData}
      trades={tradesData}
      onPriceClick={handleOrderbookPriceClick}
      isLoading={ob?.isLoading}
    />
  );

  if (!isChainSupported) {
    return (
      <>
        <Header />
        <div className="w-full h-screen flex items-center justify-center bg-[#080808] text-white font-sans">
          <div className="max-w-md p-8 bg-[color:var(--color-background-secondary)] border border-[color:var(--color-border-strong)] rounded-2xl">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Unsupported Network</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Perpetual trading is not available on this network. Please switch to Ethereum, Arbitrum, or BNB Chain to access perpetual futures.
              </p>
              <div className="mt-2 text-xs text-gray-500">Current Chain ID: {chainId}</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Futures Trading - High Leverage Crypto Trading"
        description="Trade cryptocurrency futures with high leverage on BTC, ETH, BNB, SOL and more. Long or short positions with real-time charts and instant execution via Orderly Network."
        keywords="crypto futures trading, leveraged trading, BTC futures, ETH futures, BNB futures, long short trading, cryptocurrency derivatives, DeFi trading, Orderly"
        url="/future-trading"
      />
        <div className="flex flex-col min-h-[100dvh] lg:min-h-screen bg-[#080808] overflow-x-hidden lg:overflow-visible pb-[env(safe-area-inset-bottom)]">
        <Header />
        <OrderlyConnect />
        <TradingLayout
          header={
            <FutureTradingHeader
              markets={markets}
              symbol={symbol}
              onSymbolChange={handleSymbolChange}
              ticker={ticker}
              fundingRate={fundingRate}
            />
          }
          chart={chartEl}
          orderBook={orderBookEl}
          rightPanel={orderEntryEl}
          bottomTabs={<CustomBottomTabs symbol={symbol} />}
          account={<AccountSection />}
          mobileTabs={
            <MobileTradingTabs
              chart={chartEl}
              orderBook={orderBookEl}
              orderEntry={orderEntryEl}
              symbol={symbol}
            />
          }
        />
      </div>
    </>
  );
};

export default FutureTrading;
