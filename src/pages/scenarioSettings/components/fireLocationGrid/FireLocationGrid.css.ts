import { style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const panel = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.gray25,
  padding: vars.space.s3,
  minHeight: '20rem',
});

export const map = style({
  display: 'block',
  border: `1px solid ${vars.color.gray200}`,
  backgroundColor: vars.color.white,
  width: '100%',
  minWidth: 0,
  maxHeight: '28rem',
});

export const route = style({
  fill: 'none',
  stroke: vars.color.success,
  strokeDasharray: '7 5',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  strokeWidth: 4,
});

export const gridCell = style({
  fill: `color-mix(in srgb, ${vars.color.white} 4%, transparent)`,
  stroke: `color-mix(in srgb, ${vars.color.gray300} 55%, transparent)`,
  strokeWidth: 0.6,
});

export const selectedFireCell = style({
  cursor: 'pointer',
  fill: `color-mix(in srgb, ${vars.color.warningStrong} 30%, transparent)`,
  stroke: vars.color.warningStrong,
  strokeWidth: 2,
});

export const fireCell = style({
  fill: vars.color.warningSurface,
  stroke: vars.color.warningStrong,
  strokeWidth: 2,
});

export const fireMarker = style({
  pointerEvents: 'none',
  fontSize: '20px',
  fontWeight: vars.fontWeight.bold,
  fill: vars.color.dangerText,
  textAnchor: 'middle',
});

export const selectedFireMarker = style({
  pointerEvents: 'none',
  fontSize: '14px',
  textAnchor: 'middle',
  dominantBaseline: 'middle',
});

export const inactiveStartNode = style({
  fill: `color-mix(in srgb, ${vars.color.pink} 18%, ${vars.color.white})`,
  stroke: vars.color.pink,
  strokeWidth: 1.5,
});

export const unavailableStartNode = style({
  fill: vars.color.gray100,
  stroke: vars.color.gray500,
  strokeWidth: 1.5,
});

export const selectedUnavailableStartNode = style({
  fill: vars.color.warningLight,
  stroke: vars.color.warningStrong,
  strokeWidth: 3,
});

export const startNode = style({
  cursor: 'pointer',
  fill: vars.color.pink,
  stroke: vars.color.white,
  strokeWidth: 1.5,
});

export const selectedStartNode = style({
  cursor: 'pointer',
  fill: vars.color.purple,
  stroke: vars.color.white,
  strokeWidth: 3,
});

export const statusMessage = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  borderRadius: vars.radius.pill,
  backgroundColor: `color-mix(in srgb, ${vars.color.white} 92%, transparent)`,
  padding: `${vars.space.s2} ${vars.space.s3}`,
  whiteSpace: 'nowrap',
  color: vars.color.textLow,
  ...vars.typography.body14,
});
