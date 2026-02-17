import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useParams } from "react-router-dom";
import { useWallet } from "./hooks/useWallet";
import Header from "./components/Header";
import TickerBar from "./components/TickerBar";
import SEO from "./components/SEO";
import { getMarketById, getMarketBySlug, getMarketTrades, placeTrade, createComment, getMarketComments, deleteComment } from "./services/marketService";

// --- UTILS ---
const formatCurrency = (value, maximumSignificantDigits = 4) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits,
  }).format(value);

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const generateTradeHistory = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `trade-${i}`,
    user: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random()
      .toString(16)
      .substr(2, 4)}`,
    outcome: Math.random() > 0.4 ? "YES" : "NO",
    amount: (Math.random() * 500 + 10).toFixed(2),
    price: (Math.random() * 0.9).toFixed(2),
    time: `${Math.floor(Math.random() * 59)}m ago`,
  }));
};

// --- DATA ---
const marketData = {
  id: "BI6OMIe3vj76k0kWWvQJ",
  question: "BNB ALL TIME HIGH BY DECEMBER 31?",
  icon: "Globe",
  category: "Crypto",
  volume: "$4,200,500",
  liquidity: "$1,250,000",
  endDate: "Dec 31, 2025",
  description:
    "This market resolves to YES if Binance Coin (BNB) reaches a new all-time high price (above $720.67) according to CoinGecko or Binance spot market data before December 31, 2025, 11:59 PM UTC.",
  rules: [
    "Resolution Source: CoinGecko / Binance Spot.",
    "Threshold: > $720.67.",
    "Timezone: UTC.",
    "If the threshold is touched but not held, it counts as YES.",
  ],
};

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
    { name: "Price Predictions", url: "https://iotrader.io/price-prediction" },
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
      iconName: "Send",
    },
    {
      name: "Telegram Chat",
      url: "https://t.me/iotradersiochat",
      iconName: "Send",
    },
    {
      name: "Youtube",
      url: "https://www.youtube.com/@iotraderio",
      iconName: "Youtube",
    },
    {
      name: "Twitter (X)",
      url: "https://x.com/iotradersio?s=21",
      iconName: "Twitter",
    },
  ],
};

// --- SHARED COMPONENTS ---

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
    ChevronDown: <path d="M6 9l6 6 6-6" />,
    ChevronLeft: <path d="M15 18l-6-6 6-6" />,
    ChevronRight: <path d="M9 18l6-6-6-6" />,
    ChevronsLeft: (
      <>
        <polyline points="11 17 6 12 11 7" />
        <polyline points="18 17 13 12 18 7" />
      </>
    ),
    ChevronsRight: (
      <>
        <polyline points="13 17 18 12 13 7" />
        <polyline points="6 17 11 12 6 7" />
      </>
    ),
    Search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
    Clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    Info: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </>
    ),
    List: (
      <>
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </>
    ),
    Check: <polyline points="20 6 9 17 4 12" />,
    Globe: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z" />
      </>
    ),
    Send: (
      <>
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
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

const NetworkIcon = ({ name }) => {
  const icons = {
    Polygon: (
      <svg viewBox="0 0 300 300" className="w-full h-full" fill="currentColor">
        <path d="M283.3,136.7l-60.6-36c-5.7-2.8-12.3-2.8-18,0l-40.7,24.6-27.5,16.1v-23.7l26.5-16.1v-24.6c0-6.6-2.8-12.3-8.5-15.2l-58.7-35.1c-5.7-2.8-12.3-2.8-18,0L18,61.9c-5.7,2.8-8.5,9.5-8.5,15.2v71.1c0,6.6,2.8,12.3,8.5,15.2l59.7,35.1c5.7,2.8,12.3,2.8,18,0l40.7-23.7v26.5h0v22.7c0,6.6,2.8,12.3,8.5,15.2l59.7,35.1c5.7,2.8,12.3,2.8,18,0l59.7-35.1c5.7-2.8,8.5-9.5,8.5-15.2v-71.1c0-6.6-2.8-12.3-8.5-15.2l.9-.9ZM95.7,166.1c-5.7,2.8-12.3,2.8-18,0l-32.2-19c-5.7-2.8-8.5-9.5-8.5-15.2v-37.9c0-6.6,2.8-12.3,8.5-15.2l32.2-19c5.7-2.8,12.3-2.8,18,0l32.2,19c5.7,2.8,8.5,9.5,8.5,15.2v24.6h0v23.7l-40.7,24.6v-.9ZM263.4,205.9c0,6.6-2.8,12.3-8.5,15.2l-32.2-19c-5.7,2.8-12.3,2.8-18,0l-32.2-19c-5.7-2.8-8.5-9.5-8.5-15.2v-24.6l-27.5,16.1v-23.7l27.5-16.1,40.7-23.7c5.7-2.8,12.3-2.8,18,0l32.2,19c5.7,2.8,8.5,9.5,8.5,15.2,0,0,0,37.9,0,37.9Z" />
      </svg>
    ),
    BSC: (
      <svg viewBox="0 0 300 300" className="w-full h-full" fill="currentColor">
        <path d="M176.5,241.3v30.7l-26.9,16.1-26.1-16.1v-30.7l26.1,16.1,26.9-16.1ZM32.2,133.9l26.1,16.1v53l45.3,26.9v30.7l-71.4-42.2v-85.2.8ZM267,133.9v85.2l-72.1,42.2v-30.7l45.3-26.9v-53l26.9-16.1v-.8ZM194.9,92.4l26.9,16.1h0v30.7l-45.3,26.9v53.7l-26.1,16.1-26.1-16.1v-53.7l-46.8-26.9v-30.7l26.9-16.1,45.3,26.9,45.3-26.9ZM77.5,160.7l26.1,16.1v30.7l-26.1-16.1v-30.7ZM221.8,160.7v30.7l-26.1,16.1v-30.7l26.1-16.1ZM58.3,64.8l26.9,16.1-26.9,16.1v30.7l-26.1-16.1v-30.7s26.1-16.1,26.1-16.1ZM240.9,64.8l26.9,16.1v30.7l-26.9,16.1v-30.7l-26.1-16.1s26.1-16.1,26.1-16.1ZM149.6,64.8l26.9,16.1-26.9,16.1-26.1-16.1,26.1-16.1ZM149.6,11.9l72.1,42.2-26.1,16.1-45.3-26.9-46,26.9-26.1-16.1S149.6,11.9,149.6,11.9Z" />
      </svg>
    ),
    Avalanche: (
      <svg viewBox="0 0 300 300" className="w-full h-full" fill="currentColor">
        <path d="M150,5.8C70.4,5.8,5.8,70.4,5.8,150s64.6,144.2,144.2,144.2,144.2-64.6,144.2-144.2S229.6,5.8,150,5.8ZM137.7,190.8v.2c-3.3,5.6-4.9,8.4-7.2,10.6-2.4,2.3-5.4,4-8.6,5-2.9.8-6.2.8-12.8.8h-21.4l-5.3,8.2h-.2c0-.1,5.2-8.2,5.2-8.2h-6.3c-5.9,0-8.8,0-10.6-1.1-1.9-1.2-3.1-3.3-3.2-5.6-.1-2.1,1.3-4.6,4.3-9.7l69.1-121.8c2.9-5.2,4.4-7.8,6.3-8.7,2-1,4.4-1,6.4,0,1.9,1,3.4,3.5,6.3,8.7l8,13.9,6.6-10.3h.2c0,.1-6.7,10.5-6.7,10.5l6.1,10.7h0c3.2,5.7,4.8,8.5,5.5,11.4.8,3.2.8,6.6,0,9.8-.7,3-2.3,5.8-5.5,11.4l-36.3,64.2ZM229.4,190.8c0,.2.2.3.3.5,2.8,4.8,4.2,7.3,4.1,9.3-.1,2.3-1.3,4.4-3.2,5.6-1.8,1.2-4.7,1.2-10.7,1.2h-27.2l-32.8,50.8h-.2c0-.1,32.7-50.8,32.7-50.8h-12.6c-5.9,0-8.9,0-10.6-1.1-1.9-1.2-3.1-3.3-3.2-5.6-.1-2.1,1.4-4.6,4.3-9.7h0c0-.1,20-34.5,20-34.5,2.9-5.1,4.4-7.6,6.3-8.5,2-1,4.4-1,6.4,0,1.8.9,3.3,3.3,6.1,8.1l.2.4,7.6,13,34.9-54h.2c0,.1-35,54.3-35,54.3l12.4,21.2Z" />
        <polygon points="167.7 83 87.5 207.4 87.8 207.4 167.9 83.3 167.7 83" />
        <polygon points="174.6 72.9 174.3 72.8 167.7 83 167.9 83.3 174.6 72.9" />
        <polygon points="82.2 215.5 82.5 215.6 87.8 207.4 87.5 207.4 82.2 215.5" />
        <polygon points="192.4 207.4 192.7 207.4 217 169.7 216.9 169.4 192.4 207.4" />
        <polygon points="159.7 258.1 159.9 258.2 192.7 207.4 192.4 207.4 159.7 258.1" />
        <polygon points="251.8 115.4 216.9 169.4 217 169.7 252 115.5 251.8 115.4" />
      </svg>
    ),
  };
  return icons[name] || null;
};

// --- SUB-COMPONENTS ---

// TickerBar is now imported from components/TickerBar which fetches live prices from Binance

const MarketHeader = ({ marketData }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div className="flex items-start gap-4">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 leading-tight mb-1">
          {marketData.question}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-400">
          <span className="bg-white/5 border border-white/5 px-2 py-0.5 rounded text-gray-300 flex items-center gap-1">
            <Icon name="Globe" size={12} className="text-gray-400" />
            {marketData.category}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Clock" size={12} /> Ends: {marketData.endDate}
          </span>
          <span className="text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{" "}
            Live
          </span>
        </div>
      </div>
    </div>
    <div className="hidden md:flex gap-4 text-right">
      <div>
        <div className="text-[10px] text-gray-500 font-bold uppercase">
          Volume
        </div>
        <div className="text-sm font-mono font-bold text-white">
          {marketData.volume}
        </div>
      </div>
      <div>
        <div className="text-[10px] text-gray-500 font-bold uppercase">
          Liquidity
        </div>
        <div className="text-sm font-mono font-bold text-white">
          {marketData.liquidity}
        </div>
      </div>
    </div>
  </div>
);

const PriceChart = ({ chartData }) => {
  const chartRef = useRef(null);
  const [hoverData, setHoverData] = useState(null);
  const [animatedData, setAnimatedData] = useState(chartData);

  // Real-time updates - animate data changes smoothly
  useEffect(() => {
    if (chartData.length > 0) {
      setAnimatedData(chartData);
    }
  }, [chartData]);

  const handleChartMove = useCallback(
    (e) => {
      if (!chartRef.current) return;
      const rect = chartRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const index = Math.min(
        Math.max(0, Math.floor((x / width) * animatedData.length)),
        animatedData.length - 1
      );
      setHoverData(animatedData[index]);
    },
    [animatedData]
  );

  const handleChartLeave = useCallback(() => {
    setHoverData(null);
  }, []);

  // Create smooth bezier curve path - scale to 70% width so end points are visible
  // Also clamp y values to ensure points stay within graph bounds (under 100%)
  const getSmoothPath = useCallback((key) => {
    if (animatedData.length === 0) return "";
    
    // Scale x-axis to 70% so end points are visible in the middle
    const maxX = 70;
    const points = animatedData.map((d, i) => {
      const x = (i / Math.max(1, animatedData.length - 1)) * maxX;
      // Clamp data value to never exceed 1.0 (100%) before calculating y
      const clampedValue = Math.max(0, Math.min(1, d[key])); // Ensure 0-1 range
      // Map 0-1 to 5-95 (keeping 5% padding on top and bottom to prevent clipping)
      const rawY = 95 - clampedValue * 90; // 95 at 0%, 5 at 100%
      const y = Math.max(5, Math.min(95, rawY)); // Keep 5% padding from edges
      return { x, y };
    });

    if (points.length < 2) return "";

    // Create smooth cubic bezier curve
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : p2;
      
      // Calculate control points for smooth curve
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    
    return path;
  }, [animatedData]);

  // Get point at 70% of chart width for glow effect
  const getLastPoint = useCallback((key) => {
    if (animatedData.length === 0) return null;
    const last = animatedData[animatedData.length - 1];
    // Position at 70% of chart width
    const x = 70;
    // Clamp data value to never exceed 1.0 (100%) before calculating y
    const clampedValue = Math.max(0, Math.min(1, last[key])); // Ensure 0-1 range
    // Map 0-1 to 5-95 (keeping 5% padding on top and bottom to prevent clipping)
    const rawY = 95 - clampedValue * 90; // 95 at 0%, 5 at 100%
    const y = Math.max(5, Math.min(95, rawY)); // Keep 5% padding from edges
    return { x, y, value: clampedValue };
  }, [animatedData]);

  const lastYesPoint = getLastPoint("yes");
  const lastNoPoint = getLastPoint("no");

  return (
    <div className="bg-[#000000] border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl flex-1 flex flex-col">
      <div className="p-4 border-b border-white/5 flex justify-between items-center">
        <span className="font-bold text-sm text-white">
          Price Movement Over Time
        </span>
        <div className="flex gap-4 text-xs font-bold font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full border border-emerald-400 bg-emerald-400/20"></span>{" "}
            YES Price
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full border border-rose-400 bg-rose-400/20"></span>{" "}
            NO Price
          </span>
        </div>
      </div>

      <div
        className="h-[320px] w-full relative cursor-crosshair mb-6"
        ref={chartRef}
        onMouseMove={handleChartMove}
        onMouseLeave={handleChartLeave}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Subtle glow filter for YES line */}
            <filter id="glow-yes" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            {/* Subtle glow filter for NO line */}
            <filter id="glow-no" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            {/* Glow for small dot markers */}
            <filter id="glow-marker-yes" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="glow-marker-no" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <rect width="100" height="100" fill="#000000" />
          
          {/* Grid Lines - Horizontal only, dotted */}
          {[0, 25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#475569"
              strokeWidth="0.3"
              strokeDasharray="2,2"
              opacity="0.5"
            />
          ))}

          {/* YES Price Line - Smooth curve with glow */}
          <path
            d={getSmoothPath("yes")}
            fill="none"
            stroke="#34d399"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-yes)"
            style={{ transition: 'd 0.3s ease-out' }}
          />
          
          {/* NO Price Line - Smooth curve with glow */}
          <path
            d={getSmoothPath("no")}
            fill="none"
            stroke="#fb7185"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-no)"
            style={{ transition: 'd 0.3s ease-out' }}
          />

          {/* Glowing end markers - Small dots with glow */}
          {lastYesPoint && (
            <g>
              {/* Outer glow circle - Small */}
              <circle
                cx={lastYesPoint.x}
                cy={lastYesPoint.y}
                r="0.8"
                fill="#34d399"
                opacity="0.5"
                filter="url(#glow-marker-yes)"
              />
              {/* Main marker - Small dot */}
              <circle
                cx={lastYesPoint.x}
                cy={lastYesPoint.y}
                r="0.5"
                fill="#34d399"
                stroke="#000000"
                strokeWidth="0.2"
                filter="url(#glow-marker-yes)"
                style={{ 
                  animation: 'pulse 2s ease-in-out infinite',
                  transformOrigin: `${lastYesPoint.x}px ${lastYesPoint.y}px`
                }}
              />
            </g>
          )}
          
          {lastNoPoint && (
            <g>
              {/* Outer glow circle - Small */}
              <circle
                cx={lastNoPoint.x}
                cy={lastNoPoint.y}
                r="0.8"
                fill="#fb7185"
                opacity="0.5"
                filter="url(#glow-marker-no)"
              />
              {/* Main marker - Small dot */}
              <circle
                cx={lastNoPoint.x}
                cy={lastNoPoint.y}
                r="0.5"
                fill="#fb7185"
                stroke="#000000"
                strokeWidth="0.2"
                filter="url(#glow-marker-no)"
                style={{ 
                  animation: 'pulse 2s ease-in-out infinite',
                  transformOrigin: `${lastNoPoint.x}px ${lastNoPoint.y}px`
                }}
              />
            </g>
          )}

          {/* Tooltip Elements */}
          {hoverData && (
            <>
              <line
                x1={(hoverData.id / Math.max(1, animatedData.length - 1)) * 70}
                y1="0"
                x2={(hoverData.id / Math.max(1, animatedData.length - 1)) * 70}
                y2="100"
                stroke="#f3b340"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity="0.6"
              />
              <circle
                cx={(hoverData.id / Math.max(1, animatedData.length - 1)) * 70}
                cy={Math.max(5, Math.min(95, 95 - Math.max(0, Math.min(1, hoverData.yes)) * 90))}
                r="0.6"
                fill="#000000"
                stroke="#34d399"
                strokeWidth="1"
              />
              <circle
                cx={(hoverData.id / Math.max(1, animatedData.length - 1)) * 70}
                cy={Math.max(5, Math.min(95, 95 - Math.max(0, Math.min(1, hoverData.no)) * 90))}
                r="0.6"
                fill="#000000"
                stroke="#fb7185"
                strokeWidth="1"
              />
            </>
          )}
        </svg>
        
        {/* CSS Animation for very subtle pulse effect */}
        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.95;
              transform: scale(1.02);
            }
          }
        `}</style>

        {/* Tooltip Overlay */}
        {hoverData && (
          <div
            className="absolute bg-[#0f172a] border border-yellow-500/50 rounded-lg p-3 shadow-2xl z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-4 min-w-[140px] backdrop-blur-sm"
            style={{
              left: `${(hoverData.id / Math.max(1, animatedData.length - 1)) * 70}%`,
              top: "45%",
            }}
          >
            <div className="text-white text-xs font-bold mb-2 text-center border-b border-white/10 pb-2">
              {hoverData.fullLabel}
            </div>
            <div className="text-emerald-400 font-mono text-sm font-bold flex justify-between mb-1">
              <span>YES:</span>
              <span>${hoverData.yes.toFixed(2)}</span>
            </div>
            <div className="text-rose-400 font-mono text-sm font-bold flex justify-between">
              <span>NO:</span>
              <span>${hoverData.no.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Y-axis Labels - Right side */}
        <div className="absolute right-2 top-2 text-[10px] text-gray-400 font-mono font-bold">
          100%
        </div>
        <div className="absolute right-2 top-[25%] text-[10px] text-gray-500 font-mono">
          75%
        </div>
        <div className="absolute right-2 top-1/2 text-[10px] text-gray-400 font-mono font-bold">
          50%
        </div>
        <div className="absolute right-2 top-[75%] text-[10px] text-gray-500 font-mono">
          25%
        </div>
        <div className="absolute right-2 bottom-2 text-[10px] text-gray-400 font-mono font-bold">
          0%
        </div>
        
        {/* X-axis Labels */}
        {animatedData.length > 0 && (
          <div className="absolute bottom-[-20px] left-0 w-full flex justify-between px-4 text-[10px] text-gray-400 font-bold font-mono pointer-events-none">
            {animatedData
              .filter((_, i) => i % Math.max(1, Math.floor(animatedData.length / 5)) === 0)
              .map((d) => (
                <span key={d.id}>{d.date}</span>
              ))}
            <span className="text-yellow-400">Now</span>
          </div>
        )}
      </div>
    </div>
  );
};

const TradingPanel = ({
  selectedOutcome,
  setSelectedOutcome,
  investAmount,
  setInvestAmount,
  marketData,
  isConnected,
  isPending,
  isConfirming,
  transactionError,
  onPlaceBet,
  userBet,
}) => {
  // Input validator to block invalid characters for number inputs
  const handleKeyDown = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="bg-[#111] border border-yellow-500/20 rounded-2xl p-6 relative shadow-2xl h-full flex flex-col gap-6">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>

      <h2 className="text-lg font-bold text-white flex items-center shrink-0">
        <Icon
          name="Check"
          size={20}
          className="text-yellow-500 mr-2"
          strokeWidth={4}
        />
        Make a Prediction
      </h2>

      {/* Toggle Buttons */}
      <div className="flex bg-[#0a0a0a] p-1 rounded-xl border border-white/10 shrink-0">
        <button
          onClick={() => setSelectedOutcome("YES")}
          className={`flex-1 py-3 rounded-lg text-sm font-black uppercase transition-all flex items-center justify-center ${
            selectedOutcome === "YES"
              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
              : "text-gray-500 hover:text-emerald-500 hover:bg-white/5"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              selectedOutcome === "YES"
                ? "bg-black animate-pulse"
                : "bg-gray-600"
            }`}
          ></div>
          <div className="flex flex-col items-center">
            <span>Buy Yes</span>
            <span
              className={`text-xs font-mono mt-0.5 ${
                selectedOutcome === "YES" ? "text-black/70" : ""
              }`}
            >
              ${(marketData?.yesPrice || 0.5).toFixed(2)}
            </span>
          </div>
        </button>
        <button
          onClick={() => setSelectedOutcome("NO")}
          className={`flex-1 py-3 rounded-lg text-sm font-black uppercase transition-all flex items-center justify-center ${
            selectedOutcome === "NO"
              ? "bg-rose-500 text-black shadow-lg shadow-rose-500/20"
              : "text-gray-500 hover:text-rose-500 hover:bg-white/5"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              selectedOutcome === "NO"
                ? "bg-black animate-pulse"
                : "bg-gray-600"
            }`}
          ></div>
          <div className="flex flex-col items-center">
            <span>Buy No</span>
            <span
              className={`text-xs font-mono mt-0.5 ${
                selectedOutcome === "NO" ? "text-black/70" : ""
              }`}
            >
              ${(marketData?.noPrice || 0.5).toFixed(2)}
            </span>
          </div>
        </button>
      </div>

      {/* Input Amount */}
      <div className="shrink-0">
        <div className="flex justify-between mb-2 text-xs font-bold text-white">
          <span>Amount</span>
          <span>Balance: 0.00 BNB</span>
        </div>
        <div
          className={`bg-[#0a0a0a] border rounded-xl p-3 flex items-center transition-colors focus-within:border-opacity-100 ${
            selectedOutcome === "YES"
              ? "border-emerald-500/30 focus-within:border-emerald-500"
              : "border-rose-500/30 focus-within:border-rose-500"
          }`}
        >
          <input
            type="number"
            value={investAmount}
            onChange={(e) => setInvestAmount(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="0.00"
            className="bg-transparent w-full text-xl font-mono text-white outline-none placeholder-gray-700 no-spinner"
          />
          <span className="text-sm font-bold text-gray-400 ml-2">
            {marketData?.stakeInUSDT ? 'USDT' : 'BNB'}
          </span>
        </div>
      </div>

      {/* Return Calculation */}
      <div className="bg-white/5 rounded-lg p-3 shrink-0">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Est. Price</span>
          <span className="text-white font-mono">
            ${(selectedOutcome === "YES" ? (marketData?.yesPrice || 0.5) : (marketData?.noPrice || 0.5)).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Potential Payout</span>
          <span
            className={`font-mono font-bold ${
              selectedOutcome === "YES" ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {investAmount
              ? (
                  parseFloat(investAmount) /
                  (selectedOutcome === "YES" ? (marketData?.yesPrice || 0.5) : (marketData?.noPrice || 0.5))
                ).toFixed(2)
              : "0.00"}{" "}
            {marketData?.stakeInUSDT ? 'USDT' : 'BNB'}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>ROI</span>
          <span className="text-yellow-500 font-bold">
            {selectedOutcome === "YES" 
              ? `+${((1 / (marketData?.yesPrice || 0.5) - 1) * 100).toFixed(1)}%`
              : `+${((1 / (marketData?.noPrice || 0.5) - 1) * 100).toFixed(1)}%`}
          </span>
        </div>
      </div>

      {/* User Bet Info */}
      {userBet && (parseFloat(userBet.yesAmount) > 0 || parseFloat(userBet.noAmount) > 0) && (
        <div className="bg-white/5 rounded-lg p-3 shrink-0 border border-yellow-500/20">
          <div className="text-xs text-gray-400 mb-1">Your Position</div>
          {parseFloat(userBet.yesAmount) > 0 && (
            <div className="text-xs text-emerald-400 font-bold">
              YES: {parseFloat(userBet.yesAmount).toFixed(4)} {marketData?.stakeInUSDT ? 'USDT' : 'BNB'}
            </div>
          )}
          {parseFloat(userBet.noAmount) > 0 && (
            <div className="text-xs text-rose-400 font-bold">
              NO: {parseFloat(userBet.noAmount).toFixed(4)} {marketData?.stakeInUSDT ? 'USDT' : 'BNB'}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {transactionError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400">
          {transactionError}
        </div>
      )}

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={onPlaceBet}
          disabled={!isConnected || isPending || isConfirming || !marketData?.isSmartContractMarket || !investAmount || parseFloat(investAmount) <= 0}
          className={`w-full py-4 rounded-xl font-black uppercase tracking-wide text-sm shadow-xl transition-transform active:scale-[0.98] flex items-center justify-center ${
            !isConnected || isPending || isConfirming || !marketData?.isSmartContractMarket || !investAmount || parseFloat(investAmount) <= 0
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-600 to-yellow-400 text-black shadow-yellow-500/20 hover:shadow-yellow-500/40"
          }`}
        >
          {!isConnected ? (
            "Connect Wallet"
          ) : !marketData?.isSmartContractMarket ? (
            "Firebase Market Only"
          ) : isPending ? (
            "Confirming..."
          ) : isConfirming ? (
            "Processing..."
          ) : (
            <>
              <span className="relative flex h-2 w-2 mr-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-50 bg-black`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 bg-black`}
                ></span>
              </span>
              Place Trade
            </>
          )}
        </button>
        <p className="text-[10px] text-gray-600 text-center mt-3">
          {marketData?.isSmartContractMarket 
            ? "By trading, you agree to the specific rules of this market. Transaction will be executed on-chain."
            : "By trading, you agree to the specific rules of this market."}
        </p>
      </div>
    </div>
  );
};

const OrderHistory = ({ allTrades }) => {
  const itemsPerPage = 7;
  const [currentPage, setCurrentPage] = useState(1);

  // Derived state for pagination
  const totalPages = Math.ceil(allTrades.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrades = allTrades.slice(indexOfFirstItem, indexOfLastItem);

  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#151515]">
        <div className="flex items-center gap-2">
          <Icon name="List" size={16} className="text-yellow-500" />
          <span className="font-bold text-sm text-gray-300 uppercase tracking-wide">
            Recent Activity
          </span>
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
            aria-label="First Page"
          >
            <Icon name="ChevronsLeft" size={14} />
          </button>
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
            aria-label="Previous Page"
          >
            <Icon name="ChevronLeft" size={14} />
          </button>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
            aria-label="Next Page"
          >
            <Icon name="ChevronRight" size={14} />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
            aria-label="Last Page"
          >
            <Icon name="ChevronsRight" size={14} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] uppercase text-gray-500 border-b border-white/5">
              <th className="p-3 pl-4 font-bold">User</th>
              <th className="p-3 font-bold">Outcome</th>
              <th className="p-3 font-bold text-right">Amount</th>
              <th className="p-3 font-bold text-right">Price</th>
              <th className="p-3 pr-4 font-bold text-right">Time</th>
            </tr>
          </thead>
          <tbody className="text-xs font-medium divide-y divide-white/5">
            {currentTrades.map((trade) => (
              <tr key={trade.id} className="hover:bg-white/5 transition-colors">
                <td className="p-3 pl-4 font-mono text-white">
                  {trade.user}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      trade.outcome === "YES"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    {trade.outcome}
                  </span>
                </td>
                <td className="p-3 text-right text-white font-mono">
                  ${trade.amount}
                </td>
                <td className="p-3 text-right text-gray-400 font-mono">
                  ${trade.price}
                </td>
                <td className="p-3 pr-4 text-right text-gray-500">
                  {trade.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Format timestamp to relative time
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Just now";
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Format wallet address
const formatAddress = (address) => {
  if (!address) return "Anonymous";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const CommentsSection = ({ comments, newComment, setNewComment, isSubmittingComment, isConnected, address, onSubmitComment, onDeleteComment }) => {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 mt-6 animate-fade-in-up">
      <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-lg">
        <Icon name="List" size={20} className="text-yellow-500" />
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <div className="mb-6">
        {isConnected ? (
          <div className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this market..."
              className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none resize-none"
              rows={3}
              disabled={isSubmittingComment}
            />
            <div className="flex justify-end">
              <button
                onClick={onSubmitComment}
                disabled={!newComment.trim() || isSubmittingComment}
                className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingComment ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#111] border border-white/10 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">Connect your wallet to join the discussion</p>
          </div>
        )}
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="List" size={32} className="text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isOwner = comment.walletAddress?.toLowerCase() === address?.toLowerCase();
            return (
              <div key={comment.id} className="bg-[#111] border border-white/5 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <span className="text-yellow-500 text-xs font-bold">
                        {formatAddress(comment.walletAddress)[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">
                        {formatAddress(comment.walletAddress)}
                      </p>
                      <p className="text-gray-500 text-xs">{formatTimeAgo(comment.timestamp)}</p>
                    </div>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="text-gray-500 hover:text-red-500 text-xs transition-colors px-2 py-1 rounded hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">
                  {comment.deleted ? (
                    <span className="italic text-gray-500">[deleted]</span>
                  ) : (
                    comment.text
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Footer = () => (
  <footer className="bg-[#080808] border-t border-white/5 py-12 px-4 lg:px-6 mt-12 relative z-10">
    <div className="w-full max-w-full md:flex md:justify-between grid grid-cols-2 gap-x-8 gap-y-12 md:gap-12">
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
                  <Icon name={link.iconName} size={16} />
                </span>
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div className="w-full max-w-full mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
      <div className="mb-4 md:mb-0">
        <img
          src="/logo.png"
          alt="IO Trader"
          className="h-6"
        />
      </div>
      <p>&copy; {new Date().getFullYear()} IO Trader. All rights reserved.</p>
    </div>
  </footer>
);

// --- MAIN APP COMPONENT ---

const MarketDetail = () => {
  const { slug } = useParams();
  const { address, isConnected } = useWallet();
  const [activeNetwork, setActiveNetwork] = useState("BSC");
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState("YES");
  const [investAmount, setInvestAmount] = useState("");
  const [marketData, setMarketData] = useState({
    id: "",
    question: "Loading market...",
    icon: "Globe",
    category: "Crypto",
    volume: "$0",
    liquidity: "$0",
    endDate: "",
    description: "",
    rules: [],
    yesPrice: 0.5,
    noPrice: 0.5,
    isSmartContractMarket: false,
    marketId: null,
    stakeInUSDT: false,
  });
  const [allTrades, setAllTrades] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [userBet, setUserBet] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch market data from Firebase or Smart Contract
  useEffect(() => {
    const fetchMarketData = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        console.log('Fetching market with slug:', slug);
        
        // Check if it's a numeric slug (smart contract market ID) or a text slug (Firebase market)
        const isNumericSlug = /^\d+$/.test(slug);
        let market = null;
        let trades = [];
        let actualMarketId = slug;
        
        if (isNumericSlug) {
          // Frontend-only: no contract. Show not found for numeric IDs.
          setMarketData({
            id: slug,
            question: "Market Not Found",
            icon: "Globe",
            category: "Crypto",
            volume: "$0",
            liquidity: "$0",
            endDate: "",
            description: "Smart contract integration is disabled. Use market slug URLs only.",
            rules: [],
            yesPrice: 0.5,
            noPrice: 0.5,
            isSmartContractMarket: false,
          });
          setAllTrades([]);
          setChartData([]);
        } else {
          // Fetch from Firebase using slug
          try {
            market = await getMarketBySlug(slug);
            console.log('Firebase market fetched:', market ? 'Found' : 'Not found');
            
            if (market) {
              actualMarketId = market.id;
            }
          } catch (marketError) {
            console.error("Error fetching market:", marketError);
          }
          
          if (market && actualMarketId) {
            try {
              trades = await getMarketTrades(actualMarketId);
              if (!Array.isArray(trades)) {
                trades = [];
              }
              console.log('Trades fetched:', trades.length);
            } catch (tradesError) {
              console.warn("Error fetching trades:", tradesError);
              trades = []; // Default to empty array
            }
          }

          if (!market) {
            setMarketData({
              id: actualMarketId || slug,
              question: "Market Not Found",
              icon: "Globe",
              category: "Crypto",
              volume: "$0",
              liquidity: "$0",
              endDate: "",
              description: `Market with slug "${slug}" was not found. Please check the URL and try again.`,
              rules: [],
              yesPrice: 0.5,
              noPrice: 0.5,
              isSmartContractMarket: false,
            });
            setAllTrades([]);
            setChartData([]);
            setLoading(false);
            return;
          }

          if (market) {
            // Format closing time
            const closingTime = market.closingTime?.toDate 
              ? market.closingTime.toDate() 
              : market.closingTime instanceof Date 
              ? market.closingTime 
              : new Date(market.closingTime);

            const endDate = closingTime.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            });

            // Format volume and liquidity from market data
            const volumeValue = market.totalVolume || 0;
            const volume = volumeValue >= 1000000 
              ? `$${(volumeValue / 1000000).toFixed(2)}M`
              : volumeValue >= 1000
              ? `$${(volumeValue / 1000).toFixed(2)}K`
              : `$${volumeValue.toFixed(2)}`;

            const liquidityValue = (market.yesPool || 0) + (market.noPool || 0);
            const liquidity = liquidityValue >= 1000000
              ? `$${(liquidityValue / 1000000).toFixed(2)}M`
              : liquidityValue >= 1000
              ? `$${(liquidityValue / 1000).toFixed(2)}K`
              : `$${liquidityValue.toFixed(2)}`;

            const yesPoolValue = market.yesPool || 0;
            const noPoolValue = market.noPool || 0;
            const totalPool = yesPoolValue + noPoolValue;
            const yesPrice = totalPool > 0 ? yesPoolValue / totalPool : (market.yesPrice || 0.5);
            const noPrice = totalPool > 0 ? noPoolValue / totalPool : (market.noPrice || 0.5);

            setMarketData({
              id: market.id,
              question: market.title,
              icon: "Globe",
              category: market.category || "Crypto",
              volume: volume,
              liquidity: liquidity,
              endDate: endDate,
              description: market.description || "",
              rules: market.rules || [],
              yesPrice: yesPrice,
              noPrice: noPrice,
              isSmartContractMarket: false,
              marketId: null,
              stakeInUSDT: false,
            });
          }

          // Transform trades for display - ensure trades is an array (only for Firebase markets)
          const tradesArray = Array.isArray(trades) ? trades : [];
          const transformedTrades = tradesArray.map((trade) => {
            if (!trade) return null;
          
          const tradeTime = trade.timestamp?.toDate 
            ? trade.timestamp.toDate() 
            : trade.timestamp instanceof Date 
            ? trade.timestamp 
            : new Date();
          
          const minutesAgo = Math.floor((Date.now() - tradeTime.getTime()) / (1000 * 60));
          const timeStr = minutesAgo < 60 
            ? `${minutesAgo}m ago`
            : `${Math.floor(minutesAgo / 60)}h ago`;

          return {
            id: trade.id || `trade-${Math.random()}`,
            user: trade.walletAddress 
              ? `${trade.walletAddress.slice(0, 6)}...${trade.walletAddress.slice(-4)}`
              : "Unknown",
            outcome: trade.side || "YES",
            amount: (trade.amount || 0).toFixed(2),
            price: (trade.price || 0).toFixed(2),
            time: timeStr,
          };
        }).filter(trade => trade !== null);

        setAllTrades(transformedTrades);

        // Build chart data from trades
        if (tradesArray.length > 0) {
          // Sort trades by timestamp
          const sortedTrades = [...tradesArray].sort((a, b) => {
            const timeA = a.timestamp?.toDate?.()?.getTime() || a.timestamp?.getTime() || 0;
            const timeB = b.timestamp?.toDate?.()?.getTime() || b.timestamp?.getTime() || 0;
            return timeA - timeB;
          });

          // Calculate cumulative pools and prices over time
          let yesPool = 0;
          let noPool = 0;
          const chartPoints = [];

          // Add initial point (market creation)
          if (market) {
            const marketTime = market.createdAt?.toDate 
              ? market.createdAt.toDate() 
              : market.createdAt instanceof Date 
              ? market.createdAt 
              : new Date();
            
            // Start lines from different points for visual distinction
            // YES starts slightly higher, NO starts slightly lower
            const initialYes = market.yesPrice || 0.55;
            const initialNo = market.noPrice || 0.45;
            
            chartPoints.push({
              id: 0,
              date: marketTime.toLocaleDateString([], { month: "short", day: "numeric" }),
              time: marketTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              fullLabel: `${marketTime.toLocaleDateString([], { month: "short", day: "numeric" })} ${marketTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              yes: Math.max(0.01, Math.min(0.99, initialYes)),
              no: Math.max(0.01, Math.min(0.99, initialNo)),
              timestamp: marketTime.getTime(),
            });
          }

          // Process each trade
          sortedTrades.forEach((trade, index) => {
            if (trade.side === "YES") {
              yesPool += trade.amount;
            } else {
              noPool += trade.amount;
            }

            const totalPool = yesPool + noPool;
            const yesPrice = totalPool > 0 ? yesPool / totalPool : 0.5;
            const noPrice = totalPool > 0 ? noPool / totalPool : 0.5;

            const tradeTime = trade.timestamp?.toDate 
              ? trade.timestamp.toDate() 
              : trade.timestamp instanceof Date 
              ? trade.timestamp 
              : new Date();

            chartPoints.push({
              id: index + 1,
              date: tradeTime.toLocaleDateString([], { month: "short", day: "numeric" }),
              time: tradeTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              fullLabel: `${tradeTime.toLocaleDateString([], { month: "short", day: "numeric" })} ${tradeTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              yes: Math.max(0.01, Math.min(0.99, yesPrice)),
              no: Math.max(0.01, Math.min(0.99, noPrice)),
              timestamp: tradeTime.getTime(),
            });
          });

          // If we have less than 60 points, interpolate or use current market prices
          if (chartPoints.length < 60 && market) {
            const currentYes = market.yesPrice || 0.5;
            const currentNo = market.noPrice || 0.5;
            const lastPoint = chartPoints[chartPoints.length - 1] || { timestamp: Date.now() };
            
            // Add current point
            const now = new Date();
            chartPoints.push({
              id: chartPoints.length,
              date: now.toLocaleDateString([], { month: "short", day: "numeric" }),
              time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              fullLabel: `${now.toLocaleDateString([], { month: "short", day: "numeric" })} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              yes: Math.max(0.01, Math.min(0.99, currentYes)),
              no: Math.max(0.01, Math.min(0.99, currentNo)),
              timestamp: now.getTime(),
            });
          }

            setChartData(chartPoints);
          } else {
            // No trades yet, use market prices - ensure different starting points
            if (market) {
              const now = new Date();
              // Ensure lines start from different points for visual distinction
              const initialYes = market.yesPrice || 0.55;
              const initialNo = market.noPrice || 0.45;
              
              setChartData([{
                id: 0,
                date: now.toLocaleDateString([], { month: "short", day: "numeric" }),
                time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                fullLabel: `${now.toLocaleDateString([], { month: "short", day: "numeric" })} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
                yes: Math.max(0.01, Math.min(0.99, initialYes)),
                no: Math.max(0.01, Math.min(0.99, initialNo)),
                timestamp: now.getTime(),
              }]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
        setMarketData({
          id: slug || "",
          question: "Error Loading Market",
          icon: "Globe",
          category: "Crypto",
          volume: "$0",
          liquidity: "$0",
          endDate: "",
          description: `Failed to load market data: ${error.message || "Unknown error occurred"}. Please try refreshing the page.`,
          rules: [],
          yesPrice: 0.5,
          noPrice: 0.5,
        });
        setAllTrades([]);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();

    // Removed automatic polling - data will only refresh when component mounts or slug changes
  }, [slug, isConnected, address]);

  // Fetch comments when market is loaded
  useEffect(() => {
    const fetchComments = async () => {
      if (!marketData.id || marketData.id === "") return;
      try {
        const marketComments = await getMarketComments(marketData.id);
        setComments(marketComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      }
    };

    fetchComments();
  }, [marketData.id]);

  // Handle submitting a comment
  const handleSubmitComment = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet to comment");
      return;
    }
    if (!newComment.trim()) return;
    if (!marketData.id) {
      alert("Market not loaded yet");
      return;
    }

    try {
      setIsSubmittingComment(true);
      await createComment({
        marketId: marketData.id,
        walletAddress: address,
        text: newComment,
      });
      setNewComment("");
      // Refresh comments
      const marketComments = await getMarketComments(marketData.id);
      setComments(marketComments);
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert(`Failed to post comment: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    if (!isConnected || !address) return;
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteComment(commentId, address);
      // Refresh comments
      const marketComments = await getMarketComments(marketData.id);
      setComments(marketComments);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert(`Failed to delete comment: ${error.message || "Unknown error"}`);
    }
  };

  // Handle placing a bet
  const handlePlaceBet = async () => {
    if (!isConnected || !address) {
      setTransactionError("Please connect your wallet first");
      return;
    }

    if (!investAmount || parseFloat(investAmount) <= 0) {
      setTransactionError("Please enter a valid amount");
      return;
    }

    if (!marketData.id) {
      setTransactionError("Market not found");
      return;
    }

    try {
      setIsPending(true);
      setTransactionError(null);

      const amount = investAmount.toString();
      const isYes = selectedOutcome === "YES";
      const betAmount = parseFloat(amount);

      await placeTrade({
        marketId: marketData.id,
        walletAddress: address || "0x0000000000000000000000000000000000000000",
        side: isYes ? "YES" : "NO",
        amount: betAmount,
        price: marketData.yesPrice || 0.5,
      });

      setIsPending(false);
      setInvestAmount("");
      try {
        const [tradesData, commentsData] = await Promise.all([
          getMarketTrades(marketData.id),
          getMarketComments(marketData.id),
        ]);
        setAllTrades(Array.isArray(tradesData) ? tradesData : []);
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } catch (e) {}
      alert("Trade placed (demo mode).");
    } catch (error) {
      console.error("Error placing bet:", error);
      setTransactionError(error.message || "Transaction failed");
      setIsPending(false);
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-yellow-500/30 relative overflow-hidden">
      <SEO
        title={marketData?.question ? `${marketData.question} - Market Details` : "Market Details - Prediction Market"}
        description={marketData?.description || `View detailed information about this prediction market. See current prices, volume, liquidity, trading history, and place your bets on ${marketData?.question || "this market"}.`}
        keywords={`prediction market, ${marketData?.category?.toLowerCase() || "crypto"}, market details, trading, betting, ${marketData?.question || ""}`}
        url={`/market/${slug}`}
      />
      {/* Global Styles */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes dash { to { stroke-dashoffset: 100; } }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
        .animate-scroll { animation: scroll 60s linear infinite; will-change: transform; }
        @keyframes move-around { 0% { transform: translate(0, 0) scale(1); opacity: 0.15; } 33% { transform: translate(30vw, -10vh) scale(1.2); opacity: 0.25; } 66% { transform: translate(-20vw, 20vh) scale(0.8); opacity: 0.15; } 100% { transform: translate(0, 0) scale(1); opacity: 0.15; } }
        .animate-move-around { animation: move-around 20s infinite ease-in-out; will-change: transform, opacity; }
        @media (max-width: 768px) { .animate-move-around { animation-duration: 30s; filter: blur(80px); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(-5px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-100 { animation-delay: 100ms; }
        .no-spinner::-webkit-inner-spin-button, .no-spinner::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .no-spinner { -moz-appearance: textfield; }
        @media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/20 rounded-full blur-[120px] animate-move-around mix-blend-screen"></div>
      </div>

      <TickerBar />
      <Header activePage="all-markets" />

      <div className="w-full max-w-full px-4 lg:px-6 py-4 lg:py-6 relative z-10 mt-6 space-y-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading market data...</p>
          </div>
        ) : (
          <>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in-up">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <MarketHeader marketData={marketData} />
            <PriceChart chartData={chartData} />
          </div>
          <div className="lg:col-span-4 flex flex-col">
            <TradingPanel
              selectedOutcome={selectedOutcome}
              setSelectedOutcome={setSelectedOutcome}
              investAmount={investAmount}
              setInvestAmount={setInvestAmount}
              marketData={marketData}
              isConnected={isConnected}
              isPending={isPending}
              isConfirming={isConfirming}
              transactionError={transactionError}
              onPlaceBet={handlePlaceBet}
              userBet={userBet}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up delay-100">
          <div className="lg:col-span-8">
            <OrderHistory allTrades={allTrades} />
          </div>
          <div className="lg:col-span-4 space-y-6">
            {/* INFO */}
            <div className="bg-[#111] border border-white/5 rounded-xl p-5">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <Icon name="Info" size={16} className="text-yellow-500" />
                About this Market
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {marketData.description}
              </p>
            </div>
            {/* RULES */}
            <div className="bg-[#111] border border-white/5 rounded-xl p-5">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <Icon name="Check" size={16} className="text-emerald-500" />
                Resolution Rules
              </h3>
              <ul className="space-y-2">
                {marketData.rules.map((rule, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-gray-400 flex items-start gap-2"
                  >
                    <span className="text-white/20">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <CommentsSection
          comments={comments}
          newComment={newComment}
          setNewComment={setNewComment}
          isSubmittingComment={isSubmittingComment}
          isConnected={isConnected}
          address={address}
          onSubmitComment={handleSubmitComment}
          onDeleteComment={handleDeleteComment}
        />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MarketDetail;
