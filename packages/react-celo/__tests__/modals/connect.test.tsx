import '@testing-library/jest-dom';

import { act, RenderResult } from '@testing-library/react';
import React from 'react';

import { ConnectModal } from '../../src/modals';
import { renderComponentInCKProvider } from '../render-in-provider';

const theme = {
  primary: '#eef2ff',
  secondary: '#6366f1',
  text: '#ffffff',
  textSecondary: '#cbd5e1',
  textTertiary: '#64748b',
  muted: '#334155',
  background: '#1e293b',
  error: '#ef4444',
};

describe('ConnectModal', () => {
  describe('when given reactModalProps', () => {
    let dom: RenderResult;
    describe('style.overlay', () => {
      beforeEach(async () => {
        await act(() => {
          dom = renderComponentInCKProvider(
            <ConnectModal
              reactModalProps={{
                isOpen: true,
                style: { overlay: { zIndex: 10 } },
              }}
            />,
            { providerProps: { theme } }
          );
        });
      });

      afterEach(() => {
        // dom.unmount();
      });
      it('applies those styles while keeping original', async () => {
        const modal = await dom.findByRole('dialog');
        expect(modal.parentElement).toHaveStyle(
          'z-index: 10; background: rgba(30, 41, 59, 0.75)'
        );
      });
      it('still uses theme for background on content modal', async () => {
        const modal = await dom.findByRole('dialog');
        expect(modal).toHaveStyle('background: rgba(30, 41, 59, 1)');
      });
    });
  });
});
