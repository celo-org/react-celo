import { CeloContract } from '@celo/contractkit';
import { MiniContractKit } from '@celo/contractkit/lib/mini-kit';
import { WalletBase } from '@celo/wallet-base';
import { LedgerSigner } from '@celo/wallet-ledger';

import { Alfajores, Baklava, WalletTypes } from '../../src';
import { ConnectorEvents } from '../../src/connectors/common';
import LedgerConnector from '../../src/connectors/ledger';
import { setApplicationLogger } from '../../src/utils/logger';
import { mockLogger } from '../test-logger';

class StubWallet extends WalletBase<LedgerSigner> {}

describe('LedgerConnector', () => {
  let connector: LedgerConnector;
  let walletStub: StubWallet;
  const onDisconnect = jest.fn();
  const onConnect = jest.fn();
  const onChangeNetwork = jest.fn();
  let originalKit: MiniContractKit;

  beforeAll(() => setApplicationLogger(mockLogger));

  beforeEach(async () => {
    walletStub = new StubWallet();
    connector = new LedgerConnector(Alfajores, 0, CeloContract.GoldToken);
    connector.on(ConnectorEvents.DISCONNECTED, onDisconnect);
    connector.on(ConnectorEvents.CONNECTED, onConnect);
    connector.on(ConnectorEvents.NETWORK_CHANGED, onChangeNetwork);

    jest
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      .spyOn<any, any>(connector, 'createWallet')
      .mockImplementation(function () {
        return walletStub;
      });

    jest
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      .spyOn<any, any>(connector, 'getWallet')
      .mockImplementation(function () {
        return walletStub;
      });
    jest.spyOn(walletStub, 'getAccounts');
    await connector.initialise();
    originalKit = connector.kit;
  });

  // it.skip(
  //   'does not need to support ADDRESS CHANGE since the device cannot do this'
  // );

  describe('initialise', () => {
    it('emits CONNECTED with index, network, walletType params', () => {
      expect(onConnect).toBeCalledWith({
        networkName: Alfajores.name,
        walletType: WalletTypes.Ledger,
        walletChainId: null,
        index: 0,
      });
    });
    it('gets account from wallet', () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(walletStub.getAccounts).toBeCalled();
    });
  });

  describe('startNetworkChangeFromApp()', () => {
    beforeEach(async () => {
      await connector.startNetworkChangeFromApp(Baklava);
    });
    it('emits NETWORK_CHANGED EVENT', () => {
      expect(onChangeNetwork).toBeCalledWith(Baklava.name);
    });

    it('creates a new kit', () => {
      expect(connector.kit).not.toBe(originalKit);
    });
  });

  describe('close()', () => {
    beforeEach(() => {
      connector.close();
    });
    it('emits DISCONNECTED event', () => {
      expect(onDisconnect).toBeCalled();
    });
  });
  describe('updateFeeCurrency', () => {
    it('sets fee currency and in fact uses it', async () => {
      await connector.updateFeeCurrency(CeloContract.StableToken);

      expect(connector.feeCurrency).toEqual(CeloContract.StableToken);

      expect(connector.kit.connection.defaultFeeCurrency).toEqual(
        '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1'
      );
    });
  });
});
