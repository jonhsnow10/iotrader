import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { createChart, ColorType, LineSeries } from "lightweight-charts";

const BinanceChart = ({
  selectedCrypto,
  userBets = [],
  livePrices = {},
  userAddress = "",
  onChartPriceUpdate,
  timeRange = "5m",
  selectedCurrency = "BNB", // BNB or USDT
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const chartDataRef = useRef([]);
  const latestPriceRef = useRef(0);
  const wsRef = useRef(null);
  const updateIntervalRef = useRef(null);
  const apiIntervalRef = useRef(null);
  const drawnLinesRef = useRef([]);
  const priceLinesRef = useRef([]);
  const positionLinesRef = useRef([]);
  const positionMarkersRef = useRef([]);
  const [drawingMode, setDrawingMode] = useState(null);
  const [clickPoints, setClickPoints] = useState([]);

  // Binance WebSocket symbol mapping
  const binanceSymbols = {
    BTC: "btc",
    ETH: "eth",
    SOL: "sol",
    DOGE: "doge",
    BNB: "bnb",
    XRP: "xrp",
  };

  // CryptoCompare symbol mapping
  const cryptoCompareSymbols = {
    BTC: "BTC",
    ETH: "ETH",
    SOL: "SOL",
    DOGE: "DOGE",
    BNB: "BNB",
    XRP: "XRP",
  };

  // MEXC API symbol mapping (for MEXC tokens)
  const mexcSymbols = {
    ANB: "ANBUSDT",
    NUMI: "NUMIUSDT",
    SPACE: "SPACEUSDT",
  };

  // Load historical data from CryptoCompare API (or MEXC for ANB)
  const loadHistoricalData = useCallback(async () => {
    if (!selectedCrypto) return;

    // If MEXC token (ANB, NUMI, SPACE), use IOTRADER API (MEXC proxy) for chart data
    if (selectedCrypto === "ANB" || selectedCrypto === "NUMI" || selectedCrypto === "SPACE") {
      try {
        const symbol = mexcSymbols[selectedCrypto]; // e.g., "ANBUSDT", "NUMIUSDT", "SPACEUSDT"
        const limit = timeRange === "5m" ? 5 : timeRange === "10m" ? 10 : 15;
        
        // IOTRADER API - MEXC chart endpoint
        // Endpoint: https://api-iotrader.dev/api/mexc/chart?symbol=NUMIUSDT&interval=1m&limit=500
        const interval = "1m"; // 1 minute intervals
        const apiUrl = `https://api-iotrader.dev/api/mexc/chart?symbol=${symbol}&interval=${interval}&limit=${limit}`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`IOTRADER API returned status: ${response.status}`);
        }

        const klinesData = await response.json();
        
        if (Array.isArray(klinesData) && klinesData.length > 0) {
          // Parse klines data - handle both array format and object format
          const formattedData = klinesData.map((kline) => {
            // If array format: [openTime, open, high, low, close, volume, ...]
            if (Array.isArray(kline)) {
              return {
                time: Math.floor(kline[0] / 1000), // Convert milliseconds to seconds
                value: parseFloat(kline[4]), // Close price (index 4)
              };
            }
            // If object format: { time, close, ... }
            else if (kline.time && kline.close) {
              return {
                time: Math.floor(kline.time / 1000), // Convert milliseconds to seconds if needed
                value: parseFloat(kline.close),
              };
            }
            // Fallback
            return null;
          }).filter(item => item !== null);

          chartDataRef.current = formattedData;

          // Update latest price
          if (formattedData.length > 0) {
            const latest = formattedData[formattedData.length - 1];
            latestPriceRef.current = latest.value;
            if (onChartPriceUpdate) {
              onChartPriceUpdate(selectedCrypto, latest.value);
            }
          }

          if (seriesRef.current) {
            seriesRef.current.setData(formattedData);

            // Set visible range
            const now = Math.floor(Date.now() / 1000);
            const timeRangeSeconds = limit * 60;
            chartRef.current.timeScale().setVisibleRange({
              from: now - timeRangeSeconds,
              to: now,
            });
          }

          console.log(`✅ ${selectedCrypto} chart loaded from IOTRADER API:`, formattedData.length, "points");
        }
      } catch (error) {
        console.error(`Error loading ${selectedCrypto} historical data from IOTRADER API:`, error);
      }
      return;
    }

    try {
      const symbol = cryptoCompareSymbols[selectedCrypto];
      if (!symbol) return;

      const limit = timeRange === "5m" ? 5 : timeRange === "10m" ? 10 : 15;
      const currencySymbol = selectedCurrency === "USDT" ? "USDT" : "BNB";
      const url = `https://min-api.cryptocompare.com/data/v2/histominute?fsym=${symbol}&tsym=${currencySymbol}&limit=${limit}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch historical data");

      const data = await response.json();
      if (data.Data && data.Data.Data && data.Data.Data.length > 0) {
        const formattedData = data.Data.Data.map((candle) => ({
          time: candle.time, // Unix timestamp in seconds
          value: candle.close, // Close price in selected currency
        }));

        chartDataRef.current = formattedData;

        if (seriesRef.current) {
          seriesRef.current.setData(formattedData);

          // Set visible range
          const now = Math.floor(Date.now() / 1000);
          const timeRangeSeconds = limit * 60;
          chartRef.current.timeScale().setVisibleRange({
            from: now - timeRangeSeconds,
            to: now,
          });
        }

        // Update latest price
        if (formattedData.length > 0) {
          const latest = formattedData[formattedData.length - 1];
          latestPriceRef.current = latest.value;
          if (onChartPriceUpdate) {
            onChartPriceUpdate(selectedCrypto, latest.value);
          }
        }
      }
    } catch (error) {
      console.error("Error loading historical data:", error);
    }
  }, [selectedCrypto, timeRange, selectedCurrency, onChartPriceUpdate]);

  // Update chart with latest price (called every 1 second)
  const updateChart = useCallback(() => {
    if (!seriesRef.current || !chartRef.current || latestPriceRef.current <= 0) return;

    const now = Math.floor(Date.now() / 1000);
    const newPoint = {
      time: now,
      value: latestPriceRef.current,
    };

    // Check if point already exists for this second
    const existingIndex = chartDataRef.current.findIndex(
      (p) => p.time === now
    );

    if (existingIndex >= 0) {
      // Update existing point
      chartDataRef.current[existingIndex] = newPoint;
      try {
        seriesRef.current.update(newPoint);
      } catch (error) {
        console.warn("Error updating chart point:", error);
      }
    } else {
      // Add new point
      chartDataRef.current.push(newPoint);

      // Filter data to keep only points within time range
      const limit = timeRange === "5m" ? 5 : timeRange === "10m" ? 10 : 15;
      const timeRangeSeconds = limit * 60;
      const cutoffTime = now - timeRangeSeconds;

      chartDataRef.current = chartDataRef.current.filter(
        (p) => p.time >= cutoffTime
      );

      // Update chart with filtered data
      try {
        seriesRef.current.setData(chartDataRef.current);
      } catch (error) {
        console.warn("Error setting chart data:", error);
      }
    }

    // Auto-scroll to keep latest price visible
    try {
      const limit = timeRange === "5m" ? 5 : timeRange === "10m" ? 10 : 15;
      const timeRangeSeconds = limit * 60;
      chartRef.current.timeScale().setVisibleRange({
        from: now - timeRangeSeconds,
        to: now,
      });
    } catch (error) {
      console.warn("Error updating chart time scale:", error);
    }
  }, [timeRange]);

  // Setup MEXC WebSocket for MEXC tokens (real-time updates)
  const setupMEXCWebSocket = useCallback(() => {
    if (!selectedCrypto || !mexcSymbols[selectedCrypto]) return;

    // Close existing WebSocket
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        // Ignore
      }
      wsRef.current = null;
    }

    try {
      const symbol = mexcSymbols[selectedCrypto]; // e.g., "ANBUSDT", "NUMIUSDT", "SPACEUSDT"
      
      // MEXC WebSocket Base URL: wss://wbs-api.mexc.com/ws
      const ws = new WebSocket("wss://wbs-api.mexc.com/ws");

      ws.onopen = () => {
        console.log(`✅ MEXC WebSocket connected for ${selectedCrypto}`);
        
        // Subscribe to candlestick stream for real-time updates
        // Format: spot@public.kline.v3.api@ANBUSDT@1m
        ws.send(JSON.stringify({
          method: "SUBSCRIPTION",
          params: [`spot@public.kline.v3.api@${symbol}@1m`],
          id: 1
        }));

        // Also subscribe to trades for price updates
        ws.send(JSON.stringify({
          method: "SUBSCRIPTION",
          params: [`spot@public.deals.v3.api@${symbol}`],
          id: 2
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle candlestick updates
          if (data.c && data.c.k) {
            const kline = data.c.k;
            const closePrice = parseFloat(kline.c); // Close price
            const timestamp = Math.floor(kline.t / 1000); // Convert to seconds
            
            if (closePrice > 0) {
              latestPriceRef.current = closePrice;
              
              if (onChartPriceUpdate) {
                onChartPriceUpdate(selectedCrypto, closePrice);
              }
              
              // Update chart
              if (seriesRef.current && chartRef.current) {
                const newPoint = { time: timestamp, value: closePrice };
                
                // Find if point exists for this timestamp
                const existingIndex = chartDataRef.current.findIndex(
                  (p) => p.time === timestamp
                );
                
                if (existingIndex >= 0) {
                  chartDataRef.current[existingIndex] = newPoint;
                  seriesRef.current.update(newPoint);
                } else {
                  chartDataRef.current.push(newPoint);
                  chartDataRef.current.sort((a, b) => a.time - b.time);
                  
                  // Filter to keep only points within time range
                  const limit = timeRange === "5m" ? 5 : timeRange === "10m" ? 10 : 15;
                  const timeRangeSeconds = limit * 60;
                  const cutoffTime = timestamp - timeRangeSeconds;
                  chartDataRef.current = chartDataRef.current.filter(
                    (p) => p.time >= cutoffTime
                  );
                  
                  seriesRef.current.setData(chartDataRef.current);
                }
              }
            }
          }
          
          // Handle trade updates (for faster price updates)
          if (data.c && data.c.deals && Array.isArray(data.c.deals) && data.c.deals.length > 0) {
            const latestTrade = data.c.deals[data.c.deals.length - 1];
            const price = parseFloat(latestTrade.p); // Price
            
            if (price > 0) {
              latestPriceRef.current = price;
              
              if (onChartPriceUpdate) {
                onChartPriceUpdate(selectedCrypto, price);
              }
            }
          }
        } catch (error) {
          console.warn("Error parsing MEXC WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error(`❌ MEXC WebSocket error for ${selectedCrypto}:`, error);
      };

      ws.onclose = () => {
        console.log(`MEXC WebSocket closed for ${selectedCrypto}, reconnecting...`);
        // Reconnect after 3 seconds
        setTimeout(() => {
          setupMEXCWebSocket();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error(`❌ Failed to create MEXC WebSocket for ${selectedCrypto}:`, error);
    }
  }, [selectedCrypto, timeRange, onChartPriceUpdate]);

  // Setup Binance WebSocket
  const setupWebSocket = useCallback(() => {
    if (!selectedCrypto) return;

    // For MEXC tokens (ANB, NUMI, SPACE), use MEXC WebSocket
    if (mexcSymbols[selectedCrypto]) {
      setupMEXCWebSocket();
      return;
    }

    // Close existing WebSocket
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        console.warn("Error closing WebSocket:", e);
      }
      wsRef.current = null;
    }

    const binanceSymbol = binanceSymbols[selectedCrypto];
    if (!binanceSymbol) return;

    // Use selected currency pair (BNB or USDT)
    const currencyPair = selectedCurrency === "USDT" ? "usdt" : "bnb";
    const wsUrl = `wss://stream.binance.com:9443/ws/${binanceSymbol}${currencyPair}@ticker`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`✅ Binance WebSocket connected for ${selectedCrypto}/${selectedCurrency}`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.c && typeof data.c === "string") {
            const price = parseFloat(data.c);
            if (!isNaN(price) && price > 0) {
              // Update price immediately
              latestPriceRef.current = price;
              
              // Notify parent component
              if (onChartPriceUpdate) {
                onChartPriceUpdate(selectedCrypto, price);
              }
              
              // Immediately update chart with new price
              if (seriesRef.current) {
                const now = Math.floor(Date.now() / 1000);
                const newPoint = {
                  time: now,
                  value: price,
                };
                
                // Check if point already exists for this second
                const existingIndex = chartDataRef.current.findIndex(
                  (p) => p.time === now
                );
                
                if (existingIndex >= 0) {
                  // Update existing point
                  chartDataRef.current[existingIndex] = newPoint;
                  seriesRef.current.update(newPoint);
                } else {
                  // Add new point
                  chartDataRef.current.push(newPoint);
                  
                  // Filter data to keep only points within time range
                  const limit = timeRange === "5m" ? 5 : timeRange === "10m" ? 10 : 15;
                  const timeRangeSeconds = limit * 60;
                  const cutoffTime = now - timeRangeSeconds;
                  
                  chartDataRef.current = chartDataRef.current.filter(
                    (p) => p.time >= cutoffTime
                  );
                  
                  // Update chart with filtered data
                  seriesRef.current.setData(chartDataRef.current);
                }
                
                // Auto-scroll to keep latest price visible
                if (chartRef.current) {
                  const limit = timeRange === "5m" ? 5 : timeRange === "10m" ? 10 : 15;
                  const timeRangeSeconds = limit * 60;
                  chartRef.current.timeScale().setVisibleRange({
                    from: now - timeRangeSeconds,
                    to: now,
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error("Error parsing WebSocket data:", error);
        }
      };

      ws.onerror = (error) => {
        console.error(`❌ WebSocket error for ${selectedCrypto}:`, error);
      };

      ws.onclose = (event) => {
        console.log(`⚠️ WebSocket closed for ${selectedCrypto}`, event.code);
        // Reconnect after 3 seconds if not manual close
        if (event.code !== 1000) {
          setTimeout(() => {
            if (selectedCrypto) {
              setupWebSocket();
            }
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error(`❌ Failed to create WebSocket for ${selectedCrypto}:`, error);
    }
  }, [selectedCrypto, selectedCurrency, onChartPriceUpdate, setupMEXCWebSocket]);

  // Fallback API polling (every 10 seconds)
  const fetchPriceFromAPI = useCallback(async () => {
    if (!selectedCrypto) return;

    // First try livePrices prop (from parent)
    const priceKey = selectedCurrency === "USDT" ? "usdt" : "bnb";
    if (livePrices && livePrices[selectedCrypto] && livePrices[selectedCrypto][priceKey] > 0) {
      latestPriceRef.current = livePrices[selectedCrypto][priceKey];
      if (onChartPriceUpdate) {
        onChartPriceUpdate(selectedCrypto, livePrices[selectedCrypto][priceKey]);
      }
      return;
    }

    // Fallback to CryptoCompare API
    try {
      const symbol = cryptoCompareSymbols[selectedCrypto];
      if (!symbol) return;

      const currencySymbol = selectedCurrency === "USDT" ? "USDT" : "BNB";
      const url = `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=${currencySymbol}`;
      const response = await fetch(url);
      if (!response.ok) return;

      const data = await response.json();
      const price = data[currencySymbol];
      if (price && price > 0) {
        latestPriceRef.current = price;
        if (onChartPriceUpdate) {
          onChartPriceUpdate(selectedCrypto, price);
        }
      }
    } catch (error) {
      console.error("Error fetching price from API:", error);
    }
  }, [selectedCrypto, selectedCurrency, onChartPriceUpdate, livePrices]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up existing chart if it exists
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

    // Clear existing intervals
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    if (apiIntervalRef.current) {
      clearInterval(apiIntervalRef.current);
      apiIntervalRef.current = null;
    }

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#141414" },
        textColor: "#f3b340",
      },
      grid: {
        vertLines: { color: "#263d55" },
        horzLines: { color: "#263d55" },
      },
      width: chartContainerRef.current.clientWidth,
      height: window.innerWidth < 640 ? 220 : 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: timeRange === "5m",
      },
      rightPriceScale: {
        visible: true,
        borderColor: "#263d55",
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        // For MEXC tokens, show 4 decimal places
        ...(mexcSymbols[selectedCrypto] ? {
          priceFormat: {
            type: 'price',
            precision: 4,
            minMove: 0.0001,
          }
        } : {}),
      },
      leftPriceScale: {
        visible: false, // Hide left scale, show only right
      },
      crosshair: {
        mode: 1,
        vertLine: { color: "#f3b340", width: 1 },
        horzLine: { color: "#f3b340", width: 1 },
      },
    });

    chartRef.current = chart;

    // Add line series (v5 API)
    // For MEXC tokens, configure price format to 4 decimals
    const priceFormat = mexcSymbols[selectedCrypto] 
      ? { type: 'price', precision: 4, minMove: 0.0001 }
      : undefined;
    
    const lineSeries = chart.addSeries(LineSeries, {
      color: "#f3b340",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      priceFormat: priceFormat,
    });

    seriesRef.current = lineSeries;

    // Reset chart data
    chartDataRef.current = [];
    latestPriceRef.current = 0;

    // Initialize with livePrices if available
    // For MEXC tokens, always use USDT price
    if (mexcSymbols[selectedCrypto]) {
      if (livePrices && livePrices[selectedCrypto] && livePrices[selectedCrypto].usdt > 0) {
        latestPriceRef.current = livePrices[selectedCrypto].usdt;
        if (onChartPriceUpdate) {
          onChartPriceUpdate(selectedCrypto, livePrices[selectedCrypto].usdt);
        }
      }
    } else {
      const priceKey = selectedCurrency === "USDT" ? "usdt" : "bnb";
      if (livePrices && livePrices[selectedCrypto] && livePrices[selectedCrypto][priceKey] > 0) {
        latestPriceRef.current = livePrices[selectedCrypto][priceKey];
        if (onChartPriceUpdate) {
          onChartPriceUpdate(selectedCrypto, livePrices[selectedCrypto][priceKey]);
        }
      }
    }

    // Load historical data
    loadHistoricalData();

    // Setup WebSocket
    setupWebSocket();

    // Start update interval (every 1 second)
    updateIntervalRef.current = setInterval(() => {
      updateChart();
    }, 1000);

    // Start API polling (every 10 seconds as fallback)
    apiIntervalRef.current = setInterval(() => {
      fetchPriceFromAPI();
    }, 10000);

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: window.innerWidth < 640 ? 220 : 500,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      if (apiIntervalRef.current) {
        clearInterval(apiIntervalRef.current);
        apiIntervalRef.current = null;
      }
      if (wsRef.current) {
        try {
          wsRef.current.close();
          wsRef.current = null;
        } catch (e) {
          // Ignore
        }
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [selectedCrypto, selectedCurrency, timeRange]); // Re-initialize when currency or crypto changes

  // Update chart when livePrices change (for real-time updates from parent)
  useEffect(() => {
    if (chartRef.current && seriesRef.current && selectedCrypto) {
      // For MEXC tokens, always use USDT price
      if (mexcSymbols[selectedCrypto]) {
        if (livePrices && livePrices[selectedCrypto] && livePrices[selectedCrypto].usdt > 0) {
          const newPrice = livePrices[selectedCrypto].usdt;
          if (newPrice !== latestPriceRef.current) {
            latestPriceRef.current = newPrice;
            if (onChartPriceUpdate) {
              onChartPriceUpdate(selectedCrypto, newPrice);
            }
            // Immediately update chart with new price
            updateChart();
          }
        }
      } else {
        const priceKey = selectedCurrency === "USDT" ? "usdt" : "bnb";
        if (livePrices && livePrices[selectedCrypto] && livePrices[selectedCrypto][priceKey] > 0) {
          const newPrice = livePrices[selectedCrypto][priceKey];
          if (newPrice !== latestPriceRef.current) {
            latestPriceRef.current = newPrice;
            if (onChartPriceUpdate) {
              onChartPriceUpdate(selectedCrypto, newPrice);
            }
            // Immediately update chart with new price
            updateChart();
          }
        }
      }
    }
  }, [livePrices, selectedCrypto, selectedCurrency, onChartPriceUpdate, updateChart]);

  // Update position markers and entry lines
  useEffect(() => {
    if (!seriesRef.current || !userBets || userBets.length === 0) {
      // Clear existing markers and lines
      positionMarkersRef.current.forEach((marker) => {
        try {
          seriesRef.current.removePriceLine(marker);
        } catch (e) {
          // Ignore
        }
      });
      positionLinesRef.current.forEach((line) => {
        try {
          seriesRef.current.removePriceLine(line);
        } catch (e) {
          // Ignore
        }
      });
      positionMarkersRef.current = [];
      positionLinesRef.current = [];
      return;
    }

    // Filter active bets for current crypto and user
    const activeBets = userBets.filter(
      (bet) =>
        bet.symbol === selectedCrypto &&
        bet.status === "active" &&
        bet.walletAddress?.toLowerCase() === userAddress?.toLowerCase() &&
        bet.currentPrice > 0
    );

    // Clear existing markers and lines
    positionMarkersRef.current.forEach((marker) => {
      try {
        seriesRef.current.removePriceLine(marker);
      } catch (e) {
        // Ignore
      }
    });
    positionLinesRef.current.forEach((line) => {
      try {
        seriesRef.current.removePriceLine(line);
      } catch (e) {
        // Ignore
      }
    });
    positionMarkersRef.current = [];
    positionLinesRef.current = [];

    // Add entry price lines and markers
    activeBets.forEach((bet) => {
      const entryPrice = bet.currentPrice;
      const isLong = bet.direction === "ABOVE" || bet.direction === "UP";
      const currentPrice = latestPriceRef.current || entryPrice;
      const isWinning =
        (isLong && currentPrice > entryPrice) ||
        (!isLong && currentPrice < entryPrice);

      // Calculate P&L
      const priceDiff = isLong
        ? currentPrice - entryPrice
        : entryPrice - currentPrice;
      const profitPercent = (priceDiff / entryPrice) * 100;
      const profitAmount = (bet.amount * profitPercent) / 100;

      // Convert entry price to selected currency if needed
      // Note: entryPrice is stored in BNB, convert to selected currency for display
      let displayPrice = entryPrice;
      if (selectedCurrency === "USDT" && livePrices && livePrices.BNB && livePrices.BNB.usdt) {
        displayPrice = entryPrice * livePrices.BNB.usdt;
      }
      
      const currencyLabel = selectedCurrency === "USDT" ? "USDT" : "BNB";
      const decimals = selectedCurrency === "USDT" ? 2 : 6;
      
      // Add entry price line
      const priceLine = seriesRef.current.createPriceLine({
        price: displayPrice,
        color: isWinning ? "#4ade80" : "#ef4444",
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: `${isLong ? "🟢 LONG" : "🔴 SHORT"} @ ${displayPrice.toFixed(decimals)} ${currencyLabel}`,
      });

      positionLinesRef.current.push(priceLine);

      // Add position marker (dot on chart line)
      const marker = {
        time: Math.floor(Date.now() / 1000),
        position: "inBar",
        color: isWinning ? "#4ade80" : "#ef4444",
        shape: "circle",
        size: 2,
        text: `${isLong ? "LONG ↑" : "SHORT ↓"} Entry: ${entryPrice.toFixed(
          6
        )} BNB | P&L: ${profitPercent >= 0 ? "+" : ""}${profitPercent.toFixed(
          2
        )}% (${profitAmount >= 0 ? "+" : ""}${profitAmount.toFixed(6)} BNB)`,
      };

      // Note: Lightweight Charts doesn't support markers directly on line series
      // We'll use price lines as visual indicators instead
    });
  }, [userBets, selectedCrypto, userAddress, selectedCurrency, livePrices]);

  // Handle drawing tools
  const handleChartClick = useCallback(
    (event) => {
      if (!drawingMode || !chartRef.current || !seriesRef.current) return;

      const coordinate = chartRef.current
        .timeScale()
        .coordinateToTime(event.clientX - chartContainerRef.current.getBoundingClientRect().left);

      const price = seriesRef.current.coordinateToPrice(
        event.clientY - chartContainerRef.current.getBoundingClientRect().top
      );

      if (drawingMode === "trend") {
        setClickPoints((prev) => {
          const newPoints = [...prev, { time: coordinate, price }];
          if (newPoints.length === 2) {
            // Draw trend line
            const trendLine = seriesRef.current.createPriceLine({
              price: newPoints[0].price,
              color: "#f3b340",
              lineWidth: 1,
              lineStyle: 2,
              axisLabelVisible: false,
            });
            drawnLinesRef.current.push(trendLine);
            setClickPoints([]);
            setDrawingMode(null);
          }
          return newPoints;
        });
      } else if (drawingMode === "horizontal") {
        // Draw horizontal line
        const horizontalLine = seriesRef.current.createPriceLine({
          price: price,
          color: "#f3b340",
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: `H: ${price.toFixed(6)}`,
        });
        priceLinesRef.current.push(horizontalLine);
        setDrawingMode(null);
      }
    },
    [drawingMode]
  );

  // Expose drawing functions
  const handleTrendLine = useCallback(() => {
    setDrawingMode("trend");
    setClickPoints([]);
  }, []);

  const handleHorizontal = useCallback(() => {
    setDrawingMode("horizontal");
  }, []);

  const handleClearAll = useCallback(() => {
    // Clear drawn lines
    drawnLinesRef.current.forEach((line) => {
      try {
        seriesRef.current.removePriceLine(line);
      } catch (e) {
        // Ignore
      }
    });
    drawnLinesRef.current = [];

    // Clear horizontal lines
    priceLinesRef.current.forEach((line) => {
      try {
        seriesRef.current.removePriceLine(line);
      } catch (e) {
        // Ignore
      }
    });
    priceLinesRef.current = [];

    setDrawingMode(null);
    setClickPoints([]);
  }, []);

  // Expose drawing functions via ref (for parent component)
  const chartDrawingRef = useRef({
    trendLine: handleTrendLine,
    horizontal: handleHorizontal,
    clearAll: handleClearAll,
  });

  return (
    <div className="relative w-full h-full">
      <div
        ref={chartContainerRef}
        className="w-full"
        style={{ height: window.innerWidth < 640 ? "220px" : "500px" }}
        onClick={handleChartClick}
      />
      {/* Drawing tools will be controlled by parent component */}
    </div>
  );
};

export default BinanceChart;
