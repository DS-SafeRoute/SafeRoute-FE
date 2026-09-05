import type { ComponentPropsWithoutRef } from 'react';

import clsx from 'clsx';

import * as styles from './Skeleton.css';

export type SkeletonProps = {
  /** 너비 — rem 문자열(예: '4rem') */
  width?: string;
  /** 높이 — rem 문자열 */
  height?: string;
} & Omit<ComponentPropsWithoutRef<'span'>, 'children'>;

// 카드마다 값이 서로 다른 시점에 도착해 들쭉날쭉 팝업되면(특히 목록 페이지처럼 카드 수만큼
// 조회가 따로 도는 화면) 완성도가 떨어져 보인다는 피드백으로 만듦 — 값이 도착하기 전엔
// 빈 자리 대신 로딩 중임을 알리는 자리표시자를 보여줌
const Skeleton = ({
  width = '100%',
  height = '1.4rem',
  className,
  style,
  ...props
}: SkeletonProps) => (
  <span
    aria-hidden="true"
    className={clsx(styles.skeleton, className)}
    style={{ width, height, ...style }}
    {...props}
  />
);

export default Skeleton;
