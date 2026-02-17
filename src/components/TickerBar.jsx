import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const TickerBar = () => {
  const [tickerItems, setTickerItems] = useState([
    { symbol: "BTC", price: 0, change: 0 },
    { symbol: "ETH", price: 0, change: 0 },
    { symbol: "SOL", price: 0, change: 0 },
    { symbol: "BNB", price: 0, change: 0 },
    { symbol: "XRP", price: 0, change: 0 },
    { symbol: "ADA", price: 0, change: 0 },
    { symbol: "DOGE", price: 0, change: 0 },
    { symbol: "AVAX", price: 0, change: 0 },
  ]);

  const wsRef = useRef(null);
  const usingBinance = useRef(false);
  const priceDataRef = useRef({});

  // Binance symbol mapping
  const binanceSymbols = {
    BTC: "btcusdt",
    ETH: "ethusdt",
    SOL: "solusdt",
    BNB: "bnbusdt",
    XRP: "xrpusdt",
    ADA: "adausdt",
    DOGE: "dogeusdt",
    AVAX: "avaxusdt",
  };

  // Fetch from Binance REST API (primary)
  const fetchLivePricesFromBinance = async () => {
    try {
      // Fetch all tickers at once (Binance returns all tickers without params)
      const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
      
      // Filter to only the symbols we need
      const relevantTickers = response.data.filter(ticker => 
        Object.values(binanceSymbols).includes(ticker.symbol.toLowerCase())
      );
      
      const priceMap = {};
      relevantTickers.forEach(ticker => {
        const symbol = ticker.symbol.toLowerCase();
        // Find the key from binanceSymbols
        const key = Object.keys(binanceSymbols).find(k => binanceSymbols[k] === symbol);
        if (key) {
          const price = parseFloat(ticker.lastPrice);
          const openPrice = parseFloat(ticker.openPrice);
          const change24h = openPrice > 0 ? ((price - openPrice) / openPrice) * 100 : parseFloat(ticker.priceChangePercent) || 0;
          
          priceMap[key] = {
            price,
            change: change24h,
          };
        }
      });

      setTickerItems(prev => prev.map(item => ({
        ...item,
        price: priceMap[item.symbol]?.price || item.price,
        change: priceMap[item.symbol]?.change || item.change,
      })));

      // Update price data ref
      Object.assign(priceDataRef.current, priceMap);
      return true;
    } catch (error) {
      console.error('Error fetching ticker prices from Binance REST API:', error);
      return false;
    }
  };

  // Setup Binance WebSocket for real-time updates
  const setupBinanceWebSocket = () => {
    // Close existing WebSocket if any
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        console.warn("Error closing existing WebSocket:", e);
      }
      wsRef.current = null;
    }

    try {
      // Create streams for all symbols
      const streams = Object.values(binanceSymbols).map(symbol => `${symbol}@ticker`).join('/');
      const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

      ws.onopen = () => {
        console.log('✅ Binance WebSocket connected for ticker');
        usingBinance.current = true;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.stream && data.data) {
            const stream = data.stream;
            const tickerData = data.data;
            
            // Extract symbol from stream (e.g., "btcusdt@ticker" -> "BTC")
            const streamSymbol = stream.split('@')[0].toUpperCase();
            const key = Object.keys(binanceSymbols).find(k => 
              binanceSymbols[k].toUpperCase() === streamSymbol
            );
            
            if (key && tickerData.c) {
              const price = parseFloat(tickerData.c); // Last price
              const openPrice = parseFloat(tickerData.o); // Open price
              const change24h = openPrice > 0 ? ((price - openPrice) / openPrice) * 100 : parseFloat(tickerData.P) || 0;

              // Update price data
              priceDataRef.current[key] = {
                price,
                change: change24h,
              };

              // Update ticker items
              setTickerItems(prev => prev.map(item => 
                item.symbol === key 
                  ? { ...item, price, change: change24h }
                  : item
              ));
            }
          }
        } catch (error) {
          console.error('Error parsing Binance WebSocket data:', error);
        }
      };

      ws.onerror = (error) => {
        console.warn('⚠️ Binance WebSocket error, using REST API fallback:', error);
        // Try REST API as fallback
        fetchLivePricesFromBinance();
      };

      ws.onclose = (event) => {
        // Only reconnect if not manual close and still using Binance
        if (event.code !== 1000 && usingBinance.current) {
          setTimeout(() => {
            setupBinanceWebSocket();
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create Binance WebSocket, using REST API:', error);
      fetchLivePricesFromBinance();
    }
  };

  // Main fetch function - use Binance API
  const fetchLivePrices = async () => {
    // Fetch from Binance REST API
    await fetchLivePricesFromBinance();
    
    // Setup WebSocket for real-time updates if not already connected
    if (!usingBinance.current) {
      setupBinanceWebSocket();
    }
  };

  useEffect(() => {
    fetchLivePrices(); // Fetch immediately
    const interval = setInterval(fetchLivePrices, 30000); // Update every 30 seconds (less frequent since WebSocket handles real-time)
    
    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          console.warn("Error closing WebSocket on cleanup:", e);
        }
      }
    };
  }, []);

  const loopData = [...tickerItems, ...tickerItems];

  return (
    <div className="w-full bg-[#080808] border-b border-white/5 h-10 flex items-center overflow-hidden relative z-[60] select-none">
      {/* Container 1 */}
      <div className="flex animate-scroll whitespace-nowrap shrink-0">
        {loopData.map((item, i) => (
          <div
            key={i}
            className="flex items-center mx-8 space-x-2 text-xs font-medium"
          >
            <span className="text-gray-400 font-bold tracking-wider">
              {item.symbol}/USDT
            </span>
            <span className="text-white font-mono">
              $
              {item.price >= 1
                ? item.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : item.price.toLocaleString(undefined, {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 6,
                  })}
            </span>
            <span
              className={`${
                item.change >= 0 ? "text-emerald-400" : "text-rose-400"
              } font-bold`}
            >
              {item.change >= 0 ? "+" : ""}
              {item.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      {/* Container 2 (Duplicate for seamless loop) */}
      <div
        className="flex animate-scroll whitespace-nowrap shrink-0"
        aria-hidden="true"
      >
        {loopData.map((item, i) => (
          <div
            key={`dup-${i}`}
            className="flex items-center mx-8 space-x-2 text-xs font-medium"
          >
            <span className="text-gray-400 font-bold tracking-wider">
              {item.symbol}/USDT
            </span>
            <span className="text-white font-mono">
              $
              {item.price >= 1
                ? item.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : item.price.toLocaleString(undefined, {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 6,
                  })}
            </span>
            <span
              className={`${
                item.change >= 0 ? "text-emerald-400" : "text-rose-400"
              } font-bold`}
            >
              {item.change >= 0 ? "+" : ""}
              {item.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TickerBar;
