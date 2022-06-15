import {
  AbstractConnector,
  ConnectorEvents,
  ConnectorParams,
  EventsMap,
} from '../../src/connectors/common';
import {
  localStorageKeys,
  PROVIDERS,
  WalletIds,
  WalletTypes,
} from '../../src/constants';
import { getRecent } from '../../src/hooks/use-providers';
import { getTypedStorageKey } from '../../src/utils/local-storage';
import persistor from '../../src/utils/persistor';

class ConnectorStub extends AbstractConnector {
  emit<E extends ConnectorEvents>(event: E, args?: EventsMap[E]) {
    super.emit(event, args);
  }
}

describe('Persistor', () => {
  let connector: ConnectorStub;
  beforeEach(() => {
    connector = new ConnectorStub();
    persistor(connector);
  });
  describe(`when connector emits ${ConnectorEvents.ADDRESS_CHANGED}`, () => {
    it('dispatches the new address to Reducer', () => {
      connector.emit(ConnectorEvents.ADDRESS_CHANGED, '0x12312823y471');
      expect(getTypedStorageKey(localStorageKeys.lastUsedAddress)).toEqual(
        '0x12312823y471'
      );
    });
  });
  describe(`when connector emits ${ConnectorEvents.NETWORK_CHANGED}`, () => {
    it('dispatches the new network to Reducer', () => {
      connector.emit(ConnectorEvents.NETWORK_CHANGED, 'Polygon');
      expect(getTypedStorageKey(localStorageKeys.lastUsedNetwork)).toEqual(
        'Polygon'
      );
    });
  });
  describe(`when connector emits ${ConnectorEvents.CONNECTED}`, () => {
    const params: ConnectorParams = {
      walletType: WalletTypes.WalletConnect,
      address: '0x9e81622',
      networkName: 'Celo',
      index: 2,
      privateKey: 'PRIVATE',
      walletId: WalletIds.Steakwallet,
    };
    beforeEach(() => {
      connector.emit(ConnectorEvents.CONNECTED, params);
    });
    it('stores walletType', () => {
      expect(getTypedStorageKey(localStorageKeys.lastUsedWalletType)).toEqual(
        WalletTypes.WalletConnect
      );
    });
    it('stores networkName', () => {
      expect(getTypedStorageKey(localStorageKeys.lastUsedNetwork)).toEqual(
        'Celo'
      );
    });
    it('stores address', () => {
      expect(getTypedStorageKey(localStorageKeys.lastUsedAddress)).toEqual(
        '0x9e81622'
      );
    });

    it('stores index', () => {
      expect(getTypedStorageKey(localStorageKeys.lastUsedIndex)).toEqual(2);
    });

    it('stores PK', () => {
      expect(getTypedStorageKey(localStorageKeys.lastUsedPrivateKey)).toEqual(
        'PRIVATE'
      );
    });
    it('remembers walletID so it can be used to find recently used wallet', () => {
      expect(getTypedStorageKey(localStorageKeys.lastUsedWalletId)).toEqual(
        WalletIds.Steakwallet
      );
      expect(getRecent()).toEqual(PROVIDERS.Steakwallet);
    });
  });
  describe(`when connector emits ${ConnectorEvents.DISCONNECTED}`, () => {
    it('removes data from local storage', () => {
      connector.emit(ConnectorEvents.DISCONNECTED);
    });
  });
});
