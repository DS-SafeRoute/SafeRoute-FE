import { createPortal } from 'react-dom';

import Toast from './Toast';
import { containerStyle } from './ToastContainer.css';

import type { ToastProps } from './Toast';

interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose' | 'leaving'>[];
  leavingIds: Set<string>;
  onClose: (id: string) => void;
}

const ToastContainer = ({ toasts, leavingIds, onClose }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className={containerStyle}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} leaving={leavingIds.has(toast.id)} onClose={onClose} />
      ))}
    </div>,
    document.body,
  );
};

export default ToastContainer;
