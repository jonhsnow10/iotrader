import React, { useEffect, useRef, useState } from 'react';
import { AccountStatusEnum } from '@orderly.network/types';
import { useAccount, useChainId } from 'wagmi';
import { useOrderlyAccount } from '../hooks/orderly/useOrderlyAccount';

let timer;

export function OrderlyConnect() {
  const [open, setOpen] = useState(false);
  const modalRef = useRef(null);
  const { address: wagmiAddress, isConnected: wagmiIsConnected } = useAccount();
  const chainId = useChainId();

  const {
    account,
    accountState: state,
    createAccount,
    isCreatingAccount,
  } = useOrderlyAccount();

  useEffect(() => {
    if (!wagmiIsConnected || !wagmiAddress) return;
    if (timer != null) clearTimeout(timer);
    timer = setTimeout(() => {
      if ((state?.status ?? 0) < AccountStatusEnum.EnableTrading) {
        setOpen(true);
      }
      timer = undefined;
    }, 3000);
    return () => {
      if (timer != null) clearTimeout(timer);
    };
  }, [state?.status, wagmiIsConnected, wagmiAddress, account?.address]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  const isRegistered = (state?.status ?? 0) >= AccountStatusEnum.SignedIn;
  const hasOrderlyKey = (state?.status ?? 0) >= AccountStatusEnum.EnableTrading;
  const isTestnet =
    chainId === 11155111 ||
    chainId === 421614 ||
    chainId === 97 ||
    chainId === 80002;

  const getStatusName = (status) => {
    const names = [
      'NotConnected',
      'Connected',
      'NotSignedIn',
      'SignedIn',
      'DisabledTrading',
      'EnableTrading',
    ];
    return status !== undefined ? (names[status] ?? `Unknown(${status})`) : 'undefined';
  };

  const handleCreateAccount = async () => {
    try {
      if (!wagmiAddress) throw new Error('Wallet is not connected');
      if (isCreatingAccount) throw new Error('Account creation is already in progress. Please wait.');
      const hasAddress = account?.address || state?.address;
      if (!hasAddress) {
        throw new Error(
          'Address not set. Please wait for wallet to initialize.'
        );
      }
      if (state?.status === AccountStatusEnum.NotConnected) {
        throw new Error(
          `Expected NotSignedIn (2), got NotConnected (0). Please wait for wallet to initialize.`
        );
      }
      if (state?.status !== AccountStatusEnum.NotSignedIn) {
        throw new Error(
          `Expected NotSignedIn (2), got ${getStatusName(state?.status)} (${state?.status})`
        );
      }
      await createAccount();
    } catch (err) {
      throw err;
    }
  };

  const handleCreateOrderlyKey = async () => {
    try {
      await account.createOrderlyKey(365);
      setTimeout(() => setOpen(false), 3000);
    } catch (err) {
      throw err;
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F1F1FA3] backdrop-blur-sm">
          <div
            ref={modalRef}
            className="relative w-full max-w-md mx-4 bg-[#000000] rounded-2xl shadow-2xl font-nunito"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <h2 className="text-xl font-bold text-white">
                Connect with {import.meta.env.VITE_ORDERLY_BROKER_NAME || 'IoTrader'}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-[#999999] hover:text-white transition-colors p-1 hover:bg-[#2A2A2A] rounded-lg cursor-pointer"
                aria-label="Close"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="px-6 pb-6 space-y-6">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[#999999] text-sm">
                  You are connected with {import.meta.env.VITE_ORDERLY_BROKER_NAME || 'IoTrader'}{' '}
                  {isTestnet ? 'testnet' : 'mainnet'}
                </span>
              </div>

              <div className="border-t border-[#333333]" />

              <div className="flex flex-col items-center gap-3">
                <span className="text-white text-sm">Register your account first.</span>
                <button
                  onClick={handleCreateAccount}
                  disabled={isRegistered}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#141414] hover:bg-[#2A2A2A] disabled:bg-[#1F1F1F] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
                >
                  {isRegistered && (
                    <svg
                      className="w-5 h-5 text-[#FFF800]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  <span className={isRegistered ? 'text-[#FFF800]' : ''}>Register</span>
                </button>
              </div>

              <div className="border-t border-[#333333]" />

              <div className="flex flex-col items-center gap-3">
                <p className="text-[#999999] text-sm text-center">
                  Create a key pair to interact with our API. It will be stored in your
                  browser&apos;s local storage and is unique per device.
                </p>
                <button
                  onClick={handleCreateOrderlyKey}
                  disabled={hasOrderlyKey || !isRegistered}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#141414] hover:bg-[#2A2A2A] disabled:bg-[#1F1F1F] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
                >
                  {hasOrderlyKey && (
                    <svg
                      className="w-5 h-5 text-[#FFF800]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  <span className={hasOrderlyKey ? 'text-[#FFF800]' : ''}>Create Key</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
