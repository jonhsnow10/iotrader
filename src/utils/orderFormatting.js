export function roundDownToTick(value, tick) {
  if (tick <= 0 || !isFinite(tick)) return value;
  if (!isFinite(value)) return 0;
  return Math.floor(value / tick) * tick;
}

export function roundUpToTick(value, tick) {
  if (tick <= 0 || !isFinite(tick)) return value;
  if (!isFinite(value)) return 0;
  return Math.ceil(value / tick) * tick;
}

export function roundToTick(value, tick) {
  if (tick <= 0 || !isFinite(tick)) return value;
  if (!isFinite(value)) return 0;
  return Math.round(value / tick) * tick;
}

export function isValidTick(value, tick, tolerance = 1e-10) {
  if (!isFinite(value) || !isFinite(tick)) return false;
  if (tick <= 0) return true;
  const remainder = value % tick;
  return Math.abs(remainder) < tolerance || Math.abs(remainder - tick) < tolerance;
}

export function formatQuantity(quantity, baseTick = 0.0001, baseDp = 4) {
  if (!isFinite(quantity) || quantity <= 0) return '0';
  const rounded = roundDownToTick(quantity, baseTick);
  return rounded.toFixed(baseDp).replace(/\.?0+$/, '');
}

export function formatPrice(price, quoteTick = 0.01, quoteDp = 2) {
  if (!isFinite(price) || price <= 0) return '0';
  const rounded = Math.round(price / quoteTick) * quoteTick;
  return rounded.toFixed(quoteDp).replace(/\.?0+$/, '');
}

export function quoteToBaseQuantity(total, price, baseTick, baseDp) {
  if (!price || price <= 0 || !isFinite(total)) return '0';
  const qty = total / price;
  return formatQuantity(qty, baseTick, baseDp);
}
