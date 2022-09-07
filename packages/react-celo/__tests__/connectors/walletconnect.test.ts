/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CeloContract } from '@celo/contractkit';
import { WalletConnectWallet } from '@celo/wallet-walletconnect-v1';
import { generateTestingUtils } from 'eth-testing';

import { Alfajores, WalletIds } from '../../src';
import { ConnectorEvents, WalletConnectConnector } from '../../src/connectors';
import { buildOptions } from '../../src/connectors/wallet-connect';
import { setApplicationLogger } from '../../src/utils/logger';
import { mockLogger } from '../test-logger';

const ACCOUNT = '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf';

jest.createMockFromModule('@celo/wallet-walletconnect-v1');

const wallet = new WalletConnectWallet({});

jest.spyOn(wallet, 'init').mockImplementation(async function init() {
  return Promise.resolve(undefined);
});

jest.spyOn(wallet, 'close').mockImplementation(async function close() {
  return Promise.resolve(undefined);
});

jest.spyOn(wallet, 'getAccounts').mockImplementation(function getAccounts() {
  return [ACCOUNT];
});

jest.spyOn(wallet, 'getUri').mockImplementation(function getUri() {
  return Promise.resolve(
    'wc:8a5e5bdc-a0e4-4702-ba63-8f1a5655744f@1?bridge=https%3A%2F%2Fbridge.walletconnect.org&key=41791102999c339c844880b23950704cc43aa840f3739e365323cda4dfa89e7a'
  );
});

describe('WalletConnectConnector', () => {
  let connector: WalletConnectConnector;
  const testingUtils = generateTestingUtils({
    providerType: 'WalletConnect',
    verbose: false,
  });
  beforeAll(() => {
    testingUtils.getProvider();
    testingUtils.mockNotConnectedWallet();
    testingUtils.mockAccounts([ACCOUNT]);
    testingUtils.mockRequestAccounts([ACCOUNT]);
    testingUtils.lowLevel.mockRequest('wallet_switchEthereumChain', {});
    jest.setTimeout(11_000);
    setApplicationLogger(mockLogger);
  });
  afterEach(() => {
    // Clear all mocks between tests
    testingUtils.clearAllMocks();
  });
  const onConnect = jest.fn();
  const onInit = jest.fn();
  beforeEach(() => {
    connector = new WalletConnectConnector(
      Alfajores,
      false,
      CeloContract.GoldToken,
      buildOptions(Alfajores),
      false,
      (x: string) => x,
      1,
      WalletIds.Omni
    );
    jest.spyOn(connector.kit, 'getWallet').mockImplementation(() => wallet);
    connector.on(ConnectorEvents.CONNECTED, onConnect);
    connector.on(ConnectorEvents.WC_INITIALISED, onInit);
  });

  it('initialises', async () => {
    await connector.initialise();
    expect(connector.account).toEqual(ACCOUNT);
    expect(connector.initialised).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(wallet.init).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(wallet.getAccounts).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(connector.kit.getWallet).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(wallet.getUri).toHaveBeenCalled();

    expect(onInit).toBeCalled();
  });

  describe('when a connected wallet changes accounts', () => {
    const onAddressChange = jest.fn();
    beforeEach(async () => {
      await connector.initialise();
      connector.on(ConnectorEvents.ADDRESS_CHANGED, onAddressChange);
    });
    it.skip('emits an ADDRESS_CHANGED event', () => {
      expect(onAddressChange).toBeCalledWith('address');
    });
  });

  describe('close()', () => {
    const onDisconnected = jest.fn();
    beforeEach(() => {
      connector.on(ConnectorEvents.DISCONNECTED, onDisconnected);
    });

    it('emits DISCONNECTED event', async () => {
      await connector.close();
      expect(onDisconnected).toBeCalled();
    });
  });
});
