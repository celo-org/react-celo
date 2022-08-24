import { CeloContract } from '@celo/contractkit/lib/base';
import { generateTestingUtils } from 'eth-testing';

import { WalletTypes } from '../../src';
import { ConnectorEvents, MetaMaskConnector } from '../../src/connectors';
import { Alfajores, Baklava } from '../../src/constants';
import { setApplicationLogger } from '../../src/utils/logger';
import { mockLogger } from '../test-logger';

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
    testingUtils.mockRequestAccounts([ACCOUNT]);
    testingUtils.lowLevel.mockRequest('wallet_switchEthereumChain', {
      chainId: `0x${Alfajores.chainId.toString(16)}`,
    });
    setApplicationLogger(mockLogger);
  });
  afterEach(() => {
    // Clear all mocks between tests
    testingUtils.clearAllMocks();
  });

  describe('initialise()', () => {
    beforeEach(() => {
      testingUtils.mockConnectedWallet([ACCOUNT], {
        chainId: `0x${Alfajores.chainId.toString(16)}`,
      });
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
        walletChainId: Alfajores.chainId,
        walletType: WalletTypes.MetaMask,
        networkName: Alfajores.name,
        address: ACCOUNT,
      });
    });
  });
  describe('when network change', () => {
    let connector: MetaMaskConnector;
    const onChangeNetwork = jest.fn();

    beforeEach(() => {
      testingUtils.mockConnectedWallet([ACCOUNT], {
        chainId: `0x${Alfajores.chainId.toString(16)}`,
      });
      connector = new MetaMaskConnector(Alfajores, CeloContract.GoldToken);
      connector.on(ConnectorEvents.NETWORK_CHANGED, onChangeNetwork);
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
  });

  describe('when wallet changes address', () => {
    const onAddressChange = jest.fn();
    let connector: MetaMaskConnector;
    beforeEach(async () => {
      testingUtils.mockConnectedWallet([ACCOUNT], {
        chainId: `0x${Alfajores.chainId.toString(16)}`,
      });
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
