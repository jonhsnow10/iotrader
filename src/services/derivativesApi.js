import { IOTRADER_API_BASE as API_BASE } from '../config/env';

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

export async function fetchWithRetry(url, opts = {}) {
  const { signal, timeout = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES } = opts;
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(url, {
        signal: signal || controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);
      if (res.ok) return res;
      if (res.status === 429 && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
        continue;
      }
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    } catch (err) {
      lastError = err;
      if (attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }
  throw lastError || new Error('Request failed');
}

export function normalizeContracts(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.contracts)) return data.contracts;
  return [];
}

export async function fetchContracts(opts = {}) {
  const res = await fetchWithRetry(`${API_BASE}/api/derivatives/contracts`, opts);
  const data = await res.json();
  return normalizeContracts(data);
}

export async function fetchOrderbook(tickerId, opts = {}) {
  const res = await fetchWithRetry(
    `${API_BASE}/api/derivatives/orderbook/${encodeURIComponent(tickerId)}`,
    opts
  );
  return res.json();
}

export async function fetchContractSpecs(opts = {}) {
  const res = await fetchWithRetry(`${API_BASE}/api/derivatives/contract_specs`, opts);
  const data = await res.json();
  return Array.isArray(data) ? data : data?.specs || [];
}

export function contractsBySymbol(contracts) {
  const map = {};
  for (const c of contracts) {
    const ticker = c.ticker_id || '';
    const symbol = ticker.split('-')[0];
    if (symbol) {
      map[symbol] = {
        ticker_id: c.ticker_id,
        symbol,
        last_price: parseFloat(c.last_price) || 0,
        bid: parseFloat(c.bid) || 0,
        ask: parseFloat(c.ask) || 0,
        high: parseFloat(c.high) || 0,
        low: parseFloat(c.low) || 0,
        base_volume: parseFloat(c.base_volume) || 0,
        target_volume: parseFloat(c.target_volume) || 0,
        volume_24h_usd: parseFloat(c.volume_24h_usd) || parseFloat(c.target_volume) || 0,
        open_interest: parseFloat(c.open_interest) || 0,
        open_interest_usd: parseFloat(c.open_interest_usd) || 0,
        index_price: parseFloat(c.index_price) || parseFloat(c.last_price) || 0,
        funding_rate: c.funding_rate != null ? parseFloat(c.funding_rate) : null,
      };
    }
  }
  return map;
}

export { API_BASE };
