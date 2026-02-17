import { createSlug } from "../utils/slug";

// Frontend-only: no Firebase. Mock data and no-op APIs.

const mockMarkets = [
  {
    id: "mock_1",
    title: "BNB all time high by December 31?",
    slug: "bnb-all-time-high-by-december-31",
    category: "crypto",
    creatorAddress: "0x0000000000000000000000000000000000000000",
    transactionHash: "",
    closingTime: new Date("2025-12-31"),
    createdAt: new Date(),
    yesPrice: 0.67,
    noPrice: 0.33,
    totalVolume: 4200000,
    yesPool: 2800000,
    noPool: 1400000,
    status: "active",
  },
  {
    id: "mock_2",
    title: "Bitcoin to hit $100k before Q4?",
    slug: "bitcoin-to-hit-100k-before-q4",
    category: "crypto",
    creatorAddress: "0x0000000000000000000000000000000000000000",
    closingTime: new Date("2025-10-01"),
    createdAt: new Date(),
    yesPrice: 0.42,
    noPrice: 0.58,
    totalVolume: 18500000,
    yesPool: 7770000,
    noPool: 10730000,
    status: "active",
  },
];

export const createMarket = async (marketData) => {
  const id = "mock_" + Date.now();
  return { id, ...marketData, slug: createSlug(marketData.title || "") };
};

export const getAllMarkets = async () => {
  return mockMarkets.map((m) => ({
    ...m,
    closingTime: m.closingTime instanceof Date ? m.closingTime : new Date(m.closingTime),
    createdAt: m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt || Date.now()),
  }));
};

export const getMarketById = async (marketId) => {
  const m = mockMarkets.find((x) => x.id === marketId);
  return m ? { ...m } : null;
};

export const getMarketBySlug = async (slug) => {
  const m = mockMarkets.find((x) => (x.slug || createSlug(x.title || "")) === slug);
  return m ? { ...m } : null;
};

export const placeTrade = async (tradeData) => {
  return { id: "mock_trade_" + Date.now(), ...tradeData };
};

export const getMarketTrades = async () => {
  return [];
};

export const getUserPositions = async () => {
  return [];
};

export const addActivity = async () => {};

export const getActivityFeed = async () => {
  return [];
};

export const createComment = async (commentData) => {
  return { id: "mock_comment_" + Date.now(), ...commentData };
};

export const getMarketComments = async () => {
  return [];
};

export const deleteComment = async () => {};
