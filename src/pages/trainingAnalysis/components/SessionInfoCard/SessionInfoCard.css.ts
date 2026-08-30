import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  padding: vars.space.s5,
});

export const headRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
});

// 도면 관리 상세(FloorPlansDetailPage)의 캔버스 헤더 뒤로가기와 동일한 톤
export const backButton = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderRadius: vars.radius.sm,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  width: '2.4rem',
  height: '2.4rem',
  color: vars.color.textMid,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray50 },
  },
});

export const backIcon = style({
  transform: 'rotate(180deg)',
});

export const name = style({
  color: vars.color.textHigh,
  ...vars.typography.body16Bold,
});

export const meta = style({
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const notice = style({
  marginTop: vars.space.s1,
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.primaryLight2,
  padding: `${vars.space.s2} ${vars.space.s3}`,
  color: vars.color.infoText,
  ...vars.typography.body14,
});
