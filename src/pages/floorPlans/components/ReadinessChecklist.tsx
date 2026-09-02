import clsx from 'clsx';

import * as styles from '../FloorPlansDetailPage.css';

// 훈련 준비 — 시나리오를 재생하려면 이 층에 시작 노드·최종 탈출구가 있어야 하고,
// (시나리오별로) 발화점도 지정되어 있어야 함. 이 셋이 노드추가 팝업 안 칩,
// 우측 패널 카드 토글, 별도 모달로 흩어져 있어서 뭐가 필요한지 안 보이던 문제를
// 여기 한 곳에 모아서 해결함.
//
// 지금은 도면관리상세 좌측 사이드바에 렌더링하지 않고 있음(더 적합한 위치를 찾는 중) —
// 컴포넌트 자체는 그대로 두고 호출부만 빼둔 상태라, 다시 배치할 위치가 정해지면 이 컴포넌트를
// import해서 그대로 쓰면 됨.
interface ReadinessChecklistProps {
  hasStartNode: boolean;
  hasFinalExit: boolean;
  hasDoorOrStair: boolean;
  hasFireOrigin: boolean;
  onAddStartNode: () => void;
  onAddDoor: () => void;
  onFocusDeviceCards: () => void;
  onOpenFireOrigin: () => void;
}

const ReadinessChecklist = ({
  hasStartNode,
  hasFinalExit,
  hasDoorOrStair,
  hasFireOrigin,
  onAddStartNode,
  onAddDoor,
  onFocusDeviceCards,
  onOpenFireOrigin,
}: ReadinessChecklistProps) => (
  <div className={styles.readinessCard}>
    <div className={styles.readinessHeader}>훈련 준비</div>
    <span className={styles.readinessHint}>시나리오를 재생하려면 이 층에 아래 항목이 필요해요</span>

    <div className={styles.readinessItem}>
      <div className={styles.readinessItemLabel}>
        <span className={clsx(styles.readinessDot, hasStartNode && styles.readinessDotDone)} />
        시작 노드
      </div>
      {hasStartNode ? (
        <span className={styles.readinessDoneText}>완료</span>
      ) : (
        <button type="button" className={styles.readinessActionBtn} onClick={onAddStartNode}>
          지정하기
        </button>
      )}
    </div>

    <div className={styles.readinessItem}>
      <div className={styles.readinessItemLabel}>
        <span className={clsx(styles.readinessDot, hasFinalExit && styles.readinessDotDone)} />
        최종 탈출구
      </div>
      {hasFinalExit ? (
        <span className={styles.readinessDoneText}>완료</span>
      ) : !hasDoorOrStair ? (
        <button type="button" className={styles.readinessActionBtn} onClick={onAddDoor}>
          문 추가하기
        </button>
      ) : (
        <button type="button" className={styles.readinessActionBtn} onClick={onFocusDeviceCards}>
          카드에서 지정
        </button>
      )}
    </div>

    <div className={styles.readinessItem}>
      <div className={styles.readinessItemLabel}>
        <span className={clsx(styles.readinessDot, hasFireOrigin && styles.readinessDotDone)} />
        발화점
      </div>
      <button type="button" className={styles.readinessActionBtn} onClick={onOpenFireOrigin}>
        {hasFireOrigin ? '다른 시나리오 지정' : '지정하기'}
      </button>
    </div>
    <span className={styles.readinessHint}>
      {hasFireOrigin
        ? '방금 지정한 시나리오의 발화점이 도면에 표시돼요. 시나리오마다 따로 지정해요.'
        : '발화점은 시나리오마다 따로 지정해요 — 여기서는 지정 화면으로만 이동해요'}
    </span>
  </div>
);

export default ReadinessChecklist;
