import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { useWallet } from "../hooks/useWallet";
import { awardSocialSharePoints, POINT_VALUES } from "../services/pointsService";
import Icon from "../components/Icon";

const SocialShare = () => {
  const { platform } = useParams();
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [points, setPoints] = useState(0);

  const isTwitter = platform === "twitter";
  const isTelegram = platform === "telegram";

  useEffect(() => {
    if (!isTwitter && !isTelegram) {
      navigate("/");
    }
  }, [platform, navigate, isTwitter, isTelegram]);

  useEffect(() => {
    if (isTwitter) {
      setPoints(POINT_VALUES.TWITTER_SHARE);
    } else if (isTelegram) {
      setPoints(POINT_VALUES.TELEGRAM_SHARE);
    }
  }, [isTwitter, isTelegram]);

  const handleShare = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first!");
      return;
    }

    if (claimed) {
      alert("You have already claimed points for this action!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await awardSocialSharePoints(
        address,
        isTwitter ? "twitter" : "telegram"
      );

      if (result.success) {
        setClaimed(true);
        alert(`Success! You earned ${result.points} points!`);
      } else {
        setError(result.error || "Failed to claim points");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getShareUrl = () => {
    const text = encodeURIComponent(
      "🚀 Join me on IO Trading - The future of decentralized trading! Trade crypto futures and predictions with high leverage. #CryptoTrading #DeFi"
    );
    const url = encodeURIComponent(window.location.origin);

    if (isTwitter) {
      return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    } else if (isTelegram) {
      return `https://t.me/share/url?url=${url}&text=${text}`;
    }
    return "#";
  };

  const handleOpenShare = () => {
    const shareUrl = getShareUrl();
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  return (
    <Layout activePage="social-share">
      <SEO
        title={`Share on ${isTwitter ? "Twitter" : "Telegram"} - Earn Points`}
        description={`Share IO Trader on ${isTwitter ? "Twitter" : "Telegram"} and earn ${points} points instantly. Join the decentralized prediction market platform and get rewarded for sharing.`}
        keywords={`social share, ${isTwitter ? "twitter" : "telegram"}, earn points, referral, share and earn, prediction market`}
        url={`/share/${platform}`}
      />
      <div className="min-h-screen pt-6 pb-20 px-4 lg:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6" style={{ fontFamily: 'monospace' }}>
              Share on {isTwitter ? "Twitter" : "Telegram"}
            </h1>
          </div>

          <div className="border border-yellow-500 rounded-lg p-6 bg-[#0a0a0a]">
            {!isConnected ? (
              <div className="text-center py-10">
                <Icon name="Wallet" size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-4">Please connect your wallet to claim points</p>
                <button
                  onClick={() => navigate("/")}
                  className="bg-yellow-500 text-black font-black py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">
                    {isTwitter ? "🐦" : "✈️"}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Share and Earn {points} Points!
                  </h2>
                  <p className="text-gray-400">
                    Share {isTwitter ? "on Twitter" : "on Telegram"} and get {points} points instantly
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {claimed ? (
                  <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-4">✅</div>
                    <p className="text-green-400 font-bold text-lg mb-2">
                      Points Claimed Successfully!
                    </p>
                    <p className="text-gray-400 text-sm">
                      You earned {points} points for sharing on {isTwitter ? "Twitter" : "Telegram"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-[#263d55] border border-[#f3b340] rounded-lg p-4 mb-4">
                      <h3 className="text-white font-bold mb-2">How it works:</h3>
                      <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
                        <li>Click the share button below</li>
                        <li>Share the post on {isTwitter ? "Twitter" : "Telegram"}</li>
                        <li>Come back and click "Claim Points"</li>
                        <li>Get {points} points instantly!</li>
                      </ol>
                    </div>

                    <button
                      onClick={handleOpenShare}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <span>{isTwitter ? "🐦" : "✈️"}</span>
                      <span>Share on {isTwitter ? "Twitter" : "Telegram"}</span>
                    </button>

                    <button
                      onClick={handleShare}
                      disabled={loading || claimed}
                      className="w-full gold-gradient text-black font-black py-4 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Processing..." : "Claim Points"}
                    </button>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-yellow-500/30">
                  <button
                    onClick={() => navigate("/user-dashboard")}
                    className="w-full bg-white text-black font-black py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SocialShare;
