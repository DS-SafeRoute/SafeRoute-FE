import ChevronRightIcon from '@assets/icons/ic-chevron-right.svg?react';

import StatusBadge from '@components/chip/StatusBadge';
import type { StatusBadgeColor } from '@components/chip/StatusBadge';

import * as styles from './SessionInfoCard.css';

export interface SessionInfoStat {
  label: string;
  value: string;
}

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
  // 카메라 목록 화면은 이제 훈련분석의 진입점이라(목록 페이지가 없어짐) 돌아갈 곳이 없음 —
  // 생략하면 뒤로가기 버튼 자체를 안 그림. 프레임 상세 화면은 카메라 목록으로 돌아가야 하니
  // 계속 넘겨줌
  onBack?: () => void;
  // 우측에 홈 화면 수치 박스와 같은 톤으로 강조해서 보여줄 값들(날짜/시작 시간/카메라 대수 등) —
  // meta 문장 안에 텍스트로 욱여넣으면 잘 안 읽힌다는 피드백을 반영해 별도 타일로 뺌
  stats?: SessionInfoStat[];
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
  stats,
}: SessionInfoCardProps) => (
  <div className={styles.card({ tone })}>
    <div className={styles.mainRow}>
      <div className={styles.textCol}>
        <div className={styles.headRow}>
          {onBack ? (
            <button
              type="button"
              className={styles.backButton({ tone })}
              onClick={onBack}
              aria-label="뒤로"
            >
              <ChevronRightIcon width={16} height={16} className={styles.backIcon} />
            </button>
          ) : null}
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

      {stats && stats.length > 0 ? (
        <div className={styles.statRow}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.statTile({ tone })}>
              <strong className={styles.statValue({ tone })}>{stat.value}</strong>
              <span className={styles.statLabel({ tone })}>{stat.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  </div>
);

export default SessionInfoCard;
