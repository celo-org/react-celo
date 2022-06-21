import { CeloContract } from '@celo/contractkit';

import { Alfajores, localStorageKeys, WalletTypes } from '../../src';
import { ConnectorEvents, LedgerConnector } from '../../src/connectors';
import {
  getLastUsedWalletArgs,
  getTypedStorageKey,
} from '../../src/utils/local-storage';

describe('LedgerConnector', () => {
  let connector: LedgerConnector;
  const onDisconnect = jest.fn();
  const onConnect = jest.fn();
  beforeEach(() => {
    connector = new LedgerConnector(Alfajores, 0, CeloContract.GoldToken);
    connector.on(ConnectorEvents.DISCONNECTED, onDisconnect);
    connector.on(ConnectorEvents.CONNECTED, onConnect);
  });

  it('remembers info in localStorage', () => {
    expect(getTypedStorageKey(localStorageKeys.lastUsedFeeCurrency)).toEqual(
      null
    );

    expect(getTypedStorageKey(localStorageKeys.lastUsedWalletType)).toEqual(
      WalletTypes.Ledger
    );

    expect(getTypedStorageKey(localStorageKeys.lastUsedNetwork)).toEqual(
      'Alfajores'
    );

    expect(getLastUsedWalletArgs()).toEqual([0]);
  });

  // it.skip(
  //   'does not need to support ADDRESS CHANGE since the device cannot do this'
  // );

  describe('initialise', () => {
    beforeEach(() => {
      void connector.initialise();
    });
    it.skip('emits CONNECTED with index, network, walletType params', () => {
      expect(onConnect).toBeCalledWith({
        networkName: Alfajores.name,
        walletType: WalletTypes.Ledger,
        index: 0,
      });
    });
  });

  describe('close()', () => {
    beforeEach(() => {
      connector.close();
    });
    it('clears out localStorage', () => {
      expect(getTypedStorageKey(localStorageKeys.lastUsedFeeCurrency)).toEqual(
        null
      );

      expect(getLastUsedWalletArgs()).toEqual(null);

      expect(getTypedStorageKey(localStorageKeys.lastUsedNetwork)).toEqual(
        null
      );
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
