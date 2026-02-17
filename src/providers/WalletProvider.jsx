import React from "react";

// Frontend-only: no wagmi/rainbowkit. Simple wrapper for app compatibility.
const WalletProvider = ({ children }) => {
  return <>{children}</>;
};

export default WalletProvider;
