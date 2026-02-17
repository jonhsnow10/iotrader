import { useState, useCallback, useEffect } from 'react';
import { useAccount } from '@orderly.network/hooks';
import { AccountStatusEnum, ChainNamespace } from '@orderly.network/types';
import { useAccount as useWagmiAccount, useChainId } from 'wagmi';

export function useOrderlyAccount() {
  const { createAccount, createOrderlyKey, state, account } = useAccount();
  const { address: wagmiAddress, isConnected: wagmiIsConnected } =
    useWagmiAccount();
  const chainId = useChainId();

  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [accountError, setAccountError] = useState(null);
  const [keyError, setKeyError] = useState(null);
  const [addressError, setAddressError] = useState(null);
  const [isSettingAddress, setIsSettingAddress] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [initializedAddress, setInitializedAddress] = useState(null);

  useEffect(() => {
    if (!wagmiAddress || !wagmiIsConnected) return;
    if (
      hasInitialized &&
      initializedAddress &&
      initializedAddress.toLowerCase() === wagmiAddress.toLowerCase()
    ) {
      return;
    }
    if (
      account.address &&
      account.address.toLowerCase() === wagmiAddress.toLowerCase()
    ) {
      setHasInitialized(true);
      setInitializedAddress(wagmiAddress);
      return;
    }
    if (
      account.address === undefined &&
      state?.status === AccountStatusEnum.NotConnected
    ) {
      const ethereumProvider = window.ethereum;
      if (!ethereumProvider) return;
      account
        .setAddress(wagmiAddress, {
          provider: ethereumProvider,
          chain: {
            id: `0x${chainId.toString(16)}`,
            namespace: ChainNamespace.evm,
          },
          wallet: { name: 'MetaMask' },
        })
        .then(() => {
          setHasInitialized(true);
          setInitializedAddress(wagmiAddress);
        })
        .catch((err) => {
          setAddressError(err instanceof Error ? err : new Error(String(err)));
        });
    }
  }, [
    wagmiAddress,
    wagmiIsConnected,
    account.address,
    state?.status,
    hasInitialized,
    initializedAddress,
    account,
    chainId,
  ]);

  const handleCreateAccount = useCallback(async () => {
    setIsCreatingAccount(true);
    setAccountError(null);
    try {
      if (!state || state.status < AccountStatusEnum.Connected) {
        throw new Error(
          `Cannot create account: Account status must be at least Connected (current: ${state?.status ?? 'undefined'})`
        );
      }
      if (state.status !== AccountStatusEnum.NotSignedIn) {
        throw new Error(
          `Cannot create account: Status must be NotSignedIn (current: ${state.status})`
        );
      }
      return await createAccount();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setAccountError(err);
      throw err;
    } finally {
      setIsCreatingAccount(false);
    }
  }, [createAccount, state]);

  return {
    account,
    accountState: state,
    accountExists: state?.status >= AccountStatusEnum.SignedIn,
    isSignedIn: state?.status >= AccountStatusEnum.SignedIn,
    canTrade: state?.status >= AccountStatusEnum.EnableTrading,
    createAccount: handleCreateAccount,
    isCreatingAccount,
    accountError,
    isLoading: isCreatingAccount || isSettingAddress,
  };
}
