import { parseOrderlyError, formatErrorForUser } from './orderlyErrorHandler';

export function handleDepositError(error) {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();
  if (lower.includes('user rejected') || lower.includes('user denied')) {
    return { userMessage: 'Transaction cancelled' };
  }
  if (lower.includes('insufficient')) {
    return { userMessage: 'Insufficient balance for deposit' };
  }
  if (lower.includes('network') || lower.includes('chain')) {
    return { userMessage: 'Network error. Please check your wallet network and try again.' };
  }
  return { userMessage: formatErrorForUser(parseOrderlyError(error)) || 'Deposit failed. Please try again.' };
}

export function handleWithdrawError(error) {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();
  if (lower.includes('user rejected') || lower.includes('user denied')) {
    return { userMessage: 'Transaction cancelled' };
  }
  if (lower.includes('insufficient')) {
    return { userMessage: 'Insufficient withdrawable balance' };
  }
  if (lower.includes('margin') || lower.includes('collateral')) {
    return { userMessage: 'Withdrawal would exceed margin requirements.' };
  }
  return { userMessage: formatErrorForUser(parseOrderlyError(error)) || 'Withdrawal failed. Please try again.' };
}
