import React from "react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";

const ContractSpecification = () => {
  const contractDetails = {
    futures: "BTC_USD",
    type: "Inverse",
    baseCurrency: "BTC",
    quoteCurrency: "USD",
    contractSize: "1 USD",
    maxLeverage: "100",
    maintenanceMarginRatio: "0.5%",
    baseRiskLimit: "3BTC",
    riskLimitStep: "2497BTC",
    maxRiskLimit: "2500BTC",
    minimumPriceIncrement: "0.1",
    impactFundingCostNotional: "0.5BTC",
    maximumOrderPriceDeviation: "50%",
  };

  const itemConfig = {
    settlementCurrency: "BTC",
    fundingTime: "0:00, 8:00, 16:00 UTC",
    makerFee: "-0.025%",
    takerFee: "0.075%",
    minimumOrderQuantity: "1",
    maximumOrderQuantity: "1,000,000",
    maximumPendingOrderQuantity: "50",
  };

  return (
    <>
      <SEO
        title="Contract Specification - Futures Trading Details"
        description="View detailed contract specifications for BTC_USD futures including leverage, fees, and trading parameters."
        keywords="contract specification, futures contract, BTC futures, trading parameters, leverage, fees"
        url="/contract-specification"
      />
      <Layout activePage="contract-specification">
        <div className="min-h-screen pt-6 pb-20 px-4 lg:px-6 bg-black text-white">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-white mb-2">
                Contract Specification
              </h1>
            </div>

            {/* Contract Details Table */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-3">
                Contract Details
              </h2>
              <div className="border border-white/20 rounded overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead className="bg-white/10 border-b border-white/20">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-white/20">
                        Futures
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-white/20">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-white/20">
                        Base Currency
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-white/20">
                        Quote Currency
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-white/20">
                        Contract Size
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-white/20">
                        Max Leverage
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-white/20">
                        Maintenance Margin Ratio
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-white/20">
                        Base Risk Limit
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-white/20">
                        Risk Limit Step
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-white/20">
                        Max Risk Limit
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-white/20">
                        Minimum Price Increment
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white border-r border-white/20">
                        Impact Funding Cost Notional
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                        Maximum Order Price Deviation
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 text-sm text-white border-r border-white/20">
                        {contractDetails.futures}
                      </td>
                      <td className="px-4 py-3 text-sm text-white border-r border-white/20">
                        {contractDetails.type}
                      </td>
                      <td className="px-4 py-3 text-sm text-white border-r border-white/20">
                        {contractDetails.baseCurrency}
                      </td>
                      <td className="px-4 py-3 text-sm text-white border-r border-white/20">
                        {contractDetails.quoteCurrency}
                      </td>
                      <td className="px-4 py-3 text-sm text-white border-r border-white/20">
                        {contractDetails.contractSize}
                      </td>
                      <td className="px-4 py-3 text-sm text-white border-r border-white/20">
                        {contractDetails.maxLeverage}
                      </td>
                      <td className="px-4 py-3 text-sm text-white border-r border-white/20">
                        {contractDetails.maintenanceMarginRatio}
                      </td>
                      <td className="px-4 py-3 text-sm text-white border-r border-white/20">
                        {contractDetails.baseRiskLimit}
                      </td>
                      <td className="px-4 py-3 text-sm text-white border-r border-white/20">
                        {contractDetails.riskLimitStep}
                      </td>
                      <td className="px-4 py-3 text-sm text-white border-r border-white/20">
                        {contractDetails.maxRiskLimit}
                      </td>
                      <td className="px-4 py-3 text-sm text-white border-r border-white/20">
                        {contractDetails.minimumPriceIncrement}
                      </td>
                      <td className="px-4 py-3 text-sm text-white border-r border-white/20">
                        {contractDetails.impactFundingCostNotional}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {contractDetails.maximumOrderPriceDeviation}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Futures and Index Contract Section */}
            <div className="mb-6">
              {/* Top Section: Futures and Index Price Source */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1 border border-white/20 rounded px-4 py-3 bg-white/5 min-h-[50px] flex items-center">
                  <span className="text-sm text-gray-400">Futures</span>
                </div>
                <div className="flex-1 border border-white/20 rounded px-4 py-3 bg-white/5 min-h-[50px] flex items-center">
                  <span className="text-sm text-gray-400">Index Price Source</span>
                </div>
              </div>
              {/* Bottom Section: Index Contract and Constituents */}
              <div className="flex gap-4">
                <div className="flex-1 border border-white/20 rounded px-4 py-3 bg-white/5 min-h-[50px] flex items-center">
                  <span className="text-sm text-gray-400">Index Contract</span>
                </div>
                <div className="flex-1 border border-white/20 rounded px-4 py-3 bg-white/5 min-h-[50px] flex items-center">
                  <span className="text-sm text-gray-400">Constituents</span>
                </div>
              </div>
            </div>

            {/* Item Configuration Section */}
            <div>
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-400">
                  Uniform Config
                </label>
              </div>
              <h2 className="text-lg font-semibold text-white mb-3">Item</h2>
              <div className="border border-white/20 rounded overflow-hidden">
                <div className="border-b border-white/20">
                  <div className="grid grid-cols-2 gap-4 px-4 py-3">
                    <div className="text-sm font-semibold text-white">
                      Settlement Currency
                    </div>
                    <div className="text-sm text-white">{itemConfig.settlementCurrency}</div>
                  </div>
                </div>
                <div className="border-b border-white/20">
                  <div className="grid grid-cols-2 gap-4 px-4 py-3">
                    <div className="text-sm font-semibold text-white">
                      Funding Time
                    </div>
                    <div className="text-sm text-white">{itemConfig.fundingTime}</div>
                  </div>
                </div>
                <div className="border-b border-white/20">
                  <div className="grid grid-cols-2 gap-4 px-4 py-3">
                    <div className="text-sm font-semibold text-white">
                      Maker Fee
                    </div>
                    <div className="text-sm text-white">{itemConfig.makerFee}</div>
                  </div>
                </div>
                <div className="border-b border-white/20">
                  <div className="grid grid-cols-2 gap-4 px-4 py-3">
                    <div className="text-sm font-semibold text-white">
                      Taker Fee
                    </div>
                    <div className="text-sm text-white">{itemConfig.takerFee}</div>
                  </div>
                </div>
                <div className="border-b border-white/20">
                  <div className="grid grid-cols-2 gap-4 px-4 py-3">
                    <div className="text-sm font-semibold text-white">
                      Minimum Order Quantity
                    </div>
                    <div className="text-sm text-white">{itemConfig.minimumOrderQuantity}</div>
                  </div>
                </div>
                <div className="border-b border-white/20">
                  <div className="grid grid-cols-2 gap-4 px-4 py-3">
                    <div className="text-sm font-semibold text-white">
                      Maximum Order Quantity
                    </div>
                    <div className="text-sm text-white">{itemConfig.maximumOrderQuantity}</div>
                  </div>
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-4 px-4 py-3">
                    <div className="text-sm font-semibold text-white">
                      Maximum Pending Order Quantity
                    </div>
                    <div className="text-sm text-white">{itemConfig.maximumPendingOrderQuantity}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ContractSpecification;

