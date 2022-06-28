import { CeloContract } from '@celo/contractkit/lib/base';
import crypto from 'crypto';
import { generateTestingUtils } from 'eth-testing';

import { CoinbaseWalletConnector } from '../../src/connectors';
import { Alfajores, Baklava, localStorageKeys } from '../../src/constants';
import { getTypedStorageKey } from '../../src/utils/local-storage';

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
    const connector = new CoinbaseWalletConnector(
      Alfajores,
      CeloContract.GoldToken
    );
    await connector.initialise();
    expect(connector.account).toEqual(ACCOUNT);
    expect(connector.initialised).toBe(true);
  });

  describe('when network change', () => {
    let connector: CoinbaseWalletConnector;
    beforeEach(() => {
      testingUtils.mockConnectedWallet([ACCOUNT]);
      connector = new CoinbaseWalletConnector(
        Alfajores,
        CeloContract.GoldToken
      );
    });

    it('sets network in local storage and in connection', async () => {
      await connector.updateKitWithNetwork(Baklava);
      expect(getTypedStorageKey(localStorageKeys.lastUsedNetwork)).toEqual(
        Baklava.name
      );
    });

    const callback = jest.fn();

    it('reacts to network being changed from CoinbaseWallet side', async () => {
      connector.onNetworkChange(callback);

      // Seems to only work when  init is called after the callback is set
      await connector.initialise();

      testingUtils.mockChainChanged('0x1');

      expect(callback).toHaveBeenLastCalledWith(1);
    });
  });
});
