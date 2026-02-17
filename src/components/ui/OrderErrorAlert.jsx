import React, { useEffect } from 'react';

export function OrderErrorAlert({ error, onClose, autoClose = true, autoCloseDelay = 5000 }) {
  useEffect(() => {
    if (error && autoClose) {
      const t = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(t);
    }
  }, [error, autoClose, autoCloseDelay, onClose]);

  if (!error) return null;

  const errors = error.includes('\n') ? error.split('\n') : [error];

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="bg-[#FF3B69]/10 border border-[#FF3B69] rounded-lg p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-[#FF3B69]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#FF3B69] mb-1">Order Failed</h3>
            {errors.length === 1 ? (
              <p className="text-sm text-white/90">{errors[0]}</p>
            ) : (
              <ul className="text-sm text-white/90 space-y-1">
                {errors.map((e, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#FF3B69] mt-0.5">•</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button onClick={onClose} className="flex-shrink-0 text-white/60 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
