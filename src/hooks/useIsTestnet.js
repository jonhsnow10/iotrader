import { useState, useEffect, useRef } from 'react';

export function useIsTestnet() {
  const [isTestnet, setIsTestnet] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = window.localStorage.getItem('networkId');
    if (saved === 'testnet' || saved === 'mainnet') return saved === 'testnet';
    return import.meta.env.VITE_ORDERLY_NETWORK_ID === 'testnet';
  });

  const [networkChanged, setNetworkChanged] = useState(false);
  const prevIsTestnetRef = useRef(isTestnet);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkNetwork = () => {
      const saved = window.localStorage.getItem('networkId');
      const currentIsTestnet =
        saved === 'testnet' ? true : saved === 'mainnet' ? false : import.meta.env.VITE_ORDERLY_NETWORK_ID === 'testnet';
      if (currentIsTestnet !== prevIsTestnetRef.current) {
        prevIsTestnetRef.current = currentIsTestnet;
        setIsTestnet(currentIsTestnet);
        setNetworkChanged(true);
      }
    };
    checkNetwork();
    window.addEventListener('storage', checkNetwork);
    return () => window.removeEventListener('storage', checkNetwork);
  }, []);

  return [isTestnet, networkChanged];
}
