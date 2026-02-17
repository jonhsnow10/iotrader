import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useOrderlyDepositWithWagmi } from '../../hooks/orderly/useOrderlyDepositWithWagmi';

const ORDERLY_SUPPORTED_CHAINS = [
  { evmChainId: 1, name: 'Ethereum', id: 'ethereum' },
  { evmChainId: 42161, name: 'Arbitrum', id: 'arbitrum' },
  { evmChainId: 56, name: 'BNB Chain', id: 'bsc' },
  { evmChainId: 11155111, name: 'Sepolia', id: 'sepolia' },
];

export function DepositModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);
  const {
    deposit,
    isLoading,
    balance,
    depositFee,
    quantity,
    setQuantity,
  } = useOrderlyDepositWithWagmi();

  const [depositStatus, setDepositStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const currentNetwork = ORDERLY_SUPPORTED_CHAINS.find((c) => c.evmChainId === chainId) || ORDERLY_SUPPORTED_CHAINS[0];

  const handleNetworkSelect = (network) => {
    try {
      if (isConnected && switchChain && network.evmChainId !== chainId) {
        switchChain({ chainId: network.evmChainId });
      }
      setNetworkDropdownOpen(false);
      setErrorMessage(null);
    } catch (error) {
      console.error('[DepositModal] Network switch failed:', error);
      setErrorMessage('Failed to switch network. Please try again.');
    }
  };

  const formatBalance = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    if (num === 0) return '0.00';
    if (num < 0.01) return num.toFixed(6);
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getNativeCurrency = () => {
    if (chainId === 56) return 'BNB';
    return 'ETH';
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

  const handleDeposit = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }
    if (parseFloat(quantity) > parseFloat(balance)) {
      setErrorMessage('Insufficient USDC balance');
      return;
    }
    setDepositStatus('approving');
    setErrorMessage(null);
    try {
      const result = await deposit();
      setDepositStatus('success');
      if (result?.hash) setTxHash(result.hash);
      setQuantity('');
      setTimeout(() => {
        setDepositStatus('idle');
        setTxHash(null);
        onClose();
      }, 3000);
    } catch (err) {
      setDepositStatus('error');
      setErrorMessage(err?.message || 'Deposit failed');
      setTimeout(() => setDepositStatus('idle'), 5000);
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
          <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)]">Deposit USDC</h2>
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
          {(depositStatus === 'approving' || depositStatus === 'depositing') && (
            <div className="mb-4 p-4 bg-[#1F1F1F] rounded-lg border border-[#333333]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(255,248,0,0.2)] flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-[color:var(--color-accent-primary)]" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">{depositStatus === 'approving' ? 'Approval pending' : 'Deposit pending'}</p>
                    <p className="text-[#999999] text-sm">{depositStatus === 'approving' ? `Confirming on ${currentNetwork.name} (1-5 min)` : 'Confirming deposit (1-5 min)'}</p>
                  </div>
                </div>
                <span className="text-[#999999] text-sm font-mono">Step {depositStatus === 'approving' ? '1' : '2'} of 2</span>
              </div>
              <div className="flex gap-2">
                <div className={`h-1 flex-1 rounded-full transition-colors ${depositStatus === 'approving' || depositStatus === 'depositing' ? 'bg-accent-gradient' : 'bg-[#333333]'}`} />
                <div className={`h-1 flex-1 rounded-full transition-colors ${depositStatus === 'depositing' ? 'bg-accent-gradient' : 'bg-[#333333]'}`} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#999999] mb-2">Network</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
                className="w-full px-4 py-3 bg-[#080808] border border-[#1F1F1F] rounded-lg text-white text-sm font-medium flex items-center justify-between hover:border-[#333333] transition-colors"
              >
                <span>{currentNetwork.name}</span>
                <svg className={`w-4 h-4 transition-transform ${networkDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {networkDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNetworkDropdownOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-2 shadow-xl z-50 max-h-64 overflow-y-auto futures-dropdown-panel flex flex-col">
                    {ORDERLY_SUPPORTED_CHAINS.map((network) => (
                      <button
                        key={network.evmChainId}
                        type="button"
                        onClick={() => handleNetworkSelect(network)}
                        className={`futures-dropdown-item flex flex-row items-center gap-3 ${currentNetwork.evmChainId === network.evmChainId ? '!text-[#EBB30B]' : ''}`}
                      >
                        <span className="flex-1 text-left">{network.name}</span>
                        {currentNetwork.evmChainId === network.evmChainId && (
                          <svg className="w-4 h-4 text-[#EBB30B] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#999999] mb-2">Amount</label>
            <div className="relative">
              <input
                type="number"
                value={quantity || ''}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={!isConnected}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-[#080808] border border-[#1F1F1F] rounded-lg text-white text-sm pr-24 focus:outline-none focus:border-[color:var(--color-accent-primary)] disabled:opacity-50"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white text-sm">USDC</div>
            </div>
          </div>

          {isConnected && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-[#999999]">Available Balance</span>
                <span className="text-white font-mono">{formatBalance(balance)} USDC</span>
              </div>
              {quantity && parseFloat(quantity) > 0 && depositFee && (
                <div className="px-3 py-2 bg-[#1F1F1F]/50 rounded-lg">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#999999]">Cross-chain relay fee</span>
                    <span className="text-white font-mono">~{depositFee} {getNativeCurrency()}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {errorMessage && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}

          {txHash && depositStatus === 'success' && (
            <div className="px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">
                Deposit successful!
                <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="ml-2 underline">View transaction</a>
              </p>
            </div>
          )}

          {isConnected ? (
            <button
              onClick={handleDeposit}
              disabled={!quantity || parseFloat(quantity) <= 0 || isLoading || depositStatus === 'approving' || depositStatus === 'depositing'}
              className="w-full btn-primary-accent px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || depositStatus === 'approving' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {depositStatus === 'approving' ? 'Approving...' : 'Depositing...'}
                </span>
              ) : depositStatus === 'success' ? '✓ Success' : 'Deposit'}
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
