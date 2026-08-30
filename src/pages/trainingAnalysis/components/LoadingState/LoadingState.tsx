import clsx from 'clsx';

import * as styles from './LoadingState.css';

interface LoadingStateProps {
  message?: string;
  /** lg: 페이지 전체를 대신하는 로딩(세로 배치), md: 섹션 안에서 쓰는 로딩(가로 배치) */
  size?: 'lg' | 'md';
}

// 훈련분석 3개 화면(세션 목록/카메라 목록/프레임 상세)에서 로딩 표시를 통일해서 쓰기 위한 컴포넌트.
// 예전엔 화면마다 "불러오는 중..." 텍스트만 따로 있어서 톤이 제각각이었음
const LoadingState = ({ message = '불러오는 중...', size = 'lg' }: LoadingStateProps) => (
  <div className={clsx(styles.wrap, size === 'md' && styles.wrapCompact)} role="status">
    <span
      className={clsx(styles.spinner, size === 'md' && styles.spinnerSmall)}
      aria-hidden="true"
    />
    <span className={styles.message}>{message}</span>
  </div>
);

export default LoadingState;
