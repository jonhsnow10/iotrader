// Frontend-only: no Firebase. Mock data and no-op APIs.

export const createPrediction = async (betData) => {
  return "mock_prediction_" + Date.now();
};

export const getUserPredictions = async (walletAddress) => {
  return [];
};

export const getAllActivePredictions = async () => {
  return [];
};

export const getPredictionsBySymbol = async () => {
  return [];
};

export const updatePredictionStatus = async () => {};

export const claimWinnings = async () => {};

export const getUserStats = async (walletAddress) => {
  return {
    total: 0,
    active: 0,
    won: 0,
    lost: 0,
    expired: 0,
    totalInvested: 0,
    totalProfit: 0,
    winRate: 0,
  };
};

export const getRecentPredictions = async () => {
  return [];
};

export const getMarketSentiment = async () => {
  return {
    bullishCount: 0,
    bearishCount: 0,
    bullishPercent: 0,
    bearishPercent: 0,
    bullishVolume: 0,
    bearishVolume: 0,
    totalVolume: 0,
    totalPredictions: 0,
  };
};

export const settleExpiredPredictions = async () => {
  return 0;
};
