export function extractTokenSymbol(fullSymbol) {
  const match = fullSymbol?.match?.(/^(?:PERP|SPOT)_([A-Z]+)_([A-Z]+)$/);
  return match?.[1] || fullSymbol || 'ETH';
}

export function extractQuoteSymbol(fullSymbol) {
  const match = fullSymbol?.match?.(/^(?:PERP|SPOT)_([A-Z]+)_([A-Z]+)$/);
  return match?.[2] || 'USDC';
}
