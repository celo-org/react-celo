import { CeloContract } from '@celo/contractkit';

import { Alfajores, localStorageKeys, WalletTypes } from '../../src';
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
    const onConnect = jest.fn();
    beforeEach(() => {
      connector = new PrivateKeyConnector(
        Alfajores,
        TEST_KEY,
        CeloContract.StableTokenEUR
      );
      connector.on(ConnectorEvents.CONNECTED, onConnect);
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

    it('emits CONNECTED event with needed params', async () => {
      await connector.initialise();
      expect(onConnect).toBeCalledWith({
        networkName: Alfajores.name,
        walletType: WalletTypes.PrivateKey,
        address: '0x6df18c5837718a83581ead5e26bfcdb8a548e409',
      });
    });
  });

  describe('close()', () => {
    const onDisconnect = jest.fn();
    beforeEach(() => {
      connector = new PrivateKeyConnector(
        Alfajores,
        TEST_KEY,
        CeloContract.StableTokenEUR
      );
      connector.on(ConnectorEvents.DISCONNECTED, onDisconnect);
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
