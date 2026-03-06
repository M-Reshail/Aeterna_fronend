import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// ─── Event Bus ────────────────────────────────────────────────────────────────
let _nextId = 0;
const _listeners = new Set();

const emit = (toast) => _listeners.forEach((fn) => fn(toast));

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useToast = () => {
  const show = useCallback((message, type = 'info', duration = 4000) => {
    emit({ id: _nextId++, message, type, duration });
  }, []);

  return {
    success: (msg, dur) => show(msg, 'success', dur),
    error:   (msg, dur) => show(msg, 'error',   dur),
    info:    (msg, dur) => show(msg, 'info',     dur),
    warning: (msg, dur) => show(msg, 'warning',  dur),
    show,
  };
};

// ─── Toast Item ───────────────────────────────────────────────────────────────
const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
};

const STYLES = {
  success: { icon: 'text-emerald-400', bar: 'bg-emerald-500' },
  error:   { icon: 'text-red-400',     bar: 'bg-red-500'     },
  info:    { icon: 'text-slate-400',   bar: 'bg-slate-500'   },
  warning: { icon: 'text-amber-400',   bar: 'bg-amber-500'   },
};

const ToastItem = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Slide in
    requestAnimationFrame(() => setVisible(true));

    if (toast.duration > 0) {
      const step = 100 / (toast.duration / 50);
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p <= 0) {
            clearInterval(intervalRef.current);
            setVisible(false);
            setTimeout(() => onRemove(toast.id), 250);
            return 0;
          }
          return p - step;
        });
      }, 50);
    }

    return () => clearInterval(intervalRef.current);
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = () => {
    clearInterval(intervalRef.current);
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 250);
  };

  const Icon = ICONS[toast.type] || Info;
  const style = STYLES[toast.type] || STYLES.info;

  return (
    <div
      className="relative flex items-start gap-3 w-80 rounded-xl overflow-hidden"
      style={{
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        padding: '14px 16px',
        transform: visible ? 'translateX(0)' : 'translateX(calc(100% + 24px))',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease',
      }}
    >
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.icon}`} />
      <p className="flex-1 text-sm text-slate-200 leading-snug">{toast.message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${style.bar} transition-all`}
        style={{ width: `${progress}%`, transitionDuration: '50ms', transitionTimingFunction: 'linear' }}
      />
    </div>
  );
};

// ─── Container ────────────────────────────────────────────────────────────────
export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (toast) => setToasts((prev) => [...prev, toast]);
    _listeners.add(handler);
    return () => _listeners.delete(handler);
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (!toasts.length) return null;

  return createPortal(
    <div
      className="fixed top-5 right-5 flex flex-col gap-2.5 pointer-events-none"
      style={{ zIndex: 99999 }}
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={remove} />
        </div>
      ))}
    </div>,
    document.body
  );
};

export default useToast;

