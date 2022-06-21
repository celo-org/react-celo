import { CeloContract } from '@celo/contractkit/lib/base';
import { generateTestingUtils } from 'eth-testing';

import { localStorageKeys, WalletTypes } from '../../src';
import { ConnectorEvents, MetaMaskConnector } from '../../src/connectors';
import { Alfajores, Baklava } from '../../src/constants';
import { getTypedStorageKey } from '../../src/utils/local-storage';

const ACCOUNT = '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf';

describe('MetaMaskConnector', () => {
  const testingUtils = generateTestingUtils({
    providerType: 'MetaMask',
    verbose: false,
  });
  const onConnect = jest.fn();
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

  describe('initialise()', () => {
    beforeEach(() => {
      testingUtils.mockConnectedWallet([ACCOUNT]);
    });

    it('is idempotent', async () => {
      const connector = new MetaMaskConnector(
        Alfajores,
        CeloContract.GoldToken
      );
      connector.on(ConnectorEvents.CONNECTED, onConnect);
      await connector.initialise();
      await connector.initialise();
      expect(onConnect).toBeCalledTimes(1);
    });

    it('initialises', async () => {
      const connector = new MetaMaskConnector(
        Alfajores,
        CeloContract.GoldToken
      );
      connector.on(ConnectorEvents.CONNECTED, onConnect);
      await connector.initialise();

      expect(connector.account).toEqual(ACCOUNT);
      expect(connector.initialised).toBe(true);
      expect(onConnect).toBeCalledWith({
        walletType: WalletTypes.MetaMask,
        networkName: Alfajores.name,
        address: ACCOUNT,
      });
    });
  });
  describe('when network change', () => {
    let connector: MetaMaskConnector;
    beforeEach(() => {
      testingUtils.mockConnectedWallet([ACCOUNT]);
      connector = new MetaMaskConnector(Alfajores, CeloContract.GoldToken);
    });
    it('sets network in local storage and in connection', async () => {
      await connector.updateKitWithNetwork(Baklava);

      expect(getTypedStorageKey(localStorageKeys.lastUsedNetwork)).toEqual(
        Baklava.name
      );
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

  describe('when wallet changes address', () => {
    const onAddressChange = jest.fn();
    let connector: MetaMaskConnector;
    beforeEach(async () => {
      testingUtils.mockConnectedWallet([ACCOUNT]);
      connector = new MetaMaskConnector(Alfajores, CeloContract.GoldToken);
      connector.on(ConnectorEvents.ADDRESS_CHANGED, onAddressChange);
      // Seems to only work when  init is called after the callback is set
      await connector.initialise();
    });
    it('emits ADDRESS_CHANGED', () => {
      const newAddress = '0x11eed0F399d76Fe419FAf19a80ae7a52DE948D76';
      testingUtils.mockAccountsChanged([newAddress]);
      expect(onAddressChange).toBeCalledWith(newAddress);
    });
  });

  describe('close()', () => {
    let connector: MetaMaskConnector;
    const onDisconnect = jest.fn();
    beforeEach(() => {
      connector = new MetaMaskConnector(Alfajores, CeloContract.GoldToken);
      connector.on(ConnectorEvents.DISCONNECTED, onDisconnect);
    });
    it('emits DISCONNECTED event', () => {
      connector.close();
      expect(onDisconnect).toBeCalled();
    });
  });
});
