// Frontend-only: no Firebase. Mock implementations.

export const generateReferralCode = (address) => {
  if (!address) return "";
  const normalized = address.toLowerCase();
  const prefix = normalized.slice(2, 8);
  const suffix = normalized.slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${suffix}${random}`.toUpperCase();
};

export const getOrCreateReferralCode = async (address) => {
  return address ? generateReferralCode(address) : "";
};

export const getReferralCode = async () => null;

export const processReferral = async () => ({
  success: false,
  error: "Frontend only - no backend",
});

export const getReferralStats = async (address) => ({
  totalReferrals: 0,
  referralCode: address ? generateReferralCode(address) : null,
  referrals: [],
});

export const getReferralLink = async (address) => {
  const code = await getOrCreateReferralCode(address);
  return `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${code}`;
};
