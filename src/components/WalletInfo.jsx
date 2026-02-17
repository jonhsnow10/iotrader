import React from 'react';
import { useWallet } from '../hooks/useWallet';

const WalletInfo = () => {
  const { 
    address, 
    isConnected, 
    balance, 
    balanceSymbol,
    chainId,
    disconnect 
  } = useWallet();

  if (!isConnected) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Wallet not connected</p>
        <p className="text-sm text-gray-500 mt-2">
          Use the Connect Wallet button in the header to connect
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg space-y-3">
      <div>
        <p className="text-sm text-gray-400">Address</p>
        <p className="text-yellow-400 font-mono text-sm break-all">
          {address}
        </p>
      </div>
      
      <div>
        <p className="text-sm text-gray-400">Balance</p>
        <p className="text-white font-bold">
          {balance} {balanceSymbol}
        </p>
      </div>
      
      <div>
        <p className="text-sm text-gray-400">Chain ID</p>
        <p className="text-white">{chainId}</p>
      </div>
      
      <button
        onClick={disconnect}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        Disconnect Wallet
      </button>
    </div>
  );
};

export default WalletInfo;

