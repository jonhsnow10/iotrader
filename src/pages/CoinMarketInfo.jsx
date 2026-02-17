import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Icon from "../components/Icon";
import SEO from "../components/SEO";

const CoinMarketInfo = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("market_cap");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch coins from Binance
  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all 24hr tickers from Binance
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        
        if (!response.ok) {
          throw new Error("Failed to fetch coin data");
        }
        
        const data = await response.json();
        
        // Filter USDT pairs and transform to match expected format
        const usdtPairs = data
          .filter(ticker => ticker.symbol.endsWith('USDT'))
          .map(ticker => {
            const symbol = ticker.symbol.replace('USDT', '');
            const price = parseFloat(ticker.lastPrice);
            const openPrice = parseFloat(ticker.openPrice);
            const change24h = openPrice > 0 ? ((price - openPrice) / openPrice) * 100 : parseFloat(ticker.priceChangePercent) || 0;
            
            return {
              id: symbol.toLowerCase(),
              symbol: symbol,
              name: symbol,
              current_price: price,
              price_change_percentage_24h: change24h,
              price_change_percentage_1h_in_currency: change24h, // Binance doesn't have 1h, use 24h
              price_change_percentage_7d_in_currency: change24h, // Binance doesn't have 7d, use 24h
              market_cap: parseFloat(ticker.quoteVolume) || 0,
              total_volume: parseFloat(ticker.quoteVolume) || 0,
              circulating_supply: 0, // Binance doesn't provide this
              image: `https://cryptoicons.org/api/icon/${symbol.toLowerCase()}/200`, // Placeholder image URL
            };
          })
          .sort((a, b) => b.market_cap - a.market_cap) // Sort by market cap (volume)
          .slice(0, 100); // Limit to top 100
        
        setCoins(usdtPairs);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching coins:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchCoins, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter and sort coins
  const filteredAndSortedCoins = React.useMemo(() => {
    let filtered = [...coins];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (coin) =>
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    switch (filter) {
      case "top10":
        filtered = filtered.slice(0, 10);
        break;
      case "top50":
        filtered = filtered.slice(0, 50);
        break;
      case "gainers":
        filtered = filtered
          .filter((coin) => coin.price_change_percentage_24h > 0)
          .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        break;
      case "losers":
        filtered = filtered
          .filter((coin) => coin.price_change_percentage_24h < 0)
          .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
        break;
      default:
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "market_cap":
          aValue = a.market_cap || 0;
          bValue = b.market_cap || 0;
          break;
        case "price":
          aValue = a.current_price || 0;
          bValue = b.current_price || 0;
          break;
        case "volume":
          aValue = a.total_volume || 0;
          bValue = b.total_volume || 0;
          break;
        case "change_24h":
          aValue = a.price_change_percentage_24h || 0;
          bValue = b.price_change_percentage_24h || 0;
          break;
        default:
          aValue = a.market_cap || 0;
          bValue = b.market_cap || 0;
      }
      return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
    });

    return filtered;
  }, [coins, searchQuery, filter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCoins.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCoins = filteredAndSortedCoins.slice(startIndex, endIndex);

  const formatNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPrice = (price) => {
    if (price >= 1000) return `$${(price / 1000).toFixed(2)}K`;
    return `$${price.toFixed(2)}`;
  };

  const formatSupply = (supply, symbol) => {
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B ${symbol}`;
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M ${symbol}`;
    if (supply >= 1e3) return `${(supply / 1e3).toFixed(2)}K ${symbol}`;
    return `${supply.toFixed(2)} ${symbol}`;
  };

  if (loading && coins.length === 0) {
    return (
      <Layout activePage="coin-market-info">
        <div className="min-h-screen pt-6 pb-20 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Icon name="Activity" size={48} className="text-yellow-500/50 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-400">Loading coin data...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activePage="coin-market-info">
      <SEO
        title="Coins & Markets Info - Real-time Cryptocurrency Prices"
        description="Browse real-time cryptocurrency prices, market data, and statistics. View top gainers, losers, market caps, volumes, and trading information for all major coins."
        keywords="cryptocurrency prices, coin market data, crypto statistics, market cap, trading volume, price changes, top gainers, top losers, crypto markets"
        url="/coin-market-info"
      />
      <div className="min-h-screen pt-6 pb-20 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 mb-2">
              Coins & Markets Info
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Real-time cryptocurrency prices, market data, and statistics. Stay informed about the latest market movements.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6 animate-fade-in-up">
            <div className="relative">
              <Icon
                name="Search"
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search coins by name or symbol..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="mb-6 space-y-4 animate-fade-in-up">
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {[
                { id: "all", label: "All Coins" },
                { id: "top10", label: "Top 10" },
                { id: "top50", label: "Top 50" },
                { id: "gainers", label: "Top Gainers" },
                { id: "losers", label: "Top Losers" },
              ].map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => {
                    setFilter(filterOption.id);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                    filter === filterOption.id
                      ? "bg-yellow-500 text-black"
                      : "bg-[#0a0a0a] border border-white/10 text-gray-400 hover:border-yellow-500/30 hover:text-yellow-400"
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>

            {/* Sort and Page Size Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm font-bold">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white text-sm font-bold focus:border-yellow-500 focus:outline-none"
                >
                  <option value="market_cap">Market Cap</option>
                  <option value="price">Price</option>
                  <option value="volume">Volume</option>
                  <option value="change_24h">24h Change</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm font-bold">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white text-sm font-bold focus:border-yellow-500 focus:outline-none"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-gray-400 text-sm font-bold">per page</span>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-gray-400 text-sm">
              Showing {startIndex + 1} - {Math.min(endIndex, filteredAndSortedCoins.length)} of{" "}
              {filteredAndSortedCoins.length} coins
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Coins Table */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-[#050505]">
                    <th className="text-left py-4 px-4 text-gray-400 text-xs font-bold uppercase">
                      Coin
                    </th>
                    <th className="text-right py-4 px-4 text-gray-400 text-xs font-bold uppercase">
                      Price
                    </th>
                    <th className="text-right py-4 px-4 text-gray-400 text-xs font-bold uppercase">
                      1h
                    </th>
                    <th className="text-right py-4 px-4 text-gray-400 text-xs font-bold uppercase">
                      24h
                    </th>
                    <th className="text-right py-4 px-4 text-gray-400 text-xs font-bold uppercase">
                      7d
                    </th>
                    <th className="text-right py-4 px-4 text-gray-400 text-xs font-bold uppercase">
                      Market Cap
                    </th>
                    <th className="text-right py-4 px-4 text-gray-400 text-xs font-bold uppercase">
                      Volume (24h)
                    </th>
                    <th className="text-right py-4 px-4 text-gray-400 text-xs font-bold uppercase">
                      Circulating Supply
                    </th>
                    <th className="text-center py-4 px-4 text-gray-400 text-xs font-bold uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCoins.map((coin) => (
                    <tr
                      key={coin.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      {/* Coin */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-white font-bold text-sm">{coin.name}</p>
                            <p className="text-gray-400 text-xs uppercase">{coin.symbol}</p>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 text-right">
                        <p className="text-white font-bold text-sm">{formatPrice(coin.current_price)}</p>
                      </td>

                      {/* 1h Change */}
                      <td className="py-4 px-4 text-right">
                        {coin.price_change_percentage_1h_in_currency ? (
                          <div className="flex items-center justify-end gap-1">
                            {coin.price_change_percentage_1h_in_currency >= 0 ? (
                              <Icon name="TrendingUp" size={14} className="text-green-500" />
                            ) : (
                              <Icon name="TrendingUp" size={14} className="text-red-500 rotate-180" />
                            )}
                            <span
                              className={`text-sm font-bold ${
                                coin.price_change_percentage_1h_in_currency >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {coin.price_change_percentage_1h_in_currency >= 0 ? "+" : ""}
                              {coin.price_change_percentage_1h_in_currency.toFixed(2)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* 24h Change */}
                      <td className="py-4 px-4 text-right">
                        {coin.price_change_percentage_24h ? (
                          <div className="flex items-center justify-end gap-1">
                            {coin.price_change_percentage_24h >= 0 ? (
                              <Icon name="TrendingUp" size={14} className="text-green-500" />
                            ) : (
                              <Icon name="TrendingUp" size={14} className="text-red-500 rotate-180" />
                            )}
                            <span
                              className={`text-sm font-bold ${
                                coin.price_change_percentage_24h >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                              {coin.price_change_percentage_24h.toFixed(2)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* 7d Change */}
                      <td className="py-4 px-4 text-right">
                        {coin.price_change_percentage_7d_in_currency ? (
                          <div className="flex items-center justify-end gap-1">
                            {coin.price_change_percentage_7d_in_currency >= 0 ? (
                              <Icon name="TrendingUp" size={14} className="text-green-500" />
                            ) : (
                              <Icon name="TrendingUp" size={14} className="text-red-500 rotate-180" />
                            )}
                            <span
                              className={`text-sm font-bold ${
                                coin.price_change_percentage_7d_in_currency >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {coin.price_change_percentage_7d_in_currency >= 0 ? "+" : ""}
                              {coin.price_change_percentage_7d_in_currency.toFixed(2)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* Market Cap */}
                      <td className="py-4 px-4 text-right">
                        <p className="text-white font-bold text-sm">
                          {formatNumber(coin.market_cap || 0)}
                        </p>
                      </td>

                      {/* Volume 24h */}
                      <td className="py-4 px-4 text-right">
                        <p className="text-white font-bold text-sm">
                          {formatNumber(coin.total_volume || 0)}
                        </p>
                      </td>

                      {/* Circulating Supply */}
                      <td className="py-4 px-4 text-right">
                        <p className="text-white font-bold text-sm">
                          {formatSupply(coin.circulating_supply || 0, coin.symbol.toUpperCase())}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded hover:bg-yellow-400 transition-colors">
                            Trade
                          </button>
                          <Link
                            to={`/coin-market-info/${coin.id}`}
                            className="px-3 py-1 bg-[#1a1a1a] border border-white/10 text-white text-xs font-bold rounded hover:border-yellow-500/30 transition-colors"
                          >
                            Info
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-white/10 px-4 py-4 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#050505] border border-white/10 rounded-lg text-white text-sm font-bold hover:border-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-400 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#050505] border border-white/10 rounded-lg text-white text-sm font-bold hover:border-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoinMarketInfo;
