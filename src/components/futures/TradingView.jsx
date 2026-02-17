import React, { useEffect, useRef, useState } from 'react';
import { Datafeed } from '@orderly.network/trading-view';
import { useWS, useConfig } from '@orderly.network/hooks';

export function CustomTradingView({
  symbol,
  interval = '15',
  onWidgetReady,
  customOverrides,
  showCustomToolbar = true,
}) {
  const chartContainerRef = useRef(null);
  const widgetRef = useRef(null);
  const datafeedRef = useRef(null);

  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isChartReady, setIsChartReady] = useState(false);
  const [activeDrawingTool, setActiveDrawingTool] = useState(null);
  const [chartError, setChartError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const [userTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'Etc/UTC';
    }
  });

  const ws = useWS();
  const config = useConfig();

  const [datafeedReady, setDatafeedReady] = useState(false);

  useEffect(() => {
    if (!datafeedRef.current && ws && config) {
      try {
        datafeedRef.current = new Datafeed(config.get('apiBaseUrl'), ws);
        setDatafeedReady(true);
      } catch (err) {
        console.error('[TradingView] Datafeed creation error:', err);
      }
    }
    return () => {
      datafeedRef.current?.remove?.();
      datafeedRef.current = null;
      setDatafeedReady(false);
    };
  }, [ws, config]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.TradingView) {
      setIsScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = '/charting_library/charting_library.js';
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      setChartError(null);
    };
    script.onerror = () => {
      console.error('[TradingView] Failed to load charting library script');
      setChartError('Failed to load chart. Please refresh the page.');
    };
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !chartContainerRef.current || !datafeedRef.current || !datafeedReady) return;

    const isMobile = window.innerWidth < 1024;
    const widgetOptions = {
      symbol,
      datafeed: datafeedRef.current,
      interval,
      container: chartContainerRef.current,
      library_path: '/charting_library/',
      locale: 'en',
      timezone: userTimezone,
      custom_css_url: '/charting_library/chartOverrides.css',
      theme: 'dark',
      autosize: true,
      disabled_features: [
        'left_toolbar',
        'header_widget',
        'header_symbol_search',
        'header_compare',
        'header_screenshot',
        'header_settings',
        'header_indicators',
        'header_chart_type',
        'header_resolutions',
        'header_fullscreen_button',
        'timeframes_toolbar',
        'control_bar',
        'symbol_info',
        'context_menus',
        'legend_widget',
      ],
      enabled_features: [
        'use_localstorage_for_settings',
        'save_chart_properties_to_local_storage',
      ],
      overrides: {
        'paneProperties.background': '#050505',
        'paneProperties.backgroundType': 'solid',
        'paneProperties.vertGridProperties.color': 'rgba(255,255,255,0.05)',
        'paneProperties.horzGridProperties.color': 'rgba(255,255,255,0.05)',
        'paneProperties.vertGridProperties.style': 0,
        'paneProperties.horzGridProperties.style': 0,
        'mainSeriesProperties.candleStyle.upColor': '#00C853',
        'mainSeriesProperties.candleStyle.downColor': '#FF3B69',
        'mainSeriesProperties.candleStyle.borderUpColor': '#00C853',
        'mainSeriesProperties.candleStyle.borderDownColor': '#FF3B69',
        'mainSeriesProperties.candleStyle.wickUpColor': '#00C853',
        'mainSeriesProperties.candleStyle.wickDownColor': '#FF3B69',
        'mainSeriesProperties.candleStyle.drawBorder': true,
        'mainSeriesProperties.candleStyle.drawWick': true,
        'mainSeriesProperties.hollowCandleStyle.upColor': '#00C853',
        'mainSeriesProperties.hollowCandleStyle.downColor': '#FF3B69',
        'mainSeriesProperties.hollowCandleStyle.borderUpColor': '#00C853',
        'mainSeriesProperties.hollowCandleStyle.borderDownColor': '#FF3B69',
        'mainSeriesProperties.hollowCandleStyle.wickUpColor': '#00C853',
        'mainSeriesProperties.hollowCandleStyle.wickDownColor': '#FF3B69',
        'mainSeriesProperties.barStyle.upColor': '#00C853',
        'mainSeriesProperties.barStyle.downColor': '#FF3B69',
        'mainSeriesProperties.lineStyle.color': '#BAFF39',
        'mainSeriesProperties.lineStyle.linewidth': 2,
        'mainSeriesProperties.areaStyle.color1': 'rgba(186, 255, 57, 0.28)',
        'mainSeriesProperties.areaStyle.color2': 'rgba(186, 255, 57, 0.05)',
        'mainSeriesProperties.areaStyle.linecolor': '#BAFF39',
        'mainSeriesProperties.areaStyle.linewidth': 2,
        'scalesProperties.backgroundColor': '#050505',
        'scalesProperties.lineColor': '#1F1F1F',
        'scalesProperties.textColor': '#999999',
        'scalesProperties.fontSize': isMobile ? 10 : 11,
        'timeScale.rightOffset': 5,
        'crosshairProperties.color': '#BAFF39',
        'crosshairProperties.width': 1,
        'crosshairProperties.style': 2,
        'paneProperties.separatorColor': '#1F1F1F',
        'paneProperties.topMargin': isMobile ? 3 : 10,
        'paneProperties.bottomMargin': isMobile ? 3 : 10,
        'paneProperties.leftAxisProperties.autoScale': true,
        'paneProperties.rightAxisProperties.autoScale': true,
      },
      studies_overrides: {
        'volume.volume.color.0': '#FF3B69',
        'volume.volume.color.1': '#00C853',
        'volume.volume.transparency': 65,
        'volume.volume ma.visible': false,
        'volume.volume ma.linewidth': 1,
      },
      loading_screen: {
        backgroundColor: '#050505',
        foregroundColor: '#BAFF39',
      },
    };

    try {
      const tvWidget = new window.TradingView.widget(widgetOptions);
      widgetRef.current = tvWidget;

      tvWidget.onChartReady(() => {
        try {
          tvWidget.applyOverrides({
            'paneProperties.background': '#050505',
            'paneProperties.backgroundType': 'solid',
          });
          const chart = tvWidget.chart();
          const existingStudies = chart.getAllStudies?.() || [];
          const hasVolume = existingStudies.some(
            (study) => study?.name?.toLowerCase?.().includes?.('volume')
          );
          if (!hasVolume) {
            chart.createStudy?.('Volume', false, false);
          }
          if (customOverrides) tvWidget.applyOverrides(customOverrides);
          setTimeout(() => setIsChartReady(true), 300);
          onWidgetReady?.(tvWidget);
        } catch (err) {
          console.error('[TradingView] Chart init error:', err);
        }
      });
    } catch (err) {
      console.error('[TradingView] Widget creation error:', err);
    }

    return () => {
      if (widgetRef.current?.remove) widgetRef.current.remove();
      widgetRef.current = null;
      setIsChartReady(false);
    };
  }, [isScriptLoaded, datafeedReady, symbol, interval, customOverrides, userTimezone, onWidgetReady]);

  const TOOL_MAP = {
    cursor: 'cursor',
    trend_line: 'trend_line',
    horizontal_line: 'horizontal_line',
    vertical_line: 'vertical_line',
    rectangle: 'rectangle',
    text: 'text',
    brush: 'brush',
    fib_retracement: 'fib_retracement',
  };

  const handleDrawingToolClick = (toolId) => {
    if (!widgetRef.current || !isChartReady) return;
    const widget = widgetRef.current;
    const tool = TOOL_MAP[toolId];
    if (!tool) return;
    try {
      if (activeDrawingTool === toolId) {
        widget.selectLineTool('cursor');
        setActiveDrawingTool(null);
      } else {
        widget.selectLineTool(tool);
        setActiveDrawingTool(toolId);
      }
    } catch (error) {
      console.error('Failed to select drawing tool:', error);
    }
  };

  const drawingTools = [
    { id: 'cursor', name: 'Cursor', icon: '✛' },
    { id: 'trend_line', name: 'Trend Line', icon: '⟋' },
    { id: 'horizontal_line', name: 'Horizontal Line', icon: '—' },
    { id: 'vertical_line', name: 'Vertical Line', icon: '|' },
    { id: 'rectangle', name: 'Rectangle', icon: '□' },
    { id: 'text', name: 'Text', icon: 'T' },
    { id: 'brush', name: 'Brush', icon: '✏' },
    { id: 'fib_retracement', name: 'Fib Retracement', icon: '⌇' },
  ];

  return (
    <div className="relative w-full h-full bg-[#050505] overflow-hidden">
      {chartError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A] z-50">
          <div className="max-w-md p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FF3B69]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#FF3B69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Chart Unavailable</h3>
            <p className="text-[#999999] text-sm mb-4">{chartError}</p>
            <button
              onClick={() => {
                setChartError(null);
                setIsRetrying(true);
                window.location.reload();
              }}
              disabled={isRetrying}
              className="px-6 py-2.5 bg-[#EAB308] text-black text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {isRetrying ? 'Refreshing...' : 'Refresh Page'}
            </button>
          </div>
        </div>
      ) : null}

      <div ref={chartContainerRef} className="w-full h-full pl-14" />

      {showCustomToolbar && isChartReady && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-stretch w-11 p-0 gap-0 bg-[#080808] rounded-lg z-[19]">
          {drawingTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleDrawingToolClick(tool.id)}
              className={`w-11 h-11 flex items-center justify-center rounded-md transition-all cursor-pointer shrink-0 ${
                activeDrawingTool === tool.id
                  ? 'bg-[rgba(234,179,8,0.2)] text-[#EAB308]'
                  : 'text-[#8E8E93] hover:bg-[rgba(234,179,8,0.1)] hover:text-[#EAB308]'
              }`}
              title={tool.name}
            >
              <span className="text-lg leading-none font-bold w-7 h-7 flex items-center justify-center">{tool.icon}</span>
            </button>
          ))}
          <div className="w-full shrink-0 px-1 py-2.5" aria-hidden>
            <div className="w-full h-px bg-[#8E8E93]" />
          </div>
          <button
            onClick={() => {
              if (widgetRef.current?.chart?.()) {
                widgetRef.current.chart().removeAllShapes();
                setActiveDrawingTool(null);
              }
            }}
            className="w-11 h-11 flex items-center justify-center rounded-md text-[#8E8E93] hover:bg-[rgba(234,179,8,0.1)] hover:text-[#EAB308] transition-all cursor-pointer shrink-0"
            title="Clear All Drawings"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (widgetRef.current) {
                widgetRef.current.chart()?.executeActionById?.('chartReset');
                setActiveDrawingTool(null);
              }
            }}
            className="w-11 h-11 flex items-center justify-center rounded-md text-[#8E8E93] hover:bg-[rgba(234,179,8,0.1)] hover:text-[#EAB308] transition-all cursor-pointer shrink-0"
            title="Reset Chart View"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}

      <div
        className={`absolute inset-0 bg-[#050505] flex items-center justify-center z-50 transition-transform duration-700 ease-in-out ${
          isChartReady ? 'translate-x-full' : 'translate-x-0'
        }`}
        style={{ pointerEvents: isChartReady ? 'none' : 'auto' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#EAB308]/30 border-t-[#EAB308] rounded-full animate-spin" />
          <p className="text-[#999999] text-sm">Loading chart...</p>
        </div>
      </div>
    </div>
  );
}
