/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CeloContract } from '@celo/contractkit';
import { WalletConnectWallet } from '@celo/wallet-walletconnect-v1';
import { generateTestingUtils } from 'eth-testing';

import { Alfajores, WalletIds, WalletTypes } from '../../src';
import { ConnectorEvents, WalletConnectConnector } from '../../src/connectors';
import { buildOptions } from '../../src/connectors/wallet-connect';

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
  });
  afterEach(() => {
    // Clear all mocks between tests
    testingUtils.clearAllMocks();
  });
  const onConnect = jest.fn();
  beforeEach(() => {
    connector = new WalletConnectConnector(
      Alfajores,
      CeloContract.GoldToken,
      buildOptions(Alfajores),
      false,
      (x) => x,
      1,
      WalletIds.Steakwallet
    );
    jest.spyOn(connector.kit, 'getWallet').mockImplementation(() => wallet);
    connector.on(ConnectorEvents.CONNECTED, onConnect);
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

    // TODO
    // expect(onConnect).toBeCalledWith({
    //   networkName: Alfajores.name,
    //   address: ACCOUNT,
    //   walletType: WalletTypes.WalletConnect,
    //   walletId: WalletIds.Steakwallet,
    // });
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
