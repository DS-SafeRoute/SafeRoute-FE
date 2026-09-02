import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const canvasWrap = style({
  position: 'relative',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.gray25,
  overflow: 'hidden',
});

// 확대/축소는 도면관리상세와 동일하게 CSS transform: scale — SVG viewBox 좌표계는 그대로 두고
// 화면에 그려지는 크기만 키우고 줄임(클릭 좌표 계산에 영향 없음, 셀 클릭은 SVG 자체 좌표계 기준)
export const zoomedArea = style({
  transformOrigin: 'top left',
});

export const svg = style({
  display: 'block',
  width: '100%',
  height: 'auto',
});

export const zoomControls = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.s2,
  marginTop: vars.space.s2,
});

export const zoomButton = style({
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  width: '2.4rem',
  height: '2.4rem',
  color: vars.color.textMid,
  ...vars.typography.body14Medium,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray25 },
    '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
  },
});

export const zoomValue = style({
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  minWidth: '3.6rem',
  color: vars.color.textMid,
  ...vars.typography.caption,
});

export const marker = style({
  pointerEvents: 'none',
  fontFamily: 'sans-serif',
  fontSize: '6px',
  fontWeight: 700,
  fill: vars.color.danger,
});
