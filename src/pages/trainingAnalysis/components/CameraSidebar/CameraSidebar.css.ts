import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

// 앱 좌측 메인 내비게이션(Sidebar)과 같은 밝은 톤·같은 active 표기(옅은 파란 배경 + 파란 글자)를
// 그대로 씀 — 이 화면만 따로 어둡게 했더니 옆의 세션 정보·이벤트 카드와도 안 어울리고
// 가독성도 떨어진다는 피드백을 받고 앱 전반과 통일함
export const sidebar = style({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  gap: vars.space.s4,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  padding: vars.space.s3,
  width: '25rem',
  overflowY: 'auto',
  scrollbarWidth: 'thin',
});

export const group = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
});

export const groupLabel = style({
  padding: `${vars.space.s2} ${vars.space.s2} 0`,
  color: vars.color.textLow,
  ...vars.typography.captionBold,
});

export const item = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
  transition: 'background-color 0.15s, color 0.15s',
  borderRadius: vars.radius.md,
  cursor: 'pointer',
  padding: vars.space.s2,
  color: vars.color.textMid,
  selectors: {
    '&:hover': { backgroundColor: vars.color.gray25 },
  },
});

export const itemActive = style({
  backgroundColor: vars.color.primaryLight2,
  color: vars.color.primary,
  selectors: {
    '&:hover': { backgroundColor: vars.color.primaryLight2 },
  },
});

export const itemThumb = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.gray900,
  width: '4.4rem',
  height: '3.2rem',
  overflow: 'hidden',
});

export const itemThumbImg = style({
  objectFit: 'cover',
  width: '100%',
  height: '100%',
});

export const itemThumbIcon = style({
  opacity: 0.35,
  color: vars.color.white,
});

// 상태 점(itemStatusDot)은 시각적 참고용이라 aria-hidden 처리되어 있음 — 화면에는 안 보이지만
// 스크린 리더에는 같은 정보를 텍스트로 전달함
export const srOnly = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  clip: 'rect(0, 0, 0, 0)',
});

export const itemText = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  minWidth: 0,
});

export const itemCodeRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

// 실제 관제 화면에서 흔한 "녹화/수신 중" 점 표기 — 최근 프레임 유무를 곁다리 정보로만 보여줌
// (그 자체가 판단 근거는 아님, CameraCard와 동일한 이유)
export const itemStatusDot = style({
  flexShrink: 0,
  borderRadius: '50%',
  backgroundColor: vars.color.gray300,
  width: '0.6rem',
  height: '0.6rem',
});

export const itemStatusDotOn = style({
  backgroundColor: vars.color.success,
});

export const itemCode = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: 'inherit',
  ...vars.typography.body14Bold,
});

export const itemLocation = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: vars.color.textLow,
  ...vars.typography.caption,
});
