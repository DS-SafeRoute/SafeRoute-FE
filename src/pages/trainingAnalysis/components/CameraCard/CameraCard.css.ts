import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

// 카드는 항상 클릭 가능함(썸네일 유무와 무관하게 상세 페이지로 이동) — disabled 상태 없음.
// 호버 시 그림자만 살짝 키우던 것에서, 테두리 색까지 같이 옅은 브랜드색으로 바꿔 카드 전체가
// 하나로 반응한다는 느낌을 분명히 함(부분적으로만 색이 바뀌는 것처럼 보인다는 피드백 반영)
export const card = style({
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.15s, border-color 0.15s',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  overflow: 'hidden',
  textAlign: 'left',
  selectors: {
    '&:hover': {
      borderColor: vars.color.primaryLight,
      boxShadow: vars.shadow.md,
    },
    // 카드가 항상 클릭 가능한 <button>이라 키보드로 넘어왔을 때도 hover와 동일한 강조가 필요함
    '&:focus-visible': {
      borderColor: vars.color.primaryLight,
      boxShadow: vars.shadow.md,
    },
  },
});

export const thumb = style({
  aspectRatio: '16 / 9',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: vars.color.gray900,
});

export const thumbImg = style({
  objectFit: 'cover',
  width: '100%',
  height: '100%',
});

export const thumbPlaceholder = style({
  borderRadius: vars.radius.sm,
  backgroundColor: 'rgba(255,255,255,0.15)',
  width: '15%',
  height: '25%',
});

// 사진 자체가 밝을 때도 시각 배지가 항상 읽히도록 하단에 옅은 그라데이션을 깔아둠
export const thumbScrim = style({
  position: 'absolute',
  right: 0,
  bottom: 0,
  left: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0))',
  pointerEvents: 'none',
  height: '40%',
});

export const thumbEmpty = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space.s1,
});

export const thumbEmptyIcon = style({
  color: 'rgba(255,255,255,0.3)',
});

// 혼잡 단계 배지 — 촬영 시각 배지(우하단)와 겹치지 않게 반대쪽(좌상단)에 둠
export const congestionBadge = style({
  position: 'absolute',
  zIndex: 1,
  top: vars.space.s2,
  left: vars.space.s2,
});

export const timeBadge = style({
  position: 'absolute',
  right: vars.space.s2,
  bottom: vars.space.s2,
  color: 'rgba(255,255,255,0.9)',
  ...vars.typography.caption,
});

export const noFrame = style({
  color: 'rgba(255,255,255,0.4)',
  ...vars.typography.captionBold,
});

export const info = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s2,
  padding: vars.space.s4,
});

// 이름·위치를 텍스트 묶음으로 감싸 min-width:0을 줌 — 긴 이름이 링크 영역을 밀어내지 않게 함
export const infoText = style({
  minWidth: 0,
});

export const name = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});

export const location = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const link = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: '0.2rem',
  color: vars.color.primary,
  ...vars.typography.body14Bold,
});

// 카드 호버 시 화살표가 살짝 오른쪽으로 밀리는 미세 모션 — "더 보러 가기"라는 방향성을 줌
export const linkIcon = style({
  transition: 'transform 0.15s',
  selectors: {
    [`${card}:hover &`]: {
      transform: 'translateX(2px)',
    },
  },
});
