import { globalStyle, style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

const fireSurface = 'rgba(252, 217, 204, 0.8)';
const fireBorder = '#FF7A45';

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
  aspectRatio: '4 / 3',
  border: `1px solid ${vars.color.gray200}`,
  backgroundColor: vars.color.white,
  width: '100%',
  minWidth: 0,
  maxHeight: '28rem',
});

export const graphEdge = style({
  stroke: vars.color.gray300,
  strokeWidth: 0.35,
});

export const route = style({
  fill: 'none',
  stroke: vars.color.success,
  strokeDasharray: '1.4 1.2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  strokeWidth: 0.8,
});

export const gridCell = style({
  fill: 'rgba(255, 255, 255, 0.04)',
  stroke: 'rgba(156, 163, 175, 0.55)',
  strokeWidth: 0.15,
});

export const selectedCell = style({
  fill: fireSurface,
  stroke: fireBorder,
  strokeWidth: 0.45,
});

export const selectableCell = style({
  outline: 'none',
  cursor: 'pointer',
});

globalStyle(`${selectableCell}:focus-visible rect`, {
  stroke: vars.color.primary,
  strokeWidth: 0.6,
});

globalStyle(`${selectableCell}:hover ${gridCell}`, {
  fill: vars.color.warningSurface,
});

export const readOnlyCell = style({
  outline: 'none',
  cursor: 'default',
});

export const fireMarker = style({
  pointerEvents: 'none',
  fontSize: '2.3px',
  fontWeight: vars.fontWeight.bold,
  fill: vars.color.dangerText,
  textAnchor: 'middle',
});

export const graphNode = style({
  fill: vars.color.primary,
  stroke: vars.color.white,
  strokeWidth: 0.3,
});

export const exitNode = style({
  fill: vars.color.success,
  stroke: vars.color.white,
  strokeWidth: 0.3,
});

export const statusMessage = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  borderRadius: vars.radius.pill,
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  padding: `${vars.space.s2} ${vars.space.s3}`,
  whiteSpace: 'nowrap',
  color: vars.color.textLow,
  ...vars.typography.body14,
});
