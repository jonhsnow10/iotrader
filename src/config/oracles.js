/**
 * Oracle address mappings for different cryptocurrencies
 * 
 * HOW TO GET ORACLE ADDRESSES:
 * 
 * 1. Official Chainlink Documentation (Recommended):
 *    - All Networks: https://docs.chain.link/data-feeds/price-feeds/addresses
 *    - BSC (BNB Smart Chain): https://docs.chain.link/data-feeds/price-feeds/addresses?network=bnb-chain
 *    - Ethereum Mainnet: https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum-mainnet
 *    - Polygon: https://docs.chain.link/data-feeds/price-feeds/addresses?network=polygon-mainnet
 *    - Avalanche: https://docs.chain.link/data-feeds/price-feeds/addresses?network=avalanche-mainnet
 * 
 * 2. Chainlink Data Feeds Explorer:
 *    - https://data.chain.link/
 *    - Search for your asset (e.g., "BTC/USD" or "BNB/USD")
 *    - Select your network and copy the contract address
 * 
 * 3. BSC (BNB Smart Chain) Specific:
 *    - BNB/USD: https://bscscan.com/address/[ORACLE_ADDRESS]
 *    - BTC/USD: https://bscscan.com/address/[ORACLE_ADDRESS]
 *    - Check official BSC Chainlink docs for latest addresses
 * 
 * 4. Using Environment Variables:
 *    - Add to your .env file:
 *      REACT_APP_BTC_ORACLE=0x...
 *      REACT_APP_ETH_ORACLE=0x...
 *      REACT_APP_BNB_ORACLE=0x...
 * 
 * IMPORTANT NOTES:
 * - Oracle addresses are different for each network (BSC, Ethereum, Polygon, etc.)
 * - Make sure you're using the correct network's oracle addresses
 * - Oracle addresses look like: 0x264990fbd0A4796A3E3d8E37C4d5F87a3bA5c6E3
 * - Always verify addresses from official Chainlink documentation
 */

// Default oracle address (placeholder - replace with actual Chainlink oracle)
export const DEFAULT_ORACLE = '0x0000000000000000000000000000000000000000';

// Oracle addresses by crypto symbol
// Format: { symbol: oracleAddress }
// 
// EXAMPLE BSC (BNB Smart Chain) Oracle Addresses (verify from official docs):
// BTC/USD: 0x264990fbd0A4796A3E3d8E37C4d5F87a3bA5c6E3
// ETH/USD: 0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e
// BNB/USD: 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE
// 
// ⚠️ WARNING: These are examples. Always get the latest addresses from:
// https://docs.chain.link/data-feeds/price-feeds/addresses?network=bnb-chain
export const ORACLE_ADDRESSES = {
  BTC: process.env.REACT_APP_BTC_ORACLE || DEFAULT_ORACLE,
  ETH: process.env.REACT_APP_ETH_ORACLE || DEFAULT_ORACLE,
  BNB: process.env.REACT_APP_BNB_ORACLE || DEFAULT_ORACLE,
  SOL: process.env.REACT_APP_SOL_ORACLE || DEFAULT_ORACLE,
  XRP: process.env.REACT_APP_XRP_ORACLE || DEFAULT_ORACLE,
  DOGE: process.env.REACT_APP_DOGE_ORACLE || DEFAULT_ORACLE,
};

/**
 * Get oracle address for a crypto symbol
 * @param {string} symbol - Crypto symbol (BTC, ETH, etc.)
 * @returns {string} Oracle address
 */
export const getOracleAddress = (symbol) => {
  return ORACLE_ADDRESSES[symbol.toUpperCase()] || DEFAULT_ORACLE;
};
