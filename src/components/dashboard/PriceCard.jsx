import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, CheckCircle, DollarSign, Eye, LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import { formatRelativeTime } from '@utils/helpers';

const toNumber = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const safeText = (value, fallback = '') => {
  if (typeof value === 'string') return value.trim() || fallback;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};

const formatCurrency = (value, compact = false) => {
  const number = toNumber(value);
  if (number === null) return 'Not provided';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 2 : 4,
  }).format(number);
};

const formatPct = (value) => {
  const number = toNumber(value);
  if (number === null) return 'N/A';
  return `${number >= 0 ? '+' : ''}${number.toFixed(2)}%`;
};

const pctTone = (value) => {
  const number = toNumber(value);
  if (number === null) return 'text-slate-400';
  if (number > 0) return 'text-emerald-300';
  if (number < 0) return 'text-red-300';
  return 'text-slate-300';
};

const asArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

export const PriceCard = ({ alert, onViewDetails, onMarkAsRead }) => {
  const data = alert.rawContent || {};
  const isUnread = alert.status === 'new';
  const symbol = safeText(alert.symbol || data.symbol, 'N/A').toUpperCase();
  const name = safeText(alert.name || data.name, 'Unknown Asset');
  const currentPrice = alert?.metrics?.current_price ?? data.current_price;
  const ath = alert?.metrics?.ath ?? data.ath;
  const atl = alert?.metrics?.atl ?? data.atl;
  const marketCap = alert?.metrics?.market_cap ?? data.market_cap;
  const volume = alert?.metrics?.volume ?? data.trading_volume_24h;
  const moves = asArray(alert.significant_moves || data.significant_moves);
  const alertReason = safeText(alert.alert_reason || data.alert_reason || data.alert_reasons, '');

  const changes = [
    { label: '1H', value: alert?.metrics?.price_change_1h_pct ?? data.price_change_1h_pct },
    { label: '24H', value: alert?.metrics?.price_change_24h_pct ?? data.price_change_24h_pct },
    { label: '7D', value: alert?.metrics?.price_change_7d_pct ?? data.price_change_7d_pct },
    { label: '30D', value: alert?.metrics?.price_change_30d_pct ?? data.price_change_30d_pct },
  ];

  return (
    <article
      className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-950 via-amber-950/20 to-slate-950 p-4 sm:p-5 cursor-pointer hover:border-amber-400/40 transition-all duration-200"
      onClick={() => onViewDetails && onViewDetails(alert)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] border border-amber-500/40 bg-amber-500/10 text-amber-300">PRICE</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] border border-slate-600 bg-slate-900 text-slate-300">{alert.source || 'unknown'}</span>
            <span className="ml-auto text-[11px] text-slate-400">{formatRelativeTime(alert.timestamp)}</span>
          </div>

          <h3 className="text-lg font-bold text-white inline-flex items-center gap-2"><DollarSign className="w-4 h-4 text-amber-300" />{name} ({symbol})</h3>
          <div className="mt-1 text-2xl font-extrabold text-amber-200">{formatCurrency(currentPrice)}</div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-2">
              <div className="text-slate-500">ATH</div>
              <div className="text-slate-200 font-medium">{formatCurrency(ath)}</div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-2">
              <div className="text-slate-500">ATL</div>
              <div className="text-slate-200 font-medium">{formatCurrency(atl)}</div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-2">
              <div className="text-slate-500">Market Cap</div>
              <div className="text-slate-200 font-medium">{formatCurrency(marketCap, true)}</div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-2">
              <div className="text-slate-500">Volume</div>
              <div className="text-slate-200 font-medium">{formatCurrency(volume, true)}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="text-xs text-slate-500 mb-1 inline-flex items-center gap-1"><LineChart className="w-3 h-3" />Percent Changes</div>
          <div className="grid grid-cols-2 gap-2">
            {changes.map((item) => (
              <div key={`${alert.id}-${item.label}`} className="rounded-lg border border-slate-700 bg-slate-900/70 p-2">
                <div className="text-[11px] text-slate-500">{item.label}</div>
                <div className={`text-sm font-bold ${pctTone(item.value)}`}>{formatPct(item.value)}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {alertReason && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-200 inline-flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" /> {alertReason}
              </div>
            )}
            {moves.length > 0 && (
              <div>
                <div className="text-[11px] text-slate-500 mb-1">Significant Moves</div>
                <ul className="space-y-1">
                  {moves.map((move) => (
                    <li key={`${alert.id}-${move}`} className="text-xs text-slate-200 inline-flex items-center gap-1">
                      {String(move).startsWith('-') ? <TrendingDown className="w-3 h-3 text-red-300" /> : <TrendingUp className="w-3 h-3 text-emerald-300" />}
                      {move}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 flex lg:flex-col items-center lg:items-end justify-between gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onViewDetails && onViewDetails(alert)}
            className="w-full lg:w-auto inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs font-medium hover:bg-amber-500/20"
          >
            <Eye className="w-3 h-3" /> Details
          </button>
          {isUnread && (
            <button
              onClick={() => onMarkAsRead && onMarkAsRead(alert.id)}
              className="w-full lg:w-auto inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700"
            >
              <CheckCircle className="w-3 h-3" /> Read
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

PriceCard.propTypes = {
  alert: PropTypes.object.isRequired,
  onViewDetails: PropTypes.func,
  onMarkAsRead: PropTypes.func,
};

export default PriceCard;
