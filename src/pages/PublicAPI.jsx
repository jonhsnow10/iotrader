import React, { useState } from "react";
import Layout from "../components/Layout";
import Icon from "../components/Icon";
import SEO from "../components/SEO";

const PublicAPI = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const API_BASE_URL = "https://api-iotrader.dev";

  const copyToClipboard = (text, endpoint) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const apiEndpoints = {
    general: [
      {
        method: "GET",
        path: "/",
        description: "Get information about the API and available endpoints",
        example: `${API_BASE_URL}/`,
        response: `{
  "message": "Welcome to the IOTrader API",
  "version": "1.0.0",
  "endpoints": {
    "contract": {
      "tradingVolume": "/api/contract/trading-volume",
      "circulatingSupply": "/api/contract/circulating-supply"
    },
    "derivatives": {
      "contracts": "/api/derivatives/contracts",
      "contractSpecs": "/api/derivatives/contract_specs",
      "orderbook": "/api/derivatives/orderbook/:ticker_id"
    }
  }
}`,
      },
      {
        method: "GET",
        path: "/health",
        description: "Check the health status of the API server",
        example: `${API_BASE_URL}/health`,
        response: `{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}`,
      },
    ],
    contract: [
      {
        method: "GET",
        path: "/api/contract/trading-volume",
        description: "Get the contract's combined balance in BNB and USDT, converted to USD",
        example: `${API_BASE_URL}/api/contract/trading-volume`,
        response: `{
  "success": true,
  "data": {
    "tradingVolume": "179.98"
  }
}`,
      },
      {
        method: "GET",
        path: "/api/contract/circulating-supply",
        description: "Get the circulating supply of the token from the BSC contract",
        example: `${API_BASE_URL}/api/contract/circulating-supply`,
        response: `{
  "success": true,
  "data": {
    "circulatingSupply": "1000000.0",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}`,
      },
    ],
    derivatives: [
      {
        method: "GET",
        path: "/api/derivatives/contracts",
        description: "Get all derivative contracts available on the exchange",
        example: `${API_BASE_URL}/api/derivatives/contracts`,
        response: `[
  {
    "ticker_id": "BTC-PERP",
    "base_currency": "BTC",
    "target_currency": "USDT",
    "last_price": "45000.00",
    "base_volume": "1250.5",
    "target_volume": "56250000.00",
    "bid": "44995.50",
    "ask": "45005.00",
    "high": "45500.00",
    "low": "44500.00",
    "product_type": "Perpetual",
    "open_interest": "5000.00",
    "open_interest_usd": "225000000.00",
    "index_price": "45000.00",
    "funding_rate": "0.0001",
    "contract_type": "Vanilla"
  }
]`,
      },
      {
        method: "GET",
        path: "/api/derivatives/contract_specs",
        description: "Get contract specifications for all derivative contracts",
        example: `${API_BASE_URL}/api/derivatives/contract_specs`,
        response: `[
  {
    "ticker_id": "BTC-PERP",
    "contract_type": "Vanilla",
    "contract_price_currency": "USDT",
    "contract_price": "45000.00"
  }
]`,
      },
      {
        method: "GET",
        path: "/api/derivatives/orderbook/:ticker_id",
        description: "Get the orderbook for a specific trading pair (e.g., BTC-PERP, ETH-PERP)",
        example: `${API_BASE_URL}/api/derivatives/orderbook/BTC-PERP`,
        response: `{
  "ticker_id": "BTC-PERP",
  "timestamp": 1704067200000,
  "bids": [
    ["44995.50", "1.234567"],
    ["44990.00", "2.345678"]
  ],
  "asks": [
    ["45005.00", "1.123456"],
    ["45010.00", "2.234567"]
  ]
}`,
      },
    ],
  };

  const getAllEndpoints = () => {
    return [
      ...apiEndpoints.general,
      ...apiEndpoints.contract,
      ...apiEndpoints.derivatives,
    ];
  };

  const getFilteredEndpoints = () => {
    if (selectedCategory === "all") {
      return getAllEndpoints();
    }
    return apiEndpoints[selectedCategory] || [];
  };

  const codeExamples = {
    javascript: `const API_BASE_URL = '${API_BASE_URL}';

// Get trading volume
async function getTradingVolume() {
  try {
    const response = await fetch(\`\${API_BASE_URL}/api/contract/trading-volume\`);
    const data = await response.json();
    return data.data.tradingVolume;
  } catch (error) {
    console.error('Error fetching trading volume:', error);
    return null;
  }
}

// Get circulating supply
async function getCirculatingSupply() {
  try {
    const response = await fetch(\`\${API_BASE_URL}/api/contract/circulating-supply\`);
    const data = await response.json();
    return data.data.circulatingSupply;
  } catch (error) {
    console.error('Error fetching circulating supply:', error);
    return null;
  }
}

// Get all derivative contracts
async function getDerivativeContracts() {
  try {
    const response = await fetch(\`\${API_BASE_URL}/api/derivatives/contracts\`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return [];
  }
}

// Get orderbook
async function getOrderbook(tickerId) {
  try {
    const response = await fetch(\`\${API_BASE_URL}/api/derivatives/orderbook/\${tickerId}\`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching orderbook:', error);
    return null;
  }
}`,
    python: `import requests

API_BASE_URL = '${API_BASE_URL}'

def get_trading_volume():
    try:
        response = requests.get(f'{API_BASE_URL}/api/contract/trading-volume')
        data = response.json()
        return data['data']['tradingVolume']
    except Exception as e:
        print(f'Error fetching trading volume: {e}')
        return None

def get_circulating_supply():
    try:
        response = requests.get(f'{API_BASE_URL}/api/contract/circulating-supply')
        data = response.json()
        return data['data']['circulatingSupply']
    except Exception as e:
        print(f'Error fetching circulating supply: {e}')
        return None

def get_derivative_contracts():
    try:
        response = requests.get(f'{API_BASE_URL}/api/derivatives/contracts')
        return response.json()
    except Exception as e:
        print(f'Error fetching contracts: {e}')
        return []

def get_orderbook(ticker_id):
    try:
        response = requests.get(f'{API_BASE_URL}/api/derivatives/orderbook/{ticker_id}')
        return response.json()
    except Exception as e:
        print(f'Error fetching orderbook: {e}')
        return None`,
    curl: `# Get trading volume
curl ${API_BASE_URL}/api/contract/trading-volume

# Get circulating supply
curl ${API_BASE_URL}/api/contract/circulating-supply

# Get all contracts
curl ${API_BASE_URL}/api/derivatives/contracts

# Get orderbook for BTC-PERP
curl ${API_BASE_URL}/api/derivatives/orderbook/BTC-PERP

# Health check
curl ${API_BASE_URL}/health`,
  };

  return (
    <Layout activePage="public-api">
      <SEO
        title="Public API Documentation - IOTrader API"
        description="Access real-time market data, contract information, and derivative exchange data via IOTrader REST API. Complete API documentation with examples in JavaScript, Python, and cURL."
        keywords="API documentation, REST API, market data API, trading API, contract API, derivatives API, orderbook API, API examples"
        url="/public-api"
      />
      <div className="min-h-screen pt-6 pb-20 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 mb-2">
              IOTrader API Documentation
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Access real-time market data, contract information, and derivative exchange data via our REST API
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-gray-500">Version:</span>
              <span className="text-yellow-500 font-bold">1.0.0</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/10">
            {["overview", "endpoints", "examples", "docs"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-bold transition-colors ${
                  activeTab === tab
                    ? "text-yellow-500 border-b-2 border-yellow-500"
                    : "text-gray-400 hover:text-yellow-400"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in-up">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
                  <h3 className="text-white font-bold text-lg mb-4">API Overview</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Base URL</p>
                      <code className="block p-3 bg-[#050505] rounded border border-white/5 text-yellow-500 text-sm break-all">
                        {API_BASE_URL}
                      </code>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Rate Limits</p>
                      <p className="text-white text-sm">
                        Currently, there are no rate limits enforced. However, please use the API responsibly.
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Response Format</p>
                      <p className="text-white text-sm">All responses are in JSON format</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Error Handling</p>
                      <p className="text-white text-sm mb-2">Errors follow this format:</p>
                      <pre className="p-3 bg-[#050505] rounded border border-white/5 text-gray-300 text-xs overflow-x-auto">
{`{
  "success": false,
  "error": "Error message description"
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Available Endpoints</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-yellow-500 font-bold mb-2">General Endpoints</h4>
                      <ul className="list-disc list-inside text-gray-400 text-sm space-y-1 ml-4">
                        <li><code className="text-yellow-500">GET /</code> - Get API information</li>
                        <li><code className="text-yellow-500">GET /health</code> - Health check</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-yellow-500 font-bold mb-2">BSC Contract Endpoints</h4>
                      <ul className="list-disc list-inside text-gray-400 text-sm space-y-1 ml-4">
                        <li><code className="text-yellow-500">GET /api/contract/trading-volume</code> - Get trading volume</li>
                        <li><code className="text-yellow-500">GET /api/contract/circulating-supply</code> - Get circulating supply</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-yellow-500 font-bold mb-2">Derivative Exchange Endpoints</h4>
                      <ul className="list-disc list-inside text-gray-400 text-sm space-y-1 ml-4">
                        <li><code className="text-yellow-500">GET /api/derivatives/contracts</code> - Get all contracts</li>
                        <li><code className="text-yellow-500">GET /api/derivatives/contract_specs</code> - Get contract specifications</li>
                        <li><code className="text-yellow-500">GET /api/derivatives/orderbook/:ticker_id</code> - Get orderbook</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
                    <Icon name="Zap" size={24} className="text-yellow-500 mb-3" />
                    <h4 className="text-white font-bold mb-2">Fast & Reliable</h4>
                    <p className="text-gray-400 text-sm">
                      Low latency API with high availability
                    </p>
                  </div>
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
                    <Icon name="Globe" size={24} className="text-yellow-500 mb-3" />
                    <h4 className="text-white font-bold mb-2">Real-time Data</h4>
                    <p className="text-gray-400 text-sm">
                      Get live market prices and contract data instantly
                    </p>
                  </div>
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
                    <Icon name="Activity" size={24} className="text-yellow-500 mb-3" />
                    <h4 className="text-white font-bold mb-2">Comprehensive</h4>
                    <p className="text-gray-400 text-sm">
                      Access contracts, derivatives, orderbooks, and more
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "endpoints" && (
              <div className="space-y-6">
                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: "all", label: "All Endpoints" },
                    { key: "general", label: "General" },
                    { key: "contract", label: "BSC Contract" },
                    { key: "derivatives", label: "Derivatives" },
                  ].map((category) => (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        selectedCategory === category.key
                          ? "bg-yellow-500 text-black"
                          : "bg-[#0a0a0a] border border-white/10 text-gray-400 hover:text-yellow-500"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>

                {/* Endpoints List */}
                <div className="space-y-4">
                  {getFilteredEndpoints().map((endpoint, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span
                              className={`px-3 py-1 rounded text-xs font-bold ${
                                endpoint.method === "GET"
                                  ? "bg-green-500/20 text-green-500"
                                  : "bg-white/20 text-white"
                              }`}
                            >
                              {endpoint.method}
                            </span>
                            <code className="text-yellow-500 text-sm font-mono break-all">
                              {endpoint.path}
                            </code>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">{endpoint.description}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(endpoint.example, `endpoint-${idx}`)}
                          className="ml-4 p-2 hover:bg-white/5 rounded transition-colors flex-shrink-0"
                          title="Copy URL"
                        >
                          <Icon
                            name={copiedEndpoint === `endpoint-${idx}` ? "Check" : "Copy"}
                            size={18}
                            className={copiedEndpoint === `endpoint-${idx}` ? "text-green-500" : "text-gray-400"}
                          />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Request URL:</p>
                          <div className="p-3 bg-[#050505] rounded border border-white/5">
                            <code className="text-gray-400 text-xs break-all">{endpoint.example}</code>
                          </div>
                        </div>
                        {endpoint.response && (
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Example Response:</p>
                            <pre className="p-3 bg-[#050505] rounded border border-white/5 overflow-x-auto">
                              <code className="text-gray-300 text-xs">{endpoint.response}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "examples" && (
              <div className="space-y-6">
                {Object.entries(codeExamples).map(([lang, code]) => (
                  <div key={lang} className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg capitalize">
                        {lang === "javascript" ? "JavaScript/TypeScript" : lang === "curl" ? "cURL" : lang}
                      </h3>
                      <button
                        onClick={() => copyToClipboard(code, `example-${lang}`)}
                        className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 text-sm transition-colors"
                      >
                        <Icon
                          name={copiedEndpoint === `example-${lang}` ? "Check" : "Copy"}
                          size={16}
                          className={copiedEndpoint === `example-${lang}` ? "text-green-500" : ""}
                        />
                        {copiedEndpoint === `example-${lang}` ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <pre className="p-4 bg-[#050505] rounded border border-white/5 overflow-x-auto">
                      <code className="text-gray-300 text-sm">{code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "docs" && (
              <div className="space-y-6">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
                  <h3 className="text-white font-bold text-lg mb-4">API Documentation</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-[#050505] rounded-lg border border-white/5">
                      <p className="text-white font-bold mb-2">Base URL</p>
                      <code className="text-yellow-500 text-sm break-all">{API_BASE_URL}</code>
                    </div>
                    <div className="p-4 bg-[#050505] rounded-lg border border-white/5">
                      <p className="text-white font-bold mb-2">Version</p>
                      <p className="text-gray-400 text-sm">1.0.0</p>
                    </div>
                    <div className="p-4 bg-[#050505] rounded-lg border border-white/5">
                      <p className="text-white font-bold mb-2">Response Format</p>
                      <p className="text-gray-400 text-sm">All responses are in JSON format</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Error Handling</h3>
                  <div className="space-y-3">
                    <p className="text-gray-400 text-sm">
                      All endpoints follow a consistent error response format:
                    </p>
                    <pre className="p-4 bg-[#050505] rounded border border-white/5 overflow-x-auto">
                      <code className="text-gray-300 text-xs">{`{
  "success": false,
  "error": "Error message description"
}`}</code>
                    </pre>
                    <div className="mt-3">
                      <p className="text-gray-400 text-sm mb-2">HTTP Status Codes:</p>
                      <ul className="list-disc list-inside text-gray-400 text-sm space-y-1 ml-4">
                        <li><code className="text-yellow-500">200 OK</code> - Request successful</li>
                        <li><code className="text-yellow-500">404 Not Found</code> - Route not found</li>
                        <li><code className="text-yellow-500">500 Internal Server Error</code> - Server error</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Rate Limits</h3>
                  <p className="text-gray-400 text-sm">
                    Currently, there are no rate limits enforced. However, please use the API responsibly:
                  </p>
                  <ul className="list-disc list-inside text-gray-400 text-sm space-y-1 ml-4 mt-3">
                    <li>Avoid making excessive requests</li>
                    <li>Implement appropriate caching in your application</li>
                    <li>Use the health check endpoint to monitor API status</li>
                  </ul>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Available Ticker IDs</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="text-yellow-500 text-sm">BTC-PERP</code>
                      <span className="text-gray-400 text-sm">- Bitcoin Perpetual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-yellow-500 text-sm">ETH-PERP</code>
                      <span className="text-gray-400 text-sm">- Ethereum Perpetual</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-3">(More tickers will be added as they become available)</p>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Support</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    For issues, questions, or feature requests, please contact the development team.
                  </p>
                  <p className="text-gray-500 text-xs">
                    Last Updated: December 2024
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PublicAPI;

