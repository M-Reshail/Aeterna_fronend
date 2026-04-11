const toLower = (value) => String(value || '').trim().toLowerCase();
const toUpper = (value) => String(value || '').trim().toUpperCase();

const getSource = (event) => toLower(event?.sourceKey || event?.source);
const getType = (event) => toLower(event?.type || event?.eventType || event?.event_type);
const getTxType = (event) => toLower(event?.txType || event?.rawContent?.txType || event?.rawContent?.tx_type);
const getToken = (event) => toUpper(event?.token || event?.entity || event?.rawContent?.token || event?.rawContent?.symbol);
const getPriority = (event) => toUpper(event?.priority);
const getSizeCategory = (event) => toLower(event?.sizeCategory || event?.rawContent?.onchainFormatted?.sizeCategory);
const getRiskSignal = (event) => toLower(event?.riskSignal || event?.rawContent?.onchainFormatted?.riskSignal);
const getTransferType = (event) => toLower(event?.transferType || event?.rawContent?.onchainFormatted?.transferType);
const getBlockchain = (event) => toLower(event?.blockchain || event?.rawContent?.onchainFormatted?.blockchain || event?.source);
const getWhaleTier = (event) => toLower(event?.whaleTier || event?.rawContent?.onchainFormatted?.whaleTier);
const getAmountUsd = (event) => Number(event?.amountUsd || event?.rawContent?.onchainFormatted?.amountUsd || 0);

export const FILTER_MAP = {
  ethereum_blockchain: (event) => getSource(event) === 'ethereum',

  token_transfer: (event) =>
    getType(event) === 'onchain' &&
    getTxType(event) === 'transfer',

  stablecoins: (event) =>
    ['USDT', 'USDC', 'DAI'].includes(getToken(event)),

  high_priority: (event) =>
    getPriority(event) === 'HIGH',

  news_only: (event) =>
    getType(event) === 'news',

  price_only: (event) =>
    getType(event) === 'price',

  onchain_only: (event) =>
    getType(event) === 'onchain',

  whale_only: (event) =>
    getType(event) === 'onchain' && (
      ['large', 'whale'].includes(getSizeCategory(event)) || getAmountUsd(event) >= 100000
    ),

  mega_whale: (event) =>
    getType(event) === 'onchain' && (
      ['mega_whale', 'institutional_flow'].includes(getWhaleTier(event)) || getAmountUsd(event) >= 1000000
    ),

  sell_pressure: (event) =>
    getType(event) === 'onchain' && getRiskSignal(event) === 'sell_pressure',

  accumulation: (event) =>
    getType(event) === 'onchain' && getRiskSignal(event) === 'accumulation',

  exchange_flows: (event) =>
    getType(event) === 'onchain' && ['exchange_flow', 'deposit', 'withdrawal'].includes(getTransferType(event)),

  token_usdt: (event) =>
    getType(event) === 'onchain' && getToken(event) === 'USDT',

  token_eth: (event) =>
    getType(event) === 'onchain' && getToken(event) === 'ETH',

  token_btc: (event) =>
    getType(event) === 'onchain' && getToken(event) === 'BTC',

  blockchain_ethereum: (event) =>
    getType(event) === 'onchain' && getBlockchain(event).includes('ethereum'),

  high_confidence: (event) =>
    Number(event?.confidenceScore || event?.rawContent?.onchainFormatted?.confidenceScore || 0) >= 70,

  large_onchain: (event) =>
    getType(event) === 'onchain' && ['large', 'whale'].includes(getSizeCategory(event)),
};

export const FILTER_TOGGLE_OPTIONS = [
  { key: 'ethereum_blockchain', label: 'Ethereum' },
  { key: 'token_transfer', label: 'Token Transfers' },
  { key: 'stablecoins', label: 'Stablecoins' },
  { key: 'high_priority', label: 'High Priority' },
  { key: 'news_only', label: 'News Only' },
  { key: 'price_only', label: 'Price Only' },
  { key: 'onchain_only', label: 'Onchain Only' },
  { key: 'whale_only', label: 'Whale Only' },
  { key: 'mega_whale', label: 'Mega Whale' },
  { key: 'sell_pressure', label: 'Sell Pressure' },
  { key: 'accumulation', label: 'Accumulation' },
  { key: 'exchange_flows', label: 'Exchange Flows' },
  { key: 'token_usdt', label: 'USDT' },
  { key: 'token_eth', label: 'ETH' },
  { key: 'token_btc', label: 'BTC' },
  { key: 'blockchain_ethereum', label: 'Ethereum Chain' },
  { key: 'high_confidence', label: 'High Confidence' },
  { key: 'large_onchain', label: 'Large Onchain' },
];

export const applyLogicalFilters = (events, filterKeys = []) => {
  if (!Array.isArray(events) || events.length === 0) return [];
  if (!Array.isArray(filterKeys) || filterKeys.length === 0) return events;

  return events.filter((event) =>
    filterKeys.every((key) => {
      const predicate = FILTER_MAP[key];
      if (typeof predicate !== 'function') return true;
      return predicate(event);
    })
  );
};
