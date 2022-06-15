import { CeloContract } from '@celo/contractkit';

import { Alfajores, localStorageKeys, WalletTypes } from '../../src';
import { ConnectorEvents, LedgerConnector } from '../../src/connectors';
import {
  getLastUsedWalletArgs,
  getTypedStorageKey,
} from '../../src/utils/local-storage';

describe('LedgerConnector', () => {
  let connector: LedgerConnector;
  beforeEach(() => {
    connector = new LedgerConnector(Alfajores, 0, CeloContract.GoldToken);
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

  describe('close()', () => {
    beforeEach(() => {
      jest.spyOn(connector, 'emit');
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
      expect(connector.emit).toBeCalledWith(ConnectorEvents.DISCONNECTED);
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
