import React from 'react';

export function PositionTPSLCell({ position, onClick, disabled }) {
  const tpPrice = position?.tp_trigger_price;
  const slPrice = position?.sl_trigger_price;
  const positionQty = Math.abs(position?.position_qty ?? 0);
  const isPositionClosed = positionQty === 0;
  const markPrice = position?.mark_price ?? 0;
  const liqPrice = position?.est_liq_price;
  const isNearLiquidation =
    liqPrice != null && markPrice > 0
      ? Math.abs((markPrice - liqPrice) / markPrice) < 0.05
      : false;
  const isDisabled = disabled || isPositionClosed || isNearLiquidation;

  const formatPrice = (p) =>
    p == null ? '--' : Number(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const title = isDisabled
    ? isNearLiquidation
      ? 'TPSL unavailable: Near liquidation'
      : isPositionClosed
        ? 'TPSL unavailable: Position closed'
        : 'TPSL unavailable'
    : 'Click to set/edit TP/SL';

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      title={title}
      className={`flex flex-col items-center gap-0.5 p-1 rounded transition-colors ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1F1F1F] cursor-pointer'
      }`}
    >
      <span className={`text-[10px] font-mono ${tpPrice != null ? 'text-[#00C853]' : 'text-[#666666]'}`}>
        TP: {formatPrice(tpPrice)}
      </span>
      <span className={`text-[10px] font-mono ${slPrice != null ? 'text-[#FF3B69]' : 'text-[#666666]'}`}>
        SL: {formatPrice(slPrice)}
      </span>
    </button>
  );
}
