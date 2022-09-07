import { ConnectorEvents, ConnectorParams } from '../connectors/common';
import { localStorageKeys } from '../constants';
import { Connector } from '../types';
import {
  clearPreviousConfig,
  rememberWallet,
  setTypedStorageKey,
} from './local-storage';

type Updater = (connector: Connector) => void;

const persistor: Updater = (connector: Connector) => {
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

    if (params.walletId) {
      setTypedStorageKey(localStorageKeys.lastUsedWalletId, params.walletId);
    }
    rememberWallet(params.walletType, params.walletId);
  });

  connector.on(ConnectorEvents.DISCONNECTED, () => {
    clearPreviousConfig();
  });
};

export default persistor;
