export const BBO_STRATEGIES = [
  'Counterparty 1',
  'Counterparty 5',
  'Queue 1',
  'Queue 5',
];

export function isBBOStrategy(value) {
  return BBO_STRATEGIES.includes(value);
}
