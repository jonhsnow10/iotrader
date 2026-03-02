import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { scaleLinear } from 'd3-scale';
import { area, curveStepAfter, curveStepBefore } from 'd3-shape';
import { useOrderlyMarketData } from '../../../hooks/orderly/useOrderlyMarkets';

const BID_COLOR = '#35D4CA';
const ASK_COLOR = '#FF3B69';
const GRID_COLOR = '#1A1A1A';
const LABEL_COLOR = '#666666';
const CROSSHAIR_COLOR = '#444444';
const BG_COLOR = '#000000';
const MID_LINE_COLOR = '#555555';

const MARGIN = { top: 30, right: 56, bottom: 32, left: 12 };

function fmtNotional(v) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toFixed(0);
}

function fmtPrice(p) {
  if (p >= 1000) {
    return p.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }
  if (p >= 1) return p.toFixed(2);
  return p.toFixed(4);
}

export function DepthChart({ symbol }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hover, setHover] = useState(null);

  const { orderbook } = useOrderlyMarketData(symbol || '');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { bidLevels, askLevels, markPrice } = useMemo(() => {
    const empty = { bidLevels: [], askLevels: [], markPrice: 0 };
    if (!orderbook?.bids?.length && !orderbook?.asks?.length) return empty;

    const parseSide = (levels) => {
      const out = [];
      if (!levels) return out;
      let cumNotional = 0;
      for (const lvl of levels) {
        const arr = Array.isArray(lvl) ? lvl : undefined;
        const price = arr?.[0];
        const qty = arr?.[1];
        if (
          typeof price !== 'number' ||
          typeof qty !== 'number' ||
          !Number.isFinite(price) ||
          !Number.isFinite(qty) ||
          price <= 0 ||
          qty <= 0
        ) continue;
        cumNotional += price * qty;
        out.push({ price, cumNotional });
      }
      return out;
    };

    const rawBids = parseSide(orderbook.bids);
    const rawAsks = parseSide(orderbook.asks);
    const bidLevels = [...rawBids].reverse();
    const askLevels = rawAsks;
    const mp =
      orderbook.markPrice ||
      (rawBids.length && rawAsks.length
        ? (rawBids[0].price + rawAsks[0].price) / 2
        : 0);

    return { bidLevels, askLevels, markPrice: mp };
  }, [orderbook]);

  const chartWidth = dimensions.width - MARGIN.left - MARGIN.right;
  const chartHeight = dimensions.height - MARGIN.top - MARGIN.bottom;

  const { xScale, yScale, midX } = useMemo(() => {
    if (
      chartWidth <= 0 ||
      chartHeight <= 0 ||
      (!bidLevels.length && !askLevels.length)
    ) {
      return {
        xScale: scaleLinear().domain([0, 1]).range([0, Math.max(chartWidth, 1)]),
        yScale: scaleLinear().domain([0, 1]).range([Math.max(chartHeight, 1), 0]),
        midX: 0,
      };
    }

    const allPrices = [
      ...bidLevels.map((l) => l.price),
      ...askLevels.map((l) => l.price),
    ];
    const allNotionals = [
      ...bidLevels.map((l) => l.cumNotional),
      ...askLevels.map((l) => l.cumNotional),
    ];

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const maxNotional = Math.max(...allNotionals);
    const priceRange = maxPrice - minPrice;
    const pricePad = priceRange * 0.02;

    const xs = scaleLinear()
      .domain([minPrice - pricePad, maxPrice + pricePad])
      .range([0, chartWidth]);

    const ys = scaleLinear()
      .domain([0, maxNotional * 1.08])
      .range([chartHeight, 0]);

    const mid =
      bidLevels.length && askLevels.length
        ? (bidLevels[bidLevels.length - 1].price + askLevels[0].price) / 2
        : markPrice;

    return { xScale: xs, yScale: ys, midX: xs(mid) };
  }, [bidLevels, askLevels, markPrice, chartWidth, chartHeight]);

  const { bidPath, bidLine, askPath, askLine } = useMemo(() => {
    if (chartWidth <= 0 || chartHeight <= 0) {
      return { bidPath: '', bidLine: '', askPath: '', askLine: '' };
    }

    const bidAreaGen = area()
      .x((d) => xScale(d.price))
      .y0(chartHeight)
      .y1((d) => yScale(d.cumNotional))
      .curve(curveStepBefore);
    const bidLineGen = area()
      .x((d) => xScale(d.price))
      .y0((d) => yScale(d.cumNotional))
      .y1((d) => yScale(d.cumNotional))
      .curve(curveStepBefore);

    const askAreaGen = area()
      .x((d) => xScale(d.price))
      .y0(chartHeight)
      .y1((d) => yScale(d.cumNotional))
      .curve(curveStepAfter);
    const askLineGen = area()
      .x((d) => xScale(d.price))
      .y0((d) => yScale(d.cumNotional))
      .y1((d) => yScale(d.cumNotional))
      .curve(curveStepAfter);

    return {
      bidPath: bidAreaGen(bidLevels) || '',
      bidLine: bidLineGen(bidLevels) || '',
      askPath: askAreaGen(askLevels) || '',
      askLine: askLineGen(askLevels) || '',
    };
  }, [bidLevels, askLevels, xScale, yScale, chartWidth, chartHeight]);

  const { xTicks, yTicks } = useMemo(() => {
    if (chartWidth <= 0 || chartHeight <= 0) return { xTicks: [], yTicks: [] };
    return { xTicks: xScale.ticks(5), yTicks: yScale.ticks(5) };
  }, [xScale, yScale, chartWidth, chartHeight]);

  const findLevel = useCallback(
    (mouseX) => {
      if (!bidLevels.length && !askLevels.length) return null;
      const price = xScale.invert(mouseX);
      const mid =
        bidLevels.length && askLevels.length
          ? (bidLevels[bidLevels.length - 1].price + askLevels[0].price) / 2
          : bidLevels.length
            ? bidLevels[bidLevels.length - 1].price
            : (askLevels[0]?.price ?? 0);

      if (price <= mid && bidLevels.length) {
        let level = bidLevels[0];
        for (let i = 0; i < bidLevels.length; i++) {
          if (bidLevels[i].price <= price) level = bidLevels[i];
          else break;
        }
        return {
          x: xScale(level.price),
          y: yScale(level.cumNotional),
          price: level.price,
          notional: level.cumNotional,
          side: 'bid',
        };
      }
      if (askLevels.length) {
        let level = askLevels[askLevels.length - 1];
        for (let i = askLevels.length - 1; i >= 0; i--) {
          if (askLevels[i].price >= price) level = askLevels[i];
          else break;
        }
        return {
          x: xScale(level.price),
          y: yScale(level.cumNotional),
          price: level.price,
          notional: level.cumNotional,
          side: 'ask',
        };
      }
      return null;
    },
    [bidLevels, askLevels, xScale, yScale]
  );

  const handlePointerMove = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - rect.left - MARGIN.left;
      const my = e.clientY - rect.top - MARGIN.top;
      if (mx < 0 || mx > chartWidth || my < 0 || my > chartHeight) {
        setHover(null);
        return;
      }
      setHover(findLevel(mx));
    },
    [findLevel, chartWidth, chartHeight]
  );
  const handlePointerLeave = useCallback(() => setHover(null), []);

  const hasData = bidLevels.length > 0 || askLevels.length > 0;

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: BG_COLOR, minHeight: 200 }}
    >
      {dimensions.width === 0 || dimensions.height === 0 ? null : !hasData ? (
        <div className="flex flex-col items-center justify-center h-full gap-2">
          {orderbook?.isLoading ? (
            <>
              <div
                className="w-8 h-8 rounded-full border-2 border-[#BCFF2F]/30 border-t-[#BCFF2F] animate-spin"
                aria-hidden
              />
              <span className="text-[10px] text-white">Loading depth...</span>
            </>
          ) : (
            <span className="text-[10px] text-[#A3A3A3]">
              No depth data available
            </span>
          )}
        </div>
      ) : (
        <svg
          width={dimensions.width}
          height={dimensions.height}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{ touchAction: 'none' }}
        >
          <defs>
            <linearGradient id="depthBidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BID_COLOR} stopOpacity={0.45} />
              <stop offset="100%" stopColor={BID_COLOR} stopOpacity={0.08} />
            </linearGradient>
            <linearGradient id="depthAskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ASK_COLOR} stopOpacity={0.45} />
              <stop offset="100%" stopColor={ASK_COLOR} stopOpacity={0.08} />
            </linearGradient>
          </defs>

          {markPrice > 0 && (
            <text
              x={MARGIN.left + 4}
              y={16}
              fill={BID_COLOR}
              fontSize={11}
              fontFamily="var(--font-geist-sans), sans-serif"
              fontWeight={500}
            >
              Mark price {'  '}
              <tspan fill="white">{fmtPrice(markPrice)}</tspan>
            </text>
          )}

          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {yTicks.map((tick, i) => (
              <g key={`y-${i}`}>
                <line
                  x1={0}
                  x2={chartWidth}
                  y1={yScale(tick)}
                  y2={yScale(tick)}
                  stroke={GRID_COLOR}
                  strokeDasharray="2,3"
                />
                <text
                  x={chartWidth + 8}
                  y={yScale(tick)}
                  textAnchor="start"
                  dominantBaseline="middle"
                  fill={LABEL_COLOR}
                  fontSize={9}
                  fontFamily="var(--font-geist-sans), sans-serif"
                >
                  {fmtNotional(tick)}
                </text>
              </g>
            ))}

            {xTicks.map((tick, i) => (
              <text
                key={`x-${i}`}
                x={xScale(tick)}
                y={chartHeight + 18}
                textAnchor="middle"
                fill={LABEL_COLOR}
                fontSize={9}
                fontFamily="var(--font-geist-sans), sans-serif"
              >
                {fmtPrice(tick)}
              </text>
            ))}

            <line
              x1={midX}
              x2={midX}
              y1={0}
              y2={chartHeight}
              stroke={MID_LINE_COLOR}
              strokeWidth={0.5}
            />

            <path d={bidPath} fill="url(#depthBidGrad)" />
            <path
              d={bidLine}
              fill="none"
              stroke={BID_COLOR}
              strokeWidth={1.5}
            />

            <path d={askPath} fill="url(#depthAskGrad)" />
            <path
              d={askLine}
              fill="none"
              stroke={ASK_COLOR}
              strokeWidth={1.5}
            />

            {hover && (
              <>
                <line
                  x1={hover.x}
                  x2={hover.x}
                  y1={0}
                  y2={chartHeight}
                  stroke={CROSSHAIR_COLOR}
                  strokeDasharray="3,3"
                  strokeWidth={0.5}
                />
                <line
                  x1={0}
                  x2={chartWidth}
                  y1={hover.y}
                  y2={hover.y}
                  stroke={CROSSHAIR_COLOR}
                  strokeDasharray="3,3"
                  strokeWidth={0.5}
                />
                <circle
                  cx={hover.x}
                  cy={hover.y}
                  r={4}
                  fill={hover.side === 'bid' ? BID_COLOR : ASK_COLOR}
                  stroke={BG_COLOR}
                  strokeWidth={2}
                />
                <g
                  transform={`translate(${hover.x > chartWidth / 2 ? hover.x - 120 : hover.x + 10}, ${Math.max(0, Math.min(hover.y - 30, chartHeight - 50))})`}
                >
                  <rect
                    width={110}
                    height={42}
                    rx={4}
                    fill="#111111"
                    stroke="#333"
                    strokeWidth={0.5}
                  />
                  <text
                    x={8}
                    y={16}
                    fill="#888"
                    fontSize={9}
                    fontFamily="var(--font-geist-sans), sans-serif"
                  >
                    Price
                  </text>
                  <text
                    x={102}
                    y={16}
                    textAnchor="end"
                    fill="white"
                    fontSize={9}
                    fontFamily="var(--font-geist-sans), monospace"
                  >
                    {fmtPrice(hover.price)}
                  </text>
                  <text
                    x={8}
                    y={34}
                    fill="#888"
                    fontSize={9}
                    fontFamily="var(--font-geist-sans), sans-serif"
                  >
                    Total
                  </text>
                  <text
                    x={102}
                    y={34}
                    textAnchor="end"
                    fill={hover.side === 'bid' ? BID_COLOR : ASK_COLOR}
                    fontSize={9}
                    fontFamily="var(--font-geist-sans), monospace"
                  >
                    {fmtNotional(hover.notional)}
                  </text>
                </g>
              </>
            )}

            <line
              x1={0}
              x2={chartWidth}
              y1={chartHeight}
              y2={chartHeight}
              stroke={GRID_COLOR}
            />
          </g>
        </svg>
      )}
    </div>
  );
}
