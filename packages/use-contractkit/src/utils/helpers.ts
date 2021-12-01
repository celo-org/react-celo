import { CONNECTOR_TYPES, UnauthenticatedConnector } from '../connectors';
import {
  DEFAULT_NETWORKS,
  localStorageKeys,
  NetworkNames,
  WalletTypes,
} from '../constants';
import { Connector, Network } from '../types';

export const loadPreviousConfig = (
  defaultNetworkProp: Network
): {
  address: string | null;
  network: Network | null;
  connector: Connector;
} => {
  let lastUsedNetworkName: NetworkNames = defaultNetworkProp.name;
  let lastUsedAddress: string | null = null;
  let lastUsedWalletType: WalletTypes = WalletTypes.Unauthenticated;
  let lastUsedWalletArguments: unknown[] = [];
  if (typeof localStorage !== 'undefined') {
    const localLastUsedNetworkName = localStorage.getItem(
      localStorageKeys.lastUsedNetwork
    );
    if (localLastUsedNetworkName) {
      lastUsedNetworkName = localLastUsedNetworkName as NetworkNames;
    }

    lastUsedAddress = localStorage.getItem(localStorageKeys.lastUsedAddress);

    const localLastUsedWalletType = localStorage.getItem(
      localStorageKeys.lastUsedWalletType
    );
    if (localLastUsedWalletType && localLastUsedWalletType in WalletTypes) {
      lastUsedWalletType = localLastUsedWalletType as WalletTypes;
    }

    const localLastUsedWalletArguments = localStorage.getItem(
      localStorageKeys.lastUsedWalletArguments
    );
    if (localLastUsedWalletArguments) {
      try {
        lastUsedWalletArguments = JSON.parse(
          localLastUsedWalletArguments
        ) as unknown[];
      } catch (e) {
        lastUsedWalletArguments = [];
      }
    }
  }

  const lastUsedNetwork = DEFAULT_NETWORKS.find(
    (n) => n.name === lastUsedNetworkName
  );

  let initialConnector: Connector;
  if (lastUsedWalletType && lastUsedNetwork) {
    try {
      initialConnector = new CONNECTOR_TYPES[lastUsedWalletType](
        lastUsedNetwork,
        ...lastUsedWalletArguments
      );
    } catch (e) {
      initialConnector = new UnauthenticatedConnector(
        lastUsedNetwork || defaultNetworkProp
      );
    }
  } else {
    initialConnector = new UnauthenticatedConnector(
      lastUsedNetwork || defaultNetworkProp
    );
  }

  return {
    address: lastUsedAddress,
    network: lastUsedNetwork || null,
    connector: initialConnector,
  };
};

export function clearPreviousConfig(): void {
  Object.values(localStorageKeys).forEach((val) =>
    localStorage.removeItem(val)
  );
}
