import React from 'react';
import PropTypes from 'prop-types';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  loadingText = 'Loading…',
  onClick,
  type = 'button',
  ...rest
}) => {
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  const variantClasses = {
    // Primary: White background, black text, pill-shaped with glow
    primary: 'bg-white-primary text-black-oled hover:shadow-glow font-semibold',
    // Secondary: Transparent with border, subtle hover fill
    secondary: 'bg-transparent border border-black-card text-white-primary hover:bg-black-card font-semibold',
    // Ghost: Minimal, text only
    ghost: 'bg-transparent text-white-muted hover:text-white-primary font-medium',
    // Danger: Red background
    danger: 'bg-danger-600 hover:bg-danger-700 text-white font-semibold',
    // Success: Emerald background
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full transition-smooth transform-gpu hover:-translate-y-0.5 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-slate-400 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  loadingText: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.string,
};

export const Link = ({ children, href, className = '', ...rest }) => {
  return (
    <a href={href} className={`text-emerald-400 hover:text-emerald-300 transition-smooth ${className}`} {...rest}>
      {children}
    </a>
  );
};

Link.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default Button;
