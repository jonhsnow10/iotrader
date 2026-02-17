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

  // Format wallet address
  const formatAddress = (addr) => {
    if (!addr) return "Not Connected";
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  // Fetch user data from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch positions, predictions, points, and referral stats in parallel
        const [trades, priceBets, userStats, points, referralData] = await Promise.all([
          getUserPositions(address),
          getUserPredictions(address),
          getUserStats(address),
          getUserPoints(address),
          getReferralStats(address),
        ]);

        // Transform trades to positions format
        const positionsData = await Promise.all(
          trades.map(async (trade) => {
            const market = await getMarketById(trade.marketId);
            return {
              id: trade.id,
              market: market?.title || "Unknown Market",
              outcome: trade.side,
              totalStaked: trade.amount,
              recentTrades: trade.timestamp?.toDate 
                ? trade.timestamp.toDate().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : "Unknown",
              trades: 1, // Could aggregate if needed
              price: trade.price,
              value: trade.amount,
            };
          })
        );

        // Transform predictions
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
        
        // Get referral link
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

  // Mock positions data for fallback
  const mockPositions = [
    {
      id: 1,
      market: "BNB all time high by December 31?",
      outcome: "YES",
      totalStaked: 0.0,
      recentTrades: "Dec 1, 02:22 PM",
      trades: 1,
      price: 0.52,
      value: 0.0,
    },
    {
      id: 2,
      market: "Unknown Market",
      outcome: "YES",
      totalStaked: 0.12,
      recentTrades: "Dec 1, 01:15 PM",
      trades: 3,
      price: 0.45,
      value: 0.12,
    },
  ];

  const totalStaked = positions.reduce((sum, pos) => sum + (pos.totalStaked || 0), 0);
  const totalPredictions = predictions.reduce((sum, pred) => sum + (pred.amount || 0), 0);

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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2" style={{ fontFamily: 'monospace' }}>
              My Dashboard
            </h1>
            <p className="text-gray-400 text-sm">Wallet: <span className="text-yellow-500 font-mono">{isConnected ? formatAddress(address) : "Not Connected"}</span></p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Points Card */}
            <div className="border border-yellow-500 rounded-lg p-6 bg-[#0a0a0a] hover:border-yellow-400 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-400 text-sm">Total Points</p>
                <span className="text-yellow-500 text-2xl">⭐</span>
              </div>
              <p className="text-white font-black text-3xl mb-4" style={{ fontFamily: 'monospace' }}>
                {totalPoints.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <Link
                  to="/share/twitter"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black py-2 px-3 rounded text-center transition-colors"
                >
                  Twitter
                </Link>
                <Link
                  to="/share/telegram"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black py-2 px-3 rounded text-center transition-colors"
                >
                  Telegram
                </Link>
              </div>
            </div>

            {/* Total Staked Card */}
            <div className="border border-yellow-500 rounded-lg p-6 bg-[#0a0a0a] hover:border-yellow-400 transition-colors">
              <p className="text-gray-400 text-sm mb-3">Total Staked</p>
              <p className="text-white font-black text-3xl" style={{ fontFamily: 'monospace' }}>
                ${(totalStaked + totalPredictions).toFixed(2)}
              </p>
            </div>

            {/* Active Predictions Card */}
            {stats && (
              <>
                <div className="border border-yellow-500 rounded-lg p-6 bg-[#0a0a0a] hover:border-yellow-400 transition-colors">
                  <p className="text-gray-400 text-sm mb-3">Active Predictions</p>
                  <p className="text-white font-black text-3xl" style={{ fontFamily: 'monospace' }}>
                    {stats.active || 0}
                  </p>
                </div>

                <div className="border border-yellow-500 rounded-lg p-6 bg-[#0a0a0a] hover:border-yellow-400 transition-colors">
                  <p className="text-gray-400 text-sm mb-3">Win Rate</p>
                  <p className="text-white font-black text-3xl" style={{ fontFamily: 'monospace' }}>
                    {stats.winRate ? `${stats.winRate.toFixed(1)}%` : '0%'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Referral Section */}
          {referralStats && referralStats.referralCode && (
            <div className="mb-6 border border-yellow-500 rounded-lg p-6 bg-[#0a0a0a]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-black text-xl mb-1" style={{ fontFamily: 'monospace' }}>Referral Program</h3>
                  <p className="text-gray-400 text-sm">Total Referrals: <span className="text-yellow-500 font-bold">{referralStats.totalReferrals}</span></p>
                </div>
                <div className="text-yellow-500 text-3xl">🎁</div>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 bg-[#111111] border border-yellow-500 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-yellow-400"
                />
                <button
                  onClick={copyReferralLink}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 px-6 rounded-lg text-sm transition-colors whitespace-nowrap"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-3">Share this link and earn 100 points per referral!</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              to="/markets"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 px-6 rounded-lg text-center transition-colors"
            >
              Browse Markets
            </Link>
            <Link
              to="/create-market"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 px-6 rounded-lg text-center transition-colors"
            >
              Create Market
            </Link>
            <Link
              to="/leaderboard"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 px-6 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
            >
              <span>🏆</span>
              Leaderboard
            </Link>
          </div>

          {/* Your Positions Section */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'monospace' }}>
                Your Positions
              </h2>
            </div>
            
            {loading ? (
              <div className="text-center py-16 border border-yellow-500 rounded-lg bg-[#0a0a0a]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading positions...</p>
              </div>
            ) : positions.length === 0 ? (
              <div className="text-center py-16 border border-yellow-500 rounded-lg bg-[#0a0a0a]">
                <Icon name="Wallet" size={64} className="mx-auto mb-4 text-yellow-500/50" />
                <p className="text-gray-400 mb-2 text-lg">No positions found</p>
                <p className="text-gray-500 text-sm mb-6">Start trading to see your positions here</p>
                <Link
                  to="/markets"
                  className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 px-8 rounded-lg transition-colors"
                >
                  Browse Markets
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {positions.map((position) => (
                  <div
                    key={position.id}
                    className="border border-yellow-500 rounded-lg p-6 bg-[#0a0a0a] hover:border-yellow-400 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-2">{position.market}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-black ${
                        position.outcome === 'YES' || position.outcome === 'LONG'
                          ? 'bg-yellow-500 text-black'
                          : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500'
                      }`}>
                        {position.outcome}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Total Staked</p>
                        <p className="text-white font-bold text-lg">${position.totalStaked.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Price</p>
                        <p className="text-white font-bold text-lg">${position.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Trades</p>
                        <p className="text-white font-bold text-lg">{position.trades}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Date</p>
                        <p className="text-white font-bold text-sm">{position.recentTrades}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;
