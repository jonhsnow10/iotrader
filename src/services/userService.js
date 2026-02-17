// Frontend-only: no Firebase. No-op / in-memory only.

export const saveUserWallet = async (address, additionalData = {}, referralCode = null) => {
  return { address: (address || "").toLowerCase(), ...additionalData };
};

export const getUserByAddress = async (address) => {
  if (!address) return null;
  return { id: address.toLowerCase(), address: address.toLowerCase() };
};
