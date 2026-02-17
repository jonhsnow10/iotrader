import React, { useState, useEffect, cloneElement, isValidElement } from 'react';

export function TradingLayout({
  header,
  chart,
  orderBook,
  rightPanel,
  bottomTabs,
  account,
  mobileTabs,
}) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const apply = () => setIsDesktop(mql.matches);
    apply();

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }

    mql.addListener(apply);
    return () => mql.removeListener(apply);
  }, []);

  const mobileTabsWithLayoutProps =
    mobileTabs &&
    isValidElement(mobileTabs) &&
    typeof mobileTabs.type !== 'string'
      ? cloneElement(mobileTabs, {
          orderBookContainerClassName:
            'w-full h-full flex flex-col min-h-0 overflow-auto overscroll-contain',
        })
      : mobileTabs;

  return (
    <div
      className="flex flex-col min-h-[100dvh] lg:min-h-screen bg-[#080808] overflow-x-hidden lg:overflow-visible pb-[env(safe-area-inset-bottom)]"
      style={{ scrollBehavior: 'smooth', fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif' }}
    >
      {isDesktop ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_290px_340px] xl:grid-cols-[minmax(0,1.5fr)_290px_340px] 2xl:grid-cols-[minmax(0,2fr)_290px_340px] min-h-[600px]">
            <div className="min-w-0 sm:col-span-2 lg:col-span-3 lg:col-start-1 lg:row-start-1">
              {header}
            </div>
            <div className="flex-1 min-h-[500px] overflow-hidden lg:col-start-1 lg:row-start-2">
              {chart}
            </div>

            <div className="border-l border-[color:var(--color-border-strong)] min-h-[600px] overflow-auto lg:col-start-2 lg:row-start-2">
              {orderBook}
            </div>

            <div className="border-l border-[color:var(--color-border-strong)] min-h-[600px] overflow-visible flex flex-col lg:col-start-3 lg:row-start-2">
              {rightPanel}
            </div>
          </div>

          <div className="border-t border-[color:var(--color-border-strong)]">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
              <div className="min-h-[200px]">{bottomTabs}</div>
              <div className="border-l border-[color:var(--color-border-strong)] min-h-[200px]">
                {account}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex-shrink-0">{header}</div>
          <div className="flex flex-col w-full">{mobileTabsWithLayoutProps}</div>
        </>
      )}
    </div>
  );
}
