import type { ComponentPropsWithoutRef } from 'react';

import clsx from 'clsx';

import * as styles from './SegmentedProgressBar.css';

export type SegmentedProgressBarTone = 'neutral' | 'progress' | 'done';

export type SegmentedProgressBarProps = {
  /** 전체 단계 수 */
  total: number;
  /** 완료된 단계 수 (앞에서부터 채움) */
  completed: number;
  /** 채워진 구간 색 — 다 됐으면 done, 일부만 됐으면 progress, 하나도 안 됐으면 neutral */
  tone?: SegmentedProgressBarTone;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

// 카드처럼 좁은 자리에서 "N개 중 M개 완료"를 한눈에 보여주기 위한 구간형 진행바.
// 연속된 퍼센트가 아니라 완료 여부가 뚜렷이 나뉘는 항목(체크리스트류)에 적합함
const SegmentedProgressBar = ({
  total,
  completed,
  tone = 'progress',
  className,
  ...props
}: SegmentedProgressBarProps) => {
  const clampedCompleted = Math.max(0, Math.min(completed, total));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={clampedCompleted}
      className={clsx(styles.track, className)}
      {...props}
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={clsx(
            styles.segment,
            index < clampedCompleted && styles.segmentFilled({ tone }),
          )}
        />
      ))}
    </div>
  );
};

export default SegmentedProgressBar;
