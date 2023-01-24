import { AppTheme } from '../types';

const defaultTheme = {
  dark: {
    primary: '#eef2ff',
    secondary: '#6366f1',
    text: '#ffffff',
    textSecondary: '#cbd5e1',
    textTertiary: '#64748b',
    muted: '#334155',
    background: '#1e293b',
    error: '#E70532',
  },
  light: {
    primary: '#6366f1',
    secondary: '#eef2ff',
    text: '#000000',
    textSecondary: '#1f2937',
    textTertiary: '#64748b',
    muted: '#e2e8f0',
    background: '#ffffff',
    error: '#E70532',
  },
} as AppTheme;

export default defaultTheme;
