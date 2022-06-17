import { Theme } from '@celo/react-celo';

interface Props {
  theme: Theme;
  currentTheme: Theme | null;
  onClick: (theme: Theme | null) => void;
}

export function ThemeButton({ theme, currentTheme, onClick }: Props) {
  const selected = currentTheme === theme;
  return (
    <button
      aria-label="Theme button"
      className={`flex flex-row rounded gap-y-1 justify-between border cursor-pointer text-xs`}
      style={{
        background: theme.background,
        borderWidth: selected ? 2 : 1,
        padding: selected ? 3 : 4,
        borderColor: selected ? theme.primary : theme.muted,
      }}
      onClick={() => onClick(selected ? null : theme)}
    >
      <div className="flex flex-col gap-y-2 w-full">
        <div
          className="w-1/3 h-0.5 rounded"
          style={{ background: theme.text }}
        />
        <div
          className="w-3/4 h-0.5 rounded"
          style={{ background: theme.text }}
        />
        <div
          className="w-3/4 h-0.5 rounded"
          style={{ background: theme.textTertiary }}
        />
        <div
          className="w-2/3 h-0.5 rounded"
          style={{ background: theme.muted }}
        />
      </div>
      <div className="flex flex-row gap-x-2">
        <div
          className="w-3 h-full rounded"
          style={{ background: theme.primary }}
        />
        <div
          className="w-3 h-full rounded"
          style={{ background: theme.secondary }}
        />
      </div>
    </button>
  );
}

const defaultDark = {
  primary: '#eef2ff',
  secondary: '#6366f1',
  text: '#ffffff',
  textSecondary: '#cbd5e1',
  textTertiary: '#64748b',
  muted: '#334155',
  background: '#1e293b',
  error: '#ef4444',
};
const defaultLight = {
  primary: '#6366f1',
  secondary: '#eef2ff',
  text: '#000',
  textSecondary: '#1f2937',
  textTertiary: '#64748b',
  muted: '#e2e8f0',
  background: '#ffffff',
  error: '#ef4444',
};
const greenCustom = {
  primary: '#34d399',
  secondary: '#ecfccb',
  text: 'hsla(81, 88%, 80%)',
  textSecondary: '#d9f99d',
  textTertiary: '#bef264',
  muted: '#3f6212',
  background: '#000',
  error: '#ef4444',
};
const roseCustom = {
  primary: '#e11d48',
  secondary: '#fda4af',
  text: '#fff',
  textSecondary: '#ffe4e6',
  textTertiary: '#fecdd3',
  muted: '#3f3f46',
  background: '#27272a',
  error: 'rgb(255, 0, 0)',
};

export const themes = [defaultDark, defaultLight, greenCustom, roseCustom];
