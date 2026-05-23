import { globalStyle, createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
  color: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    danger: '#dc2626',
    warning: '#d97706',
    success: '#16a34a',
    bg: '#f8fafc',
    surface: '#ffffff',
    border: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
  },
  space: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
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
  fontSize: '1.6rem',
  color: vars.color.textPrimary,
  backgroundColor: vars.color.bg,
  lineHeight: 1.5,
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
