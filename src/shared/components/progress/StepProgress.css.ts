import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

import { vars } from '@styles/global.css';

export const list = recipe({
  base: {
    display: 'flex',
  },
  variants: {
    orientation: {
      vertical: { flexDirection: 'column' },
      horizontal: { flexDirection: 'row', alignItems: 'flex-start' },
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

export const stepRow = recipe({
  base: {
    display: 'flex',
  },
  variants: {
    orientation: {
      // 세로: 마커 열(원 + 아래 연결선)과 라벨/액션이 나란히, 마지막 단계가 아니면 다음
      // 단계와 이어지도록 연결선이 이 행의 남은 높이만큼 늘어남(마커 열이 stretch되고
      // 그 안의 connector가 flex:1)
      vertical: { flexDirection: 'row', alignItems: 'stretch', gap: vars.space.s3 },
      // 가로: 마커 행(원 + 오른쪽 연결선)이 위, 라벨/액션이 아래 — 마지막 단계는 flex:0으로
      // 남는 연결선이 안 늘어나게 함(list 컨테이너에서 처리)
      horizontal: { flex: 1, flexDirection: 'column', alignItems: 'center', gap: vars.space.s1 },
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

export const markerColumn = recipe({
  base: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
  },
  variants: {
    orientation: {
      vertical: { flexDirection: 'column' },
      horizontal: { flexDirection: 'row', width: '100%' },
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

export const marker = recipe({
  base: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    width: '2rem',
    height: '2rem',
    ...vars.typography.captionBold,
  },
  variants: {
    status: {
      done: {
        border: 'none',
        backgroundColor: vars.color.success,
        color: vars.color.white,
      },
      current: {
        border: `2px solid ${vars.color.primary}`,
        backgroundColor: vars.color.primaryLight2,
        color: vars.color.primary,
      },
      upcoming: {
        border: `2px solid ${vars.color.gray200}`,
        backgroundColor: vars.color.white,
        color: vars.color.textLow,
      },
    },
  },
  defaultVariants: {
    status: 'upcoming',
  },
});

export const connector = recipe({
  base: {
    flexShrink: 0,
  },
  variants: {
    orientation: {
      vertical: { flex: 1, width: '2px', minHeight: vars.space.s3 },
      horizontal: { flex: 1, marginTop: '1rem', minWidth: vars.space.s3, height: '2px' },
    },
    filled: {
      true: { backgroundColor: vars.color.success },
      false: { backgroundColor: vars.color.gray200 },
    },
  },
  defaultVariants: {
    orientation: 'vertical',
    filled: false,
  },
});

export const stepContent = recipe({
  base: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
  },
  variants: {
    orientation: {
      vertical: {
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: vars.space.s2,
        paddingBottom: vars.space.s4,
      },
      horizontal: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: vars.space.s1,
        textAlign: 'center',
      },
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

export const stepLabel = recipe({
  base: {
    ...vars.typography.body14,
  },
  variants: {
    status: {
      done: { color: vars.color.textHigh },
      current: { color: vars.color.textHigh },
      upcoming: { color: vars.color.textLow },
    },
  },
  defaultVariants: {
    status: 'upcoming',
  },
});

export const stepAction = style({
  flexShrink: 0,
});
