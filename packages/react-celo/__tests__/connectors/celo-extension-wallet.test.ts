import { CeloContract } from '@celo/contractkit/lib/base';
import { generateTestingUtils } from 'eth-testing';

import {
  CeloExtensionWalletConnector,
  ConnectorEvents,
} from '../../src/connectors';
import { Alfajores, Baklava, WalletTypes } from '../../src/constants';

const ACCOUNT = '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CEW_CALLBACKS = new Map<string, (args: any) => void>();

describe('CeloExtensionWalletConnector', () => {
  const testingUtils = generateTestingUtils({
    providerType: 'MetaMask',
    verbose: false,
  });

  const provider = testingUtils.getProvider();

  beforeAll(() => {
    // Manually inject the mocked provider in the window as MetaMask does
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (global.window.celo = {
      ...provider,
      send: (params, cb) =>
        cb(null, {
          jsonrpc: params.jsonrpc,
          id: Number(params.id),
          result: [ACCOUNT],
        }),
      enable: () => Promise.resolve(undefined),
      publicConfigStore: {
        on: (e: string, cb: (args: { networkVersion: number }) => void) => {
          CEW_CALLBACKS.set(e, cb);
        },
      },
    }),
      testingUtils.mockConnectedWallet([ACCOUNT], {
        chainId: Alfajores.chainId,
      });
    testingUtils.mockAccounts([ACCOUNT]);
    testingUtils.mockRequestAccounts([ACCOUNT]);
  });
  let connector: CeloExtensionWalletConnector;
  const onConnect = jest.fn();
  const onDisconnect = jest.fn();
  const onChangeAddress = jest.fn();
  const onChangeNetwork = jest.fn();
  beforeEach(() => {
    connector = new CeloExtensionWalletConnector(
      Alfajores,
      CeloContract.GoldToken
    );
    connector.on(ConnectorEvents.CONNECTED, onConnect);
    connector.on(ConnectorEvents.DISCONNECTED, onDisconnect);
    connector.on(ConnectorEvents.ADDRESS_CHANGED, onChangeAddress);
    connector.on(ConnectorEvents.NETWORK_CHANGED, onChangeNetwork);
  });

  afterEach(() => {
    // Clear all mocks between tests
    testingUtils.clearAllMocks();
  });
  describe('initialise()', () => {
    it('emits CONNECTED with network, address, walletType', async () => {
      await connector.initialise();
      expect(connector.initialised).toBe(true);
      expect(onConnect).toBeCalledWith({
        networkName: Alfajores.name,
        address: ACCOUNT,
        walletType: WalletTypes.CeloExtensionWallet,
      });
    });
  });

  describe('startNetworkChangeFromApp()', () => {
    it('throws since CEW doesnt support that', () => {
      expect(() => connector.startNetworkChangeFromApp()).toThrowError();
    });
  });

  describe('continueNetworkUpdateFromWallet()', () => {
    it('emits NETWORK_CHANGED EVENT', () => {
      connector.continueNetworkUpdateFromWallet(Baklava);
      expect(onChangeNetwork).toBeCalledWith(Baklava.name);
    });

    it('creates a new kit', () => {
      const originalKit = connector.kit;
      connector.continueNetworkUpdateFromWallet(Baklava);
      expect(connector.kit).not.toBe(originalKit);
    });
  });

  describe('close()', () => {
    it('emits DISCONNECTED event', () => {
      connector.close();
      expect(onDisconnect).toHaveBeenCalled();
    });
  });
});
