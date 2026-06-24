import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s5,
  padding: vars.space.s8,
});

export const topBar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: vars.space.s3,
});

export const body = style({
  display: 'grid',
  gridTemplateColumns: '1fr 30rem',
  alignItems: 'start',
  gap: vars.space.s5,
});

/* ── 좌측: 비디오 영역 ── */
export const videoSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
});

export const videoWrapper = style({
  aspectRatio: '16 / 9',
  position: 'relative',
  borderRadius: vars.radius.lg,
  backgroundColor: '#0a0f1a',
  overflow: 'hidden',
});

export const videoPlaceholder = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const videoBadgeRow = style({
  position: 'absolute',
  top: vars.space.s3,
  right: vars.space.s3,
  left: vars.space.s3,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const liveBadge = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s1,
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.danger,
  padding: '0.2rem 0.8rem',
  color: vars.color.white,
  ...vars.typography.captionBold,
});

export const liveDot = style({
  borderRadius: '50%',
  backgroundColor: vars.color.white,
  width: '0.6rem',
  height: '0.6rem',
});

export const cameraLabel = style({
  color: vars.color.white,
  ...vars.typography.captionMedium,
});

export const yoloLabel = style({
  color: 'rgba(255,255,255,0.7)',
  ...vars.typography.caption,
});

export const densityLabel = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translateX(-50%)',
  whiteSpace: 'nowrap',
  ...vars.typography.captionBold,
  color: '#FBBF24',
});

/* 바운딩박스 */
export const bboxOverlay = style({
  position: 'absolute',
  inset: 0,
});

export const bbox = style({
  position: 'absolute',
  border: '2px solid #22C55E',
  borderRadius: '2px',
});

export const bboxLabel = style({
  position: 'absolute',
  top: '-2rem',
  left: 0,
  whiteSpace: 'nowrap',
  ...vars.typography.caption,
  color: '#22C55E',
});

/* 비디오 컨트롤 바 */
export const videoControls = style({
  position: 'absolute',
  right: 0,
  bottom: 0,
  left: 0,
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s3,
  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
  padding: `${vars.space.s2} ${vars.space.s3}`,
});

export const timeLabel = style({
  whiteSpace: 'nowrap',
  ...vars.typography.caption,
  color: vars.color.white,
});

export const progressBar = style({
  position: 'relative',
  flex: 1,
  borderRadius: vars.radius.pill,
  backgroundColor: 'rgba(255,255,255,0.3)',
  cursor: 'pointer',
  height: '0.3rem',
});

export const progressFill = style({
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.primary,
  height: '100%',
});

export const progressThumb = style({
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  borderRadius: '50%',
  backgroundColor: vars.color.white,
  width: '1.2rem',
  height: '1.2rem',
});

export const speedLabel = style({
  color: vars.color.white,
  ...vars.typography.caption,
});

/* ── 우측 패널 ── */
export const sidePanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
});

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  padding: vars.space.s5,
});

export const panelTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Bold,
});

export const infoRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const infoKey = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const infoValue = style({
  color: vars.color.textHigh,
  ...vars.typography.captionBold,
});

export const divider = style({
  backgroundColor: vars.color.gray100,
  height: '1px',
});

/* 이벤트 타임라인 */
export const timelineList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s3,
});

export const timelineItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s3,
});

export const timelineTime = style({
  minWidth: '3.2rem',
  ...vars.typography.caption,
  color: vars.color.textLow,
});

export const timelineDot = style({
  flexShrink: 0,
  borderRadius: '50%',
  width: '0.8rem',
  height: '0.8rem',
});

export const timelineLabel = style({
  flex: 1,
  ...vars.typography.caption,
  color: vars.color.textMid,
});
