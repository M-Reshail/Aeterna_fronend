import { formatOnchainEvent } from '@utils/onchainFormatter';
import { mapNewsFeedItem } from '@utils/newsFormatter';
import { mapAlertSignal } from '@utils/alertFormatter';

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

const hasOnchainShape = (item, content, details) => {
  const hints = [
    item?.txHash,
    item?.tx_hash,
    item?.transaction_hash,
    item?.from,
    item?.to,
    item?.from_address,
    item?.to_address,
    content?.tx_hash,
    content?.transaction_hash,
    content?.from,
    content?.to,
    content?.from_address,
    content?.to_address,
    details?.tx_hash,
    details?.transaction_hash,
    details?.from,
    details?.to,
    details?.from_address,
    details?.to_address,
    content?.blockchain,
    content?.network,
    details?.blockchain,
    details?.network,
  ];

  return hints.some((value) => String(value || '').trim());
};

export const detectFeedItemType = (rawItem = {}) => {
  const content = isObject(rawItem?.content) ? rawItem.content : {};
  const details = isObject(content?.details)
    ? content.details
    : (isObject(rawItem?.details) ? rawItem.details : {});

  const rawType = firstNonEmptyText(
    rawItem?.type,
    rawItem?.event_type,
    rawItem?.alert_type,
    content?.type,
    content?.event_type,
    content?.alert_type,
    details?.type,
    details?.event_type,
    details?.alert_type
  ).toLowerCase();

  if (rawType.includes('onchain') || rawType.includes('transfer') || rawType.includes('whale')) return 'onchain';
  if (hasOnchainShape(rawItem, content, details)) return 'onchain';

  if (rawItem?.alert_id !== undefined || rawType.includes('alert') || rawType.includes('signal') || rawType.includes('price')) {
    return 'alert';
  }

  if (
    rawType.includes('news') ||
    content?.full_summary ||
    content?.description ||
    content?.headline ||
    content?.title ||
    details?.full_summary ||
    details?.description
  ) {
    return 'news';
  }

  return 'news';
};

export const normalizeFeedItem = (rawItem = {}) => {
  const feedType = detectFeedItemType(rawItem);
  const content = isObject(rawItem?.content) ? rawItem.content : {};
  const details = isObject(content?.details)
    ? content.details
    : (isObject(rawItem?.details) ? rawItem.details : {});

  if (feedType === 'onchain') {
    const mapped = formatOnchainEvent(rawItem);

    return {
      id: rawItem?.alert_id ?? rawItem?.id,
      type: 'onchain',
      title: mapped.title,
      subtitle: mapped.subtitle,
      description: mapped.summary || mapped.reason,
      timestamp: mapped.timestamp,
      source: firstNonEmptyText(mapped.blockchain, rawItem?.source, content?.source, details?.source, 'unknown'),
      metadata: {
        blockchain: mapped.blockchain,
        txHash: mapped.txHash,
        token: mapped.token,
        amount: mapped.amountFormatted || mapped.usdFormatted || mapped.amountDisplay || mapped.amountUsd || mapped.rawAmount || '',
      },
      severity: mapped.severity,
      confidence: mapped.confidenceScore,
    };
  }

  if (feedType === 'alert') {
    const mapped = mapAlertSignal(rawItem);

    return {
      id: rawItem?.alert_id ?? rawItem?.id,
      type: 'alert',
      title: mapped.message || firstNonEmptyText(rawItem?.title, content?.title, 'Alert'),
      subtitle: mapped.subtitle,
      description: mapped.reason || firstNonEmptyText(content?.summary, rawItem?.summary, rawItem?.description, ''),
      timestamp: mapped.timestamp,
      source: firstNonEmptyText(rawItem?.source, content?.source, details?.source, 'unknown'),
      metadata: {
        blockchain: firstNonEmptyText(content?.blockchain, details?.blockchain, rawItem?.blockchain, ''),
        txHash: firstNonEmptyText(content?.tx_hash, content?.transaction_hash, details?.tx_hash, details?.transaction_hash, rawItem?.tx_hash, rawItem?.transaction_hash, ''),
        token: mapped.token,
        amount: mapped.amountDisplay || mapped.amountUsd || mapped.rawAmount || '',
      },
      severity: mapped.severity,
      confidence: mapped.confidenceScore,
    };
  }

  const mappedNews = mapNewsFeedItem(rawItem);

  return {
    id: rawItem?.id ?? rawItem?.alert_id,
    type: 'news',
    title: mappedNews.headline,
    subtitle: mappedNews.sentiment ? `Sentiment: ${mappedNews.sentiment}` : '',
    description: mappedNews.summary,
    timestamp: mappedNews.timestamp,
    source: firstNonEmptyText(mappedNews.source, rawItem?.source, 'unknown'),
    metadata: {
      blockchain: '',
      txHash: '',
      token: '',
      amount: '',
    },
    severity: firstNonEmptyText(rawItem?.severity, content?.severity, ''),
    confidence: Number.isFinite(Number(rawItem?.confidence)) ? Number(rawItem.confidence) : null,
  };
};
