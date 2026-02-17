import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./config/wagmi";
import { OrderlyProvider } from "./providers/OrderlyProvider";
import "./styles.css";
import FutureMarket from "./futuremarket";
import PricePrediction from "./priceprediction";
import FutureTrading from "./pages/FutureTrading";
import AllMarkets from "./allmarket";
import MarketDetail from "./price";
import UserDashboard from "./pages/UserDashboard";
import CoinMarketInfo from "./pages/CoinMarketInfo";
import PublicAPI from "./pages/PublicAPI";
import Fees from "./pages/Fees";
import CreateMarket from "./pages/CreateMarket";
import ContractSpecification from "./pages/ContractSpecification";
import SocialShare from "./pages/SocialShare";
import Leaderboard from "./pages/Leaderboard";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <OrderlyProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<FutureMarket />} />
                <Route path="/price-prediction/:coin" element={<PricePrediction />} />
                <Route path="/price-prediction" element={<PricePrediction />} />
                <Route path="/future-trading" element={<FutureTrading />} />
                <Route path="/markets" element={<AllMarkets />} />
                <Route path="/market/:slug" element={<MarketDetail />} />
                <Route path="/user-dashboard" element={<UserDashboard />} />
                <Route path="/coin-market-info" element={<CoinMarketInfo />} />
                <Route path="/public-api" element={<PublicAPI />} />
                <Route path="/fees" element={<Fees />} />
                <Route path="/create-market" element={<CreateMarket />} />
                <Route path="/contract-specification" element={<ContractSpecification />} />
                <Route path="/share/:platform" element={<SocialShare />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
              </Routes>
            </BrowserRouter>
          </OrderlyProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
