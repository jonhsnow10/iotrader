import React, { useState, useRef, useCallback, useLayoutEffect, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

const MOBILE_BREAKPOINT = 768;

const TooltipOptionsContext = createContext({ disableTooltipsOnMobile: false });
export const TooltipOptionsProvider = TooltipOptionsContext.Provider;

export function InfoTooltip({ content, children, side = 'top', className = '', showUnderline = false }) {
  const options = useContext(TooltipOptionsContext);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({ opacity: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isHovered) return;
    const hide = () => setIsHovered(false);
    window.addEventListener('scroll', hide, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', hide, { capture: true });
  }, [isHovered]);

  const tooltipsDisabled = options.disableTooltipsOnMobile && isMobile;

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8;
    const estimatedHeight = 120;
    const estimatedWidth = 360;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;

    let effectiveSide = side;
    if (side === 'top' && rect.top < estimatedHeight + gap) {
      effectiveSide = 'bottom';
    } else if (side === 'bottom' && rect.bottom + estimatedHeight + gap > vh) {
      effectiveSide = 'top';
    } else if (side === 'left' && rect.left < estimatedWidth + gap) {
      effectiveSide = 'right';
    } else if (side === 'right' && rect.right + estimatedWidth + gap > vw) {
      effectiveSide = 'left';
    }

    let top = 0, left = 0, transform = '';
    switch (effectiveSide) {
      case 'top': top = rect.top - gap; left = rect.left + rect.width / 2; transform = 'translate(-50%, -100%)'; break;
      case 'bottom': top = rect.bottom + gap; left = rect.left + rect.width / 2; transform = 'translate(-50%, 0)'; break;
      case 'left': top = rect.top + rect.height / 2; left = rect.left - gap; transform = 'translate(-100%, -50%)'; break;
      case 'right': top = rect.top + rect.height / 2; left = rect.right + gap; transform = 'translate(0, -50%)'; break;
    }
    setTooltipStyle({ position: 'fixed', top, left, transform, zIndex: 9999, pointerEvents: 'none', maxWidth: 'min(400px, calc(100vw - 24px))', whiteSpace: 'normal' });
  }, [side]);

  useLayoutEffect(() => {
    if (!isHovered || !tooltipRef.current || !triggerRef.current) return;
    calculatePosition();
  }, [isHovered, content, side, calculatePosition]);

  if (tooltipsDisabled) {
    return <span className={`inline-block ${className}`}>{children}</span>;
  }

  return (
    <>
      <div ref={triggerRef} className={`inline-block ${className}`} onMouseEnter={() => { setIsHovered(true); calculatePosition(); }} onMouseLeave={() => setIsHovered(false)}>
        {children}
      </div>
      {isHovered && typeof window !== 'undefined' && createPortal(
        <div ref={tooltipRef} style={tooltipStyle} className={`px-4 py-3 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs leading-relaxed text-white break-words shadow-2xl ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {content}
        </div>,
        document.body
      )}
    </>
  );
}
