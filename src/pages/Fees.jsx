import React, { useState } from "react";
import Layout from "../components/Layout";
import Icon from "../components/Icon";
import SEO from "../components/SEO";

const Fees = () => {
  const [stakeAmount, setStakeAmount] = useState("");
  const feeRate = 1; // 1% default fee rate

  const calculateFee = (amount) => {
    if (!amount || amount <= 0) return "0.00";
    return ((amount * feeRate) / 100).toFixed(2);
  };

  const calculateNetAmount = (amount) => {
    if (!amount || amount <= 0) return "0.00";
    return (amount - (amount * feeRate) / 100).toFixed(2);
  };

  const feeApplies = [
    {
      title: "Placing a Bet (YES / NO Markets)",
      description: "Fee is charged immediately when placing a bet",
      functions: ["betYes()", "betNo()"],
      details: [
        "Fee is taken from the stake amount",
        "Only the net amount goes into the YES or NO pool",
      ],
      icon: "Activity",
    },
    {
      title: "Opening Long / Short Prediction",
      description: "Fee is charged immediately when opening a position",
      functions: ["long()", "short()"],
      details: [
        "Fee is taken from the stake amount",
        "User's position is created using the net stake",
      ],
      icon: "TrendingUp",
    },
  ];

  const feeDoesNotApply = [
    {
      title: "Claiming Winnings",
      description: "No fee when claiming your winnings",
      icon: "Trophy",
    },
    {
      title: "Market Settlement",
      description: "No fee on market settlement",
      icon: "CheckCircle",
    },
    {
      title: "Payouts",
      description: "No fee on payouts",
      icon: "Send",
    },
    {
      title: "No Hidden Fees",
      description: "No recurring or hidden fees",
      icon: "Shield",
    },
  ];

  return (
    <Layout activePage="fees">
      <SEO
        title="Fees - Transparent Fee Structure"
        description="Learn about IO Trader's transparent fee structure. Understand when fees apply, fee rates, and use our fee calculator. No hidden fees, no fees on withdrawals."
        keywords="trading fees, fee structure, fee calculator, prediction market fees, futures trading fees, transparent pricing, no hidden fees"
        url="/fees"
      />
      <div className="min-h-screen pt-6 pb-20 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 mb-2">
              Fees
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Transparent fee structure - know exactly what you pay
            </p>
          </div>

          {/* Fee Rate Section */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 mb-8 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Icon name="Activity" size={24} className="text-yellow-500" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Fee Rate</h3>
                <p className="text-gray-400 text-sm">Default fee structure</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-[#050505] rounded-lg border border-white/5">
                <div>
                  <p className="text-white font-bold">Default Fee Rate</p>
                  <p className="text-gray-400 text-sm">Applied to all bets and positions</p>
                </div>
                <div className="text-right">
                  <span className="text-yellow-500 font-black text-2xl">{feeRate}%</span>
                  <p className="text-gray-500 text-xs mt-1">(100 bps)</p>
                </div>
              </div>
              <div className="p-4 bg-[#050505] rounded-lg border border-white/5">
                <p className="text-gray-400 text-sm mb-2">
                  <span className="text-white font-bold">Adjustable by owner</span> - The fee rate can be adjusted by the contract owner
                </p>
                <p className="text-gray-400 text-sm">
                  <span className="text-white font-bold">Maximum allowed:</span> 10%
                </p>
              </div>
            </div>
          </div>

          {/* Where Fees Apply */}
          <div className="mb-8 animate-fade-in-up">
            <h2 className="text-2xl font-black text-white mb-6">Where Fees Apply</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {feeApplies.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-3 bg-yellow-500/10 rounded-lg flex-shrink-0">
                      <Icon name={item.icon} size={24} className="text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-[#050505] rounded border border-white/5">
                      <p className="text-gray-500 text-xs mb-1">Applies to:</p>
                      <div className="flex gap-2 flex-wrap">
                        {item.functions.map((func, funcIdx) => (
                          <code
                            key={funcIdx}
                            className="text-yellow-500 text-sm font-mono bg-black/30 px-2 py-1 rounded"
                          >
                            {func}
                          </code>
                        ))}
                      </div>
                    </div>
                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1 ml-2">
                      {item.details.map((detail, detailIdx) => (
                        <li key={detailIdx}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Where Fees Do NOT Apply */}
          <div className="mb-8 animate-fade-in-up">
            <h2 className="text-2xl font-black text-white mb-6">Where Fees Do NOT Apply</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {feeDoesNotApply.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6"
                >
                  <div className="p-3 bg-green-500/10 rounded-lg w-fit mb-3">
                    <Icon name={item.icon} size={24} className="text-green-500" />
                  </div>
                  <h4 className="text-white font-bold mb-2">{item.title}</h4>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fee Currency */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 mb-8 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Icon name="DollarSign" size={24} className="text-yellow-500" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Fee Currency</h3>
                <p className="text-gray-400 text-sm">Fee is taken in the same currency as the bet</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#050505] rounded-lg border border-white/5">
                <p className="text-white font-bold mb-1">USDT Markets</p>
                <p className="text-gray-400 text-sm">→ USDT fee</p>
              </div>
              <div className="p-4 bg-[#050505] rounded-lg border border-white/5">
                <p className="text-white font-bold mb-1">BNB Markets</p>
                <p className="text-gray-400 text-sm">→ BNB fee</p>
              </div>
            </div>
          </div>

          {/* Fee Calculator */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 mb-8 animate-fade-in-up">
            <h3 className="text-white font-bold text-lg mb-4">Fee Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">
                  Stake Amount
                </label>
                <input
                  type="number"
                  placeholder="100"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-2">
                    Fee ({feeRate}%)
                  </label>
                  <div className="px-4 py-3 bg-[#050505] border border-yellow-500/30 rounded-lg">
                    <span className="text-yellow-500 font-black text-lg">
                      {stakeAmount ? `$${calculateFee(parseFloat(stakeAmount))}` : "$0.00"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-2">
                    Net Amount (to pool/position)
                  </label>
                  <div className="px-4 py-3 bg-[#050505] border border-green-500/30 rounded-lg">
                    <span className="text-green-500 font-black text-lg">
                      {stakeAmount ? `$${calculateNetAmount(parseFloat(stakeAmount))}` : "$0.00"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {stakeAmount && parseFloat(stakeAmount) > 0 && (
              <div className="mt-4 p-4 bg-[#050505] rounded-lg border border-white/5">
                <p className="text-gray-400 text-sm">
                  <span className="text-white font-bold">${stakeAmount}</span> stake -{" "}
                  <span className="text-yellow-500 font-bold">
                    ${calculateFee(parseFloat(stakeAmount))} fee
                  </span>{" "}
                  ={" "}
                  <span className="text-green-500 font-bold">
                    ${calculateNetAmount(parseFloat(stakeAmount))} net
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 animate-fade-in-up">
              <Icon name="Shield" size={24} className="text-yellow-500 mb-3" />
              <h4 className="text-white font-bold mb-2">Transparent Pricing</h4>
              <p className="text-gray-400 text-sm">
                No hidden fees or surprises. Fees are clearly displayed and charged only when placing bets or opening positions.
              </p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 animate-fade-in-up">
              <Icon name="CheckCircle" size={24} className="text-yellow-500 mb-3" />
              <h4 className="text-white font-bold mb-2">No Fees on Withdrawals</h4>
              <p className="text-gray-400 text-sm">
                Claim your winnings, receive payouts, and settle markets without any fees. Only pay when you bet or trade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Fees;

