import React from 'react';
import PropTypes from 'prop-types';
import AlertCard from '@components/dashboard/AlertCard';

// Reuse AlertCard rendering while preserving a dedicated onchain component API.
export const OnchainCard = ({ alert, onViewDetails, onMarkAsRead }) => {
  return (
    <AlertCard
      alert={alert}
      onViewDetails={onViewDetails}
      onMarkAsRead={onMarkAsRead}
    />
  );
};

OnchainCard.propTypes = {
  alert: PropTypes.object.isRequired,
  selectedAlertId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onViewDetails: PropTypes.func,
  onMarkAsRead: PropTypes.func,
};

export default OnchainCard;
