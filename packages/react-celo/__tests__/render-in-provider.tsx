import { render, renderHook } from '@testing-library/react';
import React, { ReactElement } from 'react';

import { CeloProvider, CeloProviderProps } from '../src/react-celo-provider';

interface RenderArgs {
  providerProps: Partial<CeloProviderProps>;
}

const defaultProps: CeloProviderProps = {
  dapp: {
    name: 'Testing Celo React',
    description: 'Test it well',
    url: 'https://celo.developers',
    icon: '',
  },
  children: null,
};

export function renderComponentInCKProvider(
  ui: ReactElement<unknown, string>,
  { providerProps }: RenderArgs
) {
  return render(ui, {
    wrapper: ({ children }) => {
      const props = { ...defaultProps, ...providerProps };
      return <CeloProvider {...props}>{children}</CeloProvider>;
    },
  });
}

export function renderHookInCKProvider<R>(
  hook: (i: unknown) => R,
  { providerProps }: RenderArgs
) {
  return renderHook<R, unknown>(hook, {
    wrapper: ({ children }) => {
      const props = { ...defaultProps, ...providerProps };
      return <CeloProvider {...props}>{children}</CeloProvider>;
    },
  });
}
