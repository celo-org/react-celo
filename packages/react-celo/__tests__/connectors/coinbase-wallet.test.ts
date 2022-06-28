import crypto from 'crypto';
import { generateTestingUtils } from 'eth-testing';

import { CoinbaseWalletConnector, ConnectorEvents } from '../../src/connectors';
import { Alfajores, Baklava } from '../../src/constants';

const ACCOUNT = '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf';

const testingUtils = generateTestingUtils({
  providerType: 'default',
  verbose: false,
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@coinbase/wallet-sdk', () => ({
  ...jest.requireActual('@coinbase/wallet-sdk'),
  CoinbaseWalletSDK: jest.fn(() => ({
    makeWeb3Provider: () => testingUtils.getProvider(),
  })),
}));

describe('CoinbaseWalletConnector', () => {
  beforeAll(() => {
    // @ts-expect-error global override
    global.crypto = crypto;
    Object.defineProperty(global.self, 'crypto', {
      value: {
        getRandomValues: (arr: number[]) => crypto.randomBytes(arr.length),
      },
    });

    testingUtils.mockConnectedWallet([ACCOUNT], {
      chainId: `0x${Alfajores.chainId.toString(16)}`,
    });
    testingUtils.mockRequestAccounts([ACCOUNT]);
    testingUtils.lowLevel.mockRequest('wallet_switchEthereumChain', {
      chainId: `0x${Alfajores.chainId.toString(16)}`,
    });
  });

  afterEach(() => {
    // Clear all mocks between tests
    testingUtils.clearAllMocks();
  });

  const dapp = { name: 'CB', icon: 'wallet.png' };

  const onConnect = jest.fn();

  it('initialises', async () => {
    const connector = new CoinbaseWalletConnector(Alfajores, dapp);
    connector.on(ConnectorEvents.CONNECTED, onConnect);
    await connector.initialise();
    expect(connector.account).toEqual(ACCOUNT);
    expect(connector.initialised).toBe(true);
    expect(onConnect).toHaveBeenCalledWith({
      address: '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf',
      networkName: 'Alfajores',
      walletType: 'CoinbaseWallet',
    });
  });

  describe('when network change', () => {
    let connector: CoinbaseWalletConnector;
    const onChangeNetwork = jest.fn();
    testingUtils.mockChainId(`0x${Baklava.chainId.toString(16)}`);

    beforeEach(() => {
      testingUtils.mockConnectedWallet([ACCOUNT], {
        chainId: `0x${Alfajores.chainId.toString(16)}`,
      });
      connector = new CoinbaseWalletConnector(Alfajores, dapp);
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
    let connector: CoinbaseWalletConnector;
    beforeEach(async () => {
      testingUtils.mockConnectedWallet([ACCOUNT], {
        chainId: `0x${Alfajores.chainId.toString(16)}`,
      });
      connector = new CoinbaseWalletConnector(Alfajores, dapp);
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
    const onDisconnect = jest.fn();
    let connector: CoinbaseWalletConnector;
    beforeEach(() => {
      connector = new CoinbaseWalletConnector(Alfajores, dapp);
      connector.on(ConnectorEvents.DISCONNECTED, onDisconnect);
    });
    it('emits DISCONNECTED event', () => {
      connector.close();
      expect(onDisconnect).toBeCalled();
    });
  });
});
