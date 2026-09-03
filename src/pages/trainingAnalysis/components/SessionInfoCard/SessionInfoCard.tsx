import ChevronRightIcon from '@assets/icons/ic-chevron-right.svg?react';

import StatusBadge from '@components/chip/StatusBadge';
import type { StatusBadgeColor } from '@components/chip/StatusBadge';

import * as styles from './SessionInfoCard.css';

interface SessionInfoCardProps {
  sessionName: string;
  statusLabel: string;
  statusColor: StatusBadgeColor;
  meta: string;
  notice?: string;
  // 진행 중(RUNNING)일 때만 상태줄 앞에 실시간 갱신 중임을 알리는 점을 깜빡임
  live?: boolean;
  // 카메라 목록(밝은 화면)/프레임 상세("콘솔", 어두운 화면) 톤 전환
  tone?: 'light' | 'dark';
  onBack: () => void;
}

// 카메라 목록 / 카메라 프레임 상세 두 화면에서 동일하게 쓰는 세션 정보 헤더.
// 뒤로가기를 카드 바깥의 별도 줄로 빼면 그 자리만큼 빈 가로 영역이 생겨서,
// 도면 관리 상세의 뒤로가기 톤 그대로 카드 헤더 안(이름 앞)에 붙여둠
const SessionInfoCard = ({
  sessionName,
  statusLabel,
  statusColor,
  meta,
  notice,
  live = false,
  tone = 'light',
  onBack,
}: SessionInfoCardProps) => (
  <div className={styles.card({ tone })}>
    <div className={styles.headRow}>
      <button
        type="button"
        className={styles.backButton({ tone })}
        onClick={onBack}
        aria-label="뒤로"
      >
        <ChevronRightIcon width={16} height={16} className={styles.backIcon} />
      </button>
      <span className={styles.name({ tone })}>{sessionName}</span>
      <StatusBadge label={statusLabel} color={statusColor} dot />
    </div>
    <span className={styles.meta({ tone })}>{meta}</span>
    {notice ? (
      <p className={styles.notice({ tone })}>
        {live && <span className={styles.noticeLiveDot} aria-hidden="true" />}
        {notice}
      </p>
    ) : null}
  </div>
);

export default SessionInfoCard;
