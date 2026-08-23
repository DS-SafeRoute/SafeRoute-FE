import { useId, useState } from 'react';

import { Button } from '@components/Button';
import Modal from '@components/modal';

import * as styles from './GridAreaSettingModal.css';

interface GridAreaSettingModalProps {
  open: boolean;
  onClose: () => void;
  mapImageUrl: string | null;
  onConfirm: (params: { realWidth: number; realHeight: number; gridScale: number }) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 10;

const GridAreaSettingModal = ({
  open,
  onClose,
  mapImageUrl,
  onConfirm,
}: GridAreaSettingModalProps) => {
  const [realWidth, setRealWidth] = useState('');
  const [realHeight, setRealHeight] = useState('');
  const [gridScale, setGridScale] = useState(5);
  const widthInputId = useId();
  const heightInputId = useId();
  const scaleSliderId = useId();

  const makeDimensionChangeHandler =
    (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '' || /^\d+(\.\d+)?$/.test(raw)) setter(raw);
    };

  const handleScaleStep = (delta: number) => {
    setGridScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta)));
  };

  const handleClose = () => {
    setRealWidth('');
    setRealHeight('');
    setGridScale(5);
    onClose();
  };

  const isDimensionsValid = Number(realWidth) > 0 && Number(realHeight) > 0;

  const handleSubmit = () => {
    if (!isDimensionsValid) return;
    // 요청이 실패해도 모달이 닫히지 않을 수 있으므로(부모가 open을 유지) 값은 리셋하지 않고 재시도할 수 있게 둠
    onConfirm({ realWidth: Number(realWidth), realHeight: Number(realHeight), gridScale });
  };

  const cellSize = 20 + gridScale * 4;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className={styles.wideModal}
      title="그리드 배율 · 실측 크기 설정"
      description="도면의 실제 가로/세로 길이와 그리드 배율을 입력하면 다음 단계에서 도면이 자동 분석됩니다"
      footer={
        <div className={styles.footer}>
          <Button variant="ghost" className={styles.cancelButton} onClick={handleClose}>
            취소
          </Button>
          <Button
            className={styles.confirmButton}
            disabled={!isDimensionsValid}
            onClick={handleSubmit}
          >
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
        <div className={styles.dimensionFields}>
          <div className={styles.areaField}>
            <label className={styles.fieldLabel} htmlFor={widthInputId}>
              가로 (m)
            </label>
            <div className={styles.areaInputShell}>
              <input
                id={widthInputId}
                className={styles.areaInput}
                type="text"
                inputMode="decimal"
                placeholder="20"
                value={realWidth}
                onChange={makeDimensionChangeHandler(setRealWidth)}
              />
              <span className={styles.areaUnit}>m</span>
            </div>
          </div>

          <div className={styles.areaField}>
            <label className={styles.fieldLabel} htmlFor={heightInputId}>
              세로 (m)
            </label>
            <div className={styles.areaInputShell}>
              <input
                id={heightInputId}
                className={styles.areaInput}
                type="text"
                inputMode="decimal"
                placeholder="15"
                value={realHeight}
                onChange={makeDimensionChangeHandler(setRealHeight)}
              />
              <span className={styles.areaUnit}>m</span>
            </div>
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
