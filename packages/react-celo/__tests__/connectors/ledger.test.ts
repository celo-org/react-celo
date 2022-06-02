import { CeloContract } from '@celo/contractkit';

import { Alfajores, localStorageKeys, WalletTypes } from '../../src';
import { LedgerConnector } from '../../src/connectors';

describe('LedgerConnector', () => {
  let connector: LedgerConnector;
  beforeEach(() => {
    connector = new LedgerConnector(Alfajores, 0, CeloContract.GoldToken);
  });

  it('remembers info in localStorage', () => {
    expect(localStorage.getItem(localStorageKeys.lastUsedFeeCurrency)).toEqual(
      null
    );

    expect(localStorage.getItem(localStorageKeys.lastUsedWalletType)).toEqual(
      WalletTypes.Ledger
    );

    expect(
      localStorage.getItem(localStorageKeys.lastUsedWalletArguments)
    ).toEqual('[0]');

    expect(localStorage.getItem(localStorageKeys.lastUsedNetwork)).toEqual(
      'Alfajores'
    );
  });

  describe('close()', () => {
    it('clears out localStorage', () => {
      connector.close();

      expect(
        localStorage.getItem(localStorageKeys.lastUsedFeeCurrency)
      ).toEqual(null);

      expect(
        localStorage.getItem(localStorageKeys.lastUsedWalletArguments)
      ).toEqual(null);

      expect(localStorage.getItem(localStorageKeys.lastUsedNetwork)).toEqual(
        null
      );
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
