import { useEffect, useState } from 'react';

import defaultTheme from '../theme/default';
import { Mode, Theme } from '../types';
import { useCeloInternal } from '../use-celo';

class ModeState {
  private _mode = Mode.Light;
  private listeners = [] as ((mode: Mode) => void)[];

  public set mode(mode: Mode) {
    if (this._mode === mode) return;

    this._mode = mode;
    this.listeners.forEach((cb) => cb(this._mode));
  }

  public get mode() {
    return this._mode;
  }

  public addEventListener(listener: (mode: Mode) => void) {
    this.listeners.push(listener);
  }
  public removeEventListener(listener: (mode: Mode) => void) {
    this.listeners = this.listeners.filter((x) => x !== listener);
  }
  public removeEventListeners() {
    this.listeners = [];
  }
}
const state = new ModeState();

// const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const DARK_CLASSES = ['dark', 'tw-dark'];
function hasDarkClasses(elem: HTMLElement) {
  // const hasDarkMedia = window.matchMedia(COLOR_SCHEME_QUERY).matches;
  return DARK_CLASSES.some((cls) => elem.classList.contains(cls));
}

if (typeof MutationObserver !== 'undefined') {
  const body = document.getElementsByTagName('body');
  const html = document.getElementsByTagName('html');
  const elems = [...body, ...html];

  const mutationCallback = () => {
    const isDark = elems.some(hasDarkClasses);
    state.mode = isDark ? Mode.Dark : Mode.Light;
  };

  const observer = new MutationObserver(mutationCallback);
  mutationCallback();
  elems.forEach((elem) => {
    observer.observe(elem, {
      subtree: false,
      childList: false,
      attributeFilter: ['class'],
    });
  });
}

export default function useTheme(): Theme {
  const { theme } = useCeloInternal();
  const [mode, setMode] = useState(state.mode);

  useEffect(() => {
    const cb = (m: Mode) => setMode(m);
    state.addEventListener(cb);
    return () => {
      state.removeEventListener(cb);
    };
  }, []);

  return theme || defaultTheme[mode];
}
