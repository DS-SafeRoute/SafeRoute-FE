import { useCallback, useEffect, useRef, useState } from 'react';

import type { ToastProps, ToastVariant } from './Toast';

type ToastItem = Omit<ToastProps, 'onClose' | 'leaving'>;

export interface ShowToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

const LEAVE_DURATION = 300;
const MAX_TOASTS = 3;

const useToast = () => {
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
      syncToasts((prev) => prev.filter((t) => t.id !== id));
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
    ({ title, description, variant = 'default', duration = 3000 }: ShowToastOptions): string => {
      // 중복: 같은 title + variant가 이미 있으면 추가하지 않고 타이머만 리셋
      const existing = toastsRef.current.find((t) => t.title === title && t.variant === variant);
      if (existing) {
        scheduleRemoval(existing.id, duration);
        return existing.id;
      }

      // 최대 개수 초과 시 가장 오래된 토스트 슬라이드아웃 후 제거
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
    [syncToasts, scheduleRemoval, dismiss],
  );

  return { toasts, leavingIds, show, dismiss };
};

export default useToast;
