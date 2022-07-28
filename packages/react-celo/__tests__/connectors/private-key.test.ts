import { CeloContract } from '@celo/contractkit';

import { Alfajores, WalletTypes } from '../../src';
import { ConnectorEvents } from '../../src/connectors/common';
import PrivateKeyConnector from '../../src/connectors/private-key';
import { setApplicationLogger } from '../../src/utils/logger';
import { mockLogger } from '../test-logger';

const TEST_KEY =
  '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abbdef';

describe('PrivateKeyConnector', () => {
  let connector: PrivateKeyConnector;
  beforeAll(() => setApplicationLogger(mockLogger));
  describe('initialise()', () => {
    const onConnect = jest.fn();
    beforeEach(async () => {
      connector = new PrivateKeyConnector(
        Alfajores,
        TEST_KEY,
        CeloContract.StableTokenEUR
      );
      connector.on(ConnectorEvents.CONNECTED, onConnect);
      await connector.initialise();
    });
    it('sets the account', () => {
      expect(connector.account).toEqual(
        '0x6df18c5837718a83581ead5e26bfcdb8a548e409'
      );
    });

    it('sets and uses the fee currency', () => {
      expect(connector.feeCurrency).toEqual(CeloContract.StableTokenEUR);
    });

    it('emits CONNECTED event with needed params', () => {
      expect(onConnect).toBeCalledWith({
        networkName: Alfajores.name,
        walletType: WalletTypes.PrivateKey,
        address: '0x6df18c5837718a83581ead5e26bfcdb8a548e409',
      });
    });
  });

  // it.skip('does not need to support ADDRESS CHANGE');

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

    it('emits DISCONNECTED event', () => {
      connector.close();
      expect(onDisconnect).toBeCalled();
    });
  });
  describe('updateFeeCurrency', () => {
    it('sets fee currency and in fact uses it', async () => {
      connector = new PrivateKeyConnector(
        Alfajores,
        TEST_KEY,
        CeloContract.StableTokenEUR
      );
      await connector.initialise();
      expect(connector.kit.connection.defaultFeeCurrency).toEqual(
        '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F'
      );
      await connector.updateFeeCurrency(CeloContract.StableTokenBRL);

      expect(connector.feeCurrency).toEqual(CeloContract.StableTokenBRL);

      expect(connector.kit.connection.defaultFeeCurrency).toEqual(
        '0xE4D517785D091D3c54818832dB6094bcc2744545'
      );
    });
  });
});
