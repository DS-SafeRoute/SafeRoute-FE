import { globalStyle, keyframes, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/global.css';

const spin = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

const dangerHover = '#DC2626';
const dangerDark = '#B91C1C';

export const base = style({
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.6rem',
  transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
  border: '1.5px solid transparent',
  cursor: 'pointer',
  letterSpacing: '-0.01em',
  whiteSpace: 'nowrap',
  fontFamily: 'inherit',
  fontWeight: 700,
  selectors: {
    '&:disabled': {
      borderColor: vars.color.gray100,
      backgroundColor: vars.color.gray50,
      cursor: 'not-allowed',
      pointerEvents: 'none',
      color: vars.color.gray300,
    },
  },
});

export const variantStyles = styleVariants({
  primary: {
    borderColor: vars.color.primary,
    backgroundColor: vars.color.primary,
    color: '#fff',
    selectors: {
      '&:hover:not(:disabled)': {
        borderColor: vars.color.primaryHover,
        backgroundColor: vars.color.primaryHover,
      },
      '&:active:not(:disabled)': {
        borderColor: vars.color.primaryDark,
        backgroundColor: vars.color.primaryDark,
      },
    },
  },
  outlined: {
    borderColor: vars.color.primary,
    backgroundColor: '#fff',
    color: vars.color.primary,
    selectors: {
      '&:hover:not(:disabled)': { backgroundColor: vars.color.primaryLight2 },
      '&:active:not(:disabled)': { backgroundColor: vars.color.primaryLight },
    },
  },
  danger: {
    borderColor: vars.color.danger,
    backgroundColor: vars.color.danger,
    color: '#fff',
    selectors: {
      '&:hover:not(:disabled)': {
        borderColor: dangerHover,
        backgroundColor: dangerHover,
      },
      '&:active:not(:disabled)': {
        borderColor: dangerDark,
        backgroundColor: dangerDark,
      },
    },
  },
  dangerOutlined: {
    borderColor: vars.color.danger,
    backgroundColor: '#fff',
    color: vars.color.danger,
    selectors: {
      '&:hover:not(:disabled)': {
        borderColor: dangerHover,
        backgroundColor: '#FEF2F2',
        color: dangerHover,
      },
      '&:active:not(:disabled)': { backgroundColor: '#FEE2E2' },
    },
  },
  ghost: {
    borderColor: vars.color.gray100,
    backgroundColor: '#fff',
    color: vars.color.textMid,
    selectors: {
      '&:hover:not(:disabled)': {
        borderColor: vars.color.gray300,
        backgroundColor: vars.color.gray25,
      },
      '&:active:not(:disabled)': { backgroundColor: vars.color.gray50 },
    },
  },
});

export const sizeStyles = styleVariants({
  sm: { borderRadius: vars.radius.sm, padding: '0 1.2rem', height: '3.2rem', fontSize: '1.3rem' },
  md: {
    borderRadius: vars.radius.md,
    padding: '0 1.6rem',
    height: '4rem',
    fontSize: vars.fontSize.body14,
  },
  lg: { borderRadius: '1rem', padding: '0 2rem', height: '4.8rem', fontSize: '1.5rem' },
});

export const iconOnlySizes = styleVariants({
  sm: { padding: 0, width: '3.2rem' },
  md: { padding: 0, width: '4rem' },
  lg: { padding: 0, width: '4.8rem' },
});

export const iconWrapper = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
});

globalStyle(`${iconWrapper} svg`, {
  width: '1.6rem',
  height: '1.6rem',
});

export const fullWidthStyle = style({ width: '100%' });

export const spinnerStyle = style({
  display: 'inline-block',
  flexShrink: 0,
  border: '2px solid currentColor',
  borderRadius: '50%',
  borderTopColor: 'transparent',
  width: '1.4rem',
  height: '1.4rem',
  animation: `${spin} 0.6s linear infinite`,
});
