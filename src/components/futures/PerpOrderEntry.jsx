import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  startTransition,
} from 'react';
import { useAccount } from 'wagmi';
import { WalletConnectModal } from '../WalletConnectModal';
import { LeverageModal } from './LeverageModal';
import { DepositModal } from './DepositModal';
import {
  useCollateral,
  useOrderEntry,
  usePrivateQuery,
} from '@orderly.network/hooks';
import { OrderSide, OrderType } from '@orderly.network/types';
import { extractTokenSymbol } from '../../utils/tokenIcons';
import { BBOSelector, BBO_STRATEGIES } from './BBOSelector';
import { InfoTooltip } from '../ui/InfoTooltip';
import {
  useOrderlyOrderBook,
  useOrderlySymbolValidation,
} from '../../hooks/orderly/useOrderlyMarkets';
import { deriveBBOPrice, BBOStrategy } from '../../utils/bbo';
import { validateOrder } from '../../utils/orderValidation';
import {
  parseOrderlyError,
  formatErrorForUser,
} from '../../utils/orderlyErrorHandler';
import {
  formatQuantity,
  formatPrice,
  quoteToBaseQuantity,
} from '../../utils/orderFormatting';

export function PerpOrderEntry({ symbol }) {
  const { isConnected } = useAccount();

  const { freeCollateral } = useCollateral({ dp: 2 });

  const orderEntryHook = useOrderEntry(symbol, {
    initialOrder: { side: OrderSide.BUY, order_type: OrderType.MARKET },
  });

  const {
    submit,
    setValue,
    formattedOrder,
    metaState,
    isMutating,
    maxQty,
    markPrice,
    estLiqPrice,
  } = orderEntryHook;

  const { bids, asks } = useOrderlyOrderBook(symbol, 10);

  const { data: positionsData } = usePrivateQuery('/v1/positions', {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  });

  const getPositionQty = useCallback(() => {
    const pos = positionsData?.rows?.find((p) => p.symbol === symbol);
    return pos?.position_qty ?? 0;
  }, [positionsData, symbol]);

  const baseToken = useMemo(() => extractTokenSymbol(symbol), [symbol]);

  const [orderSide, setOrderSide] = useState('buy');
  const [orderType, setOrderType] = useState('market');
  const [stopLimitDropdownOpen, setStopLimitDropdownOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [leverageModalOpen, setLeverageModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [leverage, setLeverage] = useState(10);
  const [sizePercentage, setSizePercentage] = useState(0);
  const [marginMode] = useState('cross');
  const dropdownRef = useRef(null);

  const [bboEnabled, setBboEnabled] = useState(false);
  const [bboStrategy, setBboStrategy] = useState(BBO_STRATEGIES[0]);

  const debounceTimeoutRef = useRef(null);
  const priceDebounceRef = useRef(null);
  const isInternalUpdateRef = useRef(false);

  const [quantityInput, setQuantityInput] = useState('');
  const [totalInput, setTotalInput] = useState('');
  const [marketSizeUSDC, setMarketSizeUSDC] = useState('');
  const [submitError, setSubmitError] = useState(null);

  const [tpslEnabled, setTpslEnabled] = useState(false);
  const [tpInput, setTpInput] = useState('');
  const [slInput, setSlInput] = useState('');

  const {
    symbolInfo,
    markPrice: validationMarkPrice,
    isReady: isValidationReady,
  } = useOrderlySymbolValidation(symbol);

  const { baseTick, quoteTick, baseDp, quoteDp } = symbolInfo;

  const tpslValidation = useMemo(() => {
    if (!tpslEnabled) return { tpError: null, slError: null };

    const isLong = orderSide === 'buy';
    const entryPrice =
      orderType === 'market'
        ? markPrice || 0
        : parseFloat(formattedOrder.order_price || '0');

    const errors = { tpError: null, slError: null };

    if (tpInput && tpInput.trim() !== '') {
      const tpValue = parseFloat(tpInput);
      if (isNaN(tpValue) || tpValue <= 0) {
        errors.tpError = 'Invalid price';
      } else if (entryPrice > 0) {
        if (isLong && tpValue <= entryPrice) {
          errors.tpError = `Must be > ${entryPrice.toFixed(2)}`;
        } else if (!isLong && tpValue >= entryPrice) {
          errors.tpError = `Must be < ${entryPrice.toFixed(2)}`;
        }
      }
    }

    if (slInput && slInput.trim() !== '') {
      const slValue = parseFloat(slInput);
      if (isNaN(slValue) || slValue <= 0) {
        errors.slError = 'Invalid price';
      } else if (entryPrice > 0) {
        if (isLong && slValue >= entryPrice) {
          errors.slError = `Must be < ${entryPrice.toFixed(2)}`;
        } else if (!isLong && slValue <= entryPrice) {
          errors.slError = `Must be > ${entryPrice.toFixed(2)}`;
        }
      }
    }

    return errors;
  }, [
    tpslEnabled,
    tpInput,
    slInput,
    orderSide,
    orderType,
    markPrice,
    formattedOrder.order_price,
  ]);

  const orderPreview = useMemo(() => {
    const emptyPreview = {
      buy: { liqPrice: null, margin: 0, maxSize: 0, fees: 0 },
      sell: { liqPrice: null, margin: 0, maxSize: 0, fees: 0 },
    };

    if (!markPrice || maxQty === undefined || maxQty === null) {
      return emptyPreview;
    }

    const orderQuantity = parseFloat(formattedOrder.order_quantity || '0');
    const orderPrice =
      orderType === 'market'
        ? markPrice
        : parseFloat(formattedOrder.order_price || '0');

    const computePreview = (side) => {
      const liqPrice = orderSide === side ? estLiqPrice : null;

      let notionalValue = 0;
      if (orderType === 'market') {
        notionalValue = parseFloat(marketSizeUSDC || '0');
      } else {
        if (orderQuantity > 0 && orderPrice > 0) {
          notionalValue = orderQuantity * orderPrice;
        }
      }

      const margin = leverage > 0 ? notionalValue / leverage : 0;
      const maxSize = maxQty || 0;
      const takerFeeRate = 0.0005;
      const fees = notionalValue * takerFeeRate;

      return {
        liqPrice,
        margin: isFinite(margin) ? margin : 0,
        maxSize: isFinite(maxSize) ? maxSize : 0,
        fees: isFinite(fees) ? fees : 0,
      };
    };

    return {
      buy: computePreview('buy'),
      sell: computePreview('sell'),
    };
  }, [
    markPrice,
    maxQty,
    estLiqPrice,
    formattedOrder.order_quantity,
    formattedOrder.order_price,
    orderType,
    orderSide,
    marketSizeUSDC,
    leverage,
  ]);

  const reduceOnlyDisabled = useMemo(
    () => ({ disabled: false, reason: null }),
    []
  );

  const validationErrors = useMemo(() => {
    if (!isValidationReady || orderType === 'market') {
      return [];
    }

    const quantity = parseFloat(formattedOrder?.order_quantity || '0');
    const price = parseFloat(formattedOrder?.order_price || '0');

    if (!quantity || !price) return [];

    const currentMarkPrice = validationMarkPrice || markPrice || 0;
    if (!currentMarkPrice) return [];

    const validation = validateOrder(
      {
        symbol,
        side: orderSide === 'buy' ? 'BUY' : 'SELL',
        orderType:
          orderType === 'limit'
            ? 'LIMIT'
            : orderType === 'post-only'
              ? 'POST_ONLY'
              : 'LIMIT',
        price,
        quantity,
      },
      symbolInfo,
      currentMarkPrice
    );

    return validation.errors;
  }, [
    formattedOrder,
    symbol,
    orderSide,
    orderType,
    symbolInfo,
    validationMarkPrice,
    markPrice,
    isValidationReady,
  ]);

  const isMaxQtyReady = useMemo(() => {
    if (maxQty === undefined || maxQty === null) return false;
    if (maxQty === 0) {
      return freeCollateral !== undefined && freeCollateral !== null;
    }
    return true;
  }, [maxQty, freeCollateral]);

  const isTradingDisabled = useMemo(() => {
    const maxQtyValue = maxQty ?? 0;
    return maxQtyValue === 0 && isMaxQtyReady;
  }, [maxQty, isMaxQtyReady]);

  const prevQuantityRef = useRef(formattedOrder.order_quantity);
  const prevPriceRef = useRef(formattedOrder.order_price);
  const prevOrderTypeRef = useRef(orderType);

  useLayoutEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    const quantityChanged =
      prevQuantityRef.current !== formattedOrder.order_quantity;
    const priceChanged = prevPriceRef.current !== formattedOrder.order_price;
    const orderTypeChanged = prevOrderTypeRef.current !== orderType;

    if (!quantityChanged && !priceChanged && !orderTypeChanged) {
      return;
    }

    prevQuantityRef.current = formattedOrder.order_quantity;
    prevPriceRef.current = formattedOrder.order_price;
    prevOrderTypeRef.current = orderType;

    startTransition(() => {
      if (orderType !== 'market') {
        const formattedQuantity = formattedOrder.order_quantity || '';
        const formattedPrice = formattedOrder.order_price || '';

        setQuantityInput(formattedQuantity);

        const price = parseFloat(formattedPrice);
        const quantity = parseFloat(formattedQuantity);
        if (price > 0 && quantity > 0) {
          setTotalInput((price * quantity).toFixed(2));
        } else {
          setTotalInput('');
        }
      } else {
        setQuantityInput('');
        setTotalInput('');
      }
    });
  }, [formattedOrder.order_quantity, formattedOrder.order_price, orderType]);

  const updateSliderFromSize = (sizeUSDC) => {
    const availableMargin = freeCollateral ?? 0;
    if (availableMargin <= 0 || !isFinite(availableMargin)) {
      setSizePercentage(0);
      return;
    }

    const size = parseFloat(sizeUSDC || '0');
    if (!isFinite(size) || size < 0) {
      setSizePercentage(0);
      return;
    }

    const clampedSize = Math.min(size, availableMargin);
    const percentage = Math.min(
      Math.max((clampedSize / availableMargin) * 100, 0),
      100
    );
    setSizePercentage(Math.round(percentage));
  };

  const handleQuantityChange = (value) => {
    setQuantityInput(value);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (orderType !== 'market') {
        const rawQuantity = parseFloat(value || '0');
        const price = parseFloat(formattedOrder.order_price || '0');
        const maxQtyValue = maxQty ?? 0;

        if (
          isFinite(price) &&
          isFinite(rawQuantity) &&
          price > 0 &&
          rawQuantity > 0
        ) {
          const formattedQty = formatQuantity(rawQuantity, baseTick, baseDp);
          const clampedQuantity =
            maxQtyValue > 0 && parseFloat(formattedQty) > maxQtyValue
              ? formatQuantity(maxQtyValue, baseTick, baseDp)
              : formattedQty;

          isInternalUpdateRef.current = true;
          setValue('order_quantity', clampedQuantity);

          const total = (price * parseFloat(clampedQuantity)).toFixed(2);
          const totalNumeric = parseFloat(total);
          const availableMargin = freeCollateral ?? 0;
          let clampedTotal = total;

          if (
            availableMargin > 0 &&
            isFinite(totalNumeric) &&
            totalNumeric > availableMargin
          ) {
            clampedTotal = availableMargin.toFixed(2);
          }

          if (maxQtyValue > 0) {
            const maxQtyUSDC = maxQtyValue * price;
            if (isFinite(maxQtyUSDC) && parseFloat(clampedTotal) > maxQtyUSDC) {
              clampedTotal = maxQtyUSDC.toFixed(2);
            }
          }

          setTotalInput(clampedTotal);
          updateSliderFromSize(clampedTotal);
        } else {
          isInternalUpdateRef.current = true;
          setValue('order_quantity', '');
          setTotalInput('');
          updateSliderFromSize('');
        }
      }
    }, 500);
  };

  const handleTotalChange = (value) => {
    const availableMargin = freeCollateral ?? 0;
    const numericValue = parseFloat(value || '0');
    const maxQtyValue = maxQty ?? 0;

    let clampedValue = value;
    if (isFinite(numericValue) && numericValue > 0) {
      let clamped = numericValue;

      if (availableMargin > 0) {
        clamped = Math.min(clamped, availableMargin);
      }

      if (orderType !== 'market' && maxQtyValue > 0) {
        const price = parseFloat(formattedOrder.order_price || '0');
        if (isFinite(price) && price > 0) {
          const maxQtyUSDC = maxQtyValue * price;
          if (isFinite(maxQtyUSDC)) {
            clamped = Math.min(clamped, maxQtyUSDC);
          }
        }
      }

      if (clamped !== numericValue) {
        clampedValue = clamped.toFixed(2);
      }
    }

    setTotalInput(clampedValue);

    if (orderType !== 'market') {
      const price = parseFloat(formattedOrder.order_price || '0');
      const total = parseFloat(clampedValue || '0');
      if (isFinite(price) && isFinite(total) && price > 0 && total > 0) {
        const formattedQty = quoteToBaseQuantity(
          total,
          price,
          baseTick,
          baseDp
        );
        const quantityNumeric = parseFloat(formattedQty);
        const finalQuantity =
          maxQtyValue > 0 &&
          isFinite(quantityNumeric) &&
          quantityNumeric > maxQtyValue
            ? formatQuantity(maxQtyValue, baseTick, baseDp)
            : formattedQty;
        setQuantityInput(finalQuantity);
        isInternalUpdateRef.current = true;
        setValue('order_quantity', finalQuantity);
      } else {
        setQuantityInput('');
        isInternalUpdateRef.current = true;
        setValue('order_quantity', '');
      }
    }

    if (!isInternalUpdateRef.current) {
      updateSliderFromSize(clampedValue);
    }
  };

  const handleSliderChange = (percentage) => {
    const availableMargin = freeCollateral ?? 0;
    const maxQtyValue = maxQty ?? 0;

    if (
      maxQtyValue === 0 ||
      availableMargin <= 0 ||
      !isFinite(availableMargin)
    ) {
      setSizePercentage(0);
      return;
    }

    if (!isFinite(percentage) || percentage < 0) {
      setSizePercentage(0);
      return;
    }

    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
    setSizePercentage(clampedPercentage);

    let calculatedSize = Math.min(
      (availableMargin * clampedPercentage) / 100,
      availableMargin
    );

    if (orderType !== 'market' && maxQtyValue > 0) {
      const price = parseFloat(formattedOrder.order_price || '0');
      if (isFinite(price) && price > 0) {
        const maxQtyUSDC = maxQtyValue * price;
        if (isFinite(maxQtyUSDC)) {
          calculatedSize = Math.min(calculatedSize, maxQtyUSDC);
        }
      }
    }

    if (!isFinite(calculatedSize) || calculatedSize < 0) {
      return;
    }

    const sizeUSDC = calculatedSize.toFixed(2);

    isInternalUpdateRef.current = true;
    if (orderType === 'market') {
      setMarketSizeUSDC(sizeUSDC);
      if (markPrice && markPrice > 0) {
        const baseTokenQty = (parseFloat(sizeUSDC) / markPrice).toFixed(8);
        setValue('order_quantity', baseTokenQty);
      } else {
        setValue('order_quantity', '0');
      }
    } else {
      handleTotalChange(sizeUSDC);
    }
  };

  const handleBboToggle = (enabled) => {
    setBboEnabled(enabled);
    if (!enabled && orderType !== 'market') {
      isInternalUpdateRef.current = true;
    }
  };

  const handleBboStrategyChange = (strategy) => {
    setBboStrategy(strategy);
  };

  const mapStrategyToEnum = (strategy) => {
    switch (strategy) {
      case 'Counterparty 1':
        return BBOStrategy.COUNTERPARTY_1;
      case 'Counterparty 5':
        return BBOStrategy.COUNTERPARTY_5;
      case 'Queue 1':
        return BBOStrategy.QUEUE_1;
      case 'Queue 5':
        return BBOStrategy.QUEUE_5;
      default:
        return BBOStrategy.COUNTERPARTY_1;
    }
  };

  const orderbookData = useMemo(() => {
    if (!bids || !asks || bids.length === 0 || asks.length === 0) {
      return null;
    }
    return { bids, asks };
  }, [bids, asks]);

  const derivedBBOPrice = useMemo(() => {
    if (!bboEnabled || orderType === 'market' || !orderbookData || isMutating) {
      return null;
    }

    const orderSideForBBO = orderSide === 'buy' ? 'BUY' : 'SELL';
    const strategyEnum = mapStrategyToEnum(bboStrategy);

    return deriveBBOPrice(orderbookData, orderSideForBBO, strategyEnum);
  }, [
    bboEnabled,
    orderType,
    orderbookData,
    orderSide,
    bboStrategy,
    isMutating,
  ]);

  const isBBOPriceUnavailable = useMemo(() => {
    return bboEnabled && orderType === 'limit' && derivedBBOPrice === null;
  }, [bboEnabled, orderType, derivedBBOPrice]);

  useEffect(() => {
    if (
      bboEnabled &&
      orderType !== 'market' &&
      derivedBBOPrice !== null &&
      !isMutating
    ) {
      isInternalUpdateRef.current = true;
      setValue('order_price', derivedBBOPrice.toString());
    }
  }, [bboEnabled, orderType, derivedBBOPrice, isMutating]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (priceDebounceRef.current) {
        clearTimeout(priceDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setStopLimitDropdownOpen(false);
      }
    };

    if (stopLimitDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [stopLimitDropdownOpen]);

  const handleSubmit = async () => {
    if (!isConnected) {
      setWalletModalOpen(true);
      return;
    }

    setSubmitError(null);

    if (bboEnabled && derivedBBOPrice === null) {
      setSubmitError(
        'BBO price is not available. Please wait for orderbook data or disable BBO.'
      );
      return;
    }

    if (metaState?.errors) {
      const hasReduceOnly = metaState.errors.reduce_only;
      const hasSide = metaState.errors.side;
      const hasTotal = metaState.errors.total;
      const hasQuantity = metaState.errors.order_quantity;
      const hasPrice = metaState.errors.order_price;

      if (hasReduceOnly) {
        const reduceOnlyError = metaState.errors.reduce_only;
        setSubmitError(
          reduceOnlyError?.message || 'Reduce-only orders require an open position'
        );
        return;
      }

      if (hasSide) {
        const sideError = metaState.errors.side;
        setSubmitError(sideError?.message || 'Invalid order side for reduce-only');
        return;
      }

      if (hasTotal) {
        const totalError = metaState.errors.total;
        setSubmitError(
          totalError?.message || 'Order value below minimum required'
        );
        return;
      }

      if (hasQuantity || hasPrice) {
        const errors = [];
        if (hasQuantity) errors.push('Invalid quantity');
        if (hasPrice) errors.push('Invalid price');
        setSubmitError(errors.join('; '));
        return;
      }
    }

    try {
      const position_qty = getPositionQty();

      let positionSide;
      if (position_qty > 0) positionSide = 'LONG';
      else if (position_qty < 0) positionSide = 'SHORT';
      else positionSide = 'FLAT';

      const orderSideEnum = formattedOrder.side;
      const isClosingOrder =
        (positionSide === 'LONG' && orderSideEnum === OrderSide.SELL) ||
        (positionSide === 'SHORT' && orderSideEnum === OrderSide.BUY);

      const isOpeningOrder =
        (positionSide === 'LONG' && orderSideEnum === OrderSide.BUY) ||
        (positionSide === 'SHORT' && orderSideEnum === OrderSide.SELL);

      if (
        positionSide !== 'FLAT' &&
        isClosingOrder &&
        !formattedOrder.reduce_only
      ) {
        setValue('reduce_only', true);
        await new Promise((resolve) => setTimeout(resolve, 10));
      } else if (isOpeningOrder && formattedOrder.reduce_only) {
        setValue('reduce_only', false);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      await submit({ resetOnSuccess: true });

      setQuantityInput('');
      setTotalInput('');
      setMarketSizeUSDC('');
    } catch (error) {
      const parsedError = parseOrderlyError(error);
      const userMessage = formatErrorForUser(parsedError);
      setSubmitError(userMessage);
    }
  };

  return (
    <div
      className="flex flex-col h-full min-h-0 bg-[#080808] md:min-h-0 md:h-auto md:flex-initial border border-[color:var(--color-border-strong)]"
      style={{
        fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div className="flex gap-2 p-2 md:p-3 flex-shrink-0">
        <button type="button" className="cross-btn flex-none">
          Cross
        </button>
        <button
          type="button"
          onClick={() => setLeverageModalOpen(true)}
          className="flex flex-none flex-row justify-center items-center rounded-lg cursor-pointer hover:bg-white/10 transition-all box-border order-1"
          style={{
            padding: '8px 16px',
            gap: 8,
            width: 'fit-content',
            height: 36,
            background: 'rgba(120, 120, 120, 0.2)',
            borderRadius: 8,
          }}
        >
          <span
            className="flex-none order-0 flex items-center text-center text-white"
            style={{
              fontFamily: 'Inter, var(--font-geist-sans), sans-serif',
              fontStyle: 'normal',
              fontWeight: 700,
              fontSize: '13.3px',
              lineHeight: '20px',
            }}
          >
            {leverage}x
          </span>
        </button>
      </div>

      <div className="flex flex-col flex-1 bg-[#080808] min-h-0 overflow-hidden md:overflow-visible">
        <div className="flex items-center bg-[#080808] px-3 py-2 flex-shrink-0">
          <div className="flex gap-4 flex-1">
            <InfoTooltip content="Market executes immediately at the best available price. Final execution price may differ due to slippage.">
              <button
                type="button"
                onClick={() => {
                  setOrderType('market');
                  setValue('order_type', OrderType.MARKET);
                  setBboEnabled(false);
                  setMarketSizeUSDC('');
                }}
                className={`text-xs font-sans font-medium transition-colors ${
                  orderType === 'market'
                    ? 'text-white'
                    : 'text-[#999999] hover:text-white'
                }`}
              >
                Market
              </button>
            </InfoTooltip>
            <InfoTooltip content="Limit executes only at your price or better. It may not fill if the market doesn't reach your price.">
              <button
                type="button"
                onClick={() => {
                  setOrderType('limit');
                  setValue('order_type', OrderType.LIMIT);
                }}
                className={`text-xs font-sans font-medium transition-colors ${
                  orderType === 'limit'
                    ? 'text-white'
                    : 'text-[#999999] hover:text-white'
                }`}
              >
                Limit
              </button>
            </InfoTooltip>
            <div ref={dropdownRef} className="relative inline-block">
              <InfoTooltip content="Advanced order types: Stop Limit triggers a limit order at a specific price, Stop Market executes at market price when triggered, Trailing Stop follows price movements, and Post Only ensures your order is added to the order book as a maker order.">
                <button
                  type="button"
                  onClick={() =>
                    setStopLimitDropdownOpen(!stopLimitDropdownOpen)
                  }
                  className={`flex items-center gap-1 text-xs font-sans font-medium transition-colors ${
                    ['stop-limit', 'stop-market', 'trailing-stop', 'post-only'].includes(
                      orderType
                    )
                      ? 'text-white'
                      : 'text-[#999999] hover:text-white'
                  }`}
                >
                  {orderType === 'stop-limit' && 'Stop Limit'}
                  {orderType === 'stop-market' && 'Stop Market'}
                  {orderType === 'trailing-stop' && 'Trailing Stop'}
                  {orderType === 'post-only' && 'Post Only'}
                  {!['stop-limit', 'stop-market', 'trailing-stop', 'post-only'].includes(
                    orderType
                  ) && 'Stop Limit'}
                  <svg
                    className={`h-3 w-3 transition-transform ${
                      stopLimitDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </InfoTooltip>

              {stopLimitDropdownOpen && (
                <div className="absolute top-full left-auto right-0 md:left-0 md:right-auto mt-1 z-50 min-w-[180px] flex flex-col items-stretch shadow-2xl futures-dropdown-panel">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderType('stop-limit');
                      setValue('order_type', OrderType.STOP_LIMIT);
                      setStopLimitDropdownOpen(false);
                    }}
                    className="order-type-dropdown-item"
                  >
                    Stop Limit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderType('stop-market');
                      setValue('order_type', OrderType.STOP_MARKET);
                      setStopLimitDropdownOpen(false);
                    }}
                    className="order-type-dropdown-item"
                  >
                    Stop Market
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderType('trailing-stop');
                      setValue('order_type', OrderType.TRAILING_STOP);
                      setStopLimitDropdownOpen(false);
                    }}
                    className="order-type-dropdown-item"
                  >
                    Trailing Stop
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderType('post-only');
                      setValue('order_type', OrderType.POST_ONLY);
                      setStopLimitDropdownOpen(false);
                    }}
                    className="order-type-dropdown-item"
                  >
                    Post Only
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-[#080808] flex-shrink-0">
          <InfoTooltip
            content="Available (Avbl) is your free collateral - the amount you can use to open new positions."
            showUnderline={false}
          >
            <span className="text-sm font-sans font-bold text-[#FFFFFF]">
              Available
            </span>
          </InfoTooltip>
          <span className="text-sm font-sans font-medium text-[#FFFFFF]">
            {freeCollateral?.toFixed(2) ?? '0.00'} USDC
          </span>
          <div className="w-2 h-2 rounded-full bg-[#00C853]" />
        </div>

        <div
          className="flex flex-row justify-center items-center gap-2 p-1 flex-shrink-0 w-full px-3 pt-3 pb-2"
          style={{ fontFamily: 'Inter, var(--font-geist-sans), sans-serif' }}
        >
          <div
            className="flex flex-row justify-center items-center gap-2 p-1 rounded-lg w-full h-9"
            style={{ background: 'rgba(60, 60, 67, 0.6)' }}
          >
            <button
              type="button"
              onClick={() => {
                setOrderSide('buy');
                setValue('side', OrderSide.BUY);
              }}
              className="flex flex-1 flex-row justify-center items-center py-1.5 px-3 gap-2 rounded-lg transition-all cursor-pointer min-h-0"
              style={{
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: 14,
                lineHeight: '16px',
                color: orderSide === 'buy' ? '#FFFFFF' : '#8E8E93',
                background: orderSide === 'buy' ? '#22C55E' : 'transparent',
                borderRadius: 8,
              }}
            >
              <span className="md:hidden">Long</span>
              <span className="hidden md:inline">Buy / Long</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderSide('sell');
                setValue('side', OrderSide.SELL);
              }}
              className="flex flex-1 flex-row justify-center items-center py-1.5 px-3 gap-2 rounded-md transition-all cursor-pointer min-h-0"
              style={{
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: 14,
                lineHeight: '16px',
                color: orderSide === 'sell' ? '#FFFFFF' : '#8E8E93',
                background: orderSide === 'sell' ? '#F43F5E' : 'transparent',
                borderRadius: 6,
              }}
            >
              <span className="md:hidden">Short</span>
              <span className="hidden md:inline">Sell / Short</span>
            </button>
          </div>
        </div>

        {orderType === 'limit' && (
          <div className="flex items-center justify-end gap-2 px-3 pb-2 flex-shrink-0">
            <BBOSelector
              value={bboStrategy}
              onChange={handleBboStrategyChange}
              disabled={!bboEnabled}
            />
            <button
              type="button"
              onClick={() => handleBboToggle(!bboEnabled)}
              className={`px-2 py-1 text-xs font-sans font-semibold rounded transition-all ${
                bboEnabled
                  ? 'bg-accent-gradient text-[#0A0A0A]'
                  : 'bg-[#080808] text-[#A3A3A3] hover:bg-[#1F1F1F]'
              }`}
            >
              BBO
            </button>
          </div>
        )}

        <div
          className="p-3 space-y-2 flex-1 min-h-0 overflow-y-auto overscroll-contain md:overflow-visible md:flex-initial"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div
            className={orderType === 'market' ? 'opacity-40' : 'opacity-100'}
          >
            <div className="relative">
              <input
                type="text"
                value={
                  orderType === 'market'
                    ? 'Market Price'
                    : formattedOrder.order_price || ''
                }
                onChange={(e) => {
                  const rawPrice = e.target.value;

                  if (priceDebounceRef.current) {
                    clearTimeout(priceDebounceRef.current);
                  }

                  setValue('order_price', rawPrice);

                  if (orderType !== 'market') {
                    priceDebounceRef.current = setTimeout(() => {
                      const numericPrice = parseFloat(rawPrice || '0');
                      if (isFinite(numericPrice) && numericPrice > 0) {
                        const formattedPriceValue = formatPrice(
                          numericPrice,
                          quoteTick,
                          quoteDp
                        );
                        isInternalUpdateRef.current = true;
                        setValue('order_price', formattedPriceValue);

                        const quantity = parseFloat(quantityInput || '0');
                        if (quantity > 0) {
                          setTotalInput(
                            (
                              parseFloat(formattedPriceValue) * quantity
                            ).toFixed(2)
                          );
                        }
                      }
                    }, 500);
                  }
                }}
                placeholder={orderType === 'market' ? 'Market Price' : 'Price'}
                className="w-full px-3 py-2.5 text-sm bg-[#080808] rounded text-[#A3A3A3] font-sans font-normal focus:border-[color:var(--color-accent-primary)] focus:outline-none transition-colors placeholder:text-[#A3A3A3] disabled:opacity-50 disabled:cursor-not-allowed border border-[#313131]"
                disabled={orderType === 'market' || isTradingDisabled}
                readOnly={orderType === 'market' || bboEnabled}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#A3A3A3] font-sans font-normal">
                {orderType === 'market' ? '' : 'USDC'}
              </span>
            </div>
          </div>

          <div>
            <div className="relative">
              <input
                type="text"
                value={orderType !== 'market' ? quantityInput : marketSizeUSDC}
                onChange={(e) => {
                  if (orderType !== 'market') {
                    handleQuantityChange(e.target.value);
                  } else {
                    const availableMargin = freeCollateral ?? 0;
                    const numericValue = parseFloat(e.target.value || '0');

                    let clampedValue = e.target.value;
                    if (
                      isFinite(numericValue) &&
                      numericValue > 0 &&
                      availableMargin > 0
                    ) {
                      const clamped = Math.min(numericValue, availableMargin);
                      if (clamped !== numericValue) {
                        clampedValue = clamped.toFixed(2);
                      }
                    }

                    setMarketSizeUSDC(clampedValue);
                    if (markPrice && markPrice > 0) {
                      const sizeUSDC = parseFloat(clampedValue || '0');
                      const baseTokenQty = (sizeUSDC / markPrice).toFixed(8);
                      setValue('order_quantity', baseTokenQty);
                    } else {
                      setValue('order_quantity', '0');
                    }
                    updateSliderFromSize(clampedValue);
                  }
                }}
                placeholder="Size"
                className="w-full px-3 py-2.5 text-sm bg-[#080808] border border-[#313131] rounded font-sans font-normal focus:border-[color:var(--color-accent-primary)] focus:outline-none transition-colors text-[#A3A3A3] placeholder:text-[#A3A3A3] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isTradingDisabled}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#A3A3A3] font-sans font-normal">
                {orderType === 'market' ? 'USDC' : baseToken}
              </span>
            </div>
          </div>

          {orderType !== 'market' && (
            <div>
              <div className="relative">
                <input
                  type="text"
                  value={totalInput}
                  onChange={(e) => handleTotalChange(e.target.value)}
                  placeholder="Size"
                  className="w-full px-3 py-2.5 text-sm bg-[#080808] border border-[#313131] rounded font-sans font-normal focus:border-[color:var(--color-accent-primary)] focus:outline-none transition-colors text-[#A3A3A3] placeholder:text-[#A3A3A3] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isTradingDisabled}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#A3A3A3] font-sans font-normal">
                  USDC
                </span>
              </div>
            </div>
          )}

          <div>
            <div className="flex flex-row items-center gap-2 p-0 w-full min-h-[44px]">
              <div className="flex flex-col justify-end items-start gap-1 flex-1 min-w-0">
                <div className="flex flex-row items-end gap-2 w-full min-h-[44px]">
                  <div className="relative flex-1 min-h-[30px] flex flex-col justify-center">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="25"
                      value={sizePercentage}
                      onChange={(e) =>
                        handleSliderChange(parseInt(e.target.value, 10))
                      }
                      disabled={(maxQty ?? 0) === 0}
                      className="w-full h-1 bg-[#BEBEBE] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#EBB30B] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#EBB30B] [&::-moz-range-thumb]:cursor-pointer relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundImage: `linear-gradient(to right, #EBB30B 0%, #EBB30B ${sizePercentage}%, #BEBEBE ${sizePercentage}%, #BEBEBE 100%)`,
                      }}
                    />
                  </div>
                </div>
                <div
                  className="relative w-full h-[18px]"
                  style={{ width: 'calc(100% - 15px)', margin: 'auto' }}
                >
                  {[0, 25, 50, 75, 100].map((p) => (
                    <span
                      key={p}
                      className="absolute flex justify-center items-center -translate-x-1/2"
                      style={{ left: `${p}%` }}
                    >
                      <span className="w-[5px] h-[5px] rounded-full flex-shrink-0 bg-[#767676]" />
                    </span>
                  ))}
                </div>
              </div>
              <span className="font-sans font-normal text-sm leading-5 text-[#A3A3A3] text-center flex-none min-w-[21px]">
                {sizePercentage}%
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tpslEnabled}
                  onChange={(e) => {
                    setTpslEnabled(e.target.checked);
                    if (!e.target.checked) {
                      setTpInput('');
                      setSlInput('');
                    }
                  }}
                  className="w-3 h-3 border border-[#FBFBFB] bg-transparent checked:bg-[color:var(--color-accent-primary)] checked:border-[color:var(--color-accent-primary)] cursor-pointer accent-[color:var(--color-accent-primary)] appearance-none"
                  style={{ borderWidth: '0.5px' }}
                />
                <InfoTooltip content="Automatically close or reduce your position when price reaches your profit target or loss limit. Helps lock in gains and manage risk without constant monitoring.">
                  <span className="text-xs font-sans font-normal text-[#A3A3A3]">
                    TP/SL
                  </span>
                </InfoTooltip>
              </label>

              {tpslEnabled && (
                <div className="pl-5 space-y-2 mt-1">
                  <div>
                    <label className="block text-[10px] text-[#666666] mb-1">
                      Take Profit{' '}
                      {orderSide === 'buy' ? '(> price)' : '(< price)'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={tpInput}
                        onChange={(e) => setTpInput(e.target.value)}
                        placeholder={
                          orderType === 'market'
                            ? markPrice
                              ? (orderSide === 'buy'
                                  ? markPrice * 1.05
                                  : markPrice * 0.95
                                ).toFixed(2)
                              : '0.00'
                            : formattedOrder.order_price
                              ? (orderSide === 'buy'
                                  ? parseFloat(formattedOrder.order_price) *
                                    1.05
                                  : parseFloat(formattedOrder.order_price) *
                                    0.95
                                ).toFixed(2)
                              : '0.00'
                        }
                        className={`w-full px-2 py-1.5 text-xs bg-[#0A0A0A] rounded text-white font-mono focus:outline-none border transition-colors placeholder:text-[#666666] ${
                          tpslValidation.tpError
                            ? 'border-[#FF3B69] focus:border-[#FF3B69]'
                            : 'border-[#1F1F1F] focus:border-[color:var(--color-accent-primary)]'
                        }`}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#666666]">
                        USDC
                      </span>
                    </div>
                    {tpslValidation.tpError && (
                      <p className="text-[9px] text-[#FF3B69] mt-0.5">
                        {tpslValidation.tpError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#666666] mb-1">
                      Stop Loss{' '}
                      {orderSide === 'buy' ? '(< price)' : '(> price)'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={slInput}
                        onChange={(e) => setSlInput(e.target.value)}
                        placeholder={
                          orderType === 'market'
                            ? markPrice
                              ? (orderSide === 'buy'
                                  ? markPrice * 0.95
                                  : markPrice * 1.05
                                ).toFixed(2)
                              : '0.00'
                            : formattedOrder.order_price
                              ? (orderSide === 'buy'
                                  ? parseFloat(formattedOrder.order_price) *
                                    0.95
                                  : parseFloat(formattedOrder.order_price) *
                                    1.05
                                ).toFixed(2)
                              : '0.00'
                        }
                        className={`w-full px-2 py-1.5 text-xs bg-[#0A0A0A] rounded text-white font-mono focus:outline-none border transition-colors placeholder:text-[#666666] ${
                          tpslValidation.slError
                            ? 'border-[#FF3B69] focus:border-[#FF3B69]'
                            : 'border-[#1F1F1F] focus:border-[color:var(--color-accent-primary)]'
                        }`}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#666666]">
                        USDC
                      </span>
                    </div>
                    {tpslValidation.slError && (
                      <p className="text-[9px] text-[#FF3B69] mt-0.5">
                        {tpslValidation.slError}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label
                  className={`flex items-center gap-2 ${
                    reduceOnlyDisabled.disabled
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer'
                  }`}
                  title={
                    reduceOnlyDisabled.disabled
                      ? reduceOnlyDisabled.reason || 'Reduce-only not available'
                      : undefined
                  }
                >
                  <input
                    type="checkbox"
                    checked={formattedOrder.reduce_only ?? false}
                    disabled={reduceOnlyDisabled.disabled}
                    onChange={(e) => {
                      if (!reduceOnlyDisabled.disabled) {
                        setValue('reduce_only', e.target.checked);
                      }
                    }}
                    className="w-3 h-3 border border-[#FBFBFB] bg-transparent checked:bg-[color:var(--color-accent-primary)] checked:border-[color:var(--color-accent-primary)] cursor-pointer accent-[color:var(--color-accent-primary)] appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ borderWidth: '0.5px' }}
                  />
                  <InfoTooltip content="Reduce-Only can only reduce or close your current position. It prevents accidentally flipping to the opposite side.">
                    <span className="text-xs font-sans font-normal text-[#A3A3A3]">
                      Reduce-Only
                    </span>
                  </InfoTooltip>
                </label>
                {reduceOnlyDisabled.disabled &&
                  !metaState?.errors?.reduce_only && (
                    <p className="text-[9px] text-[#666666] ml-5">
                      {reduceOnlyDisabled.reason}
                    </p>
                  )}
                {metaState?.errors?.reduce_only && (
                  <p className="text-[9px] text-[#FF3B69] ml-5">
                    {metaState.errors.reduce_only?.message ||
                      'Reduce-only orders require an open position'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {!isConnected ? (
            <button
              type="button"
              onClick={() => setWalletModalOpen(true)}
              className="w-full btn-primary-accent"
            >
              Connect Wallet
            </button>
          ) : (
            <>
              {!isMaxQtyReady && (
                <div className="mb-2 p-2 bg-[rgba(255,248,0,0.1)] border border-[rgba(255,248,0,0.3)] rounded text-xs">
                  <div className="text-[color:var(--color-accent-primary)] flex items-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Loading account data...</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (
                    freeCollateral === 0 ||
                    freeCollateral === undefined
                  ) {
                    setDepositModalOpen(true);
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={
                  isMutating ||
                  !isMaxQtyReady ||
                  (freeCollateral !== 0 &&
                    freeCollateral !== undefined &&
                    (isTradingDisabled ||
                      validationErrors.length > 0 ||
                      !!metaState?.errors ||
                      isBBOPriceUnavailable))
                }
                className={`w-full px-3 py-2.5 rounded-lg text-sm font-sans font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  freeCollateral === 0 || freeCollateral === undefined
                    ? 'btn-primary-accent'
                    : orderSide === 'sell'
                      ? 'bg-[#EF4444] text-white'
                      : 'bg-[#22C55E] text-white'
                }`}
                title={
                  !isMaxQtyReady
                    ? 'Loading account data...'
                    : freeCollateral === 0 || freeCollateral === undefined
                      ? 'Deposit to start trading'
                      : isTradingDisabled
                        ? 'Insufficient collateral'
                        : undefined
                }
              >
                {isMutating
                  ? 'Placing...'
                  : !isMaxQtyReady
                    ? 'Loading...'
                    : freeCollateral === 0 || freeCollateral === undefined
                      ? 'Deposit'
                      : isTradingDisabled
                        ? 'Insufficient collateral'
                        : `${orderSide === 'buy' ? 'Buy' : 'Sell'} ${baseToken}`}
              </button>

              {validationErrors.length > 0 && (
                <div className="mt-2 p-2 bg-[#FF3B69]/10 border border-[#FF3B69]/30 rounded text-xs">
                  {validationErrors.map((error, idx) => (
                    <div
                      key={idx}
                      className="text-[#FF3B69] flex items-start gap-1"
                    >
                      <span className="mt-0.5">•</span>
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              )}

              {submitError && (
                <div className="mt-2 p-2 bg-[#FF3B69]/10 border border-[#FF3B69]/30 rounded text-xs">
                  <div className="text-[#FF3B69] flex items-start gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{submitError}</span>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 mt-3 border-t border-[#1F1F1F]">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[#A3A3A3] font-sans font-normal">
                  Liq.Price
                </span>
                <span className="text-[#35D4CA] font-sans font-normal">
                  {orderPreview.buy.liqPrice !== null
                    ? orderPreview.buy.liqPrice.toFixed(2)
                    : '--'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[#A3A3A3] font-sans font-normal">
                  Margin
                </span>
                <span className="text-[#35D4CA] font-sans font-normal">
                  {orderPreview.buy.margin.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[#A3A3A3] font-sans font-normal">
                  Max
                </span>
                <span className="text-[#35D4CA] font-sans font-normal">
                  {orderPreview.buy.maxSize.toFixed(4)}
                </span>
                <span className="text-[#FFFFFF] font-sans font-normal">
                  {baseToken}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[#A3A3A3] font-sans font-normal">
                  Fees
                </span>
                <span className="text-[#35D4CA] font-sans font-normal">
                  {orderPreview.buy.fees.toFixed(4)}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[#A3A3A3] font-sans font-normal">
                  Liq.Price
                </span>
                <span className="text-[#A3A3A3] font-sans font-normal">
                  {orderPreview.sell.liqPrice !== null
                    ? orderPreview.sell.liqPrice.toFixed(2)
                    : '--'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[#A3A3A3] font-sans font-normal">
                  Margin
                </span>
                <span className="text-[#FF3B69] font-sans font-normal">
                  {orderPreview.sell.margin.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[#A3A3A3] font-sans font-normal">
                  Max
                </span>
                <span className="text-[#FF3B69] font-sans font-normal">
                  {orderPreview.sell.maxSize.toFixed(4)}
                </span>
                <span className="text-[#FFFFFF] font-sans font-normal">
                  {baseToken}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[#A3A3A3] font-sans font-normal">
                  Fees
                </span>
                <span className="text-[#FF3B69] font-sans font-normal">
                  {orderPreview.sell.fees.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WalletConnectModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />

      <LeverageModal
        key={leverageModalOpen ? 'open' : 'closed'}
        isOpen={leverageModalOpen}
        onClose={() => setLeverageModalOpen(false)}
        symbol={symbol}
        currentLeverage={leverage}
        onSave={(newLeverage) => setLeverage(newLeverage)}
        side={orderSide}
        marginMode={marginMode}
      />

      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
      />
    </div>
  );
}
