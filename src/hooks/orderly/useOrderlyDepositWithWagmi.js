import { useDeposit, useAccount, useCollateral } from '@orderly.network/hooks';
import { useAccount as useWagmiAccount, useChainId } from 'wagmi';
import { useCallback } from 'react';

export function useOrderlyDepositWithWagmi() {
  const { address: wagmiAddress } = useWagmiAccount();
  const chainId = useChainId();
  const { account: orderlyAccount, state: orderlyState } = useAccount();
  const collateral = useCollateral({ dp: 2 });

  const usdcAddress =
    chainId === 1
      ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      : chainId === 42161
        ? '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
        : chainId === 56
          ? '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
          : chainId === 11155111
            ? '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
            : '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

  const usdcDecimals = chainId === 56 ? 18 : 6;

  const {
    balance,
    allowance,
    approve,
    deposit: orderlyDeposit,
    depositFee,
    quantity,
    setQuantity,
    balanceRevalidating,
    depositFeeRevalidating,
  } = useDeposit({
    address: usdcAddress,
    decimals: usdcDecimals,
    srcToken: 'USDC',
    srcChainId: chainId,
  });

  const executeDeposit = useCallback(async () => {
    if (!orderlyAccount?.address) {
      throw new Error('Orderly account not initialized. Please complete registration first.');
    }
    if (orderlyState?.status !== 5) {
      throw new Error('Orderly account not ready for trading. Please complete registration.');
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      throw new Error('Please enter an amount first');
    }
    let retries = 0;
    while ((!depositFee || depositFee.toString() === '0') && retries < 10) {
      await new Promise((r) => setTimeout(r, 500));
      retries++;
    }
    if (!depositFee || depositFee.toString() === '0') {
      throw new Error('Unable to calculate deposit fee. Try Ethereum or Arbitrum.');
    }
    const allowanceNum = parseFloat(allowance || '0');
    const quantityNum = parseFloat(quantity);
    if (allowanceNum < quantityNum) {
      await approve();
    }
    const result = await orderlyDeposit();
    await new Promise((r) => setTimeout(r, 3000));
    return result;
  }, [
    quantity,
    depositFee,
    orderlyAccount?.address,
    orderlyState?.status,
    allowance,
    approve,
    orderlyDeposit,
  ]);

  return {
    balance,
    allowance,
    depositFee,
    quantity,
    setQuantity,
    deposit: executeDeposit,
    isLoading: balanceRevalidating || depositFeeRevalidating,
    orderlyBalance: collateral,
  };
}
