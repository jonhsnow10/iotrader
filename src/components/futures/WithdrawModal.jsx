import React, { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useOrderlyWithdrawWithWagmi } from '../../hooks/orderly/useOrderlyWithdrawWithWagmi';

export function WithdrawModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const { isConnected } = useAccount();
  const {
    withdraw,
    availableWithdraw,
    isLoading,
    canWithdraw,
    withdrawDisabledReason,
  } = useOrderlyWithdrawWithWagmi();

  const [amount, setAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const formatUSDC = (value) => {
    if (value === undefined) return '0.00';
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  };

  useEffect(() => {
    const h = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    if (isOpen) {
      document.addEventListener('mousedown', h);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', h);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleWithdraw = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }
    if (num < 5) {
      setErrorMessage('Minimum withdrawal is 5 USDC');
      return;
    }
    if (availableWithdraw !== undefined && num > availableWithdraw) {
      setErrorMessage('Insufficient withdrawable balance');
      return;
    }
    setErrorMessage(null);
    try {
      await withdraw(amount);
      setShowSuccess(true);
      setAmount('');
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      const msg = err?.message || 'Withdrawal failed';
      if (!msg.toLowerCase().includes('user rejected') && !msg.toLowerCase().includes('cancelled')) {
        setErrorMessage(msg);
      }
    }
  };

  const handleMax = () => {
    if (availableWithdraw !== undefined && availableWithdraw > 0) {
      setAmount(Math.max(0, availableWithdraw - 1).toFixed(2));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ background: 'rgba(31, 31, 31, 0.64)' }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md mx-4 bg-[#000000] rounded-xl shadow-2xl border border-[color:var(--color-border-strong)]"
        style={{ fontFamily: 'var(--font-geist-sans), Inter, sans-serif' }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[color:var(--color-border-strong)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)]">Withdraw USDC</h2>
          <button
            onClick={onClose}
            className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors p-1 hover:bg-[color:var(--color-background-hover)] rounded-lg cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#999999] mb-2">Amount</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!isConnected}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-[#080808] border border-[#1F1F1F] rounded-lg text-white text-sm pr-24 focus:outline-none focus:border-[color:var(--color-accent-primary)] disabled:opacity-50"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMax}
                  disabled={!canWithdraw}
                  className="text-[color:var(--color-accent-primary)] text-xs font-medium hover:underline disabled:opacity-50"
                >
                  Max
                </button>
                <span className="text-white text-sm">USDC</span>
              </div>
            </div>
          </div>

          {isConnected && (
            <div className="flex justify-between text-sm">
              <span className="text-[#999999]">Available</span>
              <span className="text-white font-mono">{formatUSDC(availableWithdraw)} USDC</span>
            </div>
          )}

          {errorMessage && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}

          {showSuccess && (
            <div className="px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">Withdrawal successful!</p>
            </div>
          )}

          {isConnected ? (
            <button
              onClick={handleWithdraw}
              disabled={!canWithdraw || !amount || parseFloat(amount) <= 0 || isLoading}
              className="w-full btn-primary-accent px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!canWithdraw ? withdrawDisabledReason : undefined}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Withdrawing...
                </span>
              ) : (
                'Withdraw'
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full btn-primary-accent px-4 py-3"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
