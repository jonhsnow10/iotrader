// Frontend-only: no Firebase. No-op / mock.

export const POINT_VALUES = {
  TWITTER_SHARE: 50,
  TELEGRAM_SHARE: 50,
  REFERRAL_SIGNUP: 100,
  REFERRAL_BONUS: 50,
  FUTURE_TRADE: 10,
  FUTURE_TRADE_MULTIPLIER: 0.1,
  PREDICTION_TRADE: 10,
  PREDICTION_TRADE_MULTIPLIER: 0.1,
};

export const calculateTradePoints = (amount, type = "future") => {
  const basePoints = type === "future" ? POINT_VALUES.FUTURE_TRADE : POINT_VALUES.PREDICTION_TRADE;
  const multiplier = type === "future" ? POINT_VALUES.FUTURE_TRADE_MULTIPLIER : POINT_VALUES.PREDICTION_TRADE_MULTIPLIER;
  return Math.floor(basePoints + amount * multiplier);
};

export const addPoints = async () => {};
export const getUserPoints = async () => 0;
export const getPointTransactions = async () => [];
export const hasClaimedPoints = async () => false;
export const awardSocialSharePoints = async () => ({ success: false, error: "Frontend only" });
export const awardTradePoints = async () => ({ success: true, points: 0 });
