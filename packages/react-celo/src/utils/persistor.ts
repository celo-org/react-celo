import {
  AbstractConnector,
  ConnectorEvents,
  ConnectorParams,
} from '../connectors/common';
import { localStorageKeys } from '../constants';
import { clearPreviousConfig, setTypedStorageKey } from './local-storage';

type Updater = (connector: AbstractConnector) => void;

const persistor: Updater = (connector: AbstractConnector) => {
  connector.on(ConnectorEvents.ADDRESS_CHANGED, (address) => {
    setTypedStorageKey(localStorageKeys.lastUsedAddress, address);
  });
  // This might not be needed since we tend to just recreated connectors when network switches
  connector.on(ConnectorEvents.NETWORK_CHANGED, (networkName) => {
    setTypedStorageKey(localStorageKeys.lastUsedNetwork, networkName);
  });
  connector.on(ConnectorEvents.CONNECTED, (params: ConnectorParams) => {
    setTypedStorageKey(localStorageKeys.lastUsedNetwork, params.networkName);
    setTypedStorageKey(localStorageKeys.lastUsedWalletType, params.walletType);
    setTypedStorageKey(localStorageKeys.lastUsedAddress, params.address);

    if (params.index) {
      setTypedStorageKey(localStorageKeys.lastUsedIndex, params.index);
    }
    if (params.privateKey) {
      setTypedStorageKey(
        localStorageKeys.lastUsedPrivateKey,
        params.privateKey
      );
    }

    if (params.walletId) {
      setTypedStorageKey(localStorageKeys.lastUsedWalletId, params.walletId);
    }
  });

  connector.on(ConnectorEvents.DISCONNECTED, () => {
    clearPreviousConfig();
  });
};

export default persistor;
