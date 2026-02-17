import React, { useState, useRef, useEffect } from 'react';

export const BBO_STRATEGIES = ['Counterparty 1', 'Counterparty 5', 'Queue 1', 'Queue 5'];

export function BBOSelector({ value, onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-1 px-1.75 py-1 text-xs font-sans font-medium rounded transition-all ${
          disabled
            ? 'opacity-40 cursor-not-allowed text-[#666666]'
            : isOpen
              ? 'bg-[#1F1F1F] text-white'
              : 'bg-[#080808] text-[#A3A3A3] hover:bg-[#1F1F1F] hover:text-white'
        }`}
      >
        {value}
        <svg
          className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full right-0 mt-1 shadow-2xl z-50 min-w-[140px] futures-dropdown-panel flex flex-col">
          {BBO_STRATEGIES.map((strategy) => (
            <button
              key={strategy}
              type="button"
              onClick={() => {
                onChange(strategy);
                setIsOpen(false);
              }}
              className={`flex flex-row items-center justify-start futures-dropdown-item ${value === strategy ? '!text-[#EBB30B]' : ''}`}
            >
              {strategy}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
