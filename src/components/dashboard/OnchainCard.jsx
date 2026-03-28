import React from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, CheckCircle, Coins, Eye, Network, Wallet } from 'lucide-react';
import { formatRelativeTime } from '@utils/helpers';

const safeText = (value, fallback = '') => {
  if (typeof value === 'string') return value.trim() || fallback;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};

const toNumber = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const shortAddress = (value) => {
  const text = safeText(value, 'N/A');
  if (text === 'N/A') return text;
  if (text.length <= 14) return text;
  return `${text.slice(0, 6)}...${text.slice(-4)}`;
};

const formatUsd = (value) => {
  const number = toNumber(value);
  if (number === null) return 'Not provided';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(number);
};

const priorityClass = {
  HIGH: 'border-red-500/40 bg-red-500/10 text-red-300',
  MEDIUM: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  LOW: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
};

export const OnchainCard = ({ alert, onViewDetails, onMarkAsRead }) => {
  const raw = alert.rawContent || {};
  const token = safeText(alert.token || raw.token || raw.symbol || raw.name, 'Unknown token');
  const amount = safeText(alert.amount ?? raw.amount ?? raw.value, 'Not provided');
  const usdValue = alert.usd_value ?? raw.usd_value ?? raw.value_usd;
  const fromAddress = alert.from || raw.from || raw.from_address;
  const toAddress = alert.to || raw.to || raw.to_address;
  const blockchain = safeText(alert.blockchain || raw.blockchain, 'Unknown chain');
  const txType = safeText(alert.transaction_type || raw.transaction_type || raw.tx_type, 'Unknown');
  const isUnread = alert.status === 'new';

  return (
    <article
      className="rounded-2xl border border-emerald-500/30 bg-black p-4 sm:p-5 cursor-pointer hover:border-emerald-400/45 transition-all duration-200"
      onClick={() => onViewDetails && onViewDetails(alert)}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md text-[10px] border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">ONCHAIN</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] border ${priorityClass[alert.priority] || priorityClass.LOW}`}>{alert.priority || 'LOW'}</span>
          <span className="px-2 py-0.5 rounded-md text-[10px] border border-slate-600 bg-slate-900 text-slate-300">{alert.source || 'unknown'}</span>
        </div>
        <span className="text-[11px] text-slate-400">{formatRelativeTime(alert.timestamp)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-1 rounded-xl border border-slate-700 bg-slate-900/70 p-3">
          <div className="text-[11px] text-slate-500 mb-1">Token</div>
          <div className="text-base font-bold text-emerald-200 inline-flex items-center gap-1"><Coins className="w-4 h-4" />{token}</div>
          <div className="mt-2 text-[11px] text-slate-500">Amount</div>
          <div className="text-sm font-medium text-slate-200">{amount}</div>
          <div className="mt-2 text-[11px] text-slate-500">USD Value</div>
          <div className="text-sm font-medium text-emerald-300">{formatUsd(usdValue)}</div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-slate-700 bg-slate-900/70 p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] text-slate-500 mb-1">From</div>
              <div className="text-sm text-slate-100 inline-flex items-center gap-1"><Wallet className="w-3 h-3 text-slate-400" />{shortAddress(fromAddress)}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 mb-1">To</div>
              <div className="text-sm text-slate-100 inline-flex items-center gap-1"><Wallet className="w-3 h-3 text-slate-400" />{shortAddress(toAddress)}</div>
            </div>
          </div>

          <div className="my-3 flex items-center gap-2 text-slate-400"><ArrowRight className="w-4 h-4" /><span className="text-xs">Transfer Path</span></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] text-slate-500 mb-1">Blockchain</div>
              <div className="text-sm text-slate-200 inline-flex items-center gap-1"><Network className="w-3 h-3 text-emerald-300" />{blockchain}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 mb-1">Transaction Type</div>
              <div className="text-sm text-slate-200">{txType}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onViewDetails && onViewDetails(alert)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs font-medium hover:bg-emerald-500/20"
        >
          <Eye className="w-3 h-3" /> Details
        </button>
        {isUnread && (
          <button
            onClick={() => onMarkAsRead && onMarkAsRead(alert.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700"
          >
            <CheckCircle className="w-3 h-3" /> Mark Read
          </button>
        )}
      </div>
    </article>
  );
};

OnchainCard.propTypes = {
  alert: PropTypes.object.isRequired,
  onViewDetails: PropTypes.func,
  onMarkAsRead: PropTypes.func,
};

export default OnchainCard;
