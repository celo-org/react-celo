import { CONNECTOR_TYPES, UnauthenticatedConnector } from '../connectors';
import {
  DEFAULT_NETWORKS,
  localStorageKeys,
  Mainnet,
  NetworkNames,
  WalletTypes,
} from '../constants';
import { Connector, Network } from '../types';

export const loadPreviousConfig = (): {
  address: string | null;
  network: Network;
  connector: Connector;
} => {
  let lastUsedNetworkName: NetworkNames = Mainnet.name;
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

  const lastUsedNetwork =
    DEFAULT_NETWORKS.find((n) => n.name === lastUsedNetworkName) ?? Mainnet;

  let initialConnector: Connector;
  if (lastUsedWalletType) {
    try {
      initialConnector = new CONNECTOR_TYPES[lastUsedWalletType](
        lastUsedNetwork,
        ...lastUsedWalletArguments
      );
    } catch (e) {
      initialConnector = new UnauthenticatedConnector(lastUsedNetwork);
    }
  } else {
    initialConnector = new UnauthenticatedConnector(lastUsedNetwork);
  }

  return {
    address: lastUsedAddress,
    network: lastUsedNetwork,
    connector: initialConnector,
  };
};

export function clearPreviousConfig(): void {
  Object.values(localStorageKeys).forEach((val) =>
    localStorage.removeItem(val)
  );
}
