import React, { useState } from 'react';

export function OrderlySymbolImage({ symbol, size = 24, className = '' }) {
  const [error, setError] = useState(false);
  const baseAsset = symbol.replace('PERP_', '').split('_')[0];
  const logoUrl = `https://oss.orderly.network/static/symbol_logo/${baseAsset}.png`;

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-[#1F1F1F] rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs font-bold text-[#999999]">{baseAsset.charAt(0)}</span>
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={baseAsset}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
}
