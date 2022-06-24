import { CeloContract } from '@celo/contractkit';

import { Alfajores, Baklava, WalletTypes } from '../../src';
import { ConnectorEvents } from '../../src/connectors/common';
import LedgerConnector from '../../src/connectors/ledger';

describe('LedgerConnector', () => {
  let connector: LedgerConnector;
  const onDisconnect = jest.fn();
  const onConnect = jest.fn();
  const onChangeNetwork = jest.fn();
  beforeEach(async () => {
    connector = new LedgerConnector(Alfajores, 0, CeloContract.GoldToken);
    connector.on(ConnectorEvents.DISCONNECTED, onDisconnect);
    connector.on(ConnectorEvents.CONNECTED, onConnect);
    connector.on(ConnectorEvents.NETWORK_CHANGED, onChangeNetwork);
    await connector.initialise();
  });

  // it.skip(
  //   'does not need to support ADDRESS CHANGE since the device cannot do this'
  // );

  describe('initialise', () => {
    it('emits CONNECTED with index, network, walletType params', () => {
      expect(onConnect).toBeCalledWith({
        networkName: Alfajores.name,
        walletType: WalletTypes.Ledger,
        index: 0,
      });
    });
  });

  describe('startNetworkChangeFromApp()', () => {
    it('emits NETWORK_CHANGED EVENT', () => {
      connector.startNetworkChangeFromApp(Baklava);
      expect(onChangeNetwork).toBeCalledWith(Baklava.name);
    });

    it('creates a new kit', () => {
      const originalKit = connector.kit;
      connector.startNetworkChangeFromApp(Baklava);
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
