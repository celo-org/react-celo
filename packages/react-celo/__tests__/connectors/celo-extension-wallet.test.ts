import { CeloContract } from '@celo/contractkit/lib/base';
import { generateTestingUtils } from 'eth-testing';

import {
  CeloExtensionWalletConnector,
  ConnectorEvents,
} from '../../src/connectors';
import { Alfajores } from '../../src/constants';

const ACCOUNT = '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf';

describe('CeloExtensionWalletConnector', () => {
  const testingUtils = generateTestingUtils({
    providerType: 'MetaMask',
    verbose: false,
  });
  const otherTesting = generateTestingUtils({
    providerType: 'WalletConnect',
    verbose: false,
  });
  beforeAll(() => {
    // Manually inject the mocked provider in the window as MetaMask does
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.window.ethereum = testingUtils.getProvider();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.window.celo = otherTesting.getProvider();
    testingUtils.mockNotConnectedWallet();
    testingUtils.mockAccounts([ACCOUNT]);
    testingUtils.mockRequestAccounts([ACCOUNT]);
    testingUtils.lowLevel.mockRequest('wallet_switchEthereumChain', {});
  });
  afterEach(() => {
    // Clear all mocks between tests
    testingUtils.clearAllMocks();
  });

  // it('initialises', async () => {
  //   const connector = new CeloExtensionWalletConnector(
  //     Alfajores,
  //     CeloContract.GoldToken
  //   );
  //   await connector.initialise();
  //   expect(connector.account).toEqual(ACCOUNT);
  //   expect(connector.initialised).toBe(true);
  // });
  describe('close()', () => {
    let connector: CeloExtensionWalletConnector;
    beforeEach(() => {
      connector = new CeloExtensionWalletConnector(
        Alfajores,
        CeloContract.GoldToken
      );
      jest.spyOn(connector, 'emit');
    });

    it('emits DISCONNECTED event', () => {
      connector.close();
      expect(connector.emit).toHaveBeenCalledWith(ConnectorEvents.DISCONNECTED);
    });
  });
});
