import '@testing-library/jest-dom';

import { CeloProvider, Mainnet } from '@celo/react-celo';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { generateTestingUtils } from 'eth-testing';
import { TestingUtils } from 'eth-testing/lib/testing-utils';

import { mockLogger } from '../mock-logger';
import { ConnectWalletCheck } from './connect-wallet';

declare global {
  interface Window {
    ethereum: ReturnType<TestingUtils['getProvider']> & { send?: () => void };
  }
}
describe('ConnectWalletCheck', () => {
  const testingUtils = generateTestingUtils({ providerType: 'MetaMask' });

  beforeAll(() => {
    // Manually inject the mocked provider in the window as MetaMask does
    const provider = testingUtils.getProvider();
    global.window.ethereum = provider;
  });

  beforeEach(() => {
    testingUtils.clearAllMocks();
  });

  it('should show success when Metamask is connected', async () => {
    // Start with no wallet connected
    testingUtils.mockNotConnectedWallet();
    // Mock the response for the connection request of MetaMask
    testingUtils.mockRequestAccounts([
      '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf',
    ]);
    // `send` is deprecated in Metamask, but web3 still uses it
    global.window.ethereum.send = jest.fn();

    const screen = render(
      <CeloProvider
        dapp={{
          name: 'Test dapp',
          description: 'Wallet test plan',
          url: 'http://localhost:1234',
          icon: 'http://localhost:1234/favicon.ico',
        }}
        network={Mainnet}
        connectModal={{
          providersOptions: { searchable: true },
        }}
        logger={mockLogger}
      >
        <ConnectWalletCheck />
      </CeloProvider>
    );

    expect(screen.getByRole('status')).toHaveTextContent('not started');
    const runButton = await screen.findByLabelText(
      'Run Connect wallet to mainnet'
    );
    expect(runButton).toBeEnabled();

    fireEvent.click(runButton);

    await waitFor(() => screen.getByText(/MetaMask/).click());
    await waitFor(() => screen.getByText(/Connected to/, { exact: false }));

    expect(screen.getByRole('status')).toHaveTextContent('success');
    expect(runButton).toBeDisabled();
  });
});
