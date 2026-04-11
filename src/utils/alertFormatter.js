const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toText = (value, fallback = '') => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};

const firstNonEmptyText = (...values) => {
  for (const value of values) {
    const text = toText(value, '');
    if (text) return text;
  }
  return '';
};

const toNumber = (value, fallback = NaN) => {
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const firstFiniteNumber = (...values) => {
  for (const value of values) {
    const numeric = toNumber(value, NaN);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
};

const normalizeTimestamp = (...candidates) => {
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined || candidate === '') continue;

    if (typeof candidate === 'number') {
      const millis = candidate < 1e12 ? candidate * 1000 : candidate;
      const date = new Date(millis);
      if (!Number.isNaN(date.getTime())) return date.toISOString();
      continue;
    }

    if (typeof candidate === 'string') {
      const text = candidate.trim();
      if (!text) continue;
      const asNumber = Number(text);
      if (Number.isFinite(asNumber)) {
        const millis = asNumber < 1e12 ? asNumber * 1000 : asNumber;
        const date = new Date(millis);
        if (!Number.isNaN(date.getTime())) return date.toISOString();
      }
      const date = new Date(text);
      if (!Number.isNaN(date.getTime())) return date.toISOString();
    }
  }

  return new Date().toISOString();
};

const normalizeConfidence = (value) => {
  const numeric = firstFiniteNumber(value);
  if (!Number.isFinite(numeric)) return 0;
  const percent = numeric > 1 ? numeric : numeric * 100;
  return Math.max(0, Math.min(100, Math.round(percent)));
};

const normalizeSeverity = (rawSeverity, confidenceScore, amountUsd) => {
  const explicit = firstNonEmptyText(rawSeverity).toUpperCase();
  if (['HIGH', 'MEDIUM', 'LOW'].includes(explicit)) return explicit;

  if (amountUsd >= 10000000 || confidenceScore >= 85) return 'HIGH';
  if (amountUsd >= 1000000 || confidenceScore >= 60) return 'MEDIUM';
  return 'LOW';
};

const compactUsd = (amountUsd) => {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) return '';
  if (amountUsd >= 1e9) return `$${(amountUsd / 1e9).toFixed(1)}B`;
  if (amountUsd >= 1e6) return `$${(amountUsd / 1e6).toFixed(1)}M`;
  if (amountUsd >= 1e3) return `$${(amountUsd / 1e3).toFixed(1)}K`;
  return `$${amountUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

const normalizeSignalType = (value = '') => {
  const lower = String(value || '').trim().toLowerCase();
  if (lower.includes('whale')) return 'whale_movement';
  if (lower.includes('transfer')) return 'transfer';
  if (lower.includes('onchain')) return 'transfer';
  if (lower.includes('price')) return 'price_alert';
  if (lower.includes('news')) return 'news';
  return lower || 'signal';
};

const toPrettySignalLabel = (signalType) => {
  if (signalType === 'whale_movement') return 'Whale movement';
  if (signalType === 'transfer') return 'Transfer';
  if (signalType === 'price_alert') return 'Price alert';
  if (signalType === 'news') return 'News alert';
  return 'Alert';
};

export const mapAlertSignal = (event = {}) => {
  const content = isObject(event?.content) ? event.content : {};
  const details = isObject(content?.details)
    ? content.details
    : (isObject(event?.details) ? event.details : {});

  const token = firstNonEmptyText(
    content?.token,
    content?.symbol,
    details?.token,
    details?.symbol,
    event?.token,
    event?.entity
  );

  const fromAddress = firstNonEmptyText(
    content?.from,
    content?.from_address,
    content?.wallet_from,
    details?.from,
    details?.from_address,
    details?.wallet_from,
    event?.from,
    event?.from_address
  );

  const toAddress = firstNonEmptyText(
    content?.to,
    content?.to_address,
    content?.wallet_to,
    details?.to,
    details?.to_address,
    details?.wallet_to,
    event?.to,
    event?.to_address
  );

  const amountUsd = firstFiniteNumber(
    content?.amount_usd,
    content?.usd_amount,
    content?.value_usd,
    details?.amount_usd,
    details?.usd_amount,
    details?.value_usd,
    event?.amount_usd,
    event?.usd_amount,
    event?.value_usd
  );

  const rawAmount = firstFiniteNumber(
    content?.amount,
    details?.amount,
    event?.amount
  );

  const normalizedAmountUsd = Number.isFinite(amountUsd)
    ? amountUsd
    : ((token === 'USDC' || token === 'USDT' || token === 'DAI') && Number.isFinite(rawAmount) ? rawAmount : 0);

  const sourceType = firstNonEmptyText(
    content?.event_type,
    content?.alert_type,
    details?.event_type,
    details?.alert_type,
    event?.event_type,
    event?.type,
    event?.txType
  );

  let signalType = normalizeSignalType(sourceType);
  if (signalType === 'signal' && normalizedAmountUsd >= 1000000) signalType = 'whale_movement';
  if (signalType === 'signal' && (fromAddress || toAddress)) signalType = 'transfer';

  const confidenceScore = normalizeConfidence(
    firstFiniteNumber(
      content?.confidence,
      content?.confidence_score,
      details?.confidence,
      details?.confidence_score,
      event?.confidence,
      event?.confidenceScore
    )
  );

  const severity = normalizeSeverity(
    firstNonEmptyText(content?.severity, details?.severity, event?.severity, event?.priority),
    confidenceScore,
    normalizedAmountUsd
  );

  const amountText = compactUsd(normalizedAmountUsd);
  const label = toPrettySignalLabel(signalType);

  let message = '';
  if (signalType === 'whale_movement' || (signalType === 'transfer' && normalizedAmountUsd >= 1000000)) {
    message = [
      'Whale transferred',
      amountText,
      token,
    ].filter(Boolean).join(' ');
  } else if (signalType === 'transfer') {
    message = [
      'Transfer detected',
      amountText,
      token,
    ].filter(Boolean).join(' ');
  } else {
    message = [label, amountText, token].filter(Boolean).join(' ');
  }

  const reason = firstNonEmptyText(
    content?.reason,
    details?.reason,
    content?.alert_reasons,
    details?.alert_reasons,
    content?.summary,
    details?.summary,
    event?.summary,
    event?.description,
    message
  );

  const subtitle = [
    fromAddress && toAddress ? `${fromAddress} -> ${toAddress}` : '',
    token,
  ].filter(Boolean).join(' | ');

  return {
    signalType,
    token,
    amountUsd: Number.isFinite(normalizedAmountUsd) ? normalizedAmountUsd : 0,
    amountDisplay: amountText,
    rawAmount: Number.isFinite(rawAmount) ? rawAmount : 0,
    fromAddress,
    toAddress,
    subtitle,
    severity,
    confidenceScore,
    reason,
    message: message || reason,
    timestamp: normalizeTimestamp(
      content?.timestamp,
      details?.timestamp,
      event?.created_at,
      event?.timestamp,
      event?.createdAt
    ),
  };
};
