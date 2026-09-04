import clsx from 'clsx';

import * as styles from './LoadingState.css';

export interface LoadingStateProps {
  message?: string;
  /** lg: 페이지 전체를 대신하는 로딩(세로 배치), md: 섹션 안에서 쓰는 로딩(가로 배치) */
  size?: 'lg' | 'md';
}

// 화면마다 "불러오는 중..." 텍스트를 인라인 스타일로 따로 만들어 쓰던 걸 통일하기 위한 공용 로딩 컴포넌트
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
