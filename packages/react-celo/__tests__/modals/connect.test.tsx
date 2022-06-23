import '@testing-library/jest-dom';

import React from 'react';

import { ConnectModal } from '../../src/modals';
import { renderComponentInCKProvider } from '../render-in-provider';

renderComponentInCKProvider;

describe('ConnectModal', () => {
  describe('when given reactModalProps', () => {
    describe('style.overlay', () => {
      it('applies those styles', async () => {
        const dom = renderComponentInCKProvider(
          <ConnectModal
            reactModalProps={{
              isOpen: true,
              style: { overlay: { zIndex: 10 } },
            }}
          />,
          { providerProps: {} }
        );
        const modal = await dom.findByRole('dialog');
        expect(modal.parentElement).toHaveStyle('z-index: 10');
      });
    });
  });
});
