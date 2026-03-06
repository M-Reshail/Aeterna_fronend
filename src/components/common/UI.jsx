import React from 'react';
import PropTypes from 'prop-types';

export const Card = ({ children, className = '', onClick, variant, hoverable, ...rest }) => {
  const variantClass = variant === 'elevated' ? 'shadow-lg' : '';
  const hoverClass   = hoverable ? 'hover:shadow-glow-sm cursor-pointer' : '';
  return (
    <div
      className={`card ${variantClass} ${hoverClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  variant: PropTypes.string,
  hoverable: PropTypes.bool,
};

export const Badge = ({ children, variant = 'primary', size, className = '', ...rest }) => {
  const variantClasses = {
    primary: 'badge-primary',
    success: 'badge-success',
    info: 'badge-info',
    danger: 'badge-danger',
    warning: 'badge-warning',
    emerald: 'badge-emerald',
  };
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span className={`badge ${variantClasses[variant] || 'badge-primary'} ${size ? sizeClasses[size] || '' : ''} ${className}`} {...rest}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'success', 'info', 'danger', 'warning', 'emerald']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export const Alert = ({ type = 'info', title, children, onClose, className = '', ...rest }) => {
  const typeClasses = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    danger: 'alert-danger',
  };

  const icons = {
    info: '🛈',
    success: '✓',
    warning: '⚠',
    danger: '✕',
  };

  return (
    <div className={`alert ${typeClasses[type]} ${className}`} {...rest}>
      <div className="flex items-start">
        <span className="text-lg mr-3">{icons[type]}</span>
        <div className="flex-1">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 text-lg hover:opacity-70 transition-opacity"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'warning', 'danger']),
  title: PropTypes.string,
  children: PropTypes.node,
  onClose: PropTypes.func,
  className: PropTypes.string,
};

export const Spinner = ({ size = 'md', className = '', ...rest }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <svg
      className={`spinner ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...rest}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export const Modal = ({
  isOpen = false,
  title,
  children,
  onClose,
  closeButton = true,
  size = 'md',
  className = '',
  ...rest
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
      <div className={`bg-dark-800 rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4 animate-slide-up`} {...rest}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          {title && <h2 className="text-xl font-bold text-dark-50">{title}</h2>}
          {closeButton && (
            <button
              onClick={onClose}
              className="text-dark-400 hover:text-dark-200 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Body */}
        <div className={`p-6 ${className}`}>{children}</div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  closeButton: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl']),
  className: PropTypes.string,
};

export default Card;
