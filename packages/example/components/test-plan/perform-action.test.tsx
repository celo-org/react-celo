import '@testing-library/jest-dom';

import { CeloProvider, localStorageKeys, Mainnet } from '@celo/react-celo';
import { render, waitFor } from '@testing-library/react';
import { generateTestingUtils } from 'eth-testing';
import { TestingUtils } from 'eth-testing/lib/testing-utils';

import { mockLogger } from '../mock-logger';
import { SendTransaction } from './perform-actions';

declare global {
  interface Window {
    ethereum: ReturnType<TestingUtils['getProvider']> & { send?: () => void };
  }
}

describe('SendTransaction', () => {
  const testingUtils = generateTestingUtils({
    providerType: 'MetaMask',
  });

  beforeAll(() => {
    // Manually inject the mocked provider in the window as MetaMask does
    const provider = testingUtils.getProvider();
    global.window.ethereum = provider;
  });

  beforeEach(() => {
    testingUtils.clearAllMocks();
  });

  it('should show error if wallet has no funds', async () => {
    const mockAddress = '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf';
    testingUtils.mockConnectedWallet([mockAddress], {
      chainId: Mainnet.chainId,
    });

    localStorage.setItem(localStorageKeys.lastUsedNetwork, Mainnet.name);
    localStorage.setItem(localStorageKeys.lastUsedAddress, mockAddress);
    localStorage.setItem(localStorageKeys.lastUsedWalletType, 'MetaMask');

    /**
     * As far as I can tell, the balance is retrieved with an `eth_call` request,
     * which is sent using this function. So this might be a good point to investigate
     * how to mock it. I left an attempt below but that's not really getting to the
     * balance call from contractkit.
     *
     */
    global.window.ethereum.send = jest.fn().mockResolvedValue({
      jsonrpc: '2.0',
      result:
        '0x000000000000000000000000471ece3750da237f93b8e339c536989b8978a438',
    });

    testingUtils.lowLevel.mockRequest('eth_call', {});
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
        <SendTransaction />
      </CeloProvider>
    );

    expect(screen.getByRole('status')).toHaveTextContent('not started');

    await waitFor(() => {
      expect(
        screen.getByText(
          'This sends a very small transaction to impact market contract.'
        )
      ).toBeVisible();
    });

    await waitFor(() =>
      expect(
        screen.getByText(
          /Your wallet does not have enough funds for the transaction/,
          { exact: false }
        )
      ).toBeInTheDocument()
    );

    screen.unmount();
  });
});
