import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Icon from "../components/Icon";
import SEO from "../components/SEO";
import { useWallet } from "../hooks/useWallet";
import { getUserPositions, getMarketById } from "../services/marketService";
import { getUserPredictions, getUserStats } from "../services/predictionService";
import { getUserPoints } from "../services/pointsService";
import { getReferralStats, getReferralLink } from "../services/referralService";

const UserDashboard = () => {
  const { address, isConnected, balance, balanceSymbol } = useWallet();
  const [positions, setPositions] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [referralStats, setReferralStats] = useState(null);
  const [referralLink, setReferralLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [detailsTab, setDetailsTab] = useState("positions");

  const formatAddress = (addr) => {
    if (!addr) return "Not Connected";
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [trades, priceBets, userStats, points, referralData] = await Promise.all([
          getUserPositions(address),
          getUserPredictions(address),
          getUserStats(address),
          getUserPoints(address),
          getReferralStats(address),
        ]);

        const positionsData = await Promise.all(
          trades.map(async (trade) => {
            const market = await getMarketById(trade.marketId);
            return {
              id: trade.id,
              market: market?.title || "Unknown Market",
              outcome: trade.side,
              totalStaked: trade.amount,
              recentTrades: trade.timestamp?.toDate
                ? trade.timestamp.toDate().toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Unknown",
              trades: 1,
              price: trade.price,
              value: trade.amount,
            };
          })
        );

        const predictionsData = priceBets.map((pred) => ({
          id: pred.id,
          symbol: pred.symbol,
          direction: pred.direction,
          amount: pred.amount,
          currentPrice: pred.currentPrice,
          targetPrice: pred.targetPrice,
          status: pred.status,
          expiry: pred.expiry,
          profitLoss: pred.profitLoss,
        }));

        setPositions(positionsData);
        setPredictions(predictionsData);
        setStats(userStats);
        setTotalPoints(points);
        setReferralStats(referralData);

        if (referralData?.referralCode) {
          const link = await getReferralLink(address);
          setReferralLink(link);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isConnected, address]);

  const totalStaked = positions.reduce((sum, pos) => sum + (pos.totalStaked || 0), 0);
  const totalPredictionsValue = predictions.reduce((sum, pred) => sum + (pred.amount || 0), 0);
  const portfolioValue = totalStaked + totalPredictionsValue;
  const totalTradesCount = positions.reduce((sum, pos) => sum + (pos.trades || 0), 0);

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Layout activePage="user-dashboard">
      <SEO
        title="User Dashboard - My Trading Portfolio"
        description="View your trading positions, predictions, points, and referral stats. Track your performance, active predictions, and win rate on IO Trader."
        keywords="user dashboard, trading portfolio, positions, predictions, points, referral, win rate, trading stats"
        url="/user-dashboard"
      />
      <div className="min-h-screen pt-6 pb-20 px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Portfolio header */}
          <div className="mb-6 lg:mb-8 animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-geist-sans), monospace" }}>
              Portfolio
            </h1>
            <p className="mt-2 text-lg sm:text-xl font-semibold text-white/90">Dashboard</p>
            <p className="mt-1 text-sm text-gray-400">
              Wallet: <span className="text-[var(--color-accent-primary)] font-mono">{isConnected ? formatAddress(address) : "Not Connected"}</span>
            </p>
          </div>

          {/* Main portfolio card */}
          <div className="rounded-2xl border border-white/20 bg-[rgba(7,7,7,0.93)] overflow-hidden mb-6 animate-fade-in-up shadow-xl">
            <div className="p-5 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-10">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-white/70 uppercase tracking-wider">Total value</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-geist-sans), monospace" }}>
                      {isConnected ? `$${portfolioValue.toFixed(2)}` : "---"}
                    </p>
                    <div className="flex gap-1 mt-1">
                      <div className="h-1 w-3 bg-[var(--color-accent-primary)] rounded-full" />
                      <div className="h-1 w-3 bg-[var(--color-accent-primary)] rounded-full opacity-60" />
                    </div>
                  </div>
                  <div className="hidden sm:block h-16 w-px bg-white/20" />
                  <div className="grid grid-cols-2 sm:flex sm:flex-row gap-6 sm:gap-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-white/60 uppercase">Points</span>
                      <div className="h-px w-full border-b border-dashed border-white/30" />
                      <span className="text-lg font-semibold text-white mt-1">{totalPoints.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-white/60 uppercase">Active</span>
                      <div className="h-px w-full border-b border-dashed border-white/30" />
                      <span className="text-lg font-semibold text-white mt-1">{stats?.active ?? 0}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-white/60 uppercase">Win rate</span>
                      <div className="h-px w-full border-b border-dashed border-white/30" />
                      <span className={`text-lg font-semibold mt-1 ${stats?.winRate > 50 ? "text-[#22c55e]" : "text-white"}`}>
                        {stats?.winRate != null ? `${stats.winRate.toFixed(1)}%` : "0%"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Link
              to="/markets"
              className="h-10 rounded-full bg-[var(--color-accent-primary)] px-6 text-sm font-bold text-black hover:bg-[var(--color-accent-primary-hover)] transition-colors inline-flex items-center justify-center"
            >
              Browse Markets
            </Link>
            <Link
              to="/create-market"
              className="h-10 rounded-full border border-white/40 bg-white/5 px-6 text-sm font-medium text-white hover:bg-white/10 transition-colors inline-flex items-center justify-center"
            >
              Create Market
            </Link>
            <Link
              to="/leaderboard"
              className="h-10 rounded-full border border-white/40 bg-white/5 px-6 text-sm font-medium text-white hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>🏆</span> Leaderboard
            </Link>
            <Link
              to="/share/twitter"
              className="h-10 rounded-full border border-white/40 bg-white/5 px-6 text-sm font-medium text-white hover:bg-white/10 transition-colors inline-flex items-center justify-center"
            >
              Share (Twitter)
            </Link>
            <Link
              to="/share/telegram"
              className="h-10 rounded-full border border-white/40 bg-white/5 px-6 text-sm font-medium text-white hover:bg-white/10 transition-colors inline-flex items-center justify-center"
            >
              Share (Telegram)
            </Link>
          </div>

          {/* Referral card */}
          {referralStats?.referralCode && (
            <div className="mb-6 rounded-2xl border border-white/20 bg-[rgba(255,255,255,0.04)] backdrop-blur-sm p-5 sm:p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg border border-white/30 flex items-center justify-center text-lg">🎁</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Referral Program</h3>
                    <p className="text-sm text-white/60">
                      Total referrals: <span className="text-[var(--color-accent-primary)] font-semibold">{referralStats.totalReferrals}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 bg-[#111] border border-white/20 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
                <button
                  onClick={copyReferralLink}
                  className="h-12 rounded-xl bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary-hover)] text-black font-bold px-6 text-sm transition-colors whitespace-nowrap"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
              <p className="text-white/50 text-xs mt-3">Share and earn 100 points per referral.</p>
            </div>
          )}

          {/* Trading Summary */}
          <div className="mb-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-md border border-white/40 flex items-center justify-center">
                <svg className="h-4 w-4 text-white rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16.5 16.2L7.5 7.8" />
                  <path d="M16.6 10.6L16.5 16.2L10.4 16.3" />
                </svg>
              </div>
              <div className="h-9 rounded-lg bg-[var(--color-accent-primary)] px-4 flex items-center">
                <span className="font-semibold text-[#111] text-lg">Trading Summary</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-transparent overflow-hidden">
              <div className="p-5 sm:p-6 lg:p-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-white/20">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white/80">Total positions</span>
                      <span className="text-sm font-semibold text-white">{positions.length}</span>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm text-white/70">Total staked</span>
                      <span className="text-sm text-white">${totalStaked.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="lg:pl-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white/80">Price predictions</span>
                      <span className="text-sm font-semibold text-white">{predictions.length}</span>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm text-white/70">Prediction value</span>
                      <span className="text-sm text-white">${totalPredictionsValue.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="lg:pl-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white/80">Total trades</span>
                      <span className="text-sm font-semibold text-white">{totalTradesCount}</span>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm text-white/70">Win rate</span>
                      <span className="text-sm text-white">{stats?.winRate != null ? `${stats.winRate.toFixed(1)}%` : "0%"}</span>
                    </div>
                  </div>
                  <div className="lg:pl-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white/80">Points</span>
                      <span className="text-sm font-semibold text-[var(--color-accent-primary)]">{totalPoints.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details section with tabs (Positions | Predictions) */}
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <div className="h-8 w-8 rounded-md border border-white/40 flex items-center justify-center">
                <svg className="h-4 w-4 text-white rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16.5 16.2L7.5 7.8" />
                  <path d="M16.6 10.6L16.5 16.2L10.4 16.3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Details</h3>
              <div className="flex border border-white/30 rounded-lg overflow-hidden h-9">
                <button
                  type="button"
                  onClick={() => setDetailsTab("positions")}
                  className={`px-4 text-sm font-medium transition-colors ${detailsTab === "positions" ? "bg-white/15 text-white" : "text-white/60 hover:text-white"}`}
                >
                  Positions
                </button>
                <div className="w-px h-6 self-center bg-white/30" />
                <button
                  type="button"
                  onClick={() => setDetailsTab("predictions")}
                  className={`px-4 text-sm font-medium transition-colors ${detailsTab === "predictions" ? "bg-white/15 text-white" : "text-white/60 hover:text-white"}`}
                >
                  Price Predictions
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-[rgba(7,7,7,0.93)] overflow-hidden">
              <div className="p-4 sm:p-6">
                {loading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--color-accent-primary)] border-t-transparent mx-auto mb-4" />
                    <p className="text-white/60">Loading...</p>
                  </div>
                ) : detailsTab === "positions" ? (
                  positions.length === 0 ? (
                    <div className="text-center py-16">
                      <Icon name="Wallet" size={56} className="mx-auto mb-4 text-white/30" />
                      <p className="text-white/80 text-lg mb-2">No positions yet</p>
                      <p className="text-white/50 text-sm mb-6">Your market positions will appear here.</p>
                      <Link
                        to="/markets"
                        className="inline-flex items-center justify-center h-10 rounded-full bg-[var(--color-accent-primary)] text-black font-bold px-6 text-sm hover:bg-[var(--color-accent-primary-hover)] transition-colors"
                      >
                        Browse Markets
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {positions.map((position) => (
                        <div
                          key={position.id}
                          className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 hover:border-white/20 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-semibold truncate pr-2">{position.market}</h4>
                              <p className="text-white/50 text-sm mt-1">{position.recentTrades}</p>
                            </div>
                            <span
                              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold ${
                                position.outcome === "YES" || position.outcome === "LONG"
                                  ? "bg-[var(--color-accent-primary)] text-black"
                                  : "bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/50"
                              }`}
                            >
                              {position.outcome}
                            </span>
                          </div>
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                            <div>
                              <p className="text-xs text-white/50 uppercase tracking-wider">Staked</p>
                              <p className="text-white font-semibold">${(position.totalStaked || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/50 uppercase tracking-wider">Price</p>
                              <p className="text-white font-semibold">${(position.price || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/50 uppercase tracking-wider">Trades</p>
                              <p className="text-white font-semibold">{position.trades ?? 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/50 uppercase tracking-wider">Value</p>
                              <p className="text-white font-semibold">${(position.value || 0).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  predictions.length === 0 ? (
                    <div className="text-center py-16">
                      <Icon name="Wallet" size={56} className="mx-auto mb-4 text-white/30" />
                      <p className="text-white/80 text-lg mb-2">No price predictions</p>
                      <p className="text-white/50 text-sm mb-6">Your price predictions will appear here.</p>
                      <Link
                        to="/price-prediction"
                        className="inline-flex items-center justify-center h-10 rounded-full bg-[var(--color-accent-primary)] text-black font-bold px-6 text-sm hover:bg-[var(--color-accent-primary-hover)] transition-colors"
                      >
                        Price Prediction
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {predictions.map((pred) => (
                        <div
                          key={pred.id}
                          className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 hover:border-white/20 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-semibold">{pred.symbol}</h4>
                              <p className="text-white/50 text-sm mt-1">
                                {pred.direction} · Target ${(pred.targetPrice || 0).toFixed(2)}
                              </p>
                            </div>
                            <span className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white border border-white/20">
                              {pred.status || "Active"}
                            </span>
                          </div>
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                            <div>
                              <p className="text-xs text-white/50 uppercase tracking-wider">Amount</p>
                              <p className="text-white font-semibold">${(pred.amount || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/50 uppercase tracking-wider">Current</p>
                              <p className="text-white font-semibold">${(pred.currentPrice || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/50 uppercase tracking-wider">Target</p>
                              <p className="text-white font-semibold">${(pred.targetPrice || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/50 uppercase tracking-wider">P/L</p>
                              <p
                                className={`font-semibold ${
                                  pred.profitLoss != null && pred.profitLoss >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"
                                }`}
                              >
                                {pred.profitLoss != null ? `$${Number(pred.profitLoss).toFixed(2)}` : "---"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;
