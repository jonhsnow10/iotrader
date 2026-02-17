import React from 'react';
import { DefaultEVMWalletAdapter } from '@orderly.network/default-evm-adapter';
import { DefaultSolanaWalletAdapter } from '@orderly.network/default-solana-adapter';
import { OrderlyConfigProvider } from '@orderly.network/hooks';
import { EthersProvider } from '@orderly.network/web3-provider-ethers';
import { useIsTestnet } from '../hooks/useIsTestnet';

export function OrderlyProvider({ children }) {
  const [isTestnet, networkChanged] = useIsTestnet();
  const envNetworkId = import.meta.env.VITE_ORDERLY_NETWORK_ID;
  const resolvedNetworkId =
    envNetworkId === 'testnet' || envNetworkId === 'mainnet'
      ? envNetworkId
      : isTestnet
        ? 'testnet'
        : 'mainnet';

  const brokerId = import.meta.env.VITE_ORDERLY_BROKER_ID || import.meta.env.VITE_BROKER_ID || '';
  const brokerName = import.meta.env.VITE_ORDERLY_BROKER_NAME || import.meta.env.VITE_BROKER_NAME || '';

  if (networkChanged && typeof window !== 'undefined') {
    setTimeout(() => {
      window.localStorage.setItem('networkId', isTestnet ? 'testnet' : 'mainnet');
      window.location.reload();
    }, 1000);
  }

  return (
    <OrderlyConfigProvider
      networkId={resolvedNetworkId}
      brokerId={brokerId}
      brokerName={brokerName}
      walletAdapters={[
        new DefaultEVMWalletAdapter(new EthersProvider()),
        new DefaultSolanaWalletAdapter(),
      ]}
    >
      {children}
    </OrderlyConfigProvider>
  );
}
