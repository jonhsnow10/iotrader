const getEnv = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] != null) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key] != null) {
    return process.env[key];
  }
  return undefined;
};

export const IOTRADER_API_BASE =
  getEnv('VITE_IOTRADER_API_BASE') ||
  getEnv('REACT_APP_IOTRADER_API_BASE') ||
  'https://api-iotrader.dev';

export const VITE_BINANCE_API_BASE = getEnv('VITE_BINANCE_API_BASE') || 'https://api.binance.com';

export const VITE_OPENAI_API_KEY = getEnv('VITE_OPENAI_API_KEY');
