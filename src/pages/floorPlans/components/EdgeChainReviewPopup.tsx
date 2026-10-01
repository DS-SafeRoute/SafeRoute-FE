import { useState } from 'react';

import * as styles from '../FloorPlansDetailPage.css';

/* ── 엣지 체인 검토 팝업 — 순서대로 고른 노드들 사이 구간을 한 번에 검토·확정.
   구간이 1개(노드 2개)여도 같은 화면을 씀 — 별도 "한 쌍짜리" 경로를 둘 필요가 없음 ── */
const EdgeChainReviewPopup = ({
  containerRef,
  segments,
  onBack,
  onSubmit,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  segments: {
    fromId: string;
    toId: string;
    fromLabel: string;
    toLabel: string;
    // 두 노드 좌표 + 그리드 배율로 계산한 추정 거리(m). 없으면 수동 입력
    suggestedDistanceM: number | null;
    // 다른 경로와 겹쳐서 이미 존재하는 구간 — 입력 없이 생성 대상에서만 제외함
    alreadyExists: boolean;
  }[];
  onBack: () => void;
  onSubmit: (
    rows: {
      fromId: string;
      toId: string;
      fromLabel: string;
      toLabel: string;
      distanceM: number;
      bidirectional: boolean;
    }[],
  ) => void;
}) => {
  // 실내 노드 간 거리는 1m 미만도 흔해서 cm로 입력받음(정수로 편하게 입력, 저장은 m로 환산)
  const [distancesCm, setDistancesCm] = useState(() =>
    segments.map((s) =>
      s.suggestedDistanceM !== null ? String(Math.round(s.suggestedDistanceM * 100)) : '',
    ),
  );
  const [bidirectional, setBidirectional] = useState(true);

  const handleDistanceChange = (index: number, raw: string) => {
    // 완성된 숫자만 허용하면 편집 중간 상태(끝자리 삭제 등)가 거부돼 편집이 막히던 문제 —
    // 타이핑 도중 상태(끝에 점만 있거나 소수부가 빈 경우)도 허용
    if (raw !== '' && !/^\d*\.?\d*$/.test(raw)) return;
    setDistancesCm((prev) => prev.map((v, i) => (i === index ? raw : v)));
  };

  const newSegmentCount = segments.filter((s) => !s.alreadyExists).length;
  const allValid =
    newSegmentCount > 0 && segments.every((s, i) => s.alreadyExists || Number(distancesCm[i]) > 0);

  const handleSubmit = () => {
    const rows: {
      fromId: string;
      toId: string;
      fromLabel: string;
      toLabel: string;
      distanceM: number;
      bidirectional: boolean;
    }[] = [];
    segments.forEach((s, i) => {
      if (s.alreadyExists) return;
      rows.push({
        fromId: s.fromId,
        toId: s.toId,
        fromLabel: s.fromLabel,
        toLabel: s.toLabel,
        distanceM: Number(distancesCm[i]) / 100,
        bidirectional,
      });
    });
    onSubmit(rows);
  };

  return (
    <div ref={containerRef} className={styles.nodeAddPopup} onClick={(e) => e.stopPropagation()}>
      <div className={styles.nodeAddHeader}>
        <span className={styles.nodeAddTitle}>연결 구간 확인</span>
        <span className={styles.nodeAddStepBadge}>
          {newSegmentCount < segments.length
            ? `신규 ${newSegmentCount}개 · 기존 ${segments.length - newSegmentCount}개`
            : `${segments.length}개 구간`}
        </span>
      </div>
      <span className={styles.nodeAddHint}>
        {newSegmentCount === 0
          ? '선택한 구간이 모두 이미 연결되어 있어요'
          : '새로 만들 구간의 거리(cm)를 확인하고, 필요하면 고쳐주세요'}
      </span>

      <div className={styles.edgeChainList}>
        {segments.map((s, i) => (
          <div key={`${s.fromId}-${s.toId}`} className={styles.edgeChainRow}>
            <span className={styles.edgeChainRowLabel}>
              {s.fromLabel} → {s.toLabel}
            </span>
            {s.alreadyExists ? (
              <span className={styles.edgeChainExistingTag}>이미 연결됨</span>
            ) : (
              <input
                className={styles.edgeChainDistanceInput}
                type="text"
                inputMode="decimal"
                value={distancesCm[i]}
                onChange={(e) => handleDistanceChange(i, e.target.value)}
                placeholder="350"
              />
            )}
          </div>
        ))}
      </div>

      <label className={styles.edgeBidirectionalField}>
        <input
          type="checkbox"
          checked={bidirectional}
          onChange={(e) => setBidirectional(e.target.checked)}
        />
        전체 양방향 통행 가능
      </label>

      <div className={styles.nodeAddActions}>
        <button type="button" className={styles.nodeAddCancelBtn} onClick={onBack}>
          이전
        </button>
        <button
          type="button"
          className={styles.nodeAddSubmitBtn}
          disabled={!allValid}
          onClick={handleSubmit}
        >
          {newSegmentCount}개 연결 추가
        </button>
      </div>
    </div>
  );
};

export default EdgeChainReviewPopup;
