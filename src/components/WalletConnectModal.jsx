import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useConnect } from 'wagmi';
import { detectInstalledWallets } from '../utils/walletDetectors';

export function WalletConnectModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const { connectors, connectAsync, isPending } = useConnect();
  const [isLoading, setIsLoading] = useState(false);
  const installedWallets = React.useMemo(() => {
    const detected = detectInstalledWallets();
    return detected.filter((w) => w.detected);
  }, []);

  onCloseRef.current = onClose;

  useEffect(() => {
    const h = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onCloseRef.current();
    };
    if (isOpen) {
      document.addEventListener('mousedown', h);
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const html = document.documentElement;
      const prevHtmlOverflow = html.style.overflow;
      const prevHtmlPaddingRight = html.style.paddingRight;
      const prevBodyOverflow = document.body.style.overflow;
      const prevBodyPaddingRight = document.body.style.paddingRight;

      html.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        html.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.removeEventListener('mousedown', h);
        html.style.overflow = prevHtmlOverflow;
        html.style.paddingRight = prevHtmlPaddingRight;
        document.body.style.overflow = prevBodyOverflow;
        document.body.style.paddingRight = prevBodyPaddingRight;
      };
    }
    return () => document.removeEventListener('mousedown', h);
  }, [isOpen]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    if (isOpen) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen]);

  const handleConnect = async (walletId) => {
    if (isLoading || isPending) return;
    setIsLoading(true);
    try {
      const connector = connectors.find(
        (c) =>
          (c.id && c.id.toLowerCase().includes(walletId)) ||
          (c.name && c.name.toLowerCase().includes(walletId)) ||
          (walletId === 'walletconnect' && (c.id === 'walletConnect' || c.name === 'WalletConnect'))
      );
      if (connector) {
        await connectAsync({ connector });
        onClose();
      } else {
        console.error('Connector not found for', walletId);
      }
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && typeof err.code === 'number'
          ? err.code
          : typeof err?.error?.code === 'number'
            ? err.error.code
            : undefined;
      if (code === -32002) {
        console.warn(
          'Wallet connection request already pending. Open your wallet extension to approve/reject.'
        );
        return;
      }
      console.error('Failed to connect wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm"
      style={{ background: 'rgba(31, 31, 31, 0.64)' }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md mx-4 rounded-xl shadow-2xl border border-[color:var(--color-border-strong)]"
        style={{
          background: '#000000',
          fontFamily: 'var(--font-geist-sans), Inter, sans-serif',
        }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[color:var(--color-border-strong)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)]">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors p-1 hover:bg-[color:var(--color-background-hover)] rounded-lg cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-3 max-h-[400px] overflow-y-auto">
          {installedWallets.length > 0 ? (
            installedWallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                disabled={isLoading || isPending}
                className="w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-transparent bg-[color:var(--color-background-secondary)] hover:bg-[color:var(--color-background-hover)] hover:border-[color:var(--color-border-strong)]"
              >
                <span className="text-base font-semibold text-[color:var(--color-text-primary)] group-hover:text-[color:var(--color-accent-primary)] transition-colors">
                  {wallet.name}
                </span>
                <div className="w-10 h-10 flex items-center justify-center">
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    width={40}
                    height={40}
                    className="transition-transform group-hover:scale-110 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-[color:var(--color-text-secondary)] mb-4">No wallets detected</p>
              <p className="text-sm text-[color:var(--color-text-muted)]">
                Install MetaMask, Phantom, or another wallet extension
              </p>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="px-6 py-3 border-t border-[color:var(--color-border-strong)]">
            <div className="flex items-center justify-center gap-2">
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--color-accent-primary)', borderTopColor: 'transparent' }}
              />
              <span className="text-sm text-[color:var(--color-text-secondary)]">Connecting...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
