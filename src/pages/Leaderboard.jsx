import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { useWallet } from "../hooks/useWallet";
import { getTopUsersByPoints, getUserRank } from "../services/leaderboardService";
import { getUserPositions, getMarketById } from "../services/marketService";
import { awardSocialSharePoints, hasClaimedPoints, POINT_VALUES, getUserPoints } from "../services/pointsService";
import Icon from "../components/Icon";

const Leaderboard = () => {
  const { address, isConnected } = useWallet();
  const [topUsers, setTopUsers] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userTasks, setUserTasks] = useState({}); // Store tasks for each user
  const [selectedUser, setSelectedUser] = useState(null); // Selected user to show details
  const [taskStatus, setTaskStatus] = useState({
    twitter: false,
    telegram: false,
  });
  const [claimingTask, setClaimingTask] = useState(null);

  // Format wallet address
  const formatAddress = (addr) => {
    if (!addr) return "Not Connected";
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        
        // Get top 10 users
        const users = await getTopUsersByPoints(10);
        
        setTopUsers(users);

        // Get current user's rank if connected
        if (isConnected && address) {
          const rank = await getUserRank(address);
          setUserRank(rank);
        }

        // Fetch tasks/positions for each user
        const tasksMap = {};
        await Promise.all(
          users.map(async (user) => {
            try {
              // Fetch positions
              const positions = await getUserPositions(user.address);
              // Get market details for each position
              const tasksWithMarkets = await Promise.all(
                positions.slice(0, 10).map(async (position) => {
                  const market = await getMarketById(position.marketId);
                  return {
                    id: position.id,
                    market: market?.title || "Unknown Market",
                    outcome: position.side,
                    amount: position.amount,
                    price: position.price,
                    timestamp: position.timestamp,
                  };
                })
              );
              tasksMap[user.address] = tasksWithMarkets;
            } catch (error) {
              console.error(`Error fetching tasks for ${user.address}:`, error);
              tasksMap[user.address] = [];
            }
          })
        );
        setUserTasks(tasksMap);
        
        // Set selected user to current user if connected, otherwise first user
        if (isConnected && address) {
          const currentUser = users.find(u => u.address?.toLowerCase() === address.toLowerCase());
          
          // If current user is in top 10, use that data, otherwise fetch their actual points
          if (currentUser) {
            // Verify points are correct by fetching directly from database
            const actualPoints = await getUserPoints(address);
            setSelectedUser({
              ...currentUser,
              totalPoints: actualPoints, // Use actual points from database
            });
          } else {
            // User not in top 10, fetch their actual data
            const actualPoints = await getUserPoints(address);
            const userRank = await getUserRank(address);
            setSelectedUser({
              id: address.toLowerCase(),
              address: address,
              totalPoints: actualPoints,
              rank: userRank || users.length + 1,
            });
          }
          
          // Check task completion status
          const [twitterClaimed, telegramClaimed] = await Promise.all([
            hasClaimedPoints(address, 'twitter_share'),
            hasClaimedPoints(address, 'telegram_share'),
          ]);
          setTaskStatus({
            twitter: twitterClaimed,
            telegram: telegramClaimed,
          });
        } else if (users.length > 0) {
          setSelectedUser(users[0]);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [isConnected, address]);

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-300 shadow-lg shadow-yellow-500/50">
            <span className="text-2xl">👑</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border-2 border-gray-200 shadow-lg shadow-gray-400/50">
            <span className="text-2xl">🥈</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-orange-600 border-2 border-orange-200 shadow-lg shadow-orange-400/50">
            <span className="text-2xl">🥉</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#263d55] border border-yellow-500">
            <span className="text-yellow-500 font-black text-sm">{rank}</span>
          </div>
        );
    }
  };

  const getRankCardStyle = (rank) => {
    switch (rank) {
      case 1:
        return "border-yellow-500 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 shadow-lg shadow-yellow-500/30";
      case 2:
        return "border-gray-400 bg-gradient-to-br from-gray-400/20 to-gray-500/10 shadow-lg shadow-gray-400/30";
      case 3:
        return "border-orange-500 bg-gradient-to-br from-orange-500/20 to-orange-600/10 shadow-lg shadow-orange-500/30";
      default:
        return "border-yellow-500 bg-[#0a0a0a]";
    }
  };

  const isCurrentUser = (userAddress) => {
    if (!isConnected || !address) return false;
    return userAddress?.toLowerCase() === address.toLowerCase();
  };

  const handleSocialShare = async (platform) => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first!");
      return;
    }

    setClaimingTask(platform);
    try {
      const result = await awardSocialSharePoints(address, platform);
      if (result.success) {
        setTaskStatus(prev => ({ ...prev, [platform]: true }));
        alert(`Success! You earned ${result.points} points!`);
        // Refresh leaderboard to update points
        window.location.reload();
      } else {
        alert(result.error || "Failed to claim points");
      }
    } catch (error) {
      console.error("Error claiming points:", error);
      alert("An error occurred while claiming points");
    } finally {
      setClaimingTask(null);
    }
  };

  const getShareUrl = (platform) => {
    const text = encodeURIComponent("Check out this amazing prediction market platform! 🚀");
    const url = encodeURIComponent(window.location.origin);
    if (platform === 'twitter') {
      return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    } else if (platform === 'telegram') {
      return `https://t.me/share/url?url=${url}&text=${text}`;
    }
    return '#';
  };


  return (
    <Layout activePage="leaderboard">
      <SEO
        title="Leaderboard - Top Traders by Points"
        description="View the top traders ranked by points on IO Trader. See rankings, completed tasks, and compete to climb the leaderboard. Track your rank and performance."
        keywords="leaderboard, top traders, rankings, points, trading competition, top performers, trader rankings"
        url="/leaderboard"
      />
      <div className="min-h-screen pt-4 pb-4 px-4 lg:px-4 bg-gradient-to-b from-[#050505] to-[#0a0a0a]">
        <div className="max-w-[100%] mx-auto">
          {/* Header Section */}
          <div className="mb-4 text-center animate-fade-in-up">
            <div className="inline-block mb-2">
              <span className="text-4xl">🏆</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2" style={{ fontFamily: 'monospace' }}>
              Leaderboard
            </h1>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <p className="text-gray-400 text-sm">
                Top 10 traders ranked by points
              </p>
              {userRank && (
                <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded-full">
                  <span className="text-yellow-500 font-black text-xs" style={{ fontFamily: 'monospace' }}>
                    Your Rank: #{userRank}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Top 3 Podium */}
          {!loading && topUsers.length >= 3 && (
            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-full mx-auto">
                {/* 2nd Place */}
                <div className="order-2 md:order-1 transform md:scale-90 md:translate-y-4">
                  <div className="relative border-2 border-gray-400 rounded-xl p-4 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm shadow-xl">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border-3 border-gray-200 shadow-lg flex items-center justify-center">
                        <span className="text-2xl">🥈</span>
                      </div>
                    </div>
                    <div className="pt-6 text-center">
                      <p className="text-gray-300 text-xs font-black uppercase mb-1 tracking-wider">2nd Place</p>
                      <p className="text-white font-black text-lg mb-2 font-mono">
                        {formatAddress(topUsers[1]?.address)}
                      </p>
                      <div className="flex items-center justify-center gap-2 bg-gray-800/50 rounded-lg py-1.5 px-3">
                        <p className="text-gray-200 font-black text-xl font-mono">
                          {topUsers[1]?.totalPoints?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1st Place - Champion */}
                <div className="order-1 md:order-2 relative z-10">
                  <div className="relative border-2 border-yellow-500 rounded-xl p-5 bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 backdrop-blur-sm shadow-xl shadow-yellow-500/30">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="text-4xl animate-bounce">👑</div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="pt-5 text-center">
                      <p className="text-yellow-400 text-xs font-black uppercase mb-1 tracking-wider">CHAMPION</p>
                      <p className="text-white font-black text-xl mb-2 font-mono">
                        {formatAddress(topUsers[0]?.address)}
                      </p>
                      <div className="flex items-center justify-center gap-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg py-2 px-4">
                        <p className="text-yellow-400 font-black text-2xl font-mono">
                          {topUsers[0]?.totalPoints?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="order-3 transform md:scale-90 md:translate-y-4">
                  <div className="relative border-2 border-orange-500 rounded-xl p-4 bg-gradient-to-br from-orange-900/50 to-orange-800/30 backdrop-blur-sm shadow-xl">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-orange-600 border-3 border-orange-200 shadow-lg flex items-center justify-center">
                        <span className="text-2xl">🥉</span>
                      </div>
                    </div>
                    <div className="pt-6 text-center">
                      <p className="text-orange-300 text-xs font-black uppercase mb-1 tracking-wider">3rd Place</p>
                      <p className="text-white font-black text-lg mb-2 font-mono">
                        {formatAddress(topUsers[2]?.address)}
                      </p>
                      <div className="flex items-center justify-center gap-2 bg-orange-800/50 rounded-lg py-1.5 px-3">
                        <p className="text-orange-200 font-black text-xl font-mono">
                          {topUsers[2]?.totalPoints?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Two Column Layout: Table on Left, User Details on Right */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-400 text-sm">Loading leaderboard...</p>
            </div>
          ) : topUsers.length === 0 ? (
            <div className="text-center py-12 border-2 border-yellow-500/30 rounded-xl bg-[#0a0a0a]/50 backdrop-blur-sm">
              <Icon name="Trophy" size={60} className="mx-auto mb-4 text-yellow-500/30" />
              <p className="text-gray-300 mb-2 text-lg font-bold">No users yet</p>
              <p className="text-gray-500 text-xs mb-6">Be the first to earn points and claim the throne!</p>
              <Link
                to="/markets"
                className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-sm"
              >
                Start Trading
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Side - Rankings Table */}
              <div className="lg:col-span-2 bg-[#0a0a0a]/80 backdrop-blur-sm border-2 border-yellow-500/30 rounded-xl overflow-hidden shadow-xl">
                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-b-2 border-yellow-500/30 px-4 py-2">
                  <h2 className="text-lg font-black text-white" style={{ fontFamily: 'monospace' }}>
                    Rankings
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#111111]/50 border-b border-yellow-500/20">
                        <th className="px-3 py-2 text-left">
                          <span className="text-yellow-500 text-xs font-black uppercase tracking-wider" style={{ fontFamily: 'monospace' }}>
                            Rank
                          </span>
                        </th>
                        <th className="px-3 py-2 text-left">
                          <span className="text-yellow-500 text-xs font-black uppercase tracking-wider" style={{ fontFamily: 'monospace' }}>
                            Wallet
                          </span>
                        </th>
                        <th className="px-3 py-2 text-right">
                          <span className="text-yellow-500 text-xs font-black uppercase tracking-wider" style={{ fontFamily: 'monospace' }}>
                            Points
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-yellow-500/10">
                      {topUsers.map((user, index) => {
                        const isUser = isCurrentUser(user.address);
                        const isSelected = selectedUser?.address === user.address;
                        return (
                          <tr
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`group transition-all cursor-pointer ${
                              isSelected
                                ? "bg-yellow-500/20 border-l-4 border-yellow-500"
                                : isUser 
                                  ? "bg-yellow-500/10 border-l-4 border-yellow-500/50" 
                                  : "hover:bg-[#111111]/30"
                            }`}
                          >
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                  isSelected || isUser
                                    ? "bg-yellow-500/20 border-yellow-500" 
                                    : "bg-[#263d55] border-yellow-500/50"
                                }`}>
                                  <span className={`font-black text-sm ${isSelected || isUser ? "text-yellow-400" : "text-yellow-500"}`}>
                                    {user.rank}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <p className={`font-bold text-sm font-mono ${
                                isSelected || isUser ? "text-yellow-400" : "text-white"
                              }`}>
                                {formatAddress(user.address)}
                                {isUser && (
                                  <span className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-black text-xs font-black rounded">
                                    YOU
                                  </span>
                                )}
                              </p>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <p className={`font-black text-lg font-mono ${
                                  isSelected || isUser ? "text-yellow-400" : "text-yellow-500"
                                }`}>
                                  {user.totalPoints?.toLocaleString() || 0}
                                </p>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Side - User Tasks and Points */}
              <div className="lg:col-span-1 bg-[#0a0a0a]/80 backdrop-blur-sm border-2 border-yellow-500/30 rounded-xl overflow-hidden shadow-xl">
                {selectedUser ? (
                  <>
                    <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-b-2 border-yellow-500/30 px-4 py-3">
                      <h2 className="text-lg font-black text-white mb-1" style={{ fontFamily: 'monospace' }}>
                        User Details
                      </h2>
                      <p className="text-yellow-400 text-sm font-mono">
                        {formatAddress(selectedUser.address)}
                        {isCurrentUser(selectedUser.address) && (
                          <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-black text-xs font-black rounded">
                            YOU
                          </span>
                        )}
                      </p>
                    </div>
                    
                    <div className="p-4">
                      {/* Points Display */}
                      <div className="mb-4 border border-yellow-500/30 rounded-lg p-4 bg-yellow-500/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Total Points</span>
                          <span className="text-yellow-500 text-xl">⭐</span>
                        </div>
                        <p className="text-white font-black text-3xl font-mono">
                          {selectedUser.totalPoints?.toLocaleString() || 0}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">Rank #{selectedUser.rank}</p>
                      </div>

                      {/* Climb the Leaderboard Tasks */}
                      {isConnected && (
                        <div className="mb-4 border border-yellow-500/30 rounded-lg p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                          <h3 className="text-white font-black text-sm mb-3" style={{ fontFamily: 'monospace' }}>
                            Climb the Leaderboard! 🚀
                          </h3>
                          <div className="space-y-2">
                            {/* Twitter Share Task */}
                            <div className="border border-yellow-500/30 rounded-lg p-3 bg-[#0a0a0a]/50">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">🐦</span>
                                  <h4 className="text-white font-bold text-xs">Share on Twitter</h4>
                                </div>
                                <span className="text-yellow-500 font-black text-xs">+{POINT_VALUES.TWITTER_SHARE} pts</span>
                              </div>
                              {taskStatus.twitter ? (
                                <div className="bg-green-500/20 border border-green-500/50 rounded px-2 py-1.5 text-center">
                                  <p className="text-green-400 text-xs font-bold">✓ Completed</p>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  <a
                                    href={getShareUrl('twitter')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-1.5 px-3 rounded text-center text-xs transition-colors"
                                  >
                                    Share on Twitter
                                  </a>
                                  <button
                                    onClick={() => handleSocialShare('twitter')}
                                    disabled={claimingTask === 'twitter'}
                                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-1.5 px-3 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {claimingTask === 'twitter' ? 'Processing...' : 'Claim Points'}
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Telegram Share Task */}
                            <div className="border border-yellow-500/30 rounded-lg p-3 bg-[#0a0a0a]/50">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">✈️</span>
                                  <h4 className="text-white font-bold text-xs">Share on Telegram</h4>
                                </div>
                                <span className="text-yellow-500 font-black text-xs">+{POINT_VALUES.TELEGRAM_SHARE} pts</span>
                              </div>
                              {taskStatus.telegram ? (
                                <div className="bg-green-500/20 border border-green-500/50 rounded px-2 py-1.5 text-center">
                                  <p className="text-green-400 text-xs font-bold">✓ Completed</p>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  <a
                                    href={getShareUrl('telegram')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-1.5 px-3 rounded text-center text-xs transition-colors"
                                  >
                                    Share on Telegram
                                  </a>
                                  <button
                                    onClick={() => handleSocialShare('telegram')}
                                    disabled={claimingTask === 'telegram'}
                                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-1.5 px-3 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {claimingTask === 'telegram' ? 'Processing...' : 'Claim Points'}
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Trading Task */}
                            <div className="border border-yellow-500/30 rounded-lg p-3 bg-[#0a0a0a]/50">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">📈</span>
                                  <h4 className="text-white font-bold text-xs">Start Trading</h4>
                                </div>
                                <span className="text-yellow-500 font-black text-xs">+10+ pts</span>
                              </div>
                              <Link
                                to="/markets"
                                className="block w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-1.5 px-3 rounded text-center text-xs transition-colors"
                              >
                                Go to Markets
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tasks Section */}
                      <div>
                        <h3 className="text-white font-black text-base mb-3" style={{ fontFamily: 'monospace' }}>
                          Completed Tasks
                        </h3>
                        {userTasks[selectedUser.address]?.length > 0 ? (
                          <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {userTasks[selectedUser.address].map((task) => (
                              <div key={task.id} className="border border-yellow-500/20 rounded-lg p-3 bg-[#111111]/50 hover:border-yellow-500/40 transition-colors">
                                <p className="text-white font-bold text-sm mb-2 line-clamp-2">
                                  {task.market}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs px-2 py-1 rounded font-bold ${
                                    task.outcome === 'YES' || task.outcome === 'LONG' 
                                      ? 'bg-yellow-500/30 text-yellow-300' 
                                      : 'bg-gray-600/30 text-gray-300'
                                  }`}>
                                    {task.outcome}
                                  </span>
                                  <div className="text-right">
                                    <p className="text-yellow-500 text-sm font-bold">${task.amount?.toFixed(2) || '0.00'}</p>
                                    <p className="text-gray-500 text-xs">Staked</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 border border-yellow-500/20 rounded-lg bg-[#111111]/30">
                            <Icon name="Wallet" size={40} className="mx-auto mb-2 text-yellow-500/30" />
                            <p className="text-gray-400 text-sm">No tasks completed yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center py-12">
                    <p className="text-gray-400 text-sm">Select a user to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;
