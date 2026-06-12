import { globalStyle, style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const layout = style({
  display: 'flex',
  height: '100%',
  overflow: 'hidden',
});

export const sidebar = style({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  gap: vars.space.s4,
  borderRight: `1px solid ${vars.color.gray100}`,
  padding: vars.space.s4,
  width: '24rem',
  overflowY: 'auto',
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const sectionLabel = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const selectWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const dropdownFullWidth = style({
  display: 'block',
  width: '100%',
});

globalStyle(`${dropdownFullWidth} button`, {
  justifyContent: 'space-between',
  borderRadius: vars.radius.md,
  width: '100%',
});

globalStyle(`${dropdownFullWidth} ul`, {
  width: '100%',
});

export const divider = style({
  borderTop: `1px solid ${vars.color.gray100}`,
});

export const aiButton = style({
  width: '100%',
});

export const statusRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const statusLabel = style({
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const modeGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
});

export const modeButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s2,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  cursor: 'pointer',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  width: '100%',
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.gray25,
    },
  },
});

export const modeButtonActive = style({
  borderColor: vars.color.primary,
  backgroundColor: vars.color.primaryLight2,
  color: vars.color.primary,
});

export const modeDesc = style({
  paddingLeft: vars.space.s2,
  ...vars.typography.caption,
  color: vars.color.textLow,
});

/* 장치 요약 */
export const deviceSummaryRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const deviceSummaryLabel = style({
  color: vars.color.textMid,
  ...vars.typography.body14,
});

export const deviceSummaryCount = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

/* 선택된 장치 패널 */
export const infoPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s2,
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.lg,
  padding: vars.space.s3,
});

export const infoPanelHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const infoPanelTitle = style({
  color: vars.color.textHigh,
  ...vars.typography.body14Medium,
});

export const infoPanelClose = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderRadius: vars.radius.sm,
  background: 'none',
  cursor: 'pointer',
  padding: vars.space.s1,
  color: vars.color.textLow,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.gray50,
      color: vars.color.textHigh,
    },
  },
});

export const infoPanelRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const infoPanelKey = style({
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const infoPanelValue = style({
  color: vars.color.textMid,
  ...vars.typography.caption,
});

/* 캔버스 */
export const canvas = style({
  position: 'relative',
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: vars.color.gray50,
  overflow: 'hidden',
});

export const canvasPlaceholder = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.s3,
  color: vars.color.textLow,
  ...vars.typography.body14,
});

export const canvasPlaceholderTitle = style({
  color: vars.color.textMid,
  ...vars.typography.body14Medium,
});

export const mapWrap = style({
  position: 'relative',
  display: 'inline-block',
  maxWidth: '100%',
  maxHeight: '100%',
});

export const mapImage = style({
  display: 'block',
  objectFit: 'contain',
  maxWidth: '100%',
  maxHeight: '100%',
  userSelect: 'none',
});

/* 마커 */
export const markerWrap = style({
  position: 'absolute',
  zIndex: 1,
  transform: 'translate(-50%, -50%)',
  cursor: 'pointer',
});

export const marker = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.1s',
  border: '2px solid white',
  borderRadius: '50%',
  boxShadow: vars.shadow.md,
  width: '2.8rem',
  height: '2.8rem',
  selectors: {
    '&:hover': {
      transform: 'scale(1.15)',
    },
  },
});

export const markerCctv = style({
  backgroundColor: vars.color.primary,
  color: vars.color.white,
});

export const markerCctvOffline = style({
  backgroundColor: vars.color.gray300,
  color: vars.color.white,
});

export const markerIot = style({
  backgroundColor: vars.color.success,
  color: vars.color.white,
});

export const markerPoi = style({
  backgroundColor: vars.color.warning,
  color: vars.color.white,
});

export const markerSelected = style({
  transform: 'scale(1.2)',
  outline: `3px solid ${vars.color.primary}`,
  outlineOffset: '2px',
});

export const markerLabel = style({
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  marginTop: vars.space.s1,
  borderRadius: vars.radius.sm,
  backgroundColor: 'rgba(0,0,0,0.65)',
  pointerEvents: 'none',
  padding: `0.2rem ${vars.space.s2}`,
  whiteSpace: 'nowrap',
  color: vars.color.white,
  ...vars.typography.caption,
});
