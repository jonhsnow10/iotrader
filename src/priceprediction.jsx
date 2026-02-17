import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "./components/Header";
import SEO from "./components/SEO";
import { useWallet } from "./hooks/useWallet";
import { saveUserWallet } from "./services/userService";
import { createPrediction, getUserPredictions, updatePredictionStatus, claimWinnings } from "./services/predictionService";
import { addActivity } from "./services/marketService";
import BinanceChart from "./components/BinanceChart";
import { VITE_OPENAI_API_KEY } from "./config/env";

const Icon = ({ name, size = 24, className = "", ...props }) => {
  const icons = {
    ArrowUp: <path d="M12 19V5M5 12l7-7 7 7" />,
    ArrowDown: <path d="M12 5v14m-7-7 7 7 7-7" />,
    Wallet: (
      <>
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </>
    ),
    Zap: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    Clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    TrendingUp: (
      <>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </>
    ),
    TrendingDown: (
      <>
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
        <polyline points="17 18 23 18 23 12" />
      </>
    ),
    Activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
    ChevronDown: <path d="M6 9l6 6 6-6" />,
    ChevronLeft: <path d="M15 18l-6-6 6-6" />,
    ChevronRight: <path d="M9 18l6-6-6-6" />,
    CheckCircle2: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    RefreshCw: (
      <>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
      </>
    ),
    Youtube: (
      <>
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2.85 2.85 0 0 1 2.5-2.5h14a2.85 2.85 0 0 1 2.5 2.5 24.12 24.12 0 0 1 0 10 2.85 2.85 0 0 1-2.5 2.5h-14a2.85 2.85 0 0 1-2.5-2.5z" />
        <polygon points="10 15 15 12 10 9" />
      </>
    ),
    Twitter: (
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-12.7 14.6-5.6-4.6-7.8-11 2-12.7-3.7-4-1.8-12.9 6-11.5 3-2 10-1.8 6.7 6.2 0 0 0 0 0z" />
    ),
    Send: (
      <>
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </>
    ),
    FileText: (
      <>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </>
    ),
    HelpCircle: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
    Phone: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
    Globe: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </>
    ),
    BarChart2: (
      <>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </>
    ),
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {icons[name] || null}
    </svg>
  );
};

const PricePrediction = () => {
  const { address, isConnected } = useWallet();
  const { coin } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDuration, setSelectedDuration] = useState("1m");
  const [activeNetwork, setActiveNetwork] = useState("BSC");
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [selectedCurrency, setSelectedCurrency] = useState("BNB");
  const [predictionDirection, setPredictionDirection] = useState(null);
  const [predictionAmount, setPredictionAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const [timeRange, setTimeRange] = useState("5m");
  const [currentChartPrice, setCurrentChartPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [chartPrices, setChartPrices] = useState({});
  const [userBets, setUserBets] = useState([]);
  const [countdownTimer, setCountdownTimer] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [analysisText, setAnalysisText] = useState("");
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [claimTimers, setClaimTimers] = useState({});
  const analysisCacheRef = useRef(null);
  const CACHE_DURATION = 365 * 24 * 60 * 60 * 1000;
  const requestQueueRef = useRef([]);
  const isProcessingQueueRef = useRef(false);
  const lastRequestTimeRef = useRef(0);
  const MIN_REQUEST_INTERVAL = 0;
  const fetchInitiatedRef = useRef(false);
  const hasCalledOnceRef = useRef(false);

  const [prices, setPrices] = useState({
    BTC: { usd: 0, bnb: 0, usdt: 0, change24h: 0 },
    ETH: { usd: 0, bnb: 0, usdt: 0, change24h: 0 },
    SOL: { usd: 0, bnb: 0, usdt: 0, change24h: 0 },
    DOGE: { usd: 0, bnb: 0, usdt: 0, change24h: 0 },
    BNB: { usd: 0, bnb: 1, usdt: 0, change24h: 0 },
    XRP: { usd: 0, bnb: 0, usdt: 0, change24h: 0 },
    ANB: { usd: 0, bnb: 0, usdt: 0, change24h: 0 },
    NUMI: { usd: 0, bnb: 0, usdt: 0, change24h: 0 },
    SPACE: { usd: 0, bnb: 0, usdt: 0, change24h: 0 },
  });
  const [bnbPriceUSD, setBnbPriceUSD] = useState(0);
  const [usdtPriceUSD, setUsdtPriceUSD] = useState(1);

  const scrollContainerRef = useRef(null);
  const wsRefs = useRef({});
  const fallbackIntervalRef = useRef(null);
  const currentAssetRef = useRef(selectedAsset);
  const startedTimersRef = useRef(new Set());

  const coinGeckoIds = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",
    DOGE: "dogecoin",
    BNB: "binancecoin",
    XRP: "ripple",
  };

  const binanceSymbols = {
    BTC: "btc",
    ETH: "eth",
    SOL: "sol",
    DOGE: "doge",
    BNB: "bnb",
    XRP: "xrp",
  };

  const xtSymbols = {
    ANB: "anb_usdt",
  };

  const fetchLivePrices = async () => {
    try {
      const coinIds = [...Object.values(coinGeckoIds), "tether"].join(",");
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch prices");
      
      const data = await response.json();

      const bnbUsdPrice = data[coinGeckoIds.BNB]?.usd || 0;
      setBnbPriceUSD(bnbUsdPrice);

      const usdtUsdPrice = data["tether"]?.usd || 1;
      setUsdtPriceUSD(usdtUsdPrice);

      const newPrices = { ...prices };
      Object.keys(coinGeckoIds).forEach((symbol) => {
        const coinId = coinGeckoIds[symbol];
        if (data[coinId]) {
          const usdPrice = data[coinId].usd || 0;
          const change24h = data[coinId].usd_24h_change || 0;
          const bnbPrice = symbol === "BNB" ? 1 : (bnbUsdPrice > 0 ? usdPrice / bnbUsdPrice : 0);
          const usdtPrice = symbol === "BNB" ? (bnbUsdPrice / usdtUsdPrice) : (usdtUsdPrice > 0 ? usdPrice / usdtUsdPrice : 0);
          
          newPrices[symbol] = {
            usd: usdPrice,
            bnb: bnbPrice,
            usdt: usdtPrice,
            change24h: change24h,
          };
        }
      });
      
      setPrices(newPrices);

      if (selectedAsset && newPrices[selectedAsset]) {
        const assetPrice = selectedCurrency === "USDT" 
          ? newPrices[selectedAsset].usdt 
          : newPrices[selectedAsset].bnb;
        if (assetPrice > 0) {
          setCurrentChartPrice(assetPrice);
          setPriceChange(newPrices[selectedAsset].change24h);
        }
      }
    } catch (error) {
      console.error("Error fetching prices from CoinGecko:", error);
    }
  };

  const fetchANBPrice = async () => {
    try {
      const symbol = "ANBUSDT";

      const apiUrl = `https://api-iotrader.dev/api/mexc/price?symbol=${symbol}`;
      
      try {
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();

          let usdtPrice = 0;
          let change24h = 0;
          
          if (data.price) {
            usdtPrice = parseFloat(data.price || 0);
          } else if (data.lastPrice) {
            usdtPrice = parseFloat(data.lastPrice || 0);
          } else if (data.c) {
            usdtPrice = parseFloat(data.c || 0);
          }
          
          if (data.change24h !== undefined) {
            change24h = parseFloat(data.change24h || 0);
          } else if (data.priceChangePercent !== undefined) {
            change24h = parseFloat(data.priceChangePercent || 0);
          } else if (data.cr !== undefined) {
            change24h = parseFloat(data.cr || 0);
          }
          
          if (usdtPrice > 0) {
            const usdPrice = usdtPrice;

            let currentBnbPrice = 0;
            if (prices.BNB && prices.BNB.usdt > 0) {
              currentBnbPrice = prices.BNB.usdt;
            } else if (bnbPriceUSD > 0) {
              currentBnbPrice = bnbPriceUSD;
            }
            
            const bnbPrice = currentBnbPrice > 0 ? usdPrice / currentBnbPrice : 0;
            
            setPrices((prev) => ({
              ...prev,
              ANB: {
                usd: usdPrice,
                bnb: bnbPrice,
                usdt: usdtPrice,
                change24h: change24h,
              },
            }));

            console.log("✅ ANB price updated from IOTRADER API:", {
              usdt: usdtPrice,
              bnb: bnbPrice,
              change24h: change24h,
            });

            if (selectedAsset === "ANB") {
              setCurrentChartPrice(usdtPrice);
              setPriceChange(change24h);
            }
          } else {
            console.warn("⚠️ IOTRADER API returned invalid data format:", data);
          }
        } else {
          console.warn(`⚠️ IOTRADER API returned status: ${response.status}`);
        }
      } catch (error) {
        console.error("❌ Error fetching ANB price from IOTRADER API:", error);
      }
    } catch (error) {
      console.error("Error in fetchANBPrice:", error);
    }
  };

  const fetchNUMIPrice = async () => {
    try {
      const symbol = "NUMIUSDT";

      const apiUrl = `https://api-iotrader.dev/api/mexc/ticker/price?symbol=${symbol}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        let usdtPrice = 0;
        let change24h = 0;
        
        if (data.price) {
          usdtPrice = parseFloat(data.price || 0);
        } else if (data.lastPrice) {
          usdtPrice = parseFloat(data.lastPrice || 0);
        } else if (data.c) {
          usdtPrice = parseFloat(data.c || 0);
        }
        
        if (data.change24h !== undefined) {
          change24h = parseFloat(data.change24h || 0);
        } else if (data.priceChangePercent !== undefined) {
          change24h = parseFloat(data.priceChangePercent || 0);
        } else if (data.cr !== undefined) {
          change24h = parseFloat(data.cr || 0);
        }
        
        if (usdtPrice > 0) {
          const usdPrice = usdtPrice;
          
          let currentBnbPrice = 0;
          if (prices.BNB && prices.BNB.usdt > 0) {
            currentBnbPrice = prices.BNB.usdt;
          } else if (bnbPriceUSD > 0) {
            currentBnbPrice = bnbPriceUSD;
          }
          
          const bnbPrice = currentBnbPrice > 0 ? usdPrice / currentBnbPrice : 0;
          
          setPrices((prev) => ({
            ...prev,
            NUMI: {
              usd: usdPrice,
              bnb: bnbPrice,
              usdt: usdtPrice,
              change24h: change24h,
            },
          }));

          console.log("✅ NUMI price updated from IOTRADER API:", {
            usdt: usdtPrice,
            bnb: bnbPrice,
            change24h: change24h,
          });

          if (selectedAsset === "NUMI") {
            setCurrentChartPrice(usdtPrice);
            setPriceChange(change24h);
          }
        } else {
          console.warn("⚠️ IOTRADER API returned invalid data format for NUMI:", data);
        }
      } else {
        console.warn(`⚠️ IOTRADER API returned status ${response.status} for NUMI`);
      }
    } catch (error) {
      console.error("❌ Error fetching NUMI price from IOTRADER API:", error);
    }
  };

  const fetchSPACEPrice = async () => {
    try {
      const symbol = "SPACEUSDT";

      const apiUrl = `https://api-iotrader.dev/api/mexc/ticker/price?symbol=${symbol}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        let usdtPrice = 0;
        let change24h = 0;
        
        if (data.price) {
          usdtPrice = parseFloat(data.price || 0);
        } else if (data.lastPrice) {
          usdtPrice = parseFloat(data.lastPrice || 0);
        } else if (data.c) {
          usdtPrice = parseFloat(data.c || 0);
        }
        
        if (data.change24h !== undefined) {
          change24h = parseFloat(data.change24h || 0);
        } else if (data.priceChangePercent !== undefined) {
          change24h = parseFloat(data.priceChangePercent || 0);
        } else if (data.cr !== undefined) {
          change24h = parseFloat(data.cr || 0);
        }
        
        if (usdtPrice > 0) {
          const usdPrice = usdtPrice;
          
          let currentBnbPrice = 0;
          if (prices.BNB && prices.BNB.usdt > 0) {
            currentBnbPrice = prices.BNB.usdt;
          } else if (bnbPriceUSD > 0) {
            currentBnbPrice = bnbPriceUSD;
          }
          
          const bnbPrice = currentBnbPrice > 0 ? usdPrice / currentBnbPrice : 0;
          
          setPrices((prev) => ({
            ...prev,
            SPACE: {
              usd: usdPrice,
              bnb: bnbPrice,
              usdt: usdtPrice,
              change24h: change24h,
            },
          }));

          console.log("✅ SPACE price updated from IOTRADER API:", {
            usdt: usdtPrice,
            bnb: bnbPrice,
            change24h: change24h,
          });

          if (selectedAsset === "SPACE") {
            setCurrentChartPrice(usdtPrice);
            setPriceChange(change24h);
          }
        } else {
          console.warn("⚠️ IOTRADER API returned invalid data format for SPACE:", data);
        }
      } else {
        console.warn(`⚠️ IOTRADER API returned status ${response.status} for SPACE`);
      }
    } catch (error) {
      console.error("❌ Error fetching SPACE price from IOTRADER API:", error);
    }
  };



  const setupBNBWebSocket = () => {
    if (wsRefs.current.BNB) {
      try {
        wsRefs.current.BNB.close();
      } catch (e) {
        console.warn("Error closing existing BNB WebSocket:", e);
      }
      wsRefs.current.BNB = null;
    }

    try {
      const ws = new WebSocket("wss://stream.binance.com:9443/ws/bnbusdt@ticker");
      
      ws.onopen = () => {
        console.log("✅ BNB/USDT WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.c && typeof data.c === 'string') {
            const bnbUsd = parseFloat(data.c);
            
            if (!isNaN(bnbUsd) && bnbUsd > 0) {
              setBnbPriceUSD(bnbUsd);
              
              setPrices((prev) => ({
                ...prev,
                BNB: {
                  ...prev.BNB,
                  usdt: bnbUsd, // BNB price in USDT
                },
              }));
            }
          }
        } catch (error) {
          console.error("❌ Error parsing BNB WebSocket data:", error);
        }
      };

      ws.onerror = (error) => {
        console.warn("⚠️ BNB WebSocket error, using API fallback");
      };

      ws.onclose = (event) => {
        if (event.code !== 1000) {
          setTimeout(() => {
            if (wsRefs.current) {
              setupBNBWebSocket();
            }
          }, 3000);
        }
      };

      wsRefs.current.BNB = ws;
    } catch (error) {
      console.warn("⚠️ Failed to create BNB WebSocket, using API fallback:", error);
    }
  };

  const setupUSDTWebSocket = () => {
    if (wsRefs.current.USDT) {
      try {
        wsRefs.current.USDT.close();
      } catch (e) {
        console.warn("Error closing existing USDT WebSocket:", e);
      }
      wsRefs.current.USDT = null;
    }

    try {
      const ws = new WebSocket("wss://stream.binance.com:9443/ws/busdusdt@ticker");
      
      ws.onopen = () => {
        console.log("✅ USDT WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.c && typeof data.c === 'string') {
            const usdtPrice = parseFloat(data.c);
            
            if (!isNaN(usdtPrice) && usdtPrice > 0) {
              setUsdtPriceUSD(usdtPrice);
            }
          }
        } catch (error) {
          console.error("❌ Error parsing USDT WebSocket data:", error);
        }
      };

      ws.onerror = (error) => {
        console.warn("⚠️ USDT WebSocket error, using default $1");
      };

      ws.onclose = (event) => {
        if (event.code !== 1000) {
          setTimeout(() => {
            if (wsRefs.current) {
              setupUSDTWebSocket();
            }
          }, 3000);
        }
      };

      wsRefs.current.USDT = ws;
    } catch (error) {
      console.warn("⚠️ Failed to create USDT WebSocket, using default $1:", error);
    }
  };


  useEffect(() => {
    if (coin) {
      const coinUpper = coin.toUpperCase();
      const validAssets = ["BTC", "ETH", "SOL", "DOGE", "BNB", "XRP", "ANB", "NUMI", "SPACE"];
      
      if (validAssets.includes(coinUpper)) {
        setSelectedAsset(coinUpper);
      }
      else {
        navigate("/price-prediction/btc", { replace: true });
      }
    } else {
      if (location.pathname === "/price-prediction") {
        navigate("/price-prediction/btc", { replace: true });
      }
    }
  }, [coin, navigate, location.pathname]);

  useEffect(() => {
    fetchLivePrices();
    
    fetchANBPrice();
    fetchNUMIPrice();
    fetchSPACEPrice();

    setupBNBWebSocket();
    
    setupUSDTWebSocket();


    fallbackIntervalRef.current = setInterval(() => {
      fetchLivePrices();
      fetchANBPrice();
      fetchNUMIPrice();
      fetchSPACEPrice();
    }, 10000);

    return () => {
      Object.keys(wsRefs.current).forEach((key) => {
        const ws = wsRefs.current[key];
        if (ws) {
          try {
            ws.onclose = null;
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
              ws.close(1000, 'Component unmounting');
            }
          } catch (e) {
            console.warn(`Error closing WebSocket for ${key}:`, e);
          }
          wsRefs.current[key] = null;
        }
      });
      
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
      
    };
  }, []);


  useEffect(() => {
    if (isConnected && address) {
      saveUserWallet(address).catch((error) => {
        console.error("Error saving user wallet:", error);
      });
    }
  }, [isConnected, address]);

  useEffect(() => {
    const fetchUserBets = async () => {
      if (!isConnected || !address) {
        setUserBets([]);
        return;
      }

      try {
        const firebaseBets = await getUserPredictions(address);
        setUserBets(firebaseBets);
      } catch (error) {
        if (error.code === 'failed-precondition') {
          console.warn("Firebase index not created yet. User bets will be available after index is created.");
          setUserBets([]);
        } else {
          console.error("Error fetching user bets:", error);
          setUserBets([]);
        }
      }
    };

    fetchUserBets();
    const interval = setInterval(fetchUserBets, 5000);
    return () => clearInterval(interval);
  }, [isConnected, address]);

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const executeAPIRequest = async (userMessage, marketData) => {
    const apiKey = (VITE_OPENAI_API_KEY || '').trim();
    
    if (!apiKey || apiKey === 'your-api-key-here' || apiKey.length < 20) {
      throw new Error('OpenAI API key is not configured or invalid');
    }
    
    if (!apiKey.startsWith('sk-')) {
      console.error('Invalid API key format. OpenAI API keys should start with "sk-"');
      throw new Error('Invalid API key format');
    }
    
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert cryptocurrency market analyst. Provide concise, actionable market analysis focusing on price trends, chart patterns, short-term predictions, and trading recommendations. Keep responses brief (3-4 bullet points maximum).'
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 30000,
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        let analysisText = response.data.choices[0].message.content;
        analysisText = analysisText.replace(/\*/g, ''); // Remove all asterisks
        return analysisText;
      }
      return "Unable to generate analysis at this time.";
    } catch (error) {
      if (error.response) {
        console.error('OpenAI API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        if (error.response.status === 401) {
          const errorData = error.response.data;
          if (errorData?.error?.message) {
            console.error('OpenAI API Error Details:', errorData.error.message);
          }
          throw new Error(`API Authentication Failed (401): ${errorData?.error?.message || 'Invalid or expired API key. Please check your OpenAI API key.'}`);
        }
      }
      throw error;
    }
  };

  const processQueue = async () => {
    if (isProcessingQueueRef.current) {
      return;
    }

    isProcessingQueueRef.current = true;

    while (requestQueueRef.current.length > 0) {
      const request = requestQueueRef.current.shift();
      
      if (!request) {
        continue;
      }

      if (analysisCacheRef.current && analysisCacheRef.current.asset === request.cacheKey) {
        setAnalysisText(analysisCacheRef.current.text);
        setIsLoadingAnalysis(false);
        request.resolve(analysisCacheRef.current.text);
        continue; // Skip to next request - NO API CALL
      }

      try {
        if (MIN_REQUEST_INTERVAL > 0) {
          const timeSinceLastRequest = now - lastRequestTimeRef.current;
          
          if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
            const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
            await wait(waitTime);
          }
        }

        setIsLoadingAnalysis(true);
        const analysis = await executeAPIRequest(request.userMessage, request.marketData);
        
        lastRequestTimeRef.current = Date.now();
        
        analysisCacheRef.current = {
          text: analysis,
          timestamp: Date.now(),
          asset: request.cacheKey,
        };
        
        setAnalysisText(analysis);
        setIsLoadingAnalysis(false);
        
        request.resolve(analysis);
      } catch (error) {
        console.error("OpenAI API error:", error);
        let errorMessage = "Error loading market analysis. Please try again later.";
        
        if (error.response?.status === 429) {
          errorMessage = "⚠️ Rate limit exceeded. Please wait a few moments. Analysis will refresh automatically after 10 minutes.";
        } else if (error.response?.status === 401) {
          const apiError = error.response?.data?.error;
          if (apiError?.message) {
            errorMessage = `⚠️ Authentication Failed: ${apiError.message}\n\nPlease:\n1. Check your API key at https://platform.openai.com/api-keys\n2. Ensure the key is active and has credits\n3. Regenerate the key if needed`;
          } else {
            errorMessage = "⚠️ API key invalid or expired.\n\nPlease check your OpenAI API key:\n1. Visit https://platform.openai.com/api-keys\n2. Verify the key is active\n3. Regenerate if necessary\n4. Update the key in your code";
          }
        } else if (error.response?.status === 400) {
          errorMessage = "Invalid request. Please try again later.";
        } else if (error.response?.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.message === 'OpenAI API key is not configured' || error.message === 'Invalid API key format') {
          errorMessage = `⚠️ ${error.message}\n\nPlease add a valid OpenAI API key that starts with "sk-"`;
        } else if (error.message?.includes('API Authentication Failed')) {
          errorMessage = error.message;
        }
        
        setAnalysisText(errorMessage);
        setIsLoadingAnalysis(false);
        request.reject(error);
      }
    }

    isProcessingQueueRef.current = false;
  };

  const fetchMarketAnalysis = useCallback(async () => {
    const asset = selectedAsset;
    const currency = selectedCurrency;
    const price = currentChartPrice;
    const change = priceChange;
    const timeRangeValue = timeRange;
    const cacheKey = `${asset}-${currency}`;
    
    if (analysisCacheRef.current && analysisCacheRef.current.asset === cacheKey) {
      setAnalysisText(analysisCacheRef.current.text);
      setIsLoadingAnalysis(false);
      return;
    }

    if (hasCalledOnceRef.current && analysisCacheRef.current?.asset === cacheKey) {
      return;
    }

    if (fetchInitiatedRef.current) {
      return;
    }

    if (price <= 0) {
      return; // Wait for price data
    }

    fetchInitiatedRef.current = true;
    hasCalledOnceRef.current = true; // Mark that we've called once

    const userMessage = `Analyze the current market situation for ${asset}/${currency}.

Current Market Data:
- Asset: ${asset}/${currency}
- Current Price: ${price.toFixed(currency === "USDT" ? 2 : 6)} ${currency}
- 24h Change: ${change >= 0 ? "+" : ""}${change.toFixed(2)}%
- Time Range: ${timeRangeValue}

Provide a brief analysis (3-4 bullet points) focusing on:
1. Current price trends and chart patterns
2. Short-term price predictions (1m, 10m, 1h)
3. Trading recommendations based on technical analysis
4. Risk assessment`;

    const marketData = {
      asset: asset,
      currency: currency,
      price: price,
      change: change,
      timeRange: timeRangeValue
    };

    return new Promise((resolve, reject) => {
      requestQueueRef.current.push({
        userMessage,
        marketData,
        cacheKey,
        resolve: (result) => {
          fetchInitiatedRef.current = false; // Reset flag on success
          resolve(result);
        },
        reject: (error) => {
          fetchInitiatedRef.current = false; // Reset flag on error
          reject(error);
        },
      });

      processQueue();
    });
  }, [selectedAsset, selectedCurrency, currentChartPrice, priceChange, timeRange]);

  useEffect(() => {
    const cacheKey = `${selectedAsset}-${selectedCurrency}`;
    if (analysisCacheRef.current && analysisCacheRef.current.asset !== cacheKey) {
      analysisCacheRef.current = null;
      setAnalysisText("");
      fetchInitiatedRef.current = false;
      hasCalledOnceRef.current = false; // Reset so we can call once for new asset
    }
  }, [selectedAsset, selectedCurrency]);

  const getTimestampMs = (timestamp) => {
    if (!timestamp) return null;
    if (timestamp.toMillis) {
      return timestamp.toMillis();
    } else if (timestamp.toDate) {
      return timestamp.toDate().getTime();
    } else if (timestamp.seconds) {
      return timestamp.seconds * 1000;
    } else if (typeof timestamp === "number") {
      return timestamp;
    } else if (timestamp instanceof Date) {
      return timestamp.getTime();
    }
    return null;
  };

  useEffect(() => {
    if (!userBets || userBets.length === 0) return;

    const wonBets = userBets.filter(
      (bet) => (bet.status === "won" || bet.isWinning) && !bet.claimed
    );

    const timersToStart = {};
    const now = Date.now();
    const CLAIM_WAIT_TIME = 180 * 1000; // 3 minutes in milliseconds

    wonBets.forEach((bet) => {
      if (!startedTimersRef.current.has(bet.id)) {
        const wonTimestamp = getTimestampMs(bet.closedAt || bet.settledAt);
        
        if (wonTimestamp) {
          const elapsed = now - wonTimestamp;
          
          const remaining = Math.max(0, Math.floor((CLAIM_WAIT_TIME - elapsed) / 1000));
          
          timersToStart[bet.id] = remaining;
          startedTimersRef.current.add(bet.id);
        } else {
          timersToStart[bet.id] = 180;
          startedTimersRef.current.add(bet.id);
        }
      }
    });

    if (Object.keys(timersToStart).length > 0) {
      setClaimTimers((prev) => ({
        ...prev,
        ...timersToStart,
      }));
    }
  }, [userBets]);

  useEffect(() => {
    const activeTimers = Object.keys(claimTimers).filter(
      (betId) => claimTimers[betId] > 0
    );

    if (activeTimers.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setClaimTimers((prev) => {
        const updated = { ...prev };
        let hasActive = false;

        Object.keys(updated).forEach((betId) => {
          if (updated[betId] > 0) {
            updated[betId] = updated[betId] - 1;
            if (updated[betId] > 0) {
              hasActive = true;
            }
          }
        });

        if (!hasActive) {
          Object.keys(updated).forEach((betId) => {
            if (updated[betId] <= 0) {
              updated[betId] = 0; // Keep at 0 to indicate expired
            }
          });
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [claimTimers]);

  useEffect(() => {
    if (!isChatOpen || currentChartPrice <= 0) {
      return;
    }

    const cacheKey = `${selectedAsset}-${selectedCurrency}`;
    
    if (analysisCacheRef.current && analysisCacheRef.current.asset === cacheKey) {
      setAnalysisText(analysisCacheRef.current.text);
      setIsLoadingAnalysis(false);
      return;
    }

    if (!fetchInitiatedRef.current && !hasCalledOnceRef.current) {
      if (!analysisCacheRef.current || analysisCacheRef.current.asset !== cacheKey) {
        console.log('Calling API for analysis...', { asset: selectedAsset, currency: selectedCurrency, price: currentChartPrice });
        fetchMarketAnalysis();
      }
    }
  }, [isChatOpen, currentChartPrice, selectedAsset, selectedCurrency, fetchMarketAnalysis]);

  const handleChartPriceUpdate = useCallback((symbol, price) => {
    setChartPrices((prev) => ({
      ...prev,
      [symbol]: price, // Store in selected currency
    }));

    if (symbol === selectedAsset) {
      setCurrentChartPrice(price);
      
      const baseline = selectedCurrency === "USDT" 
        ? (prices[symbol]?.usdt || 0)
        : (prices[symbol]?.bnb || 0);
      if (baseline > 0) {
        const change = ((price - baseline) / baseline) * 100;
        setPriceChange(change);
      } else {
        setPriceChange(prices[symbol]?.change24h || 0);
      }
    }
  }, [selectedAsset, selectedCurrency, prices]);

  const getExpiryTime = () => {
    const now = Date.now();
    const durationMap = {
      "1m": 60 * 1000,
      "10m": 10 * 60 * 1000,
      "1h": 60 * 60 * 1000,
    };
    return now + (durationMap[selectedDuration] || 60 * 1000);
  };

  const handleSubmitPrediction = async () => {
    if (!isConnected || !address) {
      setSubmitMessage("Please connect your wallet first");
      return;
    }

    if (!predictionDirection) {
      setSubmitMessage("Please select a prediction direction (Buy or Sell)");
      return;
    }

    const amount = parseFloat(predictionAmount);
    if (!amount || amount <= 0) {
      setSubmitMessage("Please enter a valid prediction amount");
      return;
    }

    let priceToUse = chartPrices[selectedAsset] || 
      (selectedCurrency === "USDT" ? prices[selectedAsset]?.usdt : prices[selectedAsset]?.bnb) || 
      currentChartPrice;
    
    if (priceToUse <= 0) {
      setSubmitMessage("Price data not available. Please wait...");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const usdPrice = prices[selectedAsset]?.usdt || 0;
      if (usdPrice <= 0) {
        setSubmitMessage("USD price data not available. Please wait...");
        setIsSubmitting(false);
        return;
      }

      const targetPriceUSD = 
        predictionDirection === "UP" 
          ? usdPrice * 1.0001  // 0.01% above for ABOVE predictions
          : usdPrice * 0.9999; // 0.01% below for BELOW predictions

      const durationMap = {
        "1m": 60,
        "10m": 600,
        "1h": 3600,
      };
      const duration = durationMap[selectedDuration] || 60;

      const stakeUSDT = selectedCurrency === "USDT";

      setSubmitMessage("Saving prediction...");
      const txHash = "mock_" + Date.now();
      const contractPredictionId = null;

      const targetPriceInCurrency = 
        predictionDirection === "UP" 
          ? priceToUse * 1.0001
          : priceToUse * 0.9999;
      const amountInCurrency = parseFloat(amount);

      const predictionId = await createPrediction({
        walletAddress: address,
        symbol: selectedAsset,
        direction: predictionDirection === "UP" ? "ABOVE" : "BELOW",
        currentPrice: priceToUse, // Store price in selected currency
        targetPrice: targetPriceInCurrency,
        amount: amountInCurrency, // Store amount in selected currency
        originalAmount: amountInCurrency,
        originalCurrency: selectedCurrency,
        leverage: 1,
        expiry: getExpiryTime(),
        duration: duration, // Store duration in seconds
        transactionHash: txHash,
        onChain: false,
        confirmed: true,
        contractPredictionId: contractPredictionId,
      });

      const bets = await getUserPredictions(address);
      setUserBets(bets);

      await addActivity({
        type: "price_prediction",
        walletAddress: address,
        action: `Placed ${predictionDirection === "UP" ? "BUY" : "SELL"} prediction on ${selectedAsset} for ${amount} ${selectedCurrency} (TX: ${txHash.slice(0, 10)}...)`,
        amount: amount,
      });

      setSubmitMessage(`Prediction submitted successfully! Transaction: ${txHash.slice(0, 10)}...`);
      
      setPredictionAmount("");
      setPredictionDirection(null);
      
      setTimeout(() => {
        setSubmitMessage("");
      }, 5000);
    } catch (error) {
      console.error("Error submitting prediction:", error);
      setSubmitMessage(`Error: ${error.message || "Failed to submit prediction"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedAsset) {
      currentAssetRef.current = selectedAsset;
      
      let assetPrice;
      if (selectedAsset === "ANB") {
        assetPrice = prices.ANB?.usdt;
      } else {
        assetPrice = selectedCurrency === "USDT" 
          ? prices[selectedAsset]?.usdt 
          : prices[selectedAsset]?.bnb;
      }
      if (assetPrice && assetPrice > 0) {
        setCurrentChartPrice(assetPrice);
        setPriceChange(prices[selectedAsset].change24h);
      }
    }
  }, [selectedAsset, selectedCurrency, prices]);


  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 200;
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  const tickerItems = [
    { symbol: "BTC", price: selectedCurrency === "USDT" ? (prices.BTC.usdt || 0) : (prices.BTC.bnb || 0), change: prices.BTC.change24h || 0 },
    { symbol: "ETH", price: selectedCurrency === "USDT" ? (prices.ETH.usdt || 0) : (prices.ETH.bnb || 0), change: prices.ETH.change24h || 0 },
    { symbol: "SOL", price: selectedCurrency === "USDT" ? (prices.SOL.usdt || 0) : (prices.SOL.bnb || 0), change: prices.SOL.change24h || 0 },
    { symbol: "BNB", price: selectedCurrency === "USDT" ? (prices.BNB.usdt || 0) : (prices.BNB.bnb || 1), change: prices.BNB.change24h || 0 },
    { symbol: "XRP", price: selectedCurrency === "USDT" ? (prices.XRP.usdt || 0) : (prices.XRP.bnb || 0), change: prices.XRP.change24h || 0 },
    { symbol: "DOGE", price: selectedCurrency === "USDT" ? (prices.DOGE.usdt || 0) : (prices.DOGE.bnb || 0), change: prices.DOGE.change24h || 0 },
    { symbol: "ANB", price: prices.ANB?.usdt || 0, change: prices.ANB?.change24h || 0, currency: "USDT" }, // Always show ANB/USDT
    { symbol: "NUMI", price: prices.NUMI?.usdt || 0, change: prices.NUMI?.change24h || 0, currency: "USDT" }, // Always show NUMI/USDT
    { symbol: "SPACE", price: prices.SPACE?.usdt || 0, change: prices.SPACE?.change24h || 0, currency: "USDT" }, // Always show SPACE/USDT
  ].filter(item => {
    if (item.symbol === "ANB" || item.symbol === "NUMI" || item.symbol === "SPACE") return true;
    return item.price > 0;
  });

  const topTickerItems = [
    { symbol: "BTC", price: prices.BTC.usdt || 0, change: prices.BTC.change24h || 0 },
    { symbol: "ETH", price: prices.ETH.usdt || 0, change: prices.ETH.change24h || 0 },
    { symbol: "SOL", price: prices.SOL.usdt || 0, change: prices.SOL.change24h || 0 },
    { symbol: "BNB", price: prices.BNB.usdt || 0, change: prices.BNB.change24h || 0 },
    { symbol: "XRP", price: prices.XRP.usdt || 0, change: prices.XRP.change24h || 0 },
    { symbol: "DOGE", price: prices.DOGE.usdt || 0, change: prices.DOGE.change24h || 0 },
    { symbol: "ANB", price: prices.ANB?.usdt || 0, change: prices.ANB?.change24h || 0 },
    { symbol: "NUMI", price: prices.NUMI?.usdt || 0, change: prices.NUMI?.change24h || 0 },
    { symbol: "SPACE", price: prices.SPACE?.usdt || 0, change: prices.SPACE?.change24h || 0 },
  ].filter(item => {
    if (item.symbol === "ANB" || item.symbol === "NUMI" || item.symbol === "SPACE") return true;
    return item.price > 0;
  });

  const loopData = [...topTickerItems, ...topTickerItems];

  const networkIcons = {
    Polygon: (
      <svg viewBox="0 0 300 300" className="w-full h-full" fill="currentColor">
        <path d="M283.3,136.7l-60.6-36c-5.7-2.8-12.3-2.8-18,0l-40.7,24.6-27.5,16.1v-23.7l26.5-16.1v-24.6c0-6.6-2.8-12.3-8.5-15.2l-58.7-35.1c-5.7-2.8-12.3-2.8-18,0L18,61.9c-5.7,2.8-8.5,9.5-8.5,15.2v71.1c0,6.6,2.8,12.3,8.5,15.2l59.7,35.1c5.7,2.8,12.3,2.8,18,0l40.7-23.7v26.5h0v22.7c0,6.6,2.8,12.3,8.5,15.2l59.7,35.1c5.7,2.8,12.3,2.8,18,0l59.7-35.1c5.7-2.8,8.5-9.5,8.5-15.2v-71.1c0-6.6-2.8-12.3-8.5-15.2l.9-.9ZM95.7,166.1c-5.7,2.8-12.3,2.8-18,0l-32.2-19c-5.7-2.8-8.5-9.5-8.5-15.2v-37.9c0-6.6,2.8-12.3,8.5-15.2l32.2-19c5.7-2.8,12.3-2.8,18,0l32.2,19c5.7,2.8,8.5,9.5,8.5,15.2v24.6h0v23.7l-40.7,24.6v-.9ZM263.4,205.9c0,6.6-2.8,12.3-8.5,15.2l-32.2,19c-5.7,2.8-12.3,2.8-18,0l-32.2-19c-5.7-2.8-8.5-9.5-8.5-15.2v-24.6l-27.5,16.1v-23.7l27.5-16.1,40.7-23.7c5.7-2.8,12.3-2.8,18,0l32.2,19c5.7,2.8,8.5,9.5,8.5,15.2,0,0,0,37.9,0,37.9Z" />
      </svg>
    ),
    BSC: (
      <svg viewBox="0 0 300 300" className="w-full h-full" fill="currentColor">
        <path d="M176.5,241.3v30.7l-26.9,16.1-26.1-16.1v-30.7l26.1,16.1,26.9-16.1ZM32.2,133.9l26.1,16.1v53l45.3,26.9v30.7l-71.4-42.2v-85.2.8ZM267,133.9v85.2l-72.1,42.2v-30.7l45.3-26.9v-53l26.9-16.1v-.8ZM194.9,92.4l26.9,16.1h0v30.7l-45.3,26.9v53.7l-26.1,16.1-26.1-16.1v-53.7l-46.8-26.9v-30.7l26.9-16.1,45.3,26.9,45.3-26.9ZM77.5,160.7l26.1,16.1v30.7l-26.1-16.1v-30.7ZM221.8,160.7v30.7l-26.1,16.1v-30.7l26.1-16.1ZM58.3,64.8l26.9,16.1-26.9,16.1v30.7l-26.1-16.1v-30.7s26.1-16.1,26.1-16.1ZM240.9,64.8l26.9,16.1v30.7l-26.9,16.1v-30.7l-26.1-16.1s26.1-16.1,26.1-16.1ZM149.6,64.8l26.9,16.1-26.9,16.1-26.1-16.1,26.1-16.1ZM149.6,11.9l72.1,42.2-26.1,16.1-45.3-26.9-46,26.9-26.1-16.1S149.6,11.9,149.6,11.9Z" />
      </svg>
    ),
    Avalanche: (
      <svg viewBox="0 0 300 300" className="w-full h-full" fill="currentColor">
        <g>
          <path
            fill="none"
            d="M209.3,156.5l-.2-.4c-2.8-4.8-4.2-7.2-6.1-8.1-2-1-4.4-1-6.4,0-1.8,1-3.3,3.5-6.3,8.5l-20,34.4h0c-2.9,5.2-4.4,7.7-4.3,9.8.1,2.3,1.3,4.4,3.2,5.6,1.7,1.1,4.7,1.1,10.6,1.1h12.6l24.5-37.9-7.6-13Z"
          />
          <path
            fill="none"
            d="M179.6,115.2c.8-3.2.8-6.6,0-9.8-.7-3-2.3-5.8-5.5-11.3h0c0-.1-6.1-10.8-6.1-10.8l-80.1,124.1h21.4c6.6,0,9.9,0,12.8-.8,3.2-1,6.2-2.7,8.6-5,2.2-2.1,3.9-5,7.1-10.6v-.2c0,0,36.4-64.2,36.4-64.2,3.2-5.6,4.8-8.5,5.5-11.4Z"
          />
          <path
            fill="none"
            d="M219.9,207.4c5.9,0,8.9,0,10.7-1.2,1.9-1.2,3.1-3.3,3.2-5.6.1-2-1.3-4.5-4.1-9.3,0-.2-.2-.3-.3-.5l-12.4-21.2-24.3,37.7h27.2Z"
          />
          <path
            fill="none"
            d="M159.8,69.1c-2.9-5.2-4.4-7.8-6.3-8.7-2-1-4.4-1-6.4,0-1.9,1-3.4,3.5-6.3,8.7l-69.1,121.8c-2.9,5.1-4.4,7.7-4.3,9.7.1,2.3,1.3,4.3,3.2,5.6,1.8,1.1,4.7,1.1,10.6,1.1h6.3l80.3-124.4-8-13.9Z"
          />
          <path d="M150,5.8C70.4,5.8,5.8,70.4,5.8,150s64.6,144.2,144.2,144.2,144.2-64.6,144.2-144.2S229.6,5.8,150,5.8ZM137.7,190.8v.2c-3.3,5.6-4.9,8.4-7.2,10.6-2.4,2.3-5.4,4-8.6,5-2.9.8-6.2.8-12.8.8h-21.4l-5.3,8.2h-.2c0-.1,5.2-8.2,5.2-8.2h-6.3c-5.9,0-8.8,0-10.6-1.1-1.9-1.2-3.1-3.3-3.2-5.6-.1-2.1,1.3-4.6,4.3-9.7l69.1-121.8c2.9-5.2,4.4-7.8,6.3-8.7,2-1,4.4-1,6.4,0,1.9,1,3.4,3.5,6.3,8.7l8,13.9,6.6-10.3h.2c0,.1-6.7,10.5-6.7,10.5l6.1,10.7h0c3.2,5.7,4.8,8.5,5.5,11.4.8,3.2.8,6.6,0,9.8-.7,3-2.3,5.8-5.5,11.4l-36.3,64.2ZM229.4,190.8c0,.2.2.3.3.5,2.8,4.8,4.2,7.3,4.1,9.3-.1,2.3-1.3,4.4-3.2,5.6-1.8,1.2-4.7,1.2-10.7,1.2h-27.2l-32.8,50.8h-.2c0-.1,32.7-50.8,32.7-50.8h-12.6c-5.9,0-8.9,0-10.6-1.1-1.9-1.2-3.1-3.3-3.2-5.6-.1-2.1,1.4-4.6,4.3-9.7h0c0-.1,20-34.5,20-34.5,2.9-5.1,4.4-7.6,6.3-8.5,2-1,4.4-1,6.4,0,1.8.9,3.3,3.3,6.1,8.1l.2.4,7.6,13,34.9-54h.2c0,.1-35,54.3-35,54.3l12.4,21.2Z" />
          <polygon points="167.7 83 87.5 207.4 87.8 207.4 167.9 83.3 167.7 83" />
          <polygon points="174.6 72.9 174.3 72.8 167.7 83 167.9 83.3 174.6 72.9" />
          <polygon points="82.2 215.5 82.5 215.6 87.8 207.4 87.5 207.4 82.2 215.5" />
          <polygon points="192.4 207.4 192.7 207.4 217 169.7 216.9 169.4 192.4 207.4" />
          <polygon points="159.7 258.1 159.9 258.2 192.7 207.4 192.4 207.4 159.7 258.1" />
          <polygon points="251.8 115.4 216.9 169.4 217 169.7 252 115.5 251.8 115.4" />
        </g>
      </svg>
    ),
  };


  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (typeof timestamp === "number") {
        date = new Date(timestamp);
      } else {
        date = new Date(timestamp);
      }
      
      if (isNaN(date.getTime())) return "-";
      
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "-";
    }
  };

  const getRemainingTime = (bet) => {
    if (!bet || bet.status !== "active") return null;

    try {
      let timestampMs;
      if (bet.timestamp?.toMillis) {
        timestampMs = bet.timestamp.toMillis();
      } else if (bet.timestamp?.seconds) {
        timestampMs = bet.timestamp.seconds * 1000;
      } else if (typeof bet.timestamp === "number") {
        timestampMs = bet.timestamp;
      } else {
        return null;
      }

      const duration = bet.duration || (bet.expiry ? Math.floor((bet.expiry - timestampMs) / 1000) : 60);
      
      const expirationTime = timestampMs + (duration * 1000);
      
      const remaining = Math.max(0, expirationTime - Date.now());
      
      if (remaining <= 0) return "Expired";

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    } catch (error) {
      console.error("Error calculating remaining time:", error);
      return null;
    }
  };

  const calculatePnL = (bet) => {
    if (!bet || !bet.currentPrice) return { profitPercent: 0, profitAmount: 0, isWinning: false };

    const betCurrency = bet.originalCurrency || "BNB";
    
    const entryPriceBNB = bet.currentPrice;
    
    let currentPriceBNB = bet.marketPrice; // This is passed from closePosition
    
    if (!currentPriceBNB || currentPriceBNB <= 0) {
      currentPriceBNB = chartPrices[bet.symbol] || prices[bet.symbol]?.bnb || 0;
    }
    
    if (!currentPriceBNB || currentPriceBNB <= 0 || !entryPriceBNB || entryPriceBNB <= 0) {
      return { profitPercent: 0, profitAmount: 0, isWinning: false };
    }

    const priceDiff = currentPriceBNB - entryPriceBNB;
    const isLong = bet.direction === "ABOVE" || bet.direction === "UP";
    
    let profitPercent;
    if (isLong) {
      profitPercent = ((currentPriceBNB - entryPriceBNB) / entryPriceBNB) * 100;
    } else {
      profitPercent = ((entryPriceBNB - currentPriceBNB) / entryPriceBNB) * 100;
    }

    const isWinning = (isLong && priceDiff > 0) || (!isLong && priceDiff < 0);
    
    let betAmountInCurrency = bet.amount; // bet.amount is stored in BNB
    if (betCurrency === "USDT") {
      const bnbPriceInUSDT = prices.BNB?.usdt || bnbPriceUSD;
      betAmountInCurrency = bet.amount * bnbPriceInUSDT;
    }
    
    const profitAmount = (betAmountInCurrency * Math.abs(profitPercent)) / 100;

    let currentPriceDisplay = currentPriceBNB;
    if (betCurrency === "USDT") {
      const bnbPriceInUSDT = prices.BNB?.usdt || bnbPriceUSD;
      currentPriceDisplay = currentPriceBNB * bnbPriceInUSDT;
    }

    return { profitPercent, profitAmount, isWinning, currentPrice: currentPriceDisplay };
  };

  const closePosition = async (betId, bet, isManual = false) => {
    try {
      const currentPriceBNB = chartPrices[bet.symbol] || prices[bet.symbol]?.bnb || bet.currentPrice;
      
      if (!currentPriceBNB || currentPriceBNB <= 0) {
        alert("Unable to get current price. Please try again.");
        return;
      }

      const { profitPercent, profitAmount, isWinning } = calculatePnL({ ...bet, marketPrice: currentPriceBNB });
      const isWon = isWinning;
      
      const betCurrency = bet.originalCurrency || "BNB";
      let currentPrice = currentPriceBNB;
      if (betCurrency === "USDT") {
        const bnbPriceInUSDT = prices.BNB?.usdt || bnbPriceUSD;
        currentPrice = currentPriceBNB * bnbPriceInUSDT;
      }
      
      const finalAmount = isWon 
        ? bet.amount + profitAmount 
        : bet.amount - Math.abs(profitAmount);

      await updatePredictionStatus(
        betId,
        isWon ? "won" : "lost",
        currentPrice,
        profitAmount,
        {
          profitPercent,
          finalAmount,
          isWinning: isWon,
          closedManually: isManual,
        }
      );

      setUserBets((prev) => {
        const updatedBets = prev.map((b) =>
          b.id === betId
            ? {
                ...b,
                status: isWon ? "won" : "lost",
                exitPrice: currentPrice,
                profitPercent,
                profitAmount,
                finalAmount,
                isWinning: isWon,
                closedAt: new Date(),
                closedManually: isManual,
              }
            : b
        );
        return updatedBets;
      });

      if (isWon && !bet.claimed) {
        if (!startedTimersRef.current.has(betId)) {
          startClaimTimer(betId);
          startedTimersRef.current.add(betId);
        }
      }

      if (isManual) {
        alert(
          `Position closed successfully! ${isWon ? "WON" : "LOST"}: ${profitAmount >= 0 ? "+" : ""}${profitAmount.toFixed(6)} BNB (${profitPercent >= 0 ? "+" : ""}${profitPercent.toFixed(2)}%)`
        );
      }
    } catch (error) {
      console.error("Error closing position:", error);
      alert("Error closing position. Please try again.");
    }
  };

  const startClaimTimer = (betId) => {
    setClaimTimers((prev) => ({
      ...prev,
      [betId]: 180, // 3 minutes
    }));
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClaimWinnings = async (betId, bet) => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    if (claimTimers[betId] && claimTimers[betId] > 0) {
      alert(`Please wait ${formatTimer(claimTimers[betId])} before claiming.`);
      return;
    }

    try {
      await claimWinnings(betId);
      
      setUserBets((prev) =>
        prev.map((b) =>
          b.id === betId
            ? {
                ...b,
                claimed: true,
                claimedAt: new Date(),
              }
            : b
        )
      );

      await addActivity({
        type: "claim_winnings",
        walletAddress: address,
        action: `Claimed winnings for ${bet.symbol} ${bet.direction} prediction`,
        amount: bet.finalAmount || bet.amount + (bet.profitAmount || 0),
      });

      alert("Winnings claimed successfully!");
      setSubmitMessage("");
      setClaimTimers((prev) => {
        const updated = { ...prev };
        delete updated[betId];
        return updated;
      });
      startedTimersRef.current.delete(betId);
    } catch (error) {
      console.error("Error claiming winnings:", error);
      alert(`Error claiming winnings: ${error.message || "Please try again"}`);
      setSubmitMessage("");
    }
  };

  const checkAndCloseExpiredPositions = useCallback(async () => {
    if (!userBets || userBets.length === 0) return;

    const now = Date.now();
    
    for (const bet of userBets) {
      if (bet.status !== "active") continue;

      try {
        let timestampMs;
        if (bet.timestamp?.toMillis) {
          timestampMs = bet.timestamp.toMillis();
        } else if (bet.timestamp?.seconds) {
          timestampMs = bet.timestamp.seconds * 1000;
        } else if (typeof bet.timestamp === "number") {
          timestampMs = bet.timestamp;
        } else {
          continue;
        }

        const duration = bet.duration || (bet.expiry ? Math.floor((bet.expiry - timestampMs) / 1000) : 60);
        const expirationTime = timestampMs + (duration * 1000);

        if (now >= expirationTime) {
          await closePosition(bet.id, bet, false);
        }
      } catch (error) {
        console.error(`Error checking expiration for bet ${bet.id}:`, error);
      }
    }
  }, [userBets, chartPrices, prices]);

  useEffect(() => {
    checkAndCloseExpiredPositions();
    const interval = setInterval(checkAndCloseExpiredPositions, 5000);
    return () => clearInterval(interval);
  }, [checkAndCloseExpiredPositions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const footerLinks = {
    company: [
      { name: "About", url: "https://iotrader.io/about" },
      { name: "Careers", url: "https://iotrader.io/careers" },
      { name: "Privacy Policy", url: "https://iotrader.io/privacy-policy" },
      {
        name: "Terms and Conditions",
        url: "https://iotrader.io/terms-and-conditions",
      },
    ],
    trading: [
      {
        name: "Price Predictions",
        url: "https://iotrader.io/price-prediction",
      },
      { name: "Futures Trading", url: "https://iotrader.io/future-trading" },
      { name: "Market Predictions", url: "https://iotrader.io/markets" },
      { name: "User Dashboard", url: "https://iotrader.io/user-dashboard" },
    ],
    support: [
      { name: "Help Center", url: "https://iotrader.io/help-center" },
      { name: "Contact Us", url: "https://iotrader.io/contact" },
      { name: "Public API", url: "https://iotrader.io/public-api" },
      {
        name: "Documentation",
        url: "https://iotrader.gitbook.io/iotrader-docs/",
      },
    ],
    community: [
      {
        name: "Telegram Channel",
        url: "https://t.me/iotradersio",
        icon: <Icon name="Send" size={16} />,
      },
      {
        name: "Telegram Chat",
        url: "https://t.me/iotradersiochat",
        icon: <Icon name="Send" size={16} />,
      },
      {
        name: "Youtube",
        url: "https://www.youtube.com/@iotraderio",
        icon: <Icon name="Youtube" size={16} />,
      },
      {
        name: "Twitter (X)",
        url: "https://x.com/iotradersio?s=21",
        icon: <Icon name="Twitter" size={16} />,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-yellow-500/30 relative overflow-hidden">
      <SEO
        title="Price Predictions - Trade Crypto Futures"
        description="Make real-time cryptocurrency price predictions on BTC, ETH, BNB, SOL and more. Trade with 1 min, 10 min, or 1 hour durations. Built on BSC blockchain."
        keywords="crypto price predictions, BTC predictions, ETH predictions, BNB predictions, cryptocurrency trading, price forecasting, blockchain predictions"
        url="/price-prediction"
      />
      {/* 0. STYLES FOR MARQUEE ANIMATION & INPUT SPINNER REMOVAL */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); } 
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        .no-spinner::-webkit-inner-spin-button, 
        .no-spinner::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        .no-spinner {
          -moz-appearance: textfield;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes move-around {
          0% { top: 30%; left: 30%; transform: translate(-50%, -50%) scale(1); opacity: 0.15; }
          25% { top: 20%; left: 70%; transform: translate(-50%, -50%) scale(1.1); opacity: 0.25; }
          50% { top: 70%; left: 60%; transform: translate(-50%, -50%) scale(1); opacity: 0.15; }
          75% { top: 60%; left: 20%; transform: translate(-50%, -50%) scale(1.1); opacity: 0.25; }
          100% { top: 30%; left: 30%; transform: translate(-50%, -50%) scale(1); opacity: 0.15; }
        }
        .animate-move-around {
          animation: move-around 20s infinite ease-in-out;
          transform: translate3d(0, 0, 0); /* Force GPU acceleration */
        }
        
        /* New Entrance Animations - Smoother Curve */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        /* Delays for staggered animation */
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        
        /* Dropdown Animation */
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(-5px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-in {
          animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        /* Chat Window Slide Up Animation */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        /* Pulse Animation for FAB */
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* BACKGROUND MOVING GRADIENT */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-yellow-500/20 rounded-full blur-[120px] animate-move-around mix-blend-screen"></div>
      </div>

      {/* 1. TOP TICKER BAR */}
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
                {item.price.toFixed(6)}
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
                {item.price.toFixed(6)}
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

      {/* 2. MAIN NAVIGATION HEADER */}
      <Header activePage="price-prediction" />

      {/* 3. ASSET SELECTOR BAR */}
      <div className="bg-[#080808] border-b border-yellow-500/20 pt-3 pb-1">
        {/* ADDED HEADER TEXT */}
        <div className="px-2 lg:px-6 mb-1">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
            <Icon name="Activity" size={10} className="text-yellow-500" />
            Select Prediction Market
          </span>
        </div>

        <div className="relative group px-2 lg:px-6 py-2">
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#080808]/80 h-full px-2 items-center text-gray-400 hover:text-white transition-colors"
          >
            <Icon name="ChevronLeft" size={24} />
          </button>

          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#080808]/80 h-full px-2 items-center text-gray-400 hover:text-white transition-colors"
          >
            <Icon name="ChevronRight" size={24} />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex items-center gap-3 overflow-x-auto no-scrollbar px-8 scroll-smooth"
          >
            {tickerItems.map((item) => (
              <button
                key={item.symbol}
                onClick={() => navigate(`/price-prediction/${item.symbol.toLowerCase()}`)}
                className={`flex-shrink-0 flex items-center gap-3 px-3 py-2 rounded-lg border transition-all min-w-[120px] group active:scale-95 touch-manipulation ${
                  selectedAsset === item.symbol
                    ? "bg-gradient-to-r from-yellow-600 to-yellow-400 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] scale-105"
                    : "bg-[#1E2329] border-gray-700 hover:border-gray-500 hover:scale-105"
                }`}
              >
                <div className="flex flex-col items-start w-full">
                  <span
                    className={`text-xs font-black tracking-wider uppercase ${
                      selectedAsset === item.symbol
                        ? "text-black"
                        : "text-white"
                    }`}
                  >
                    {item.symbol}/{item.currency || selectedCurrency}
                  </span>
                  <span
                    className={`text-sm font-mono font-bold ${
                      selectedAsset === item.symbol
                        ? "text-black"
                        : "text-gray-300"
                    }`}
                  >
                    {item.price > 0 
                      ? (item.symbol === "ANB" ? item.price.toFixed(4) : item.price.toFixed(6))
                      : (item.symbol === "ANB" ? "0.0000" : "0.000000")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="w-full max-w-full px-4 lg:px-6 py-4 lg:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* 4. LEFT SIDE: CHART & INFO (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col space-y-6 animate-fade-in-up">
          {/* Header Area */}
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center mb-1">
                {/* BTC Logo SVG matching "perpetual" color */}
                <svg
                  viewBox="0 0 1000 1000"
                  className="w-4 h-4 mr-1 text-yellow-400"
                  fill="currentColor"
                >
                  <path d="M499.4,341.4l-27.3,109.2c30.9,7.6,126.1,39.6,141.7-22.8h0s-.5,0-.5,0c16.1-64.6-83.5-78.9-113.9-86.4Z" />
                  <path d="M622.1,16.1c-.5,0-1-.2-1.4-.3C353-50.6,82.2,112.6,15.8,380.3c-66.3,267.7,96.8,538.5,364.5,604.9,267.7,66.4,538.5-96.8,604.9-364.5h0c66.3-267.2-96.1-537.6-363.1-604.6ZM721.6,428.8h-.2c-7.7,49.4-34.2,72.3-70.1,80.6,49.2,25.6,74.3,64.8,50.4,132.8-29.6,84.6-99.7,91.7-193.3,74l-22.6,90.8-54.8-13.6,22.2-90.4c-14.2-3.4-28.7-7.1-43.5-11.2l-22.5,90-54.8-13.7,22.6-91-39-10.1-71.3-17.6,27.2-62.4s40,10.6,40,9.8c10.5,3.3,21.8-2.5,25.1-13l35.7-143.7,5.8,1.6c-1.8-.8-3.7-1.5-5.6-1.9l25.6-102.5c1.2-15.6-10.1-29.3-25.6-31.2.8-.6-39.8-10-39.8-10l14.5-58.5,75.7,18.9,35,7.8,22.5-90,54.8,13.7-21.8,88.6c14.7,3.3,29.5,6.7,43.9,10.3l21.8-87.7,55.4,13.7-22.5,90c68.5,23.7,119,59.4,109.2,125.9Z" />
                  <path d="M458.4,505.7l-30.1,120.6c37.1,9.2,151.6,46,168.5-22,17.7-71-101.3-89.2-138.4-98.6Z" />
                </svg>
                <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">
                  {selectedAsset === "ANB" ? "ANB/USDT" : `${selectedAsset}/${selectedCurrency}`}
                </h1>
                <span className="ml-3 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold border border-yellow-500/20">
                  PERPETUAL
                </span>
              </div>
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-mono font-medium text-white drop-shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                  {currentChartPrice > 0
                    ? currentChartPrice.toFixed(selectedAsset === "ANB" ? 4 : (selectedCurrency === "USDT" ? 2 : 6))
                    : selectedAsset === "ANB" ? "0.0000" : (selectedCurrency === "USDT" ? "0.00" : "0.000000")}{" "}
                  <span className="text-2xl text-yellow-400">{selectedAsset === "ANB" ? "USDT" : selectedCurrency}</span>
                </span>
                <span
                  className={`flex items-center text-lg font-bold ${
                    priceChange >= 0 ? "text-emerald-400" : "text-rose-500"
                  }`}
                >
                  {priceChange >= 0 ? (
                    <Icon name="ArrowUp" size={20} />
                  ) : (
                    <Icon name="ArrowDown" size={20} />
                  )}
                  {priceChange >= 0 ? "+" : ""}
                  {priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* TRADINGVIEW LIGHTWEIGHT CHART */}
          <div className="flex-1 bg-[#0a0b0d] border border-white/10 rounded-xl min-h-[450px] relative overflow-hidden flex flex-col">
            {/* Chart Toolbar */}
            <div className="flex flex-wrap items-center justify-between p-3 border-b border-white/5 gap-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-white">
                  {selectedAsset === "ANB" ? "ANB/USDT" : `${selectedAsset}/${selectedCurrency}`} Chart
                </span>
                <span className={`text-xs font-bold ${
                  priceChange >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-bold uppercase mr-2">
                  Time Range:
                </span>
                {["5 Min", "10 Min", "15 Min"].map((t) => {
                  const tValue = t === "5 Min" ? "5m" : t === "10 Min" ? "10m" : "15m";
                  return (
                    <button
                      key={tValue}
                      onClick={() => setTimeRange(tValue)}
                      className={`px-3 py-1 text-xs font-bold rounded active:scale-95 touch-manipulation ${
                        timeRange === tValue
                          ? "bg-yellow-500 text-black"
                          : "bg-[#1E2329] text-gray-400 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chart Sub-Toolbar */}
            <div className="flex items-center gap-2 p-3 pt-0 mt-3 px-3">
              <button className="px-3 py-1 bg-[#1E2329] text-yellow-500 text-xs font-bold rounded border border-white/5 hover:border-yellow-500/50 transition-colors active:scale-95 touch-manipulation">
                Trend Line
              </button>
              <button className="px-3 py-1 bg-[#1E2329] text-yellow-500 text-xs font-bold rounded border border-white/5 hover:border-yellow-500/50 transition-colors active:scale-95 touch-manipulation">
                Horizontal
              </button>
              <button className="px-3 py-1 bg-rose-500/20 text-rose-500 text-xs font-bold rounded border border-rose-500/20 hover:bg-rose-500/30 transition-colors active:scale-95 touch-manipulation">
                Clear All
              </button>
            </div>

            {/* BinanceChart Component */}
            <div className="flex-1 relative w-full h-full">
              <BinanceChart
                selectedCrypto={selectedAsset}
                userBets={userBets}
                livePrices={prices}
                userAddress={address}
                onChartPriceUpdate={handleChartPriceUpdate}
                timeRange={timeRange}
                selectedCurrency={selectedCurrency}
              />
              
              {/* FLOATING ACTION BUTTON - ANALYSIS BOT (on graph) */}
              <div className="absolute top-4 right-4 z-50 flex flex-col items-center gap-2">
                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className="w-16 h-16 rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center group hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer relative"
                  aria-label="Open Analysis Bot"
                >
                  {/* Pulsing ring effect - golden */}
                  {!isChatOpen && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 animate-pulse-ring"></div>
                  )}
                  {/* Inner gradient ring - golden and black hollow circle effect */}
                  <div className="absolute inset-2 rounded-full overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="botGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f3b340" />
                          <stop offset="50%" stopColor="#f5c842" />
                          <stop offset="100%" stopColor="#f3b340" />
                        </linearGradient>
                      </defs>
                      {/* Outer circle with golden gradient */}
                      <circle cx="50" cy="50" r="48" fill="url(#botGradient)" />
                      {/* Inner circle to create hollow effect - black center */}
                      <circle cx="50" cy="50" r="38" fill="#000000" />
                    </svg>
                  </div>
                  {/* Center logo - iotrader logo */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <img 
                      src="/logo.png" 
                      alt="IO Trader" 
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 opacity-90 hidden"></div>
                  </div>
                  {/* Hover effect ring - golden */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md -z-10"></div>
                </button>
                {/* IOTRADER AI Text */}
                <span className="text-xs font-black text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  IOTRADER AI
                </span>
              </div>
            </div>

            {/* Footer Status Bar */}
            <div className="border-t border-white/5 p-2 px-4 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center text-gray-400">
                <Icon
                  name="ArrowUp"
                  size={10}
                  className="text-emerald-500 mr-1"
                />
                Long ({userBets.filter(b => (b.direction === "ABOVE" || b.direction === "UP") && b.status === "active" && b.symbol === selectedAsset).length} user{userBets.filter(b => (b.direction === "ABOVE" || b.direction === "UP") && b.status === "active" && b.symbol === selectedAsset).length !== 1 ? 's' : ''})
              </div>
              <div className="flex items-center text-gray-400">
                <Icon
                  name="ArrowDown"
                  size={10}
                  className="text-rose-500 mr-1"
                />
                Short ({userBets.filter(b => (b.direction === "BELOW" || b.direction === "DOWN") && b.status === "active" && b.symbol === selectedAsset).length} user{userBets.filter(b => (b.direction === "BELOW" || b.direction === "DOWN") && b.status === "active" && b.symbol === selectedAsset).length !== 1 ? 's' : ''})
              </div>
              <div className="flex items-center text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></div>
                Winning ({userBets.filter(b => {
                  if (b.status !== "active" || b.symbol !== selectedAsset) return false;
                  const currentPrice = chartPrices[selectedAsset] || b.currentPrice;
                  const isLong = b.direction === "ABOVE" || b.direction === "UP";
                  return (isLong && currentPrice > b.currentPrice) || (!isLong && currentPrice < b.currentPrice);
                }).length})
              </div>
              <div className="flex items-center text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></div>
                Losing ({userBets.filter(b => {
                  if (b.status !== "active" || b.symbol !== selectedAsset) return false;
                  const currentPrice = chartPrices[selectedAsset] || b.currentPrice;
                  const isLong = b.direction === "ABOVE" || b.direction === "UP";
                  return (isLong && currentPrice <= b.currentPrice) || (!isLong && currentPrice >= b.currentPrice);
                }).length})
              </div>
              <span className="ml-auto text-gray-500 normal-case tracking-normal">
                {isConnected ? "Chart synced with real-time prices" : "Connect your wallet to start making predictions"}
              </span>
            </div>
          </div>
        </div>

        {/* 5. RIGHT SIDE: INTERACTIVE PANEL (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col space-y-4 animate-fade-in-up delay-100">
          {/* REMOVED TAB SWITCHER */}

          {/* PREDICTION CARD */}
          <div className="bg-[#111] border border-yellow-500/20 rounded-2xl p-6 relative overflow-hidden shadow-2xl transition-all hover:border-yellow-500/40">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center text-white">
                <Icon
                  name="Zap"
                  className="text-yellow-400 mr-2"
                  fill="currentColor"
                  size={20}
                />
                New Prediction
              </h2>
            </div>

            {/* Current Price Box - NEW */}
            <div className="border border-yellow-500/20 rounded-xl p-4 mb-6 relative bg-white/2">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Current Price
                </span>
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]">
                    Chart Synced
                  </span>
                </div>
              </div>
              <div className="text-2xl font-mono font-bold text-white mb-1">
                {currentChartPrice > 0
                  ? currentChartPrice.toFixed(selectedAsset === "ANB" ? 4 : (selectedCurrency === "USDT" ? 2 : 6))
                  : selectedAsset === "ANB" ? "0.0000" : (selectedCurrency === "USDT" ? "0.00" : "0.000000")}{" "}
                {selectedAsset === "ANB" ? "USDT" : selectedCurrency}
              </div>
              <div
                className={`flex items-center text-sm font-bold mb-3 ${
                  priceChange >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {priceChange >= 0 ? (
                <Icon name="ArrowUp" size={14} className="mr-1" />
                ) : (
                  <Icon name="ArrowDown" size={14} className="mr-1" />
                )}
                {priceChange >= 0 ? "+" : ""}
                {priceChange.toFixed(2)}%
              </div>
              <div className="text-[10px] text-gray-500 italic flex items-center">
                <Icon name="CheckCircle2" size={10} className="mr-1" />
                Price synced with chart display
              </div>
            </div>

            {/* Currency Selector */}
            <div className="mb-4">
              <label className="text-xs text-white font-bold uppercase mb-2 block tracking-wider">
                Payment Currency
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedCurrency("BNB")}
                  className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                    selectedCurrency === "BNB"
                      ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                      : "bg-[#1a1a1a] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 text-white">
                      {networkIcons.BSC}
                    </div>
                    <span>BNB</span>
                  </div>
                </button>
                <button
                  onClick={() => setSelectedCurrency("USDT")}
                  className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                    selectedCurrency === "USDT"
                      ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                      : "bg-[#1a1a1a] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 text-white font-bold">$</div>
                    <span>USDT</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Prediction Amount - UPDATED LAYOUT */}
            <div className="mb-6">
              <label className="text-xs text-white font-bold uppercase mb-2 block tracking-wider">
                Prediction Amount
              </label>
              <div className="bg-[#1a1a1a] rounded-xl p-3 border border-yellow-500/30 flex justify-between items-center transition-all focus-within:border-yellow-500">
                <input
                  type="number"
                  placeholder="0.00"
                  value={predictionAmount}
                  onChange={(e) => setPredictionAmount(e.target.value)}
                  disabled={!isConnected || isSubmitting}
                  className="no-spinner bg-transparent text-xl font-mono text-white outline-none w-full placeholder-white/20 focus:placeholder-white/10 caret-yellow-500 disabled:opacity-50"
                />
                <div className="flex items-center ml-2">
                  {selectedCurrency === "BNB" ? (
                    <>
                      <div className="w-4 h-4 mr-2 text-white">
                        {networkIcons.BSC}
                      </div>
                      <span className="text-white font-bold text-sm">BNB</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 mr-2 text-white font-bold">$</div>
                      <span className="text-white font-bold text-sm">USDT</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-gray-500 mt-2 font-medium">
                Enter the amount you want to predict with ({selectedCurrency})
                {selectedCurrency === "USDT" && bnbPriceUSD > 0 && predictionAmount && (
                  <span className="block mt-1 text-yellow-400">
                    ≈ {(parseFloat(predictionAmount) / bnbPriceUSD).toFixed(6)} BNB
                  </span>
                )}
              </div>
            </div>

            {/* Duration Selector - UPDATED OPTIONS */}
            <div className="mb-6">
              <label className="text-xs text-white font-bold uppercase mb-2 block tracking-wider">
                Prediction Duration
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "1m", label: "1 min" },
                  { value: "10m", label: "10 min" },
                  { value: "1h", label: "1 hour" }
                ].map((time) => (
                  <button
                    key={time.value}
                    onClick={() => setSelectedDuration(time.value)}
                    className={`py-3 rounded-xl text-sm font-black tracking-wide border transition-all hover:scale-[1.02] active:scale-95 ${
                      selectedDuration === time.value
                        ? "bg-yellow-500 text-black border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                        : "bg-[#1a1f1c] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons - UPDATED TEXT & LAYOUT */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() =>
                  isConnected &&
                  setPredictionDirection(
                    predictionDirection === "DOWN" ? null : "DOWN"
                  )
                }
                disabled={!isConnected}
                className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 transform active:scale-[0.98] ${
                  !isConnected ? "opacity-50 cursor-not-allowed" : ""
                } ${
                  predictionDirection === "DOWN"
                    ? "bg-rose-500/20 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)] ring-1 ring-rose-500/50"
                    : "bg-rose-900/20 border-rose-500/30 hover:bg-rose-900/30 hover:border-rose-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                }`}
              >
                <div className="relative z-10 flex flex-col items-center">
                  <span
                    className={`font-black text-lg transition-colors uppercase mb-1 ${
                      predictionDirection === "DOWN"
                        ? "text-white"
                        : "text-rose-400 group-hover:text-rose-300"
                    }`}
                  >
                    Sell (Below)
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-500/80 group-hover:text-rose-400">
                    {currentChartPrice > 0 
                      ? (currentChartPrice * 0.9999).toFixed(selectedCurrency === "USDT" ? 2 : 6) 
                      : selectedCurrency === "USDT" ? "0.00" : "0.000000"}
                  </span>
                </div>
                {/* Hover Fill Effect */}
                <div
                  className={`absolute inset-0 bg-rose-500/10 transition-transform duration-300 ${
                    predictionDirection === "DOWN"
                      ? "translate-y-0"
                      : "translate-y-full group-hover:translate-y-0"
                  }`}
                ></div>
              </button>

              <button
                onClick={() =>
                  isConnected &&
                  setPredictionDirection(
                    predictionDirection === "UP" ? null : "UP"
                  )
                }
                disabled={!isConnected}
                className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 transform active:scale-[0.98] ${
                  !isConnected ? "opacity-50 cursor-not-allowed" : ""
                } ${
                  predictionDirection === "UP"
                    ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] ring-1 ring-emerald-500/50"
                    : "bg-emerald-900/20 border-emerald-500/30 hover:bg-emerald-900/30 hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                }`}
              >
                <div className="relative z-10 flex flex-col items-center">
                  <span
                    className={`font-black text-lg transition-colors uppercase mb-1 ${
                      predictionDirection === "UP"
                        ? "text-white"
                        : "text-emerald-400 group-hover:text-emerald-300"
                    }`}
                  >
                    Buy (Above)
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-500/80 group-hover:text-emerald-400">
                    {currentChartPrice > 0 
                      ? (currentChartPrice * 1.0001).toFixed(selectedCurrency === "USDT" ? 2 : 6) 
                      : selectedCurrency === "USDT" ? "0.00" : "0.000000"}
                  </span>
                </div>
                {/* Hover Fill Effect - Shows when NOT active, or fills full when active */}
                <div
                  className={`absolute inset-0 bg-emerald-500/10 transition-transform duration-300 ${
                    predictionDirection === "UP"
                      ? "translate-y-0"
                      : "translate-y-full group-hover:translate-y-0"
                  }`}
                ></div>
              </button>
            </div>

            <div className="text-center text-[10px] text-gray-500 font-bold tracking-wider mb-4 uppercase">
              Buy = Predict ABOVE | Sell = Predict BELOW
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitPrediction}
              disabled={!isConnected || !predictionDirection || !predictionAmount || isSubmitting}
              className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-wider transition-all ${
                isConnected && predictionDirection && predictionAmount && !isSubmitting
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] active:scale-95"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting
                ? "Submitting..."
                : !isConnected
                ? "Connect Wallet"
                : "Submit Prediction"}
            </button>

            {/* Submit Message */}
            {submitMessage && (
              <div
                className={`mt-4 p-3 rounded-lg text-sm font-bold text-center ${
                  submitMessage.includes("Error")
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {submitMessage}
              </div>
            )}

            {/* Potential Returns - NEW SECTION */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white mb-3">
                Potential Returns
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Sell Return Card */}
                <div className="bg-[#1a1f1c]/50 border border-rose-500/30 rounded-lg p-3 relative overflow-hidden transition-all hover:border-rose-500/50">
                  <div className="text-[10px] font-bold text-rose-500 uppercase mb-1">
                    Sell (Below)
                  </div>
                  <div className="text-xl font-mono font-bold text-white mb-1">
                    0.00
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold mb-2">
                    {selectedCurrency}
                  </div>
                  <div className="text-xs font-bold text-rose-400">
                    +85% Return
                  </div>
                </div>
                {/* Buy Return Card */}
                <div className="bg-[#1a1f1c]/50 border border-emerald-500/30 rounded-lg p-3 relative overflow-hidden transition-all hover:border-emerald-500/50">
                  <div className="text-[10px] font-bold text-emerald-500 uppercase mb-1">
                    Buy (Above)
                  </div>
                  <div className="text-xl font-mono font-bold text-white mb-1">
                    0.00
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold mb-2">
                    {selectedCurrency}
                  </div>
                  <div className="text-xs font-bold text-emerald-400">
                    +95% Return
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Investment Info */}
            <div className="mt-4 flex justify-center items-center text-xs font-bold text-gray-300">
              <span>
                Investment:{" "}
                <span className="text-white">
                  {predictionAmount || "0.00"} {selectedCurrency}
                </span>
                {selectedCurrency === "USDT" && bnbPriceUSD > 0 && predictionAmount && (
                  <span className="text-gray-500 ml-2">
                    (≈ {(parseFloat(predictionAmount) / bnbPriceUSD).toFixed(6)} BNB)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MY PREDICTIONS TABLE (ORDER BOOK) */}
      {isConnected && address && (
        <div className="w-full max-w-full px-4 lg:px-6 py-4 lg:py-6 relative z-10 animate-fade-in-up delay-200">
          <div className="bg-[#0a0b0d] border border-white/10 rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="p-4 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Icon name="BarChart2" size={20} className="text-yellow-400 mr-2" />
                My Predictions
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Track your active and closed positions
              </p>
            </div>

            {/* Table */}
            {userBets.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400 text-sm">No predictions yet. Place your first prediction above!</p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full">
                  <thead className="bg-[#080808] border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Asset</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Direction</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Entry Price</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Current Price</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">P&L</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Time Left</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {userBets
                      .sort((a, b) => {
                        const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds * 1000 || a.timestamp || 0;
                        const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds * 1000 || b.timestamp || 0;
                        return timeB - timeA;
                      })
                      .map((bet) => {
                        if (bet.status === "active") {
                          void countdownTimer;
                        }
                        const isActive = bet.status === "active";
                        let pnl;
                        if (!isActive && bet.exitPrice) {
                          pnl = calculatePnL({ ...bet, marketPrice: bet.exitPrice });
                        } else {
                          pnl = calculatePnL(bet);
                        }
                        
                        const finalPnl = pnl;
                        
                        const currentPrice = isActive 
                          ? (finalPnl.currentPrice || bet.currentPrice)
                          : (finalPnl.currentPrice || bet.exitPrice || bet.currentPrice);
                        
                        const remainingTime = getRemainingTime(bet);
                        const isLong = bet.direction === "ABOVE" || bet.direction === "UP";

                        return (
                          <tr key={bet.id} className="hover:bg-white/5 transition-colors">
                            {/* Time */}
                            <td className="px-4 py-3 text-xs text-gray-400">
                              {formatTime(bet.timestamp)}
                            </td>

                            {/* Asset */}
                            <td className="px-4 py-3 text-sm font-bold text-white">
                              {bet.symbol}
                            </td>

                            {/* Direction */}
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                                  isLong
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {bet.direction}
                              </span>
                            </td>

                            {/* Amount */}
                            <td className="px-4 py-3 text-sm font-mono text-white text-right">
                              {bet.originalAmount 
                                ? `${bet.originalAmount.toFixed(bet.originalCurrency === "USDT" ? 2 : 6)} ${bet.originalCurrency || "BNB"}`
                                : `${bet.amount?.toFixed(6) || "0.000000"} BNB`
                              }
                            </td>

                            {/* Entry Price */}
                            <td className="px-4 py-3 text-sm font-mono text-gray-400 text-right">
                              {bet.currentPrice?.toFixed(bet.originalCurrency === "USDT" ? 2 : 6) || (bet.originalCurrency === "USDT" ? "0.00" : "0.000000")}
                            </td>

                            {/* Current Price */}
                            <td className="px-4 py-3 text-sm font-mono text-white text-right">
                              {currentPrice?.toFixed(bet.originalCurrency === "USDT" ? 2 : 6) || (bet.originalCurrency === "USDT" ? "0.00" : "0.000000")}
                            </td>

                            {/* P&L */}
                            <td className={`px-4 py-3 text-sm font-mono text-right ${
                              finalPnl.profitPercent >= 0 ? "text-green-400" : "text-red-400"
                            }`}>
                              {(() => {
                                const displayCurrency = bet.originalCurrency || "BNB";
                                return (
                                  <>
                                    {finalPnl.profitAmount >= 0 ? "+" : ""}
                                    {finalPnl.profitAmount.toFixed(displayCurrency === "USDT" ? 2 : 6)} {displayCurrency} ({finalPnl.profitPercent >= 0 ? "+" : ""}
                                    {finalPnl.profitPercent.toFixed(2)}%)
                                  </>
                                );
                              })()}
                            </td>

                            {/* Time Left */}
                            <td className="px-4 py-3 text-center">
                              {isActive ? (
                                <span className="text-xs font-semibold text-[#f3b340]">
                                  {remainingTime || "-"}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-500">-</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3 text-center">
                              {isActive ? (
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                                    finalPnl.isWinning
                                      ? "bg-blue-500/20 text-blue-400"
                                      : "bg-blue-500/20 text-blue-400"
                                  }`}
                                >
                                  {finalPnl.isWinning ? "🟢 Winning" : "🔴 Losing"}
                                </span>
                              ) : (bet.status === "won" || finalPnl.isWinning) ? (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400">
                                  WON
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400">
                                  LOST
                                </span>
                              )}
                            </td>

                            {/* Action */}
                            <td className="px-4 py-3 text-center">
                              {isActive ? (
                                <button
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to close this position?")) {
                                      closePosition(bet.id, bet, true);
                                    }
                                  }}
                                  className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded hover:bg-red-500/30 transition-colors"
                                >
                                  Cancel
                                </button>
                              ) : (bet.status === "won" || finalPnl.isWinning) && !bet.claimed ? (
                                (() => {
                                  const timerSeconds = claimTimers[bet.id];
                                  const hasTimer = claimTimers.hasOwnProperty(bet.id);
                                  const isTimerActive = timerSeconds > 0;
                                  const timerExpired = hasTimer && timerSeconds === 0;
                                  
                                  if (isTimerActive) {
                                    return (
                                      <div className="flex flex-col items-center gap-1">
                                        <span className="text-xs text-yellow-400 font-bold">
                                          {formatTimer(timerSeconds)}
                                        </span>
                                        <span className="text-xs text-gray-500">Wait to claim</span>
                                      </div>
                                    );
                                  }
                                  
                                  if (timerExpired) {
                                    return (
                                      <button
                                        onClick={() => {
                                          if (window.confirm(`Claim winnings of ${bet.finalAmount ? bet.finalAmount.toFixed(bet.originalCurrency === "USDT" ? 2 : 6) : (bet.amount + (bet.profitAmount || 0)).toFixed(bet.originalCurrency === "USDT" ? 2 : 6)} ${bet.originalCurrency || "BNB"}?`)) {
                                            handleClaimWinnings(bet.id, bet);
                                          }
                                        }}
                                        className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded hover:bg-green-500/30 transition-colors"
                                      >
                                        Claim
                                      </button>
                                    );
                                  }
                                  
                                  return (
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs text-yellow-400 font-bold">
                                        03:00
                                      </span>
                                      <span className="text-xs text-gray-500">Wait to claim</span>
                                    </div>
                                  );
                                })()
                              ) : bet.claimed ? (
                                <span className="text-xs text-gray-500">Claimed</span>
                              ) : (
                                <span className="text-xs text-gray-500">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHAT WINDOW MODAL */}
      {isChatOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-end pointer-events-none">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
            onClick={() => setIsChatOpen(false)}
          ></div>
          
          {/* Chat Window */}
          <div className="relative w-full max-w-md h-[600px] max-h-[85vh] bg-[#0a0b0d] border border-white/10 rounded-t-2xl shadow-2xl pointer-events-auto animate-slide-up flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#111] rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.8)] flex items-center justify-center">
                    <div className="absolute inset-1 rounded-full overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="botGradientSmall" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f3b340" />
                            <stop offset="50%" stopColor="#f5c842" />
                            <stop offset="100%" stopColor="#f3b340" />
                          </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="48" fill="url(#botGradientSmall)" />
                        <circle cx="50" cy="50" r="38" fill="#000000" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <img 
                        src="/logo.png" 
                        alt="IO Trader" 
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 opacity-90 hidden"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Analysis Bot</h3>
                  <p className="text-xs text-gray-400">AI-powered market analysis</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-2"
                aria-label="Close chat"
              >
                <Icon name="ChevronDown" size={20} />
              </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {/* Welcome Message */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center flex-shrink-0">
                  <img 
                    src="/logo.png" 
                    alt="IO Trader" 
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1 bg-[#111] border border-white/10 rounded-lg p-3">
                  <p className="text-sm text-white">
                    Hello! I'm your AI Analysis Bot. I can help you with:
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-gray-300 list-disc list-inside">
                    <li>Market trend analysis</li>
                    <li>Price predictions</li>
                    <li>Trading insights</li>
                    <li>Risk assessment</li>
                  </ul>
                  <p className="text-xs text-gray-400 mt-2">Ask me anything about {selectedAsset}!</p>
                </div>
              </div>

              {/* Loading State */}
              {isLoadingAnalysis && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center flex-shrink-0">
                    <img 
                      src="/logo.png" 
                      alt="IO Trader" 
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 bg-[#111] border border-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-400">Fetching market analysis...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Analysis Message */}
              {analysisText && !isLoadingAnalysis && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center flex-shrink-0">
                    <img 
                      src="/logo.png" 
                      alt="IO Trader" 
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 bg-[#111] border border-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-yellow-400 uppercase">AI Market Analysis</span>
                      {analysisCacheRef.current && (
                        <span className="text-[10px] text-gray-500 italic">
                          (Cached - refreshes every 10 min)
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white whitespace-pre-wrap">{analysisText}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#080808] border-t border-white/5 py-12 px-4 lg:px-6 mt-12 relative z-10 animate-fade-in-up delay-200">
        <div className="w-full max-w-full md:flex md:justify-between grid grid-cols-2 gap-x-8 gap-y-12 md:gap-12">
          {/* Company Column */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Company
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    className="text-gray-400 hover:text-yellow-500 transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Trading Column */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Trading
            </h4>
            <ul className="space-y-2">
              {footerLinks.trading.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    className="text-gray-400 hover:text-yellow-500 transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Support
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    className="text-gray-400 hover:text-yellow-500 transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Column */}
          <div className="md:text-right">
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Community
            </h4>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name} className="md:flex md:justify-end">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-gray-400 hover:text-yellow-500 transition-colors text-xs font-medium group"
                  >
                    <span className="bg-white/5 p-1.5 rounded-md mr-2 group-hover:bg-yellow-500/20 group-hover:text-yellow-500 transition-all">
                      {link.icon}
                    </span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="w-full max-w-full mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <div className="mb-4 md:mb-0">
            <img
              src="/logo.png"
              alt="IO Trader"
              className="h-5 object-contain"
            />
          </div>
          <p>
            &copy; {new Date().getFullYear()} IO Trader. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PricePrediction;
