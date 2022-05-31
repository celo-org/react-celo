import { CeloContract } from '@celo/contractkit/lib/base';
import { generateTestingUtils } from 'eth-testing';

import { MetaMaskConnector } from '../../src/connectors';
import { Alfajores, Baklava } from '../../src/constants';
import { getLastUsedNetwork } from '../../src/utils/localStorage';

const ACCOUNT = '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf';

describe('MetaMaskConnector', () => {
  const testingUtils = generateTestingUtils({
    providerType: 'MetaMask',
    verbose: false,
  });
  beforeAll(() => {
    // Manually inject the mocked provider in the window as MetaMask does
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.window.ethereum = testingUtils.getProvider();
    testingUtils.mockNotConnectedWallet();
    testingUtils.mockAccounts([ACCOUNT]);
    testingUtils.mockRequestAccounts([ACCOUNT]);
    testingUtils.lowLevel.mockRequest('wallet_switchEthereumChain', {});
  });
  afterEach(() => {
    // Clear all mocks between tests
    testingUtils.clearAllMocks();
  });

  it('initialises', async () => {
    const connector = new MetaMaskConnector(Alfajores, CeloContract.GoldToken);
    await connector.initialise();
    expect(connector.account).toEqual(ACCOUNT);
    expect(connector.initialised).toBe(true);
  });
  describe('when network change', () => {
    let connector: MetaMaskConnector;
    beforeEach(() => {
      testingUtils.mockConnectedWallet([ACCOUNT]);
      connector = new MetaMaskConnector(Alfajores, CeloContract.GoldToken);
    });
    it('sets network in local storage and in connection', async () => {
      await connector.updateKitWithNetwork(Baklava);

      expect(getLastUsedNetwork()).toEqual(Baklava.name);
    });

    const callback = jest.fn();

    it('reacts to network being changed from metamask side', async () => {
      connector.onNetworkChange(callback);

      // Seems to only work when  init is called after the callback is set
      await connector.initialise();

      testingUtils.mockChainChanged('0x1');

      expect(callback).toHaveBeenLastCalledWith(1);
    });
  });
});
