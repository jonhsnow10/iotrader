import React, { useState, useRef, useEffect, useMemo } from "react";
import Layout from "./components/Layout";
import Icon from "./components/Icon";
import SEO from "./components/SEO";
import { getAllMarkets } from "./services/marketService";
import { createSlug } from "./utils/slug";

// 2. CATEGORIES
const categories = [
  { id: "all", name: "All Markets", icon: "Menu" },
  { id: "crypto", name: "Crypto", icon: "Globe" },
  { id: "sports", name: "Sports", icon: "Trophy" },
  { id: "politics", name: "Politics", icon: "Libra" },
  { id: "entertainment", name: "Pop Culture", icon: "Tv" },
  { id: "economy", name: "Economy", icon: "Activity" },
  { id: "general", name: "General", icon: "Menu" },
];

// Current Date
const TODAY = new Date().getTime();

// Mock markets for fallback (will be replaced by Firebase data)
const mockMarkets = [
  {
    id: 1,
    category: "crypto",
    question: "BNB all time high by December 31?",
    closes: "Dec 31, 2025",
    yesPrice: 0.67,
    noPrice: 0.33,
    volume: "4.2M",
    liquidity: "1.2M",
    isHot: true,
  },
  {
    id: 2,
    category: "crypto",
    question: "Bitcoin to hit $100k before Q4?",
    closes: "Oct 01, 2025", // Past
    yesPrice: 0.42,
    noPrice: 0.58,
    volume: "18.5M",
    liquidity: "5.4M",
    isHot: false,
  },
  {
    id: 3,
    category: "sports",
    question: "Real Madrid to win Champions League?",
    closes: "May 31, 2025", // Past
    yesPrice: 0.25,
    noPrice: 0.75,
    volume: "850K",
    liquidity: "250K",
    image: null,
  },
  {
    id: 4,
    category: "politics",
    question: "Fed Interest Rate Cut in next meeting?",
    closes: "Dec 15, 2025", // Future (Live)
    yesPrice: 0.85,
    noPrice: 0.15,
    volume: "2.1M",
    liquidity: "800K",
    image: null,
    isHot: true,
  },
  {
    id: 5,
    category: "entertainment",
    question: "Taylor Swift album release in 2025?",
    closes: "Dec 31, 2025", // Future
    yesPrice: 0.92,
    noPrice: 0.08,
    volume: "150K",
    liquidity: "45K",
    image: null,
  },
  {
    id: 6,
    category: "crypto",
    question: "Ethereum Flippening (Market Cap > BTC)?",
    closes: "Dec 31, 2026", // Future
    yesPrice: 0.12,
    noPrice: 0.88,
    volume: "3.3M",
    liquidity: "900K",
  },
  {
    id: 7,
    category: "politics",
    question: "Midterm Election Result: Democratic Majority?",
    closes: "Nov 05, 2025", // Past
    yesPrice: 0.45,
    noPrice: 0.55,
    volume: "12M",
    liquidity: "3M",
  },
];

// Sorting Helpers
const getVolumeValue = (str) => {
  if (!str) return 0;
  // Remove $ and any whitespace
  const cleaned = str.toString().replace(/[$,\s]/g, '');
  if (cleaned.includes("M")) return parseFloat(cleaned) * 1000000;
  if (cleaned.includes("K")) return parseFloat(cleaned) * 1000;
  return parseFloat(cleaned) || 0;
};

const getTimeValue = (str) => {
  if (str === "Next Month") {
    const d = new Date(TODAY);
    d.setMonth(d.getMonth() + 1);
    return d.getTime();
  }
  return new Date(str).getTime();
};

// Network types
const AllMarkets = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSortFilter, setActiveSortFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chart State
  const [chartData, setChartData] = useState([]);
  const [chartMin, setChartMin] = useState(0);
  const [chartMax, setChartMax] = useState(0);
  const [currentChartPrice, setCurrentChartPrice] = useState(64231.45);

  const scrollContainerRef = useRef(null);

  // Fetch markets from Firebase
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        setError(null);
        const firebaseMarkets = await getAllMarkets();
        
        // Transform Firebase markets to match component format
        const transformedFirebaseMarkets = firebaseMarkets.map((market) => {
          // Convert Firestore Timestamp to Date
          const closingTime = market.closingTime?.toDate 
            ? market.closingTime.toDate() 
            : market.closingTime instanceof Date 
            ? market.closingTime 
            : new Date(market.closingTime);
          
          const createdAt = market.createdAt?.toDate 
            ? market.createdAt.toDate() 
            : market.createdAt instanceof Date 
            ? market.createdAt 
            : new Date(market.createdAt || Date.now());

          // Format closing date
          const closes = closingTime.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          });

          // Calculate volume (format as string)
          const volumeValue = market.totalVolume || 0;
          const volume = volumeValue >= 1000000 
            ? `${(volumeValue / 1000000).toFixed(1)}M`
            : volumeValue >= 1000
            ? `${(volumeValue / 1000).toFixed(0)}K`
            : volumeValue.toFixed(0);

          // Calculate liquidity (sum of pools)
          const liquidityValue = (market.yesPool || 0) + (market.noPool || 0);
          const liquidity = liquidityValue >= 1000000
            ? `${(liquidityValue / 1000000).toFixed(1)}M`
            : liquidityValue >= 1000
            ? `${(liquidityValue / 1000).toFixed(0)}K`
            : liquidityValue.toFixed(0);

          // Determine if market is hot (high volume or recent)
          const isHot = volumeValue > 1000000 || (Date.now() - createdAt.getTime()) < 24 * 60 * 60 * 1000;

          // Normalize category to lowercase for consistent filtering
          const normalizedCategory = (market.category || "general").toLowerCase();

          return {
            id: `firebase_${market.id}`,
            category: normalizedCategory,
            question: market.title,
            slug: market.slug || createSlug(market.title || ''),
            closes: closes,
            yesPrice: market.yesPrice || 0.5,
            noPrice: market.noPrice || 0.5,
            volume: volume,
            volumeValue: volumeValue, // Store numeric value for sorting
            liquidity: liquidity,
            isHot: isHot,
            status: market.status || "active",
            closingTime: closingTime.getTime(),
            createdAt: createdAt.getTime(),
            source: 'firebase',
            firebaseId: market.id,
            transactionHash: market.transactionHash,
            blockchainId: market.blockchainId || market.marketId, // Store blockchain ID for deduplication
          };
        });

        // Deduplicate Firebase markets (same question + closing date = duplicate)
        const uniqueFirebaseMarkets = [];
        const seenFirebaseMarkets = new Map(); // Use Map to store index for easier updates
        
        transformedFirebaseMarkets.forEach((fbMarket) => {
          // Create a unique key based on question (normalized) and closing time
          const questionKey = fbMarket.question.toLowerCase().trim();
          const closingKey = fbMarket.closingTime.toString();
          const uniqueKey = `${questionKey}|${closingKey}`;
          
          if (!seenFirebaseMarkets.has(uniqueKey)) {
            seenFirebaseMarkets.set(uniqueKey, uniqueFirebaseMarkets.length);
            uniqueFirebaseMarkets.push(fbMarket);
          } else {
            // If duplicate found, decide which one to keep
            const existingIndex = seenFirebaseMarkets.get(uniqueKey);
            const existing = uniqueFirebaseMarkets[existingIndex];
            
            // Prefer market with blockchainId (linked to contract)
            if (fbMarket.blockchainId && !existing.blockchainId) {
              uniqueFirebaseMarkets[existingIndex] = fbMarket;
            } else if (!fbMarket.blockchainId && existing.blockchainId) {
              // Keep existing if it has blockchainId and new one doesn't
              // Do nothing, keep existing
            } else {
              // Both have blockchainId or neither has it - prefer the one with higher volume or more recent
              if (fbMarket.volumeValue > existing.volumeValue) {
                uniqueFirebaseMarkets[existingIndex] = fbMarket;
              } else if (fbMarket.volumeValue === existing.volumeValue && fbMarket.createdAt > existing.createdAt) {
                // Same volume, prefer more recent
                uniqueFirebaseMarkets[existingIndex] = fbMarket;
              }
            }
          }
        });
        
        // Use only Firebase markets (contract markets are excluded)
        setMarkets(uniqueFirebaseMarkets);
      } catch (err) {
        console.error("Error fetching markets:", err);
        setError(err.message);
        // Fallback to mock data on error
        setMarkets(mockMarkets);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  // Initialize Chart Data
  useEffect(() => {
    const startPrice = 64231.45;
    const initialData = Array.from({ length: 200 }, (_, i) => {
      const timeOffset = i * 0.05;
      const trend = Math.sin(timeOffset) * 15;
      const noise = (Math.random() - 0.5) * 5;
      return { value: startPrice + trend + noise, id: i };
    });
    setChartData(initialData);
    setCurrentChartPrice(initialData[initialData.length - 1].value);

    const interval = setInterval(() => {
      setChartData((prev) => {
        const lastVal = prev[prev.length - 1].value;
        const volatility = 0.8;
        const change = (Math.random() - 0.5) * volatility;
        const trendBias = Math.sin(Date.now() / 10000) * 0.2;
        const newValue = lastVal + change + trendBias;
        setCurrentChartPrice(newValue);
        const newData = [...prev.slice(1), { value: newValue, id: Date.now() }];
        return newData;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chartData.length > 0) {
      const values = chartData.map((d) => d.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const padding = (max - min) * 0.2;
      setChartMin(min - padding);
      setChartMax(max + padding);
    }
  }, [chartData]);

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


  // Filter & Sort Logic
  const visibleMarkets = useMemo(() => {
    // 1. Category Filter
    let filtered = markets.filter((market) => {
      // Normalize category comparison (case-insensitive)
      const marketCategory = (market.category || "general").toLowerCase();
      const activeCat = (activeCategory || "all").toLowerCase();
      const matchesCategory =
        activeCat === "all" || marketCategory === activeCat;
      
      // Search filter
      const matchesSearch = !searchQuery || market.question
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });

    // 2. Main Logic: Sort by "All" preferences (Hot -> Active -> Past) or specific Filters

    // Sort logic for "All" is tricky: Display by Time, but FIRST the hot ones.
    // AND Previous ones should be at the bottom (or treated as "outdated").

    filtered.sort((a, b) => {
      // Use closingTime if available (from Firebase), otherwise parse closes string
      const timeA = a.closingTime || getTimeValue(a.closes);
      const timeB = b.closingTime || getTimeValue(b.closes);
      const isPastA = timeA < TODAY;
      const isPastB = timeB < TODAY;

      // "All" view logic
      if (activeSortFilter === "all") {
        // 1. Active vs Past (Active first)
        if (isPastA !== isPastB) return isPastA ? 1 : -1;

        // 2. If both Active, Hot first
        if (!isPastA && !isPastB) {
          if (a.isHot !== b.isHot) return a.isHot ? -1 : 1;
        }

        // 3. Sort by Time (Nearest closing first for active, most recent expired for past)
        return timeA - timeB;
      }

      // Specific Filters
      if (activeSortFilter === "hot") {
        // Sort hot markets: hottest first (by isHot, then by volume)
        if (a.isHot !== b.isHot) return a.isHot ? -1 : 1;
        return (b.volumeValue || 0) - (a.volumeValue || 0);
      }
      if (activeSortFilter === "live") return timeA - timeB;
      if (activeSortFilter === "ended") return timeB - timeA; // Most recently expired first
      // Sort descending by time (Finishing later/Future first, Oldest/Past last)
      if (activeSortFilter === "time") return timeB - timeA;
      if (activeSortFilter === "volume") {
        // Use volumeValue if available, otherwise parse from volume string
        const volA = a.volumeValue || getVolumeValue(a.volume);
        const volB = b.volumeValue || getVolumeValue(b.volume);
        return volB - volA;
      }

      return 0;
    });

    // 3. Apply Strict Filters (filtering out items)
    if (activeSortFilter === "hot") {
      filtered = filtered.filter(
        (m) => m.isHot && (m.closingTime || getTimeValue(m.closes)) >= TODAY
      );
    } else if (activeSortFilter === "live") {
      filtered = filtered.filter((m) => (m.closingTime || getTimeValue(m.closes)) >= TODAY);
    } else if (activeSortFilter === "ended") {
      filtered = filtered.filter((m) => (m.closingTime || getTimeValue(m.closes)) < TODAY);
    }

    return filtered;
  }, [markets, activeCategory, activeSortFilter, searchQuery]);

  return (
    <Layout activePage="all-markets">
      <SEO
        title="All Markets - Browse Prediction Markets"
        description="Browse all prediction markets on IO Trader. Filter by category (Crypto, Sports, Politics, Entertainment, Economy) and discover markets to trade on. Find active markets, view volumes, and place your bets."
        keywords="prediction markets, all markets, crypto markets, sports betting, political predictions, market categories, trading markets"
        url="/markets"
      />
      {/* CATEGORY BROWSER & SEARCH BAR */}
      <div className="bg-[#080808] border-b border-yellow-500/20 pt-4 pb-4">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Middle: Horizontal Category Scroll */}
          <div className="relative flex-1 w-full md:w-auto min-w-0 mx-4">
            <button
              onClick={() => scroll("left")}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-[#080808] to-transparent h-full px-2 items-center text-gray-400 hover:text-white"
            >
              <Icon name="ChevronLeft" size={20} />
            </button>
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-6 md:px-8"
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all border ${
                    activeCategory === cat.id
                      ? "bg-yellow-500 text-black border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]"
                      : "bg-[#1a1a1a] text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                >
                  <Icon name={cat.icon} size={14} />
                  {cat.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => scroll("right")}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-[#080808] to-transparent h-full px-2 items-center text-gray-400 hover:text-white"
            >
              <Icon name="ChevronRight" size={20} />
            </button>
          </div>

          {/* Right: Search */}
          <div className="relative w-full md:w-64">
            <Icon
              name="Search"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - MARKETS GRID */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6 relative z-10">
        {/* Header Stats REMOVED */}

        {/* Section Title Replaced with Filters */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 overflow-x-auto no-scrollbar">
          <span className="font-bold text-white shrink-0">Filter by:</span>

          {["all", "hot", "live", "time", "volume", "ended"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveSortFilter(filter)}
              className={`transition-colors flex items-center gap-1 font-medium px-4 py-1.5 rounded-full border shrink-0 capitalize ${
                activeSortFilter === filter
                  ? "text-yellow-500 bg-white/5 border-yellow-500/20"
                  : "text-gray-400 border-transparent hover:bg-white/5 hover:text-white"
              }`}
            >
              {filter === "hot" && <Icon name="FlameFilled" size={12} />}
              {filter}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
            <h3 className="text-xl font-bold text-white">Loading markets...</h3>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-50">
            <Icon name="AlertCircle" size={48} className="mb-4 text-yellow-500" />
            <h3 className="text-xl font-bold text-white">Error loading markets</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && !error && visibleMarkets.length > 0 ? (
            visibleMarkets.map((market, index) => {
              const closingTime = market.closingTime || getTimeValue(market.closes);
              const isExpired = closingTime < TODAY;
              return (
                <div
                  key={market.id}
                  className={`group bg-[#0f0f0f] border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col animate-fade-in-up 
                                ${
                                  isExpired
                                    ? "border-white/5 opacity-60 grayscale-[0.8] hover:opacity-80"
                                    : "border-white/5 hover:border-yellow-500/30 hover:shadow-[0_0_20px_rgba(234,179,8,0.05)]"
                                }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-white/5 relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {/* Main Icon - Category Icon (Larger) */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isExpired
                              ? "bg-white/5 text-gray-500"
                              : "bg-white/10 text-yellow-500"
                          }`}
                        >
                          <Icon
                            name={
                              categories.find((c) => c.id === market.category)
                                ?.icon ?? "Menu"
                            }
                            size={20}
                          />
                        </div>

                        {/* Category Label */}
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          {market.category}
                        </span>
                      </div>

                      {/* STATUS BADGES */}
                      <div className="flex gap-2">
                        {isExpired ? (
                          <span className="bg-gray-800 text-gray-400 border border-gray-700 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                            Ended
                          </span>
                        ) : (
                          <>
                            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Live
                            </span>
                            {market.isHot && (
                              <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                <Icon
                                  name="FlameFilled"
                                  size={12}
                                  className="mr-0.5"
                                />
                                Hot
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <h3
                      className={`text-lg font-bold uppercase leading-snug mb-3 transition-colors ${
                        isExpired
                          ? "text-gray-400"
                          : "text-white group-hover:text-yellow-500"
                      }`}
                    >
                      {market.question}
                    </h3>

                    <div className="flex justify-between items-end">
                      <div className="text-xs font-medium text-gray-500">
                        {isExpired ? "Closed:" : "Closes:"}
                      </div>
                      <div
                        className={`text-xs font-bold font-mono px-2 py-1 rounded border flex items-center gap-1.5 ${
                          isExpired
                            ? "bg-white/5 border-white/5 text-gray-500"
                            : "bg-white/5 border-white/5 text-white"
                        }`}
                      >
                        <Icon
                          name="Clock"
                          size={12}
                          className={
                            isExpired ? "text-gray-500" : "text-yellow-500"
                          }
                        />
                        {market.closes}
                      </div>
                    </div>
                  </div>

                  {/* Outcomes */}
                  <div className="p-5 flex-1 flex flex-col justify-center">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* YES BUTTON */}
                      <button
                        disabled={isExpired}
                        className={`relative overflow-hidden border rounded-xl p-3 text-left transition-all group/btn 
                                            ${
                                              isExpired
                                                ? "bg-[#1a1a1a] border-white/5 cursor-not-allowed"
                                                : "bg-[#0e2a1e] border-emerald-500/30 hover:border-emerald-500 cursor-default"
                                            }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div
                            className={`text-[10px] font-bold uppercase tracking-widest ${
                              isExpired ? "text-gray-600" : "text-emerald-500"
                            }`}
                          >
                            Yes
                          </div>
                          {!isExpired && (
                            <div className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </div>
                          )}
                        </div>
                        <div
                          className={`text-xl font-mono font-bold transition-colors ${
                            isExpired
                              ? "text-gray-500"
                              : "text-emerald-400 group-hover/btn:text-white"
                          }`}
                        >
                          ${market.yesPrice.toFixed(2)}
                        </div>
                        {!isExpired && (
                          <div className="absolute right-0 bottom-0 p-2 opacity-10 group-hover/btn:opacity-20">
                            <Icon name="ArrowUp" size={32} />
                          </div>
                        )}
                      </button>

                      {/* NO BUTTON */}
                      <button
                        disabled={isExpired}
                        className={`relative overflow-hidden border rounded-xl p-3 text-left transition-all group/btn 
                                            ${
                                              isExpired
                                                ? "bg-[#1a1a1a] border-white/5 cursor-not-allowed"
                                                : "bg-[#2a0e0e] border-rose-500/30 hover:border-rose-500 cursor-default"
                                            }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div
                            className={`text-[10px] font-bold uppercase tracking-widest ${
                              isExpired ? "text-gray-600" : "text-rose-500"
                            }`}
                          >
                            No
                          </div>
                          {!isExpired && (
                            <div className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </div>
                          )}
                        </div>
                        <div
                          className={`text-xl font-mono font-bold transition-colors ${
                            isExpired
                              ? "text-gray-500"
                              : "text-rose-400 group-hover/btn:text-white"
                          }`}
                        >
                          ${market.noPrice.toFixed(2)}
                        </div>
                        {!isExpired && (
                          <div className="absolute right-0 bottom-0 p-2 opacity-10 group-hover/btn:opacity-20">
                            <Icon name="ArrowDown" size={32} />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase">
                        Volume
                      </div>
                      <div
                        className={`text-sm font-mono font-bold ${
                          isExpired ? "text-gray-500" : "text-white"
                        }`}
                      >
                        ${market.volume}
                      </div>
                    </div>

                    {isExpired ? (
                      <button
                        disabled
                        className="flex items-center gap-2 font-black text-xs uppercase px-6 py-3 rounded-lg transition-all transform bg-[#1a1a1a] text-gray-500 cursor-not-allowed"
                      >
                        Ended
                      </button>
                    ) : (
                      <a
                        href={`/market/${market.slug}`}
                        className="flex items-center gap-2 font-black text-xs uppercase px-6 py-3 rounded-lg transition-all transform bg-gradient-to-r from-yellow-600 to-yellow-400 text-black shadow-[0_0_10px_rgba(234,179,8,0.2)] hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <span className="relative flex h-2 w-2 mr-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-50"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                        </span>
                        Trade
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-50">
              <Icon name="Search" size={48} className="mb-4 text-gray-600" />
              <h3 className="text-xl font-bold text-white">No markets found</h3>
              <p className="text-gray-500">
                Try adjusting your filters or search query.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AllMarkets;
