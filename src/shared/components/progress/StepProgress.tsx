import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import clsx from 'clsx';

import CheckIcon from '@assets/icons/ic-check.svg?react';

import * as styles from './StepProgress.css';

export type StepStatus = 'done' | 'current' | 'upcoming';

export interface ProgressStep {
  /** 단계 이름 */
  label: string;
  status: StepStatus;
  /** 라벨 오른쪽에 보여줄 내용 — 버튼, "완료" 텍스트, 안내 문구 등 */
  action?: ReactNode;
}

export type StepProgressProps = {
  steps: ProgressStep[];
  orientation?: 'horizontal' | 'vertical';
} & Omit<ComponentPropsWithoutRef<'ol'>, 'children'>;

// 순서가 있는 준비 단계(체크리스트·온보딩 등)를 원형 마커 + 연결선으로 보여주는 스테퍼.
// done은 체크 아이콘, current는 채워진 원(지금 진행 가능), upcoming은 빈 원(아직 못함)으로 구분.
// 각 단계 라벨 옆에 action을 끼워둘 수 있어 "지정하기" 같은 버튼을 그대로 붙일 수 있음.
// div 중첩 대신 ol/li로 둬서 스크린리더가 "총 N단계 중 몇 번째"를 자동으로 읽어주게 하고,
// 지금 단계에는 aria-current="step"을 붙여 위치를 함께 알려줌(코드래빗 리뷰 반영)
const StepProgress = ({
  steps,
  orientation = 'vertical',
  className,
  ...props
}: StepProgressProps) => (
  <ol className={clsx(styles.list({ orientation }), className)} {...props}>
    {steps.map((step, index) => (
      <li
        key={index}
        className={styles.stepRow({ orientation })}
        aria-current={step.status === 'current' ? 'step' : undefined}
      >
        <div className={styles.markerColumn({ orientation })}>
          <span className={styles.marker({ status: step.status })}>
            {step.status === 'done' ? (
              <CheckIcon width={12} height={12} />
            ) : (
              <span>{index + 1}</span>
            )}
          </span>
          {index < steps.length - 1 && (
            <span
              className={styles.connector({
                orientation,
                filled: step.status === 'done',
              })}
            />
          )}
        </div>
        <div className={styles.stepContent({ orientation })}>
          <span className={styles.stepLabel({ status: step.status })}>{step.label}</span>
          {step.action && <div className={styles.stepAction}>{step.action}</div>}
        </div>
      </li>
    ))}
  </ol>
);

export default StepProgress;
