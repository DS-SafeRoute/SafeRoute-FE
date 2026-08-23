import { Button } from '@components/Button';
import Modal from '@components/modal';

import * as styles from './IoTLightSettingsModal.css';

import type { Cctv } from '../api/cctvApi';

interface CctvSettingsModalProps {
  open: boolean;
  onClose: () => void;
  cctv: Cctv;
  onToggleEnabled: (enabled: boolean) => void;
  onEditCells: () => void;
}

const CctvSettingsModal = ({
  open,
  onClose,
  cctv,
  onToggleEnabled,
  onEditCells,
}: CctvSettingsModalProps) => (
  <Modal
    open={open}
    onClose={onClose}
    title="CCTV 설정"
    description={cctv.name}
    footer={
      <Button variant="ghost" fullWidth onClick={onClose}>
        닫기
      </Button>
    }
  >
    <div className={styles.section}>
      <span className={styles.sectionTitle}>활성화 상태</span>
      <div className={styles.rowButtons}>
        <button
          type="button"
          className={
            cctv.enabled
              ? `${styles.toggleButton} ${styles.toggleButtonActive}`
              : styles.toggleButton
          }
          onClick={() => onToggleEnabled(true)}
        >
          사용 가능
        </button>
        <button
          type="button"
          className={
            !cctv.enabled
              ? `${styles.toggleButton} ${styles.toggleButtonActive}`
              : styles.toggleButton
          }
          onClick={() => onToggleEnabled(false)}
        >
          사용 불가능
        </button>
      </div>
    </div>

    <div className={styles.section}>
      <span className={styles.sectionTitle}>감시 영역</span>
      <span className={styles.hint}>
        현재 {cctv.monitoredGridCellCount}칸 · {cctv.monitoredAreaM2}㎡ 모니터링 중
      </span>
      <div className={styles.saveRow}>
        <Button size="sm" onClick={onEditCells}>
          감시 영역 재선택
        </Button>
      </div>
    </div>
  </Modal>
);

export default CctvSettingsModal;
