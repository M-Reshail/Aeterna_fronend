const toText = (value, fallback = '') => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return fallback;
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeTxType = (rawType = '') => {
  const value = toText(rawType, '').toLowerCase();
  if (value.includes('deposit')) return 'deposit';
  if (value.includes('withdraw')) return 'withdrawal';
  if (value.includes('exchange')) return 'exchange_flow';
  if (value.includes('transfer')) return 'transfer';
  return value || 'transfer';
};

const formatAmount = (amount) => {
  const numeric = toNumber(amount, NaN);
  if (!Number.isFinite(numeric) || numeric <= 0) return '';
  return numeric.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const classifySize = (amount) => {
  const numeric = toNumber(amount, 0);
  if (numeric >= 10000000) return 'mega';
  if (numeric >= 1000000) return 'whale';
  if (numeric >= 100000) return 'large';
  if (numeric > 0) return 'normal';
  return 'unknown';
};

const classifyWhaleTier = (sizeCategory, transferType) => {
  if (sizeCategory === 'mega') return 'mega_whale';
  if (sizeCategory === 'whale') return transferType === 'exchange_flow' ? 'institutional_flow' : 'whale';
  if (sizeCategory === 'large') return 'large_holder';
  return 'retail';
};

const detectRiskSignal = (txType, amount) => {
  const numeric = toNumber(amount, 0);
  if (txType === 'deposit' && numeric >= 1000000) return 'sell_pressure';
  if (txType === 'withdrawal' && numeric >= 1000000) return 'accumulation';
  if (txType === 'exchange_flow') return 'liquidity_shift';
  return 'neutral';
};

export const formatOnchainEvent = (event = {}) => {
  const content = event?.content && typeof event.content === 'object' ? event.content : {};

  const blockchain =
    toText(event?.blockchain, '') ||
    toText(content?.blockchain, '') ||
    toText(content?.chain, '') ||
    'onchain';

  const txType = normalizeTxType(
    event?.txType || content?.tx_type || content?.transaction_type || content?.transfer_type || content?.type
  );

  const token =
    toText(event?.token, '') ||
    toText(content?.token, '') ||
    toText(content?.symbol, '') ||
    toText(event?.entity, '') ||
    'Unknown';

  const transferType = txType === 'deposit' || txType === 'withdrawal' ? txType : 'exchange_flow';
  const amount = content?.amount ?? event?.amount ?? content?.value_usd ?? content?.usd_amount;
  const sizeCategory = classifySize(amount);
  const whaleTier = classifyWhaleTier(sizeCategory, transferType);
  const riskSignal = detectRiskSignal(txType, amount);
  const confidenceScore = Math.min(95, Math.max(40, Math.round(toNumber(event?.confidenceScore ?? content?.confidence_score, 65))));

  const title =
    toText(event?.title, '') ||
    toText(content?.title, '') ||
    `${token} ${txType.replace('_', ' ')} on ${blockchain}`;

  const amountText = formatAmount(amount);
  const reason = amountText
    ? `${txType.replace('_', ' ')} observed for ${amountText} ${token}`
    : `${txType.replace('_', ' ')} observed for ${token}`;

  const summary =
    toText(content?.summary, '') ||
    toText(event?.summary, '') ||
    `${reason} (${blockchain})`;

  const score = Math.min(100, Math.round((confidenceScore + (sizeCategory === 'mega' ? 20 : sizeCategory === 'whale' ? 10 : 0))));

  return {
    txType,
    token,
    transferType,
    sizeCategory,
    riskSignal,
    confidenceScore,
    whaleTier,
    blockchain,
    score,
    title,
    summary,
    reason,
  };
};

export const enrichOnchainWalletPatterns = (events = []) => {
  if (!Array.isArray(events)) return [];

  return events.map((event) => {
    if (event?.type !== 'onchain') return event;

    const rawContent = event?.rawContent && typeof event.rawContent === 'object' ? event.rawContent : {};
    const fromWallet = toText(rawContent?.from_address || rawContent?.wallet_from, '');
    const toWallet = toText(rawContent?.to_address || rawContent?.wallet_to, '');

    let walletPattern = 'wallet_activity';
    if (fromWallet && toWallet && fromWallet === toWallet) {
      walletPattern = 'self_transfer';
    } else if (toText(event?.txType, '') === 'deposit') {
      walletPattern = 'exchange_inflow';
    } else if (toText(event?.txType, '') === 'withdrawal') {
      walletPattern = 'exchange_outflow';
    }

    return {
      ...event,
      rawContent: {
        ...rawContent,
        walletPattern,
        from_address: fromWallet || rawContent?.from_address,
        to_address: toWallet || rawContent?.to_address,
      },
    };
  });
};
