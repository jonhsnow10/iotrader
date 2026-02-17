import { SUPPORTED_WALLETS } from '../constants/wallets';

function getWindow() {
  if (typeof window === 'undefined') return null;
  return window;
}

const WALLET_DETECTORS = {
  metamask: {
    id: 'metamask',
    name: 'MetaMask',
    chains: ['evm'],
    detect: () => !!getWindow()?.ethereum?.isMetaMask,
  },
  walletconnect: {
    id: 'walletconnect',
    name: 'WalletConnect',
    chains: ['evm'],
    detect: () => true,
  },
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    chains: ['evm'],
    detect: () => {
      const w = getWindow();
      return !!(w?.ethereum?.isCoinbaseWallet || w?.ethereum?.selectedProvider?.isCoinbaseWallet);
    },
  },
  trust: {
    id: 'trust',
    name: 'Trust Wallet',
    chains: ['evm'],
    detect: () => {
      const w = getWindow();
      return !!(w?.ethereum?.isTrust || w?.trustwallet || w?.trustWallet);
    },
  },
  rabby: {
    id: 'rabby',
    name: 'Rabby',
    chains: ['evm'],
    detect: () => !!(getWindow()?.rabby || getWindow()?.ethereum?.isRabby),
  },
  bitget: {
    id: 'bitget',
    name: 'Bitget Wallet',
    chains: ['evm'],
    detect: () => !!(getWindow()?.bitkeep || getWindow()?.ethereum?.isBitKeep),
  },
  rainbow: {
    id: 'rainbow',
    name: 'Rainbow',
    chains: ['evm'],
    detect: () => !!getWindow()?.ethereum?.isRainbow,
  },
  brave: {
    id: 'brave',
    name: 'Brave Wallet',
    chains: ['evm'],
    detect: () => !!getWindow()?.ethereum?.isBraveWallet,
  },
  okx: {
    id: 'okx',
    name: 'OKX Wallet',
    chains: ['evm'],
    detect: () => !!(getWindow()?.okxwallet || getWindow()?.ethereum?.isOkxWallet),
  },
};

export function detectInstalledWallets() {
  return SUPPORTED_WALLETS.map((wallet) => {
    const detector = WALLET_DETECTORS[wallet.id];
    const detected = detector ? detector.detect() : false;
    return { ...wallet, detected };
  });
}

export function getInstalledWalletsForEVM() {
  return detectInstalledWallets().filter((w) => w.detected && w.chains.includes('evm'));
}
