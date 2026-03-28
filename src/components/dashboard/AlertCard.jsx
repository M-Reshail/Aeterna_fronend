import React from 'react';
import PropTypes from 'prop-types';
import NewsCard from './NewsCard';
import PriceCard from './PriceCard';
import OnchainCard from './OnchainCard';

const resolveType = (alert) => {
  const rawType = String(alert?.type || alert?.rawContent?.type || alert?.event_type || '').toLowerCase();
  if (rawType.includes('price')) return 'price';
  if (rawType.includes('onchain')) return 'onchain';
  return 'news';
};

export const AlertCard = ({ alert, onViewDetails, onMarkAsRead }) => {
  const typeKey = resolveType(alert);
  if (typeKey === 'price') {
    return <PriceCard alert={alert} onViewDetails={onViewDetails} onMarkAsRead={onMarkAsRead} />;
  }

  if (typeKey === 'onchain') {
    return <OnchainCard alert={alert} onViewDetails={onViewDetails} onMarkAsRead={onMarkAsRead} />;
  }

  return <NewsCard alert={alert} onViewDetails={onViewDetails} onMarkAsRead={onMarkAsRead} />;
};

AlertCard.propTypes = {
  alert: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string,
    event_type: PropTypes.string,
    rawContent: PropTypes.object,
  }).isRequired,
  onViewDetails: PropTypes.func,
  onMarkAsRead: PropTypes.func,
};

export default AlertCard;
