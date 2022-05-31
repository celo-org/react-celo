import { CeloContract } from '@celo/contractkit';

import { Alfajores, WalletTypes } from '../../src';
import { LedgerConnector } from '../../src/connectors';
import {
  getLastUsedFeeCurrency,
  getLastUsedNetwork,
  getLastUsedWalletArgs,
  getLastUsedWalletType,
} from '../../src/utils/localStorage';

describe('LedgerConnector', () => {
  let connector: LedgerConnector;
  beforeEach(() => {
    connector = new LedgerConnector(Alfajores, 0, CeloContract.GoldToken);
  });

  it('remembers info in localStorage', () => {
    expect(getLastUsedFeeCurrency()).toEqual(null);

    expect(getLastUsedWalletType()).toEqual(WalletTypes.Ledger);

    expect(getLastUsedWalletArgs()).toEqual([0]);

    expect(getLastUsedNetwork()).toEqual('Alfajores');
  });

  describe('close()', () => {
    it('clears out localStorage', () => {
      connector.close();

      expect(getLastUsedFeeCurrency()).toEqual(null);

      expect(getLastUsedWalletArgs()).toEqual(null);

      expect(getLastUsedNetwork()).toEqual(null);
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
