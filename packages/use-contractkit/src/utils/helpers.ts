import { CeloContract, CeloTokenContract } from '@celo/contractkit';

import { CONNECTOR_TYPES, UnauthenticatedConnector } from '../connectors';
import { localStorageKeys, NetworkNames, WalletTypes } from '../constants';
import { Connector, Network } from '../types';
import localStorage from './localStorage';

export const loadPreviousConfig = (
  defaultNetworkProp: Network,
  defaultFeeCurrencyProp: CeloTokenContract,
  networks: Network[]
): {
  address: string | null;
  network: Network | null;
  connector: Connector;
  feeCurrency: CeloTokenContract | null;
} => {
  let lastUsedNetworkName: NetworkNames = defaultNetworkProp.name;
  let lastUsedAddress: string | null = null;
  let lastUsedWalletType: WalletTypes = WalletTypes.Unauthenticated;
  let lastUsedWalletArguments: unknown[] = [];
  let lastUsedFeeCurrency: CeloContract = defaultFeeCurrencyProp;
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

    const localLastUsedFeeCurrency = localStorage.getItem(
      localStorageKeys.lastUsedFeeCurrency
    );

    if (isValidFeeCurrency(localLastUsedFeeCurrency)) {
      lastUsedFeeCurrency = localLastUsedFeeCurrency as CeloTokenContract;
    }
  }

  const lastUsedNetwork = networks.find((n) => n.name === lastUsedNetworkName);

  let initialConnector: Connector;
  if (lastUsedWalletType && lastUsedNetwork) {
    try {
      initialConnector = new CONNECTOR_TYPES[lastUsedWalletType](
        lastUsedNetwork,
        lastUsedFeeCurrency,
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
    feeCurrency: lastUsedFeeCurrency,
  };
};

export function clearPreviousConfig(): void {
  Object.values(localStorageKeys).forEach((val) =>
    localStorage.removeItem(val)
  );
}

export function isValidFeeCurrency(currency: string | null): boolean {
  switch (currency) {
    case CeloContract.GoldToken:
    case CeloContract.StableToken:
    case CeloContract.StableTokenEUR:
    case CeloContract.StableTokenBRL:
      return true;
    default:
      return false;
  }
}
