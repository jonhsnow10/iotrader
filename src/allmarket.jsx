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

const getClosesInDays = (closingTime) => {
  if (!closingTime) return null;
  const diff = closingTime - TODAY;
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
  if (days < 0) return null;
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes in 1 day";
  return `Closes in ${days} days`;
};

// Network types
const AllMarkets = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSortFilter, setActiveSortFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewCols, setViewCols] = useState(3); // 1, 2, or 3 per row
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [markets, setMarkets] = useState([]);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const viewDropdownRef = useRef(null);
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

        setMarkets(uniqueFirebaseMarkets);
        setError(null);
      } catch (err) {
        console.error("Error fetching markets:", err);
        setError(err.message);
        setMarkets([]);
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

  useEffect(() => {
    if (!searchOpen) return;
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  useEffect(() => {
    if (!viewDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(e.target)) {
        setViewDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [viewDropdownOpen]);


  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);


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
      {/* CATEGORY BROWSER & SEARCH BAR - full-width border, content aligned with main */}
      <div className="bg-[#080808] w-full border-b border-[rgba(60,60,67,0.6)]">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex flex-row items-center justify-between gap-6 h-[60px] pt-4">
          {/* Tabs in the middle: centered, same width context as content below */}
          <div
            ref={scrollContainerRef}
            className="flex flex-row items-center justify-start gap-4 md:gap-8 flex-1 min-w-0 overflow-x-auto no-scrollbar scroll-smooth font-inter"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-row justify-center items-center py-2 px-1 gap-2 flex-none whitespace-nowrap self-stretch transition-colors text-base leading-6 ${
                  activeCategory === cat.id
                    ? "border-b-2 border-[#EBB30B] font-bold text-white"
                    : "font-light text-[#737373] hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Right: Search, Filter, Info */}
          <div className="flex flex-row items-center gap-2 flex-none shrink-0">
            <div ref={searchContainerRef} className="relative flex items-center">
              {searchOpen ? (
                <div className="relative flex items-center">
                  <Icon
                    name="Search"
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search markets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 sm:w-56 bg-[#1a1a1a] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors font-inter"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => setSearchOpen(true)}
                  className="box-border flex flex-row items-center justify-center p-3 w-10 h-9 rounded-lg flex-none text-white hover:bg-white/10 transition-colors"
                >
                  <Icon name="Search" size={16} />
                </button>
              )}
            </div>
            <button
              type="button"
              aria-label="Filter"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((o) => !o)}
              className={`box-border flex flex-row items-center justify-center p-3 w-10 h-9 rounded-lg flex-none text-white transition-colors ${
                filterOpen ? "bg-white/10" : "hover:bg-white/10"
              }`}
            >
              <Icon name="Filter" size={16} />
            </button>
            {/* View density dropdown: hidden on mobile; on tablet only 2 cols + list; on desktop all 3 */}
            <div className="relative flex-none hidden md:block" ref={viewDropdownRef}>
              <button
                type="button"
                aria-label="View layout"
                aria-expanded={viewDropdownOpen}
                aria-haspopup="true"
                onClick={() => setViewDropdownOpen((o) => !o)}
                className={`box-border flex flex-row items-center justify-center p-3 w-10 h-9 rounded-lg text-white transition-colors ${
                  viewDropdownOpen ? "bg-white/10" : "hover:bg-white/10"
                }`}
              >
                {viewCols === 3 && (
                  <svg width="21" height="14" viewBox="0 0 21 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                    <path d="M5.66667 1H1V5.66667H5.66667V1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 1H8.33333V5.66667H13V1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 8.33333H8.33333V13H13V8.33333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.66667 8.33333H1V13H5.66667V8.33333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.1667 1H15.5V5.66667H20.1667V1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.1667 8.33333H15.5V13H20.1667V8.33333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {viewCols === 2 && (
                  <svg width="21" height="14" viewBox="0 0 21 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                    <path d="M9.16667 1H4.5V5.66667H9.16667V1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.5 1H11.8333V5.66667H16.5V1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.5 8.33333H11.8333V13H16.5V8.33333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.16667 8.33333H4.5V13H9.16667V8.33333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {viewCols === 1 && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                    <path d="M5.33333 4H14M5.33333 8H14M5.33333 12H14M2 4H2.00667M2 8H2.00667M2 12H2.00667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              {viewDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 py-1 min-w-[220px] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50">
                  {[
                    { cols: 3, label: "Compact grid (3 columns)", icon: "grid3", showFrom: "lg" },
                    { cols: 2, label: "Standard grid (2 columns)", icon: "grid2", showFrom: "md" },
                    { cols: 1, label: "List view (1 column)", icon: "list", showFrom: "md" },
                  ].map(({ cols, label, icon, showFrom }) => (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => { setViewCols(cols); setViewDropdownOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-inter transition-colors ${
                        viewCols === cols ? "bg-yellow-500/20 text-yellow-500" : "text-gray-300 hover:bg-white/10 hover:text-white"
                      } ${showFrom === "lg" ? "hidden lg:flex" : ""}`}
                    >
                      {icon === "grid3" && (
                        <svg width="21" height="14" viewBox="0 0 21 14" fill="none" className="shrink-0" aria-hidden>
                          <path d="M5.66667 1H1V5.66667H5.66667V1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M13 1H8.33333V5.66667H13V1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M13 8.33333H8.33333V13H13V8.33333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M5.66667 8.33333H1V13H5.66667V8.33333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20.1667 1H15.5V5.66667H20.1667V1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20.1667 8.33333H15.5V13H20.1667V8.33333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {icon === "grid2" && (
                        <svg width="21" height="14" viewBox="0 0 21 14" fill="none" className="shrink-0" aria-hidden>
                          <path d="M9.16667 1H4.5V5.66667H9.16667V1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16.5 1H11.8333V5.66667H16.5V1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16.5 8.33333H11.8333V13H16.5V8.33333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9.16667 8.33333H4.5V13H9.16667V8.33333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {icon === "list" && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
                          <path d="M5.33333 4H14M5.33333 8H14M5.33333 12H14M2 4H2.00667M2 8H2.00667M2 12H2.00667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar - shown only when filter icon is clicked (Figma Frame 48097309) */}
      {filterOpen && (
        <div className="box-border flex flex-col items-start w-full py-4 px-4 md:px-20 gap-4 border-b border-[rgba(60,60,67,0.29)] bg-[#080808] flex-none">
          <div className="flex flex-row items-center gap-2 w-full max-w-7xl mx-auto">
            {/* Filter by: label */}
            <div className="box-border flex flex-row justify-center items-center p-2 gap-2 flex-none rounded-lg">
              <span className="font-inter font-normal text-sm leading-5 text-[#787878] flex items-center">
                Filter by:
              </span>
            </div>
            {/* Tabs */}
            <div className="flex flex-row items-center gap-2 overflow-x-auto no-scrollbar flex-wrap">
              {["all", "hot", "live", "time", "volume", "ended"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveSortFilter(filter)}
                  className={`box-border flex flex-row items-center justify-center gap-1.5 py-2 px-4 rounded-[10px] shrink-0 font-inter text-sm leading-[17px] tracking-[0.63px] capitalize transition-colors ${
                    activeSortFilter === filter
                      ? "bg-[rgba(250,204,21,0.2)] border border-[#EBB30B] font-semibold text-white"
                      : "bg-[rgba(60,60,67,0.3)] border border-[rgba(116,116,128,0.08)] font-normal text-[#B3B3B3] hover:text-white hover:border-white/20"
                  }`}
                >
                  {filter === "hot" && <Icon name="FlameFilled" size={12} />}
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT - MARKETS GRID */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6 relative z-10">
        {/* Header Stats REMOVED */}

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

        {/* Grid - responsive 1 / 2 / 3 columns by view density */}
        <div
          className={`grid gap-6 ${
            viewCols === 3
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : viewCols === 2
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1"
          }`}
        >
          {!loading && !error && visibleMarkets.length > 0 ? (
            visibleMarkets.map((market, index) => {
              const closingTime = market.closingTime || getTimeValue(market.closes);
              const isExpired = closingTime < TODAY;
              const closesInText = getClosesInDays(closingTime);
              const yesPct = Math.round((market.yesPrice || 0) * 100);
              const categoryIcon = categories.find((c) => c.id === market.category)?.icon ?? "Menu";
              return (
                <div
                  key={market.id}
                  className={`flex flex-col justify-center items-end p-3 gap-3 rounded-2xl min-w-0 transition-all duration-300 animate-fade-in-up ${
                    isExpired
                      ? "bg-[rgba(116,116,128,0.05)] opacity-70 cursor-not-allowed"
                      : "bg-[rgba(116,116,128,0.08)] hover:bg-[rgba(116,116,128,0.12)]"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                        {/* Tags: Closes in X days, High activity, Live */}
                        <div className="flex flex-row items-center gap-1 w-full flex-wrap">
                          <div className="flex flex-row items-center gap-1 flex-1 min-w-0">
                            {closesInText && (
                              <span className="box-border flex flex-row items-start py-1 px-1.5 rounded bg-[#080808] font-inter font-normal text-[10px] leading-3 text-[#8E8E93] flex-none">
                                {closesInText}
                              </span>
                            )}
                            {!isExpired && market.isHot && (
                              <span className="box-border flex flex-row items-center py-1 px-1.5 gap-1 rounded bg-[#080808] font-inter font-normal text-[10px] leading-3 text-[#8E8E93] flex-none">
                                <Icon name="TrendingUp" size={12} className="shrink-0 border border-[#EBB30B] rounded" />
                                High activity
                              </span>
                            )}
                            {!isExpired && (
                              <span className="box-border flex flex-row items-center py-1 px-1.5 gap-1 rounded font-inter font-medium text-[10px] leading-3 tracking-wide text-[#22C55E] flex-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                                Live
                              </span>
                            )}
                            {isExpired && (
                              <span className="box-border flex flex-row items-center py-1 px-1.5 rounded bg-[#080808] font-inter font-normal text-[10px] leading-3 text-[#8E8E93]">
                                Ended
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Question block - not a link when closed */}
                        {isExpired ? (
                          <div className="w-full min-w-0 pointer-events-none">
                            <div className="box-border flex flex-col justify-center items-end p-3 gap-3 rounded-[10px] bg-[rgba(116,116,128,0.08)] w-full">
                              <div className="flex flex-row items-center gap-4 w-full min-w-0">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-none bg-[#F7931A] text-white">
                                  <Icon name={categoryIcon} size={16} />
                                </div>
                                <h3 className="font-inter font-semibold text-base leading-6 flex-1 min-w-0 text-[#8E8E93]">
                                  {market.question}
                                </h3>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <a href={`/market/${market.slug}`} className="w-full min-w-0">
                            <div className="box-border flex flex-col justify-center items-end p-3 gap-3 rounded-[10px] bg-[rgba(116,116,128,0.08)] w-full">
                              <div className="flex flex-row items-center gap-4 w-full min-w-0">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-none bg-[#F7931A] text-white">
                                  <Icon name={categoryIcon} size={16} />
                                </div>
                                <h3 className="font-inter font-semibold text-base leading-6 flex-1 min-w-0 text-white">
                                  {market.question}
                                </h3>
                              </div>
                            </div>
                          </a>
                        )}

                        {/* Yes / No buttons - not links when closed */}
                        <div className="flex flex-row justify-center items-center w-full gap-2">
                          {isExpired ? (
                            <>
                              <span className="flex flex-row justify-center items-center py-1 px-4 gap-2 rounded-lg flex-1 min-w-0 backdrop-blur-sm font-inter font-medium text-sm leading-7 text-center bg-[#1a1a1a] text-[#757575] cursor-not-allowed pointer-events-none">
                                Yes
                              </span>
                              <span className="flex flex-row justify-center items-center py-1 px-4 gap-2 rounded-lg flex-1 min-w-0 font-inter font-medium text-sm leading-7 text-center bg-[#1a1a1a] text-[#757575] cursor-not-allowed pointer-events-none">
                                No
                              </span>
                            </>
                          ) : (
                            <>
                              <a
                                href={`/market/${market.slug}`}
                                className="flex flex-row justify-center items-center py-1 px-4 gap-2 rounded-lg flex-1 min-w-0 backdrop-blur-sm font-inter font-medium text-sm leading-7 text-center text-white bg-[#31A75C] hover:opacity-90 transition-opacity"
                              >
                                Yes
                              </a>
                              <a
                                href={`/market/${market.slug}`}
                                className="flex flex-row justify-center items-center py-1 px-4 gap-2 rounded-lg flex-1 min-w-0 font-inter font-medium text-sm leading-7 text-center text-white bg-[#FF2D55] hover:opacity-90 transition-opacity"
                              >
                                No
                              </a>
                            </>
                          )}
                        </div>

                        {/* Footer: clock + outcome bar */}
                        <div className="box-border flex flex-row items-center pt-3 px-4 w-full gap-1.5 border-t border-[rgba(120,120,128,0.16)]">
                          <div className="flex flex-row items-center gap-1.5 flex-1 min-w-0">
                            <Icon name="Clock" size={16} className="shrink-0 text-[#757575]" />
                            <span className="font-inter font-normal text-xs leading-7 text-[#757575]">
                              {isExpired ? "Closed" : market.closes}
                            </span>
                          </div>
                          <div className="flex flex-row items-center gap-1 shrink-0">
                            <div className="flex flex-row rounded-full overflow-hidden bg-[#FF2D55] min-w-[3rem]">
                              <div className="h-2 rounded-l-full bg-[#31A75C]" style={{ width: `${yesPct}%` }} />
                            </div>
                            <span className={`font-inter font-medium text-sm leading-[15px] tracking-wide uppercase ${isExpired ? "text-[#757575]" : "text-[#22C55E]"}`}>
                              {yesPct}%
                            </span>
                          </div>
                        </div>
                </div>
              );
            })
          ) : (
            <div className="w-full py-20 text-center flex flex-col items-center justify-center opacity-50">
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
