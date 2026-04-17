import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

let nextToastId = 1;

function ToastItem({ id, type, title, message, onDismiss }) {
  return (
    <div className={`toast toast-${type}`} role="status">
      <div className="toast-copy">
        {title && <strong>{title}</strong>}
        <span>{message}</span>
      </div>
      <button type="button" className="toast-dismiss" onClick={() => onDismiss(id)} aria-label="Dismiss notification">
        x
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((type, message, title) => {
    const id = nextToastId++;
    setToasts((current) => [...current, { id, type, title, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
    return id;
  }, []);

  const value = useMemo(
    () => ({
      notify: ({ type = 'info', title, message }) => push(type, message, title),
      success: (message, title = 'Success') => push('success', message, title),
      error: (message, title = 'Something went wrong') => push('error', message, title),
      info: (message, title = 'Heads up') => push('info', message, title),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="false" aria-relevant="additions text">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}