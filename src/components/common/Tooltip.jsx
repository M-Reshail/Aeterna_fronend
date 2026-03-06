/**
 * Tooltip — lightweight CSS-only tooltip with four placement options.
 *
 * Usage:
 *   <Tooltip content="Explanation text" placement="top">
 *     <button>Hover me</button>
 *   </Tooltip>
 */
import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

const PLACEMENT = {
  top:    { tooltip: 'bottom-full left-1/2 -translate-x-1/2 mb-2', arrow: 'top-full left-1/2 -translate-x-1/2 border-t-[#2a2a2a] border-x-transparent border-b-transparent border-4' },
  bottom: { tooltip: 'top-full left-1/2 -translate-x-1/2 mt-2',    arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-[#2a2a2a] border-x-transparent border-t-transparent border-4' },
  left:   { tooltip: 'right-full top-1/2 -translate-y-1/2 mr-2',   arrow: 'left-full top-1/2 -translate-y-1/2 border-l-[#2a2a2a] border-y-transparent border-r-transparent border-4' },
  right:  { tooltip: 'left-full top-1/2 -translate-y-1/2 ml-2',    arrow: 'right-full top-1/2 -translate-y-1/2 border-r-[#2a2a2a] border-y-transparent border-l-transparent border-4' },
};

export const Tooltip = ({
  children,
  content,
  placement = 'top',
  disabled = false,
  maxWidth = 220,
  delay = 120,
}) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const p = PLACEMENT[placement] || PLACEMENT.top;

  const show = useCallback(() => {
    if (disabled || !content) return;
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [disabled, content, delay]);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  if (!content) return children;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {visible && (
        <span
          role="tooltip"
          className={`absolute z-[9999] pointer-events-none ${p.tooltip}`}
          style={{ maxWidth }}
        >
          {/* Arrow */}
          <span className={`absolute border ${p.arrow}`} aria-hidden="true" />
          {/* Content */}
          <span
            className="block px-2.5 py-1.5 text-xs text-slate-200 leading-snug rounded-lg whitespace-normal"
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              animation: 'tooltip-in 0.12s ease forwards',
            }}
          >
            {content}
          </span>
        </span>
      )}
    </span>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node,
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  disabled: PropTypes.bool,
  maxWidth: PropTypes.number,
  delay: PropTypes.number,
};

export default Tooltip;
