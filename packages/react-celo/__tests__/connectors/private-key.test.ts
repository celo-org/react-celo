import { CeloContract } from '@celo/contractkit';

import { Alfajores, localStorageKeys } from '../../src';
import { ConnectorEvents, PrivateKeyConnector } from '../../src/connectors';
import {
  getLastUsedWalletArgs,
  getTypedStorageKey,
} from '../../src/utils/local-storage';

const TEST_KEY =
  '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abbdef';

describe('PrivateKeyConnector', () => {
  let connector: PrivateKeyConnector;
  describe('initialise()', () => {
    beforeEach(() => {
      connector = new PrivateKeyConnector(
        Alfajores,
        TEST_KEY,
        CeloContract.StableTokenEUR
      );
    });
    it('sets the account', async () => {
      await connector.initialise();

      expect(connector.account).toEqual(
        '0x6df18c5837718a83581ead5e26bfcdb8a548e409'
      );
    });

    it('sets and uses the fee currency', async () => {
      await connector.initialise();

      expect(connector.feeCurrency).toEqual(CeloContract.StableTokenEUR);
    });

    it('sets the private key in locale storage', () => {
      expect(getLastUsedWalletArgs()).toEqual([TEST_KEY]);
    });

    it('sets the last network in local storage', () => {
      expect(getTypedStorageKey(localStorageKeys.lastUsedNetwork)).toEqual(
        Alfajores.name
      );
    });
  });

  describe('close()', () => {
    beforeEach(() => {
      connector = new PrivateKeyConnector(
        Alfajores,
        TEST_KEY,
        CeloContract.StableTokenEUR
      );
      jest.spyOn(connector, 'emit');
    });
    it('clears out localStorage', async () => {
      await connector.initialise();

      connector.close();

      expect(getTypedStorageKey(localStorageKeys.lastUsedFeeCurrency)).toEqual(
        null
      );

      expect(
        getTypedStorageKey(localStorageKeys.lastUsedWalletArguments)
      ).toEqual(null);

      expect(getTypedStorageKey(localStorageKeys.lastUsedNetwork)).toEqual(
        null
      );
    });

    it('emits DISCONNECTED event', () => {
      connector.close();
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
