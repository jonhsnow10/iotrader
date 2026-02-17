import { useAccount } from 'wagmi';

export function useWallet() {
  const { address, isConnected, connector } = useAccount();
  return {
    address,
    isConnected: !!isConnected,
    connector,
    chainId: undefined,
    balance: undefined,
    balanceSymbol: undefined,
    balanceLoading: false,
    connect: () => {},
    disconnect: () => {},
    switchChain: () => {},
    connectors: [],
    isConnecting: false,
  };
}

export function useWalletAddress() {
  const { address } = useAccount();
  return address;
}

export function useIsWalletConnected() {
  const { isConnected } = useAccount();
  return !!isConnected;
}
