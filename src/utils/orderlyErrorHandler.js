const ERROR_CODES = {
  '1000': { message: 'Invalid request parameters', userMessage: 'Invalid order parameters.' },
  '1001': { message: 'Account not found', userMessage: 'Account not found. Please connect your wallet.' },
  '1003': { message: 'Insufficient balance', userMessage: 'Insufficient balance to place this order.' },
  '1004': { message: 'Order not found', userMessage: 'Order not found. It may have been filled or cancelled.' },
  '1100': { message: 'Insufficient position size', userMessage: 'Insufficient position size for reduce-only order.' },
};

export function parseOrderlyError(error) {
  if (!error) {
    return { message: 'Unknown error', category: 'unknown', isRetryable: false, userMessage: 'Please try again.' };
  }
  if (typeof error === 'string') {
    return { message: error, category: 'unknown', isRetryable: false, userMessage: error };
  }
  const err = error;
  const code = err.code?.toString() || err.error_code?.toString();
  const msg = err.message || err.msg || err.error;
  if (code && ERROR_CODES[code]) {
    return { ...ERROR_CODES[code], message: msg || ERROR_CODES[code].message };
  }
  if (msg) {
    const lower = msg.toLowerCase();
    if (lower.includes('insufficient position') || lower.includes('reduce only')) {
      return { message: msg, category: 'validation', isRetryable: false, userMessage: 'Order size exceeds your current position.' };
    }
    if (lower.includes('network') || lower.includes('timeout')) {
      return { message: msg, category: 'network', isRetryable: true, userMessage: 'Network error. Please try again.' };
    }
    return { message: msg, category: 'unknown', isRetryable: false, userMessage: msg };
  }
  if (err.status === 401) {
    return { message: 'Unauthorized', category: 'authentication', isRetryable: false, userMessage: 'Please reconnect your wallet.' };
  }
  if (err.status >= 500) {
    return { message: 'Server error', category: 'network', isRetryable: true, userMessage: 'Server error. Please try again.' };
  }
  return { message: 'An error occurred', category: 'unknown', isRetryable: false, userMessage: 'Please try again.' };
}

export function formatErrorForUser(error) {
  const parsed = parseOrderlyError(error);
  return parsed.userMessage || parsed.message;
}

export function handlePositionError(error, action) {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();
  if (lower.includes('insufficient position')) {
    return { userMessage: 'Position size insufficient for this action' };
  }
  if (lower.includes('margin') || lower.includes('liquidation')) {
    return { userMessage: 'Action would violate margin requirements' };
  }
  return {
    userMessage: action === 'close'
      ? 'Failed to close position. Please try again.'
      : 'Failed to set TP/SL. Please try again.',
  };
}
