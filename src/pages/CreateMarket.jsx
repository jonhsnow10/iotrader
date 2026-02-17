import React, { useState } from "react";
import Layout from "../components/Layout";
import Icon from "../components/Icon";
import SEO from "../components/SEO";
import { useWallet } from "../hooks/useWallet";
import { createMarket, addActivity } from "../services/marketService";
import { saveUserWallet } from "../services/userService";

const CreateMarket = () => {
  const { isConnected, address } = useWallet();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    category: "crypto",
    endDate: "",
    description: "",
    imageUrl: "",
  });

  const categories = [
    { id: "crypto", name: "Crypto", icon: "Globe" },
    { id: "sports", name: "Sports", icon: "Trophy" },
    { id: "politics", name: "Politics", icon: "Libra" },
    { id: "entertainment", name: "Entertainment", icon: "Tv" },
    { id: "economy", name: "Economy", icon: "Activity" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const creatorAddress = address || "0x0000000000000000000000000000000000000000";

    if (!formData.question || !formData.endDate) {
      alert("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      await saveUserWallet(creatorAddress);

      const closingTime = new Date(formData.endDate);
      if (closingTime <= new Date()) {
        alert("End date must be in the future");
        setIsCreating(false);
        return;
      }

      const duration = Math.floor((closingTime.getTime() - Date.now()) / 1000);
      
      const pair = "BTC";
      
      const targetPrice = "100000";
      
      const stakeInUSDT = false;

      const txHash = "mock_" + Date.now();

      const marketData = {
        title: formData.question,
        category: formData.category || "general",
        creatorAddress: creatorAddress,
        transactionHash: txHash,
        closingTime: closingTime,
        yesPrice: 0.5,
        noPrice: 0.5,
      };

      const newMarket = await createMarket(marketData);

      await addActivity({
        type: "market_created",
        marketId: newMarket.id,
        walletAddress: creatorAddress,
        action: `Created market: ${formData.question} (TX: ${txHash.slice(0, 10)}...)`,
      });

      alert("Market created (demo mode).");

      setFormData({
        question: "",
        category: "crypto",
        endDate: "",
        description: "",
        imageUrl: "",
      });

    } catch (error) {
      console.error("Error creating market:", error);
      alert(`Failed to create market: ${error.message || "Please try again."}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout activePage="create-market">
      <SEO
        title="Create Market - Build Your Own Prediction Market"
        description="Create your own prediction market on IO Trader. Set questions, choose assets, and let others trade on your market. Built on BSC blockchain."
        keywords="create prediction market, build market, custom market, prediction market creation, DeFi markets, blockchain markets"
        url="/create-market"
      />
      <div className="min-h-screen pt-6 pb-20 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 mb-2">
              Create Market
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Create your own prediction market and let others trade on it
            </p>
          </div>

          {!isConnected && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg animate-fade-in-up">
              <div className="flex items-center gap-3">
                <Icon name="Wallet" size={20} className="text-yellow-500" />
                <div>
                  <p className="text-white font-bold text-sm">Wallet Not Connected</p>
                  <p className="text-gray-400 text-xs">
                    Connect your wallet to create a market. Market creation fee: 50 USDT
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 animate-fade-in-up">
              <label className="block text-white font-bold text-sm mb-3">
                Market Question <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleChange}
                placeholder="e.g., Will Bitcoin hit $100k by December 31, 2025?"
                required
                className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              />
              <p className="text-gray-400 text-xs mt-2">
                Make your question clear and specific with a definitive outcome
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 animate-fade-in-up">
              <label className="block text-white font-bold text-sm mb-3">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`p-4 rounded-lg border transition-all ${
                      formData.category === cat.id
                        ? "bg-yellow-500/10 border-yellow-500/50"
                        : "bg-[#050505] border-white/10 hover:border-yellow-500/30"
                    }`}
                  >
                    <Icon
                      name={cat.icon}
                      size={24}
                      className={`mx-auto mb-2 ${
                        formData.category === cat.id ? "text-yellow-500" : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`text-xs font-bold ${
                        formData.category === cat.id ? "text-yellow-500" : "text-gray-400"
                      }`}
                    >
                      {cat.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 animate-fade-in-up">
              <label className="block text-white font-bold text-sm mb-3">
                Market End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
              />
              <p className="text-gray-400 text-xs mt-2">
                When should this market resolve? Must be in the future.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 animate-fade-in-up">
              <label className="block text-white font-bold text-sm mb-3">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Add more context about your market..."
                className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none resize-none"
              />
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 animate-fade-in-up">
              <label className="block text-white font-bold text-sm mb-3">
                Image URL (Optional)
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 animate-fade-in-up">
              <div className="flex items-start gap-3">
                <Icon name="Activity" size={20} className="text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-white font-bold text-sm mb-1">Market Creation Fee</p>
                  <p className="text-gray-400 text-sm mb-3">
                    Creating a market costs 50 USDT. This fee helps prevent spam and ensures market
                    quality.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 font-black text-lg">50 USDT</span>
                    <span className="text-gray-400 text-sm">≈ $50.00</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isConnected || isCreating}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-black text-lg px-6 py-4 rounded-lg shadow-[0_0_25px_rgba(234,179,8,0.3)] hover:shadow-[0_0_35px_rgba(234,179,8,0.5)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isCreating
                ? "Creating Market..."
                : isConnected
                ? "Create Market"
                : "Connect Wallet to Continue"}
            </button>
          </form>

          <div className="mt-8 bg-[#0a0a0a] border border-white/10 rounded-lg p-6 animate-fade-in-up">
            <h3 className="text-white font-bold text-lg mb-4">Market Creation Guidelines</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>
                  Questions must be clear, specific, and have a definitive yes/no outcome
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>End dates must be in the future and realistic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>Markets must comply with our terms of service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>Spam or low-quality markets may be removed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateMarket;

