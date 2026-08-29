import { globalStyle, style } from '@vanilla-extract/css';

import { vars } from '@styles/global.css';

export const canvas = style({
  position: 'relative',
  border: `1px solid ${vars.color.gray100}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.white,
  width: '100%',
  height: '18rem',
  overflow: 'hidden',
});

export const graph = style({
  display: 'block',
  width: '100%',
  height: '100%',
});

export const edges = style({});

globalStyle(`${edges} line`, {
  stroke: vars.color.gray300,
  strokeWidth: 2,
  vectorEffect: 'non-scaling-stroke',
});

export const route = style({
  fill: 'none',
  stroke: vars.color.success,
  strokeWidth: 4,
  strokeDasharray: '8 6',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  vectorEffect: 'non-scaling-stroke',
});

export const node = style({
  fill: vars.color.white,
  stroke: vars.color.gray500,
  strokeWidth: 2,
  vectorEffect: 'non-scaling-stroke',
});

export const routeNode = style({
  fill: vars.color.success,
  stroke: vars.color.white,
  strokeWidth: 2,
  vectorEffect: 'non-scaling-stroke',
});

export const startNode = style({
  fill: vars.color.danger,
  stroke: vars.color.white,
  strokeWidth: 2,
  vectorEffect: 'non-scaling-stroke',
});

export const fireHalo = style({
  fill: 'rgba(239, 68, 68, 0.14)',
});

export const nodeLabel = style({
  fontWeight: 600,
  fill: vars.color.textMid,
  paintOrder: 'stroke',
  stroke: vars.color.white,
  strokeWidth: 2,
  vectorEffect: 'non-scaling-stroke',
});

export const notice = style({
  position: 'absolute',
  right: vars.space.s3,
  bottom: vars.space.s3,
  left: vars.space.s3,
  borderRadius: vars.radius.md,
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  padding: vars.space.s2,
  textAlign: 'center',
  color: vars.color.textLow,
  ...vars.typography.caption,
});

export const state = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '18rem',
  color: vars.color.textLow,
  ...vars.typography.body14,
});
