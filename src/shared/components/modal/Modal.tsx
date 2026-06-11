import { useEffect, type ReactNode } from 'react';

import { createPortal } from 'react-dom';

import XIcon from '@assets/icons/ic-x.svg?react';

import * as styles from './Modal.css';

export type ModalSize = 'sm' | 'md' | 'lg';

type BaseProps = {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  children?: ReactNode;
  footer?: ReactNode;
  title: string;
  description?: string;
  warning?: string;
};

// 폼 모달: 헤더(타이틀 + X) + 콘텐츠 + 푸터
type FormModalProps = BaseProps & {
  variant?: 'form';
};

// 확인 모달: 타이틀 + 설명 + 경고박스(선택) + 푸터, X 없음
type ConfirmModalProps = BaseProps & {
  variant: 'confirm';
};

export type ModalProps = FormModalProps | ConfirmModalProps;

const Modal = (props: ModalProps) => {
  const { open, onClose, size = 'md', children, footer } = props;
  const variant = props.variant ?? 'form';

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.container({ size })}>
        {variant === 'form' && (
          <div className={styles.header}>
            <div className={styles.headerText}>
              <h2 id="modal-title" className={styles.title}>
                {props.title}
              </h2>
              {props.description && <p className={styles.description}>{props.description}</p>}
            </div>
            <button
              type="button"
              className={styles.closeButton}
              aria-label="닫기"
              onClick={onClose}
            >
              <XIcon width={20} height={20} />
            </button>
          </div>
        )}

        {variant === 'confirm' && (
          <div className={styles.confirmBody}>
            <h2 id="modal-title" className={styles.confirmTitle}>
              {props.title}
            </h2>
            {props.description && <p className={styles.confirmDescription}>{props.description}</p>}
            {props.warning && <p className={styles.warningBox}>{props.warning}</p>}
          </div>
        )}

        {children && <div className={styles.body}>{children}</div>}

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
