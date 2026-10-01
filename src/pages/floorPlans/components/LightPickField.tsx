import clsx from 'clsx';

import XIcon from '@assets/icons/ic-x.svg?react';

import * as styles from '../FloorPlansDetailPage.css';

export type LightPickFieldName = 'decisionNode' | 'leftEdge' | 'rightEdge';

interface LightPickFieldProps {
  label: string;
  fieldName: LightPickFieldName;
  pickField: LightPickFieldName | null;
  disabled?: boolean;
  // 옵션 목록에서 찾은 현재 값의 표시용 라벨 — undefined면 아직 선택 안 된 상태
  displayLabel?: string;
  emptyText: string;
  onStartPick: () => void;
  onClear: () => void;
}

// 갈림길 위치·왼쪽 통로·오른쪽 통로 — 같은 이름 노드가 많아 드롭다운으로는 뭐가 뭔지 구분이
// 안 된다는 QA 피드백으로 드롭다운 자체를 없애고 도면(캔버스) 클릭으로만 고르게 함. 이 컴포넌트는
// 값을 고르는 UI가 아니라 "캔버스에서 선택" 버튼 + 현재 값 표시 + 지우기 버튼만 담당함
const LightPickField = ({
  label,
  fieldName,
  pickField,
  disabled = false,
  displayLabel,
  emptyText,
  onStartPick,
  onClear,
}: LightPickFieldProps) => {
  const picking = pickField === fieldName;
  return (
    <div className={styles.nodeAddField}>
      <div className={styles.nodeAddLabelRow}>
        <span className={styles.nodeAddLabel}>{label}</span>
        <button
          type="button"
          className={styles.nodeAddPickBtn}
          disabled={disabled}
          onClick={onStartPick}
        >
          {picking ? '선택 취소' : '캔버스에서 선택'}
        </button>
      </div>
      <div
        className={clsx(
          styles.nodeAddPickDisplay,
          !displayLabel && styles.nodeAddPickDisplayEmpty,
          picking && styles.nodeAddPickDisplayActive,
        )}
      >
        {displayLabel ?? emptyText}
        {displayLabel && (
          <button
            type="button"
            aria-label={`${label} 선택 해제`}
            className={styles.nodeAddPickClearBtn}
            onClick={onClear}
          >
            <XIcon width={14} height={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default LightPickField;

// 갈림길 위치에 이어진 엣지가 도면에 하나도 없으면 왼쪽/오른쪽 통로는 캔버스에서 클릭할 대상 자체가
// 없어 아무것도 고를 수 없음(통로는 이 팝업이 아니라 별도의 "+ 추가 → 엣지 추가"로 미리 그려둬야
// 하는 데이터라서) — 그 상태에서 그냥 "클릭해주세요"만 보여주면 왜 안 되는지 알 수 없어 안내를 바꿔줌
interface LightPickHint {
  text: string;
  // 그냥 안내가 아니라 "지금 이대로는 진행이 안 된다"는 경고라 색으로도 구분되게 함
  isWarning: boolean;
}

export const getLightPickHint = (
  pickField: LightPickFieldName | null,
  decisionNodeId: string,
  edgeOptions: readonly { fromNodeId: string; toNodeId: string }[],
): LightPickHint => {
  if (!pickField) {
    return {
      text: '이 유도등이 서 있는 갈림길 위치와, 화재 시 왼쪽·오른쪽 중 어느 통로로 안내할지 정해주세요',
      isWarning: false,
    };
  }
  if (pickField === 'decisionNode') {
    return { text: '도면에서 갈림길이 될 노드를 클릭해주세요', isWarning: false };
  }
  const hasConnectedEdge = edgeOptions.some(
    (e) => e.fromNodeId === decisionNodeId || e.toNodeId === decisionNodeId,
  );
  if (!hasConnectedEdge) {
    return {
      text: '이 갈림길에 연결된 통로(엣지)가 없어요. "+ 추가 → 엣지 추가"로 통로를 먼저 만들어주세요',
      isWarning: true,
    };
  }
  return {
    text:
      pickField === 'leftEdge'
        ? '도면에서 왼쪽 통로가 될 구간(선)을 클릭해주세요'
        : '도면에서 오른쪽 통로가 될 구간(선)을 클릭해주세요',
    isWarning: false,
  };
};
