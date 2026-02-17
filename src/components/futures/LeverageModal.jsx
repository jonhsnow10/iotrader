import React, { useState, useEffect, useRef } from 'react';
import { extractTokenSymbol } from '../../utils/tokenIcons';

export function LeverageModal({
  isOpen,
  onClose,
  symbol,
  currentLeverage,
  onSave,
  side = 'buy',
  marginMode = 'cross',
}) {
  const modalRef = useRef(null);

  const initialLeverage = isOpen ? currentLeverage : 10;
  const [leverage, setLeverage] = useState(initialLeverage);
  const [inputValue, setInputValue] = useState(initialLeverage.toString());
  const [error, setError] = useState('');

  const baseAsset = extractTokenSymbol(symbol);
  const leverageOptions = [1, 2, 3, 4, 5, 10, 20];
  const maxLeverage = 20;
  const symbolDisplay = symbol?.replace?.('PERP_', '')?.replace?.(/_/g, '/') ?? `${baseAsset}/USDC`;

  useEffect(() => {
    if (isOpen) {
      setLeverage(currentLeverage);
      setInputValue(String(currentLeverage));
      setError('');
    }
  }, [isOpen, currentLeverage]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= maxLeverage) {
      setLeverage(numValue);
      setError('');
    } else if (numValue > maxLeverage) {
      setError(`Maximum leverage is ${maxLeverage}x`);
    } else if (numValue < 1) {
      setError('Minimum leverage is 1x');
    }
  };

  const handleIncrement = () => {
    const newValue = Math.min(leverage + 1, maxLeverage);
    setLeverage(newValue);
    setInputValue(newValue.toString());
    setError('');
  };

  const handleDecrement = () => {
    const newValue = Math.max(leverage - 1, 1);
    setLeverage(newValue);
    setInputValue(newValue.toString());
    setError('');
  };

  const handleQuickSelect = (value) => {
    setLeverage(value);
    setInputValue(value.toString());
    setError('');
  };

  const handleSave = () => {
    if (leverage >= 1 && leverage <= maxLeverage) {
      onSave(leverage);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ background: 'rgba(31, 31, 31, 0.64)' }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl mx-4 bg-[#000000] rounded-xl shadow-2xl border border-[color:var(--color-border-strong)]"
        style={{ fontFamily: 'var(--font-geist-sans), Inter, sans-serif' }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[color:var(--color-border-strong)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)]">Adjust leverage</h2>
          <button
            onClick={onClose}
            className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors p-1 hover:bg-[color:var(--color-background-hover)] rounded-lg cursor-pointer"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
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

        <div className="px-6 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style={{ background: 'var(--color-background-hover)' }}>
                <img
                  src={`https://oss.orderly.network/static/symbol_logo/${baseAsset}.png`}
                  alt={baseAsset}
                  width={32}
                  height={32}
                  className="rounded-full w-8 h-8 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <span className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                {symbolDisplay}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  side === 'buy'
                    ? 'bg-[color:var(--color-success)]/20 text-[color:var(--color-success)]'
                    : 'bg-[color:var(--color-error)]/20 text-[color:var(--color-error)]'
                }`}
              >
                {side === 'buy' ? 'Long' : 'Short'}
              </span>
              <span className="px-3 py-1 rounded text-sm font-medium text-[color:var(--color-text-primary)]" style={{ background: 'var(--color-background-hover)' }}>
                {marginMode === 'cross' ? 'Cross' : 'Isolated'} {currentLeverage}X
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[color:var(--color-text-secondary)] text-sm mb-2">Current: {leverage}x</p>
            <div className="flex items-center justify-center gap-4 rounded-xl p-4 border border-[color:var(--color-border-strong)]" style={{ background: 'var(--color-background)' }}>
              <button
                type="button"
                onClick={handleDecrement}
                className="w-10 h-10 flex items-center justify-center text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-background-hover)] rounded-lg transition-colors cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <div className="relative flex items-center justify-center gap-1">
                <input
                  type="number"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="leverage-modal-input w-32 bg-transparent text-4xl font-bold text-center outline-none appearance-none text-[color:var(--color-text-primary)]"
                  min={1}
                  max={maxLeverage}
                />
                <span className="text-2xl font-medium text-[color:var(--color-text-primary)]">x</span>
              </div>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-10 h-10 flex items-center justify-center text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-background-hover)] rounded-lg transition-colors cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
            {error && (
              <p className="text-sm mt-2 font-medium text-[color:var(--color-error)]">{error}</p>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {leverageOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleQuickSelect(option)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  leverage === option
                    ? 'bg-accent-gradient text-black border border-[color:var(--color-accent-primary)]'
                    : 'text-[color:var(--color-text-secondary)] border border-[color:var(--color-border-strong)] hover:border-[color:var(--color-accent-primary)] hover:text-[color:var(--color-text-primary)]'
                }`}
                style={leverage !== option ? { background: 'var(--color-background)' } : undefined}
              >
                {option}x
              </button>
            ))}
          </div>

          <div className="space-y-2 text-sm text-[color:var(--color-text-secondary)]">
            <p>
              * Highest available leverage {maxLeverage}x. Selecting higher
              leverage increases your liquidation risk.
            </p>
            <p>
              * Actual position leverage adjusts with notional changes and may
              fall below your selected leverage.
            </p>
          </div>

          {leverage >= 10 && (
            <div className="rounded-lg p-3 border border-amber-500/50 bg-amber-500/10">
              <p className="text-sm font-medium text-amber-400">
                High leverage warning: Leverage of 10x or higher significantly
                increases liquidation risk. Please ensure you understand the
                risks.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-[color:var(--color-accent-primary)] text-base font-semibold rounded-lg transition-colors cursor-pointer text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-background-hover)]"
              style={{ background: 'var(--color-background)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!!error || leverage < 1 || leverage > maxLeverage}
              className="flex-1 btn-primary-accent px-6 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .leverage-modal-input::-webkit-inner-spin-button,
        .leverage-modal-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .leverage-modal-input {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
