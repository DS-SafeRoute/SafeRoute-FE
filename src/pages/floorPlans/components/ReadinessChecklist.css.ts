import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

// FloorPlansDetailPage.css.ts에 있던 readiness* 클래스를 이 컴포넌트 전용 파일로 옮김 — 페이지
// 스타일 파일이 컴포넌트 내부 클래스까지 떠안고 있으면 이 컴포넌트를 다른 위치로 옮길 때 스타일이
// 따라오지 않음(코드래빗 리뷰 반영, 컴포넌트 범위 캡슐화)
export const readinessCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  padding: vars.space.s4,
});

export const readinessHeader = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const readinessHint = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const readinessItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s2,
  borderTop: `1px solid ${vars.color.gray50}`,
  paddingTop: vars.space.s2,
});

export const readinessItemLabel = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
  color: vars.color.textHigh,
  ...vars.typography.body14,
});

export const readinessDot = style({
  flexShrink: 0,
  borderRadius: '50%',
  backgroundColor: vars.color.gray300,
  width: '0.7rem',
  height: '0.7rem',
});

export const readinessDotDone = style({
  backgroundColor: vars.color.success,
});

export const readinessDoneText = style({
  flexShrink: 0,
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const readinessActionBtn = style({
  flexShrink: 0,
  border: `1px solid ${vars.color.primary}`,
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `0.2rem ${vars.space.s3}`,
  color: vars.color.primary,
  ...vars.typography.caption,
  selectors: {
    '&:hover': { backgroundColor: vars.color.primaryLight2 },
  },
});

// 앞 단계(시작 노드·최종 탈출구)가 안 끝나 지금은 누를 수 없는 상태 — 항목 자체는 계속
// 보여주되, 버튼을 회색으로 바꾸고 라벨에 뭘 먼저 해야 하는지 안내함
export const readinessActionBtnDisabled = style({
  flexShrink: 0,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.gray50,
  cursor: 'not-allowed',
  padding: `0.2rem ${vars.space.s3}`,
  color: vars.color.textLow,
  ...vars.typography.caption,
});
