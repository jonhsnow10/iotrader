import React, { useState, useMemo, Fragment, useEffect } from 'react';
import { OrderSide, OrderStatus, OrderType } from '@orderly.network/types';
import {
  useOrderStream,
  usePositionStream,
  useSubAccountMutation,
  useSymbolsInfo,
  useAssetsHistory,
  useChains,
} from '@orderly.network/hooks';
import { useAccount } from 'wagmi';
import { useAccountBalance } from '../../hooks/useAccountBalance';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { useTradeHistory } from '../../hooks/useTradeHistory';
import { DepositModal } from './DepositModal';
import { PositionTPSLCell } from './PositionTPSLCell';
import { OrderErrorAlert } from '../ui/OrderErrorAlert';
import { handlePositionError } from '../../utils/orderlyErrorHandler';
import { InfoTooltip } from '../ui/InfoTooltip';

function EmptyStatePanel({ iconSrc, title, subtitle }) {
  return (
    <div className="p-6 bg-[#000000]">
      <div className="flex flex-col items-center justify-center min-h-[320px] text-center">
        {iconSrc ? (
          <img src={iconSrc} alt="" width={63} height={63} className="w-[63px] h-[63px] opacity-80" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#1F1F1F] flex items-center justify-center mb-4">
            <span className="text-[#666666] text-2xl">—</span>
          </div>
        )}
        <p className="mt-4 text-[20px] leading-[24px] text-white font-medium">{title}</p>
        <p className="mt-2 text-[20px] leading-[24px] text-[#666666]">{subtitle}</p>
      </div>
    </div>
  );
}

function formatSymbol(s) {
  return s?.replace?.('PERP_', '')?.replace?.(/_/g, '/') ?? s;
}

export function CustomBottomTabs({ symbol }) {
  const [activeTab, setActiveTab] = useState('orders');
  const tabs = [
    { key: 'orders', label: 'Open Orders' },
    { key: 'positions', label: 'Positions' },
    { key: 'trades', label: 'Trade History' },
    { key: 'assets', label: 'Assets' },
    { key: 'deposit-withdraw', label: 'Deposit & Withdrawals' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#000000]" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div
        className="flex flex-row items-center justify-start gap-4 px-8 overflow-x-auto overflow-y-hidden border-t border-b shrink-0 bg-[#000000]"
        style={{
          height: 44,
          borderColor: 'rgba(60, 60, 67, 0.6)',
        }}
      >
        {tabs.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`
                box-border flex flex-row items-center justify-start shrink-0 py-2 px-1 gap-2 text-left
                text-base font-normal leading-6 transition-colors whitespace-nowrap
                border-b-2 -mb-px
                ${isActive
                  ? 'border-[#EBB30B] font-bold text-white'
                  : 'border-transparent font-light text-[#737373] hover:text-white'
                }
              `}
              style={{ height: 44 }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-[#000000]" style={{ WebkitOverflowScrolling: 'touch' }}>
        {activeTab === 'positions' && <PositionsTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'trades' && <TradesTab symbol={symbol} />}
        {activeTab === 'assets' && <AssetsTab />}
        {activeTab === 'deposit-withdraw' && <DepositWithdrawTab />}
      </div>
    </div>
  );
}

function PositionsTab() {
  const [positionsData] = usePositionStream();
  const positions = useMemo(() => positionsData?.rows || [], [positionsData?.rows]);
  const symbolsInfo = useSymbolsInfo();
  const [closingSymbol, setClosingSymbol] = useState(null);
  const [positionError, setPositionError] = useState(null);
  const [tpslEditingSymbol, setTpslEditingSymbol] = useState(null);
  const [doCreateOrder, { isMutating }] = useSubAccountMutation('/v1/order', 'POST');

  const submitCloseOrder = async (position, customQuantity) => {
    if (!position?.symbol || isMutating) return;
    const quantity = customQuantity !== undefined ? customQuantity : Math.abs(Number(position.position_qty) || 0);
    if (quantity <= 0) return;
    setClosingSymbol(position.symbol);
    try {
      await doCreateOrder({
        symbol: position.symbol,
        order_type: OrderType.MARKET,
        side: (position.position_qty ?? 0) > 0 ? OrderSide.SELL : OrderSide.BUY,
        order_quantity: quantity,
        reduce_only: true,
      });
    } catch (err) {
      console.error('Close position failed:', err);
      const handled = handlePositionError(err, 'close');
      setPositionError(handled.userMessage);
    } finally {
      setClosingSymbol(null);
    }
  };

  const handleClosePosition = async (position) => {
    await submitCloseOrder(position);
  };

  useEffect(() => {
    if (!tpslEditingSymbol) return;
    const p = positions.find((x) => x.symbol === tpslEditingSymbol);
    if (!p || Math.abs(p.position_qty ?? 0) === 0) setTpslEditingSymbol(null);
  }, [positions, tpslEditingSymbol]);

  if (!positions?.length) {
    return (
      <div className="p-6 bg-[#000000]">
        <OrderErrorAlert error={positionError} onClose={() => setPositionError(null)} />
        <EmptyStatePanel iconSrc="/images/empty-positions-icon.svg" title="No open positions" subtitle="Your positions will appear here" />
      </div>
    );
  }

  return (
    <div className="p-3 bg-[#000000]">
      <OrderErrorAlert error={positionError} onClose={() => setPositionError(null)} />
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[1000px]">
          <thead>
            <tr className="text-left text-[10px] text-[#666666] border-b border-[#1F1F1F]">
              <th className="pb-2 px-2 font-medium">Contract</th>
              <th className="pb-2 px-2 font-medium">Side</th>
              <th className="pb-2 px-2 text-right font-medium">Quantity</th>
              <th className="pb-2 px-2 text-right font-medium">Value</th>
              <th className="pb-2 px-2 text-right font-medium">Entry Price</th>
              <th className="pb-2 px-2 text-right font-medium">Mark Price</th>
              <th className="pb-2 px-2 text-right font-medium">P&L</th>
              <th className="pb-2 px-2 text-center font-medium">
                <InfoTooltip content="Automatically close or reduce your position when price reaches your profit target or loss limit.">
                  <span>TP/SL</span>
                </InfoTooltip>
              </th>
              <th className="pb-2 px-2 text-center font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p, i) => {
              const unrealPnl = p.unrealized_pnl ?? 0;
              const unrealRoi = p.unrealized_pnl_ROI ?? 0;
              const isBuy = (p.position_qty ?? 0) > 0;
              const isProfit = unrealPnl >= 0;
              const notional = p.notional ?? 0;
              const isEditing = tpslEditingSymbol === p.symbol;
              return (
                <Fragment key={p.symbol || i}>
                  <tr className="border-b border-[#0A0A0A] hover:bg-[#0A0A0A] transition-colors">
                    <td className="py-3 px-2 font-medium text-white">{formatSymbol(p.symbol)}</td>
                    <td className="py-3 px-2">
                      <span className={`font-medium ${isBuy ? 'text-[#00C853]' : 'text-[#FF3B69]'}`}>{isBuy ? 'Buy' : 'Sell'}</span>
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-white">{Math.abs(p.position_qty ?? 0).toFixed(4)}</td>
                    <td className="py-3 px-2 text-right font-mono text-[#999999]">${Math.abs(notional).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3 px-2 text-right font-mono text-white">${(p.average_open_price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3 px-2 text-right font-mono text-white">${(p.mark_price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-medium font-mono ${isProfit ? 'text-[#00C853]' : 'text-[#FF3B69]'}`}>{isProfit ? '+' : ''}{(unrealRoi * 100).toFixed(2)}%</span>
                        <span className={`text-[10px] font-mono ${isProfit ? 'text-[#00C853]' : 'text-[#FF3B69]'}`}>{isProfit ? '+' : ''}${unrealPnl.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <PositionTPSLCell
                        position={p}
                        onClick={() => setTpslEditingSymbol(p.symbol)}
                        disabled={isMutating || closingSymbol === p.symbol}
                      />
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setTpslEditingSymbol(p.symbol)} disabled={isMutating || closingSymbol === p.symbol} className="p-1.5 hover:bg-[#1F1F1F] rounded transition-colors disabled:opacity-50" title="Edit TP/SL">
                          <svg className="w-4 h-4 text-[#999999] hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleClosePosition(p)} disabled={isMutating || closingSymbol === p.symbol || Math.abs(p.position_qty ?? 0) === 0} className="p-1.5 hover:bg-[#FF3B69]/10 rounded transition-colors disabled:opacity-50" title="Close position">
                          {closingSymbol === p.symbol && isMutating ? (
                            <svg className="w-4 h-4 text-[#FF3B69] animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                          ) : (
                            <svg className="w-4 h-4 text-[#999999] hover:text-[#FF3B69]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isEditing && (
                    <tr className="bg-[#0A0A0A] border-b border-[#1F1F1F]">
                      <td colSpan={9} className="py-3 px-2 text-center text-[#999999] text-xs">
                        TP/SL editor coming soon — use Orderly dashboard to manage
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, { cancelOrder }] = useOrderStream({ status: OrderStatus.INCOMPLETE });
  const [isCancelling, setIsCancelling] = useState(null);

  const handleCancel = async (orderId, symbol) => {
    try {
      setIsCancelling(orderId);
      await cancelOrder(orderId, symbol);
    } catch (e) {
      console.error('Cancel order failed:', e);
    } finally {
      setIsCancelling(null);
    }
  };

  const formatOrderType = (t) => {
    const m = { LIMIT: 'Limit', MARKET: 'Market', POST_ONLY: 'Post Only', STOP_LIMIT: 'Stop Limit', STOP_MARKET: 'Stop Market', TRAILING_STOP: 'Trailing Stop' };
    return m[t] ?? t;
  };

  if (!orders?.length) {
    return <EmptyStatePanel iconSrc="/images/empty-orders-icon.svg" title="No open orders" subtitle="Your pending orders will appear here" />;
  }

  return (
    <div className="p-3 overflow-x-auto bg-[#000000]">
      <table className="w-full text-xs min-w-[800px]">
        <thead>
          <tr className="text-left text-[10px] text-[#666666] border-b border-[#1F1F1F]">
            <th className="pb-2 px-2">Time</th>
            <th className="pb-2 px-2">Contract</th>
            <th className="pb-2 px-2">Type</th>
            <th className="pb-2 px-2">Side</th>
            <th className="pb-2 px-2 text-right">Price</th>
            <th className="pb-2 px-2 text-right">Quantity</th>
            <th className="pb-2 px-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const isBuy = o.side === 'BUY';
            return (
              <tr key={o.order_id} className="border-b border-[#0A0A0A] hover:bg-[#0A0A0A]">
                <td className="py-3 px-2 text-[#999999]">
                  {o.created_time ? new Date(o.created_time).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--'}
                </td>
                <td className="py-3 px-2 font-medium text-white">{formatSymbol(o.symbol)}</td>
                <td className="py-3 px-2 text-[#999999]">{formatOrderType(o.type)}</td>
                <td className="py-3 px-2">
                  <span className={isBuy ? 'text-[#00C853]' : 'text-[#FF3B69]'}>{isBuy ? 'Buy' : 'Sell'}</span>
                </td>
                <td className="py-3 px-2 text-right font-mono text-white">${(o.price ?? 0).toFixed(2)}</td>
                <td className="py-3 px-2 text-right font-mono text-white">{(o.quantity ?? 0).toFixed(4)}</td>
                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => handleCancel(o.order_id, o.symbol)}
                    disabled={isCancelling === o.order_id}
                    className="p-1.5 hover:bg-[#FF3B69]/10 rounded disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 text-[#999999] hover:text-[#FF3B69]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TradesTab({ symbol }) {
  const { paginatedTrades, isLoading, isConnected } = useTradeHistory({ symbol, pageSize: 10 });

  if (isLoading) return <EmptyStatePanel title="Loading..." subtitle="Please wait" />;
  if (!isConnected) return <EmptyStatePanel iconSrc="/images/empty-trades-icon.svg" title="No trade history" subtitle="Connect wallet to view trades" />;
  if (!paginatedTrades?.length) return <EmptyStatePanel iconSrc="/images/empty-trades-icon.svg" title="No trade history" subtitle={symbol ? `Trades for ${symbol}` : 'Executed trades will appear here'} />;

  return (
    <div className="p-3 bg-[#000000]">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-[10px] text-[#666666] border-b border-[#1F1F1F]">
            <th className="pb-2 px-2">Time</th>
            <th className="pb-2 px-2">Side</th>
            <th className="pb-2 px-2 text-right">Price</th>
            <th className="pb-2 px-2 text-right">Quantity</th>
            <th className="pb-2 px-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTrades.map((t, i) => (
            <tr key={i} className="border-b border-[#0A0A0A] hover:bg-[#0A0A0A]">
              <td className="py-2 px-2 text-[#999999]">
                {t.timestamp ? new Date(t.timestamp).toLocaleTimeString('en-US', { hour12: false }) : '--'}
              </td>
              <td className="py-2 px-2">
                <span className={t.side === 'BUY' ? 'text-[#00C853]' : 'text-[#FF3B69]'}>{t.side}</span>
              </td>
              <td className="py-2 px-2 text-right font-mono text-white">${(t.price ?? 0).toFixed(2)}</td>
              <td className="py-2 px-2 text-right font-mono text-[#999999]">{(t.quantity ?? 0).toFixed(4)}</td>
              <td className="py-2 px-2 text-right font-mono text-[#999999]">${(t.total ?? 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssetsTab() {
  const [hideZero, setHideZero] = useSessionStorage('hideZeroAssets', true);
  const [depositOpen, setDepositOpen] = useState(false);
  const { totalBalanceUSD, assets, isLoading, isConnected } = useAccountBalance({ includeZeroBalances: !hideZero });

  const formatUSD = (v) => (v == null || !isConnected ? '--' : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

  if (!isConnected) return <EmptyStatePanel iconSrc="/images/empty-assets-icon.svg" title="No assets" subtitle="Connect wallet to view assets" />;
  if (isLoading) return <EmptyStatePanel title="Loading..." subtitle="Please wait" />;
  if (!assets?.length) return <EmptyStatePanel iconSrc="/images/empty-assets-icon.svg" title="No assets" subtitle="Deposit to get started" />;

  return (
    <div className="p-3 space-y-3 bg-[#000000]">
      <div className="p-3 rounded bg-[#000000] border border-[#1F1F1F]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold text-white">Total Balance</span>
          <button
            onClick={() => setDepositOpen(true)}
            className="btn-primary-accent px-3 py-1.5"
          >
            Deposit
          </button>
        </div>
        <div className="text-xl font-semibold text-white">${formatUSD(totalBalanceUSD)}</div>
      </div>
      {assets.length > 0 && (
        <div className="flex justify-end gap-2 py-1">
          <label className="text-[10px] text-[#999999]">Hide zero</label>
          <button
            role="switch"
            onClick={() => setHideZero(!hideZero)}
            className={`relative h-4 w-7 rounded-full transition-colors ${hideZero ? 'bg-[#FFF800]' : 'bg-[#333333]'}`}
          >
            <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-black transition-transform ${hideZero ? 'left-3.5' : 'left-0.5'}`} />
          </button>
        </div>
      )}
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-[10px] text-[#666666] border-b border-[#1F1F1F]">
            <th className="pb-1.5">Asset</th>
            <th className="pb-1.5 text-right">Total</th>
            <th className="pb-1.5 text-right">Available</th>
            <th className="pb-1.5 text-right">In Orders</th>
            <th className="pb-1.5 text-right">Value</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => (
            <tr key={a.symbol} className="border-b border-[#0A0A0A] hover:bg-[#0A0A0A]">
              <td className="py-2 font-medium text-white">{a.symbol}</td>
              <td className="py-2 text-right text-[#A3A3A3]">{(a.total ?? 0).toFixed(6)}</td>
              <td className="py-2 text-right text-[#A3A3A3]">{(a.available ?? 0).toFixed(6)}</td>
              <td className="py-2 text-right text-[#A3A3A3]">{(a.inOrders ?? 0).toFixed(6)}</td>
              <td className="py-2 text-right font-medium text-white">${formatUSD(a.usdValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
    </div>
  );
}

const CHAIN_NAMES = { 1: 'Ethereum', 42161: 'Arbitrum', 56: 'BNB', 137: 'Polygon', 11155111: 'Sepolia', 421614: 'Arbitrum Sepolia' };
const BLOCK_EXPLORERS = { 1: 'https://etherscan.io/tx/', 42161: 'https://arbiscan.io/tx/', 56: 'https://bscscan.com/tx/', 421614: 'https://sepolia.arbiscan.io/tx/' };

function DepositWithdrawTab() {
  const [records, { isLoading }] = useAssetsHistory({ pageSize: 1000, page: 1 });
  const [, { findByChainId }] = useChains();
  const { address } = useAccount();

  const sorted = useMemo(() => [...(records || [])].sort((a, b) => (b.created_time ?? 0) - (a.created_time ?? 0)), [records]);

  const getNetworkName = (chainId) => {
    const n = Number(chainId);
    if (!isNaN(n)) {
      const c = findByChainId?.(n);
      if (c?.network_infos?.name) return c.network_infos.name;
    }
    return CHAIN_NAMES[String(chainId)] ?? 'Unknown';
  };

  const getExplorerUrl = (chainId, txId) => {
    const base = BLOCK_EXPLORERS[String(chainId)];
    return base && txId ? `${base}${txId}` : null;
  };

  if (isLoading) return <EmptyStatePanel title="Loading..." subtitle="Deposit & withdrawal history" />;
  if (!sorted?.length) return <EmptyStatePanel iconSrc="/images/empty-deposit-withdraw-icon.svg" title="No deposits or withdrawals" subtitle="History will appear here" />;

  return (
    <div className="p-3 overflow-x-auto bg-[#000000]">
      <table className="w-full text-xs min-w-[700px]">
        <thead>
          <tr className="text-left text-[10px] text-[#666666] border-b border-[#1F1F1F]">
            <th className="pb-2 px-2">Asset</th>
            <th className="pb-2 px-2">Network</th>
            <th className="pb-2 px-2 text-right">Amount</th>
            <th className="pb-2 px-2">Type</th>
            <th className="pb-2 px-2">Date</th>
            <th className="pb-2 px-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.slice(0, 50).map((r, i) => {
            const isDeposit = r.side === 'DEPOSIT';
            return (
              <tr key={r.id || i} className="border-b border-[#0A0A0A] hover:bg-[#0A0A0A]">
                <td className="py-3 px-2 font-medium text-white">{r.token}</td>
                <td className="py-3 px-2 text-[#999999]">{getNetworkName(r.chain_id)}</td>
                <td className="py-3 px-2 text-right font-mono text-white">{(r.amount ?? 0).toFixed(6)}</td>
                <td className="py-3 px-2">
                  <span className={isDeposit ? 'text-[#00C853]' : 'text-[#FF3B69]'}>{isDeposit ? 'Deposit' : 'Withdrawal'}</span>
                </td>
                <td className="py-3 px-2 text-[#999999]">
                  {r.created_time ? new Date(r.created_time).toLocaleString() : '--'}
                </td>
                <td className="py-3 px-2">
                  <span
                    className={
                      r.trans_status === 'COMPLETED' ? 'text-[#00C853]' :
                      r.trans_status === 'FAILED' ? 'text-[#FF3B69]' : 'text-[#FFF800]'
                    }
                  >
                    {r.trans_status ?? '--'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
