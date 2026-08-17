import { useId, useState } from 'react';

import { Button } from '@components/Button';
import Modal from '@components/modal';

import * as styles from './GridAreaSettingModal.css';

interface GridAreaSettingModalProps {
  open: boolean;
  onClose: () => void;
  mapImageUrl: string | null;
  onConfirm: (params: { area: number; gridScale: number }) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 10;

const GridAreaSettingModal = ({
  open,
  onClose,
  mapImageUrl,
  onConfirm,
}: GridAreaSettingModalProps) => {
  const [area, setArea] = useState('');
  const [gridScale, setGridScale] = useState(5);
  const areaInputId = useId();
  const scaleSliderId = useId();

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || /^\d+(\.\d+)?$/.test(raw)) setArea(raw);
  };

  const handleScaleStep = (delta: number) => {
    setGridScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta)));
  };

  const handleClose = () => {
    setArea('');
    setGridScale(5);
    onClose();
  };

  const isAreaValid = Number(area) > 0;

  const handleSubmit = () => {
    if (!isAreaValid) return;
    // 요청이 실패해도 모달이 닫히지 않을 수 있으므로(부모가 open을 유지) 값은 리셋하지 않고 재시도할 수 있게 둠
    onConfirm({ area: Number(area), gridScale });
  };

  const cellSize = 20 + gridScale * 4;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className={styles.wideModal}
      title="그리드 배율 · 평수 설정"
      description="그리드 배율과 평수를 입력하면 다음 단계에서 도면이 자동 분석됩니다"
      footer={
        <div className={styles.footer}>
          <Button variant="ghost" className={styles.cancelButton} onClick={handleClose}>
            취소
          </Button>
          <Button className={styles.confirmButton} disabled={!isAreaValid} onClick={handleSubmit}>
            입력하기
          </Button>
        </div>
      }
    >
      <div
        className={styles.preview}
        style={mapImageUrl ? { backgroundImage: `url(${mapImageUrl})` } : undefined}
      >
        {mapImageUrl ? (
          <div
            className={styles.gridOverlay}
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(37,99,235,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(37,99,235,0.25) 1px, transparent 1px)',
              backgroundSize: `${cellSize}px ${cellSize}px`,
            }}
          />
        ) : (
          <span className={styles.previewEmpty}>도면 이미지를 불러올 수 없습니다</span>
        )}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.areaField}>
          <label className={styles.fieldLabel} htmlFor={areaInputId}>
            평수 (㎡)
          </label>
          <div className={styles.areaInputShell}>
            <input
              id={areaInputId}
              className={styles.areaInput}
              type="text"
              inputMode="decimal"
              placeholder="450"
              value={area}
              onChange={handleAreaChange}
            />
            <span className={styles.areaUnit}>㎡</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.scaleField}>
          <label className={styles.fieldLabel} htmlFor={scaleSliderId}>
            그리드 배율
          </label>
          <div className={styles.scaleControls}>
            <button
              type="button"
              className={styles.scaleButton}
              aria-label="그리드 배율 감소"
              disabled={gridScale <= MIN_SCALE}
              onClick={() => handleScaleStep(-1)}
            >
              −
            </button>
            <input
              id={scaleSliderId}
              type="range"
              className={styles.scaleSlider}
              min={MIN_SCALE}
              max={MAX_SCALE}
              value={gridScale}
              onChange={(e) => setGridScale(Number(e.target.value))}
            />
            <button
              type="button"
              className={styles.scaleButton}
              aria-label="그리드 배율 증가"
              disabled={gridScale >= MAX_SCALE}
              onClick={() => handleScaleStep(1)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GridAreaSettingModal;
