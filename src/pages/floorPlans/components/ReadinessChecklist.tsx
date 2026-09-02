import clsx from 'clsx';

import * as styles from './ReadinessChecklist.css';

// 훈련 준비 — 시나리오를 재생하려면 이 층에 시작 노드(후보)·최종 탈출구가 있어야 함. 이 둘이
// 노드추가 팝업 안 칩, 우측 패널 카드 토글로 흩어져 있어서 뭐가 필요한지 안 보이던 문제를
// 여기 한 곳에 모아서 해결함.
//
// 발화점 항목은 뺐음 — 팀 전달사항(2026-09-03)으로 발화점 등록 API(POST
// /scenarios/{scenarioId}/fire-zones)가 백엔드에서 완전히 제거됐고, 도면관리 화면은 더 이상
// 발화점을 다루지 않음.
//
// 지금은 도면관리상세 좌측 사이드바에 렌더링하지 않고 있음(더 적합한 위치를 찾는 중) —
// 컴포넌트 자체는 그대로 두고 호출부만 빼둔 상태라, 다시 배치할 위치가 정해지면 이 컴포넌트를
// import해서 그대로 쓰면 됨.
interface ReadinessChecklistProps {
  hasStartNode: boolean;
  hasFinalExit: boolean;
  hasDoorOrStair: boolean;
  onAddStartNode: () => void;
  onAddDoor: () => void;
  onFocusDeviceCards: () => void;
}

const ReadinessChecklist = ({
  hasStartNode,
  hasFinalExit,
  hasDoorOrStair,
  onAddStartNode,
  onAddDoor,
  onFocusDeviceCards,
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
  </div>
);

export default ReadinessChecklist;
