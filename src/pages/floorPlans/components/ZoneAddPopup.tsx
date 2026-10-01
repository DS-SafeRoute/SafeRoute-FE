import { useState } from 'react';

import * as styles from '../FloorPlansDetailPage.css';

/* ── 구역 설정 팝업 — 백엔드 저장 단위가 그리드 셀 집합이라 드래그는 겹치는 셀을 고르는 용도로 씀.
   구역 재설정(재드래그)에도 그대로 재사용함 — 구역은 수정 API가 없어 새로 만들고 기존 걸
   지우는 방식으로만 "재설정"할 수 있는데, 이 팝업이 이름+셀 선택을 같이 받는 유일한 곳이라
   재설정 흐름도 다시 "새 구역 만들기"와 같은 절차를 타면 됨 ── */
const ZoneAddPopup = ({
  containerRef,
  selectedCellCount,
  initialName = '',
  title = '구역 설정',
  submitLabel = '추가',
  onCancel,
  onSave,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  selectedCellCount: number;
  initialName?: string;
  title?: string;
  submitLabel?: string;
  onCancel: () => void;
  onSave: (label: string) => void;
}) => {
  const [zoneName, setZoneName] = useState(initialName);
  const hasSelectedCells = selectedCellCount > 0;

  const handleSave = () => {
    onSave(zoneName.trim());
  };

  return (
    <div ref={containerRef} className={styles.nodeAddPopup} onClick={(e) => e.stopPropagation()}>
      <div className={styles.nodeAddHeader}>
        <span className={styles.nodeAddTitle}>{title}</span>
        <span className={styles.nodeAddStepBadge}>{hasSelectedCells ? '2/2' : '1/2'}</span>
      </div>
      <span className={styles.nodeAddHint}>
        {hasSelectedCells
          ? `${selectedCellCount}칸 선택됨. 다시 드래그하면 그 영역으로 새로 잡혀요. 이름을 입력하고 ${submitLabel} 버튼을 누르면 저장됩니다.`
          : '이름을 입력하거나 도면을 드래그해서 영역에 해당하는 칸을 선택해주세요. 어느 쪽을 먼저 하셔도 괜찮아요.'}
      </span>

      <div className={styles.nodeAddField}>
        <span className={styles.nodeAddLabel}>구역 이름</span>
        <input
          className={styles.nodeAddInput}
          value={zoneName}
          onChange={(e) => setZoneName(e.target.value)}
          placeholder="3층 앞 복도 구역"
        />
      </div>

      <div className={styles.nodeAddActions}>
        <button type="button" className={styles.nodeAddCancelBtn} onClick={onCancel}>
          취소
        </button>
        <button
          type="button"
          className={styles.nodeAddSubmitBtn}
          disabled={!zoneName.trim() || !hasSelectedCells}
          onClick={handleSave}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

export default ZoneAddPopup;
