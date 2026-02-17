import { useWithdraw, useAccount as useOrderlyAccount } from '@orderly.network/hooks';
import { AccountStatusEnum } from '@orderly.network/types';
import { useAccount, useChainId } from 'wagmi';
import { useState, useCallback, useMemo } from 'react';

const ORDERLY_SUPPORTED_CHAINS = [1, 42161, 56, 11155111];

export function useOrderlyWithdrawWithWagmi() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { account: orderlyAccount, state: orderlyState } = useOrderlyAccount();
  const [isLoading, setIsLoading] = useState(false);

  const {
    withdraw: sdkWithdraw,
    availableWithdraw,
    unsettledPnL,
    availableBalance,
    maxAmount,
  } = useWithdraw({
    srcChainId: chainId,
    token: 'USDC',
    decimals: 6,
  });

  const isSupportedChain = useMemo(
    () => ORDERLY_SUPPORTED_CHAINS.includes(chainId),
    [chainId]
  );

  const { canWithdraw, withdrawDisabledReason } = useMemo(() => {
    if (!isConnected) return { canWithdraw: false, withdrawDisabledReason: 'Connect wallet' };
    if (!orderlyState || orderlyState.status !== AccountStatusEnum.EnableTrading) {
      return { canWithdraw: false, withdrawDisabledReason: 'Enable trading' };
    }
    if (availableWithdraw === undefined || availableWithdraw <= 0) {
      return { canWithdraw: false, withdrawDisabledReason: 'Insufficient balance' };
    }
    if (!isSupportedChain) {
      return { canWithdraw: false, withdrawDisabledReason: 'Switch network' };
    }
    return { canWithdraw: true, withdrawDisabledReason: '' };
  }, [isConnected, orderlyState, availableWithdraw, isSupportedChain]);

  const withdraw = useCallback(
    async (amount) => {
      setIsLoading(true);
      try {
        const numAmount = parseFloat(amount);
        if (numAmount < 5) {
          throw new Error('Minimum withdrawal amount is 5 USDC');
        }
        const withdrawChainId = orderlyAccount?.chainId
          ? Number(orderlyAccount.chainId)
          : chainId;
        return await sdkWithdraw({
          chainId: withdrawChainId,
          token: 'USDC',
          amount: String(amount),
          allowCrossChainWithdraw: false,
        });
      } catch (error) {
        console.error('Withdraw error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [sdkWithdraw, chainId, orderlyAccount]
  );

  return {
    withdraw,
    availableWithdraw: availableWithdraw ?? undefined,
    availableBalance: availableBalance ?? undefined,
    maxAmount: maxAmount ?? undefined,
    unsettledPnL: unsettledPnL ?? undefined,
    isLoading,
    canWithdraw,
    withdrawDisabledReason,
  };
}
