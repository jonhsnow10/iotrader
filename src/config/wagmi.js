import { http, createConfig } from 'wagmi';
import { mainnet, arbitrum, bsc, sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
  import.meta.env.VITE_NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  '8a0e1b2c3d4e5f6a7b8c9d0e1f2a3b4c';

export const wagmiConfig = createConfig({
  chains: [mainnet, arbitrum, bsc, sepolia],
  connectors: [
    injected({ shimDisconnect: true, target: 'metaMask' }),
    walletConnect({
      projectId,
      metadata: {
        name: 'IoTrader',
        description: 'Crypto Trading Platform',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://iotrader.io',
        icons: [typeof window !== 'undefined' ? `${window.location.origin}/slogo.png` : 'https://iotrader.io/slogo.png'],
      },
      showQrModal: true,
      qrModalOptions: { themeMode: 'dark' },
    }),
  ],
  transports: {
    [mainnet.id]: http(import.meta.env.VITE_MAINNET_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo', {
      batch: true,
      retryCount: 3,
      timeout: 30_000,
    }),
    [arbitrum.id]: http(import.meta.env.VITE_ARBITRUM_RPC_URL || 'https://arb-mainnet.g.alchemy.com/v2/demo', {
      batch: true,
      retryCount: 3,
      timeout: 30_000,
    }),
    [bsc.id]: http(import.meta.env.VITE_BNB_RPC_URL || 'https://bsc-dataseed.binance.org', {
      batch: true,
      retryCount: 3,
      timeout: 30_000,
    }),
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo', {
      batch: true,
      retryCount: 3,
      timeout: 30_000,
    }),
  },
  multiInjectedProviderDiscovery: true,
});
