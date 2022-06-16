import { CeloContract } from '@celo/contractkit/lib/base';
import { generateTestingUtils } from 'eth-testing';

import {
  CeloExtensionWalletConnector,
  ConnectorEvents,
} from '../../src/connectors';
import { Alfajores, WalletTypes } from '../../src/constants';

const ACCOUNT = '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CEW_CALLBACKS = new Map<string, (args: any) => void>();

describe('CeloExtensionWalletConnector', () => {
  const testingUtils = generateTestingUtils({
    providerType: 'MetaMask',
    verbose: false,
  });

  beforeAll(() => {
    // Manually inject the mocked provider in the window as MetaMask does
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.window.ethereum = testingUtils.getProvider();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (global.window.celo = {
      ...testingUtils.getProvider(),
      send: () => true,
      enable: () => Promise.resolve(undefined),
      publicConfigStore: {
        on: (e: string, cb: (args: { networkVersion: number }) => void) => {
          CEW_CALLBACKS.set(e, cb);
        },
      },
    }),
      testingUtils.mockNotConnectedWallet();
    testingUtils.mockAccounts([ACCOUNT]);
    testingUtils.mockRequestAccounts([ACCOUNT]);
    testingUtils.lowLevel.mockRequest('wallet_switchEthereumChain', {});
  });
  let connector: CeloExtensionWalletConnector;
  beforeEach(() => {
    connector = new CeloExtensionWalletConnector(
      Alfajores,
      CeloContract.GoldToken
    );
    jest.spyOn(connector, 'emit');
  });

  afterEach(() => {
    // Clear all mocks between tests
    testingUtils.clearAllMocks();
  });
  describe('initialise()', () => {
    it.skip('emits CONNECTED with network, address, walletType', async () => {
      await connector.initialise();
      expect(connector.initialised).toBe(true);
      expect(connector.emit).toBeCalledWith(ConnectorEvents.CONNECTED, {
        networkName: Alfajores.name,
        address: ACCOUNT,
        walletType: WalletTypes.CeloExtensionWallet,
      });
    });
  });

  describe('close()', () => {
    it('emits DISCONNECTED event', () => {
      connector.close();
      expect(connector.emit).toHaveBeenCalledWith(ConnectorEvents.DISCONNECTED);
    });
  });
});
