import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import ToastContainer from './ToastContainer';
import { ToastContext } from './useToast';

import type { ToastProps } from './Toast';
import type { ShowToastOptions } from './useToast';

type ToastItem = Omit<ToastProps, 'onClose' | 'leaving'>;

const LEAVE_DURATION = 300;
const MAX_TOASTS = 3;

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [leavingIds, setLeavingIds] = useState<Set<string>>(new Set());
  const toastsRef = useRef<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const syncToasts = useCallback((updater: (prev: ToastItem[]) => ToastItem[]) => {
    toastsRef.current = updater(toastsRef.current);
    setToasts([...toastsRef.current]);
  }, []);

  const remove = useCallback(
    (id: string) => {
      syncToasts((prev) => prev.filter((toast) => toast.id !== id));
      setLeavingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      timersRef.current.delete(id);
    },
    [syncToasts],
  );

  const dismiss = useCallback(
    (id: string) => {
      setLeavingIds((prev) => new Set(prev).add(id));
      setTimeout(() => remove(id), LEAVE_DURATION);
    },
    [remove],
  );

  const scheduleRemoval = useCallback(
    (id: string, duration: number) => {
      const existing = timersRef.current.get(id);
      if (existing) clearTimeout(existing);
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }
    },
    [dismiss],
  );

  const show = useCallback(
    ({ title, description, variant = 'default', duration = 3000 }: ShowToastOptions) => {
      const existing = toastsRef.current.find(
        (toast) => toast.title === title && toast.variant === variant,
      );
      if (existing) {
        scheduleRemoval(existing.id, duration);
        return existing.id;
      }

      if (toastsRef.current.length >= MAX_TOASTS) {
        const evicted = toastsRef.current[0];
        const evictTimer = timersRef.current.get(evicted.id);
        if (evictTimer) clearTimeout(evictTimer);
        timersRef.current.delete(evicted.id);
        dismiss(evicted.id);
      }

      const id = `toast-${Date.now()}-${Math.random()}`;
      syncToasts((prev) => {
        const next = prev.length >= MAX_TOASTS ? prev.slice(1) : prev;
        return [...next, { id, title, description, variant, duration }];
      });
      scheduleRemoval(id, duration);
      return id;
    },
    [dismiss, scheduleRemoval, syncToasts],
  );
  const contextValue = useMemo(() => ({ show, dismiss }), [dismiss, show]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} leavingIds={leavingIds} onClose={dismiss} />
    </ToastContext.Provider>
  );
};
