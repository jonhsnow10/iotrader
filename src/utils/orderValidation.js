import { isValidTick } from './orderFormatting';

const PRICE_RANGE = 0.03;
const PRICE_SCOPE = 0.4;

export function validateOrder(input, symbolInfo, markPrice) {
  const errors = [];
  const warnings = [];

  if (!input.symbol || input.symbol.trim() === '') {
    errors.push('Symbol is required');
  }

  if (!input.side || (input.side !== 'BUY' && input.side !== 'SELL')) {
    errors.push('Side must be either BUY or SELL');
  }

  if (!input.orderType) {
    errors.push('Order type is required');
  }

  const quantity = input.quantity ?? input.amount;
  if (quantity === undefined || quantity === null) {
    errors.push('Order quantity or amount is required');
  } else if (quantity <= 0) {
    errors.push('Order quantity must be greater than 0');
  } else if (!isFinite(quantity)) {
    errors.push('Order quantity must be a valid number');
  }

  if (input.orderType !== 'MARKET') {
    if (input.price === undefined || input.price === null) {
      errors.push('Price is required for non-market orders');
    } else if (input.price <= 0) {
      errors.push('Price must be greater than 0');
    } else if (!isFinite(input.price)) {
      errors.push('Price must be a valid number');
    } else {
      const priceValidation = validatePrice(input.price, markPrice, input.side);
      errors.push(...priceValidation.errors);
      warnings.push(...priceValidation.warnings);
    }
  }

  if (markPrice <= 0 || !isFinite(markPrice)) {
    errors.push('Invalid mark price - cannot validate order');
  }

  if (quantity && input.price && symbolInfo?.minNotional) {
    const notional = quantity * input.price;
    if (notional < symbolInfo.minNotional) {
      errors.push(
        `Order value (${notional.toFixed(2)}) must be at least ${symbolInfo.minNotional.toFixed(2)} (minimum notional)`
      );
    }
  }

  if (quantity && symbolInfo?.baseMin && quantity < symbolInfo.baseMin) {
    errors.push(`Order quantity (${quantity}) must be at least ${symbolInfo.baseMin}`);
  }

  if (quantity && symbolInfo?.baseMax && quantity > symbolInfo.baseMax) {
    errors.push(`Order quantity (${quantity}) exceeds maximum allowed (${symbolInfo.baseMax})`);
  }

  if (quantity && symbolInfo?.baseTick) {
    if (!isValidTick(quantity, symbolInfo.baseTick)) {
      errors.push(`Order quantity must be a multiple of ${symbolInfo.baseTick}`);
    }
  }

  if (input.price && symbolInfo?.quoteTick) {
    if (!isValidTick(input.price, symbolInfo.quoteTick)) {
      errors.push(`Price must be a multiple of ${symbolInfo.quoteTick}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function validatePrice(price, markPrice, side) {
  const errors = [];
  const warnings = [];

  const upperPriceRange = markPrice * (1 + PRICE_RANGE);
  const lowerPriceRange = markPrice * (1 - PRICE_RANGE);
  const upperPriceScope = markPrice * (1 + PRICE_SCOPE);
  const lowerPriceScope = markPrice * (1 - PRICE_SCOPE);

  if (side === 'BUY') {
    if (price > upperPriceRange) {
      errors.push(
        `Buy limit price (${price.toFixed(2)}) cannot exceed ${upperPriceRange.toFixed(2)} (mark price + ${(PRICE_RANGE * 100).toFixed(0)}%)`
      );
    }
    if (price < lowerPriceScope) {
      errors.push(
        `Price (${price.toFixed(2)}) is too far below mark price (${markPrice.toFixed(2)}). Maximum deviation is ${(PRICE_SCOPE * 100).toFixed(0)}%`
      );
    }
    if (price > markPrice * 0.98 && price < markPrice * 1.02) {
      warnings.push('Price is very close to mark price - consider using a market order');
    }
  } else if (side === 'SELL') {
    if (price < lowerPriceRange) {
      errors.push(
        `Sell limit price (${price.toFixed(2)}) cannot be below ${lowerPriceRange.toFixed(2)} (mark price - ${(PRICE_RANGE * 100).toFixed(0)}%)`
      );
    }
    if (price > upperPriceScope) {
      errors.push(
        `Price (${price.toFixed(2)}) is too far above mark price (${markPrice.toFixed(2)}). Maximum deviation is ${(PRICE_SCOPE * 100).toFixed(0)}%`
      );
    }
    if (price > markPrice * 0.98 && price < markPrice * 1.02) {
      warnings.push('Price is very close to mark price - consider using a market order');
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}
