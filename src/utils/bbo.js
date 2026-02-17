export const BBOStrategy = {
  COUNTERPARTY_1: 'COUNTERPARTY_1',
  COUNTERPARTY_5: 'COUNTERPARTY_5',
  QUEUE_1: 'QUEUE_1',
  QUEUE_5: 'QUEUE_5',
};

function extractPrice(entry) {
  if (Array.isArray(entry)) {
    const price = entry[0];
    return typeof price === 'number' && isFinite(price) && price > 0 ? price : null;
  }
  const price = entry?.price ?? entry?.[0];
  return typeof price === 'number' && isFinite(price) && price > 0 ? price : null;
}

function getPriceAtLevel(entries, level) {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  if (level < 0 || level >= entries.length) return null;
  return extractPrice(entries[level]);
}

export function deriveBBOPrice(orderbook, side, strategy) {
  if (!orderbook) return null;
  const { bids, asks } = orderbook;
  const relevantSide = side === 'BUY' ? bids : asks;
  if (!Array.isArray(relevantSide) || relevantSide.length === 0) return null;

  let level;
  switch (strategy) {
    case BBOStrategy.COUNTERPARTY_1:
    case BBOStrategy.QUEUE_1:
      level = 0;
      break;
    case BBOStrategy.COUNTERPARTY_5:
    case BBOStrategy.QUEUE_5:
      level = 4;
      break;
    default:
      return null;
  }
  return getPriceAtLevel(relevantSide, level);
}
