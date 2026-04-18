// src/components/ui/Toast.jsx
/**
 * Toast notification system — no browser alert() needed.
 * Usage:
 *   import { useToast, ToastContainer } from './ui/Toast';
 *   const { addToast } = useToast();
 *   addToast('Bağlantı kesildi', 'error');
 */
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: 'bg-green-900/90 border-green-500/40 text-green-200',
  error:   'bg-red-900/90   border-red-500/40   text-red-200',
  warning: 'bg-amber-900/90 border-amber-500/40 text-amber-200',
  info:    'bg-slate-800/90 border-slate-600/40  text-slate-200',
};

const TOAST_ICONS = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        aria-label="Bildirimler"
        role="region"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            role="alert"
            className={[
              'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md',
              'shadow-2xl text-sm font-medium max-w-xs',
              'animate-[slideIn_0.25s_ease-out]',
              TOAST_STYLES[type] ?? TOAST_STYLES.info,
            ].join(' ')}
          >
            <span aria-hidden="true" className="font-black shrink-0 mt-px">
              {TOAST_ICONS[type]}
            </span>
            <span className="flex-1">{message}</span>
            <button
              aria-label="Bildirimi kapat"
              onClick={() => dismiss(id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition ml-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
