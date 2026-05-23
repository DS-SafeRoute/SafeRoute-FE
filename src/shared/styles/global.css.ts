import { globalStyle, createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
  color: {
    // Brand
    primary: '#2563EB',
    primaryHover: '#104ED8',
    primaryLight: '#DBEAFE',
    primaryLight2: '#EFF6FF',
    primaryDark: '#1E3A8A',

    // Text
    textHigh: '#101828',
    textMid: '#4A5563',
    textLow: '#99A1AF',

    // Semantic
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#2563EB',
    purple: '#8B5CF6',

    // Neutrals
    gray25: '#F9FAFB',
    gray50: '#F3F4F6',
    gray100: '#E5E7EB',
    gray300: '#9CA3AF',
    gray500: '#4B5563',
    gray700: '#1F2937',
    gray900: '#0A0F1A',
  },
  space: {
    s1: '0.4rem',
    s2: '0.8rem',
    s3: '1.2rem',
    s4: '1.6rem',
    s6: '2.4rem',
    s8: '3.2rem',
    s12: '4.8rem',
  },
  fontSize: {
    h1: '4.8rem',
    h2: '3rem',
    h3: '2rem',
    h4: '1.8rem',
    body16: '1.6rem',
    body14: '1.4rem',
    caption: '1.2rem',
  },
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    pill: '999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    card: '0 2px 8px rgba(0,0,0,0.08)',
    md: '0 4px 12px rgba(0,0,0,0.1)',
    lg: '0 8px 24px rgba(0,0,0,0.12)',
  },
});

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
});

globalStyle('html', {
  fontSize: '62.5%',
});

globalStyle('body', {
  fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: vars.fontSize.body16,
  color: vars.color.textHigh,
  backgroundColor: vars.color.gray25,
  lineHeight: 1.5,
  letterSpacing: '-0.02em',
});

globalStyle('button', {
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  fontFamily: 'inherit',
  fontSize: 'inherit',
});

globalStyle('a', {
  color: 'inherit',
  textDecoration: 'none',
});

globalStyle('ul, ol', {
  listStyle: 'none',
});

globalStyle('img', {
  maxWidth: '100%',
  display: 'block',
});

globalStyle('input, textarea, select', {
  fontFamily: 'inherit',
  fontSize: 'inherit',
});
