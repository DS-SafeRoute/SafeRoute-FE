import { useId, useState } from 'react';

import { Button } from '@components/Button';
import Modal from '@components/modal';

import * as styles from './GridAreaSettingModal.css';

interface GridAreaSettingModalProps {
  open: boolean;
  onClose: () => void;
  mapImageUrl: string | null;
  onConfirm: (params: { realWidth: number; realHeight: number; cellSizeMeter: number }) => void;
}

const GridAreaSettingModal = ({
  open,
  onClose,
  mapImageUrl,
  onConfirm,
}: GridAreaSettingModalProps) => {
  const [realWidth, setRealWidth] = useState('');
  const [realHeight, setRealHeight] = useState('');
  const [cellSizeMeter, setCellSizeMeter] = useState(1);
  const widthInputId = useId();
  const heightInputId = useId();
  const cellSizeInputId = useId();

  const makeDimensionChangeHandler =
    (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '' || /^\d+(\.\d+)?$/.test(raw)) setter(raw);
    };

  const handleClose = () => {
    setRealWidth('');
    setRealHeight('');
    setCellSizeMeter(1);
    onClose();
  };

  const isDimensionsValid = Number(realWidth) > 0 && Number(realHeight) > 0 && cellSizeMeter > 0;

  const handleSubmit = () => {
    if (!isDimensionsValid) return;
    // 요청이 실패해도 모달이 닫히지 않을 수 있으므로(부모가 open을 유지) 값은 리셋하지 않고 재시도할 수 있게 둠
    onConfirm({
      realWidth: Number(realWidth),
      realHeight: Number(realHeight),
      cellSizeMeter,
    });
  };

  // 실제 축척과 무관한 미리보기 전용 근사치 — 정확한 격자는 업로드 후 실제 캔버스에서 확인 가능
  const cellSize = Math.max(6, Math.min(120, cellSizeMeter * 20));

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
          <div className={styles.scaleLabelRow}>
            <label className={styles.fieldLabel} htmlFor={cellSizeInputId}>
              그리드 셀 크기
            </label>
            <span className={styles.scaleValue}>{cellSizeMeter.toFixed(1)}m</span>
          </div>
          <input
            id={cellSizeInputId}
            type="range"
            className={styles.scaleSlider}
            min={0.1}
            max={5}
            step={0.1}
            value={cellSizeMeter}
            onChange={(e) => setCellSizeMeter(Number(e.target.value))}
          />
        </div>
      </div>
    </Modal>
  );
};

export default GridAreaSettingModal;
