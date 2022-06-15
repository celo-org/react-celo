/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CeloContract } from '@celo/contractkit';
import { WalletConnectWallet } from '@celo/wallet-walletconnect-v1';
import { generateTestingUtils } from 'eth-testing';

import { Alfajores } from '../../src';
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

  it('initialises', async () => {
    const connector = new WalletConnectConnector(
      Alfajores,
      CeloContract.GoldToken,
      { connect: { chainId: Alfajores.chainId } }
    );

    jest.spyOn(connector.kit, 'getWallet').mockImplementation(() => wallet);

    await connector.initialise();
    expect(connector.account).toEqual(ACCOUNT);
    expect(connector.initialised).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(wallet.init).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(wallet.getAccounts).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(connector.kit.getWallet).toHaveBeenCalled();
  });
  describe('close()', () => {
    let connector: WalletConnectConnector;
    beforeEach(() => {
      connector = new WalletConnectConnector(
        Alfajores,
        CeloContract.GoldToken,
        buildOptions(Alfajores)
      );
      jest.spyOn(connector, 'emit');
      jest.spyOn(connector.kit, 'getWallet').mockImplementation(() => wallet);
    });

    it('emits DISCONNECTED event', async () => {
      await connector.close();
      expect(connector.emit).toBeCalledWith(ConnectorEvents.DISCONNECTED);
    });
  });
});
