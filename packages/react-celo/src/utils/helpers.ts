import { CeloContract, CeloTokenContract } from '@celo/contractkit/lib/base';

import { CONNECTOR_TYPES, UnauthenticatedConnector } from '../connectors';
import { localStorageKeys, WalletTypes } from '../constants';
import { Connector, Maybe, Network } from '../types';
import {
  getLastUsedWalletArgs,
  getTypedStorageKey,
  localStorageAvailable,
} from './localStorage';

export const loadPreviousConfig = (
  defaultNetworkProp: Network,
  networks: Network[]
): {
  address: Maybe<string>;
  network: Maybe<Network>;
  connector: Connector;
} => {
  let lastUsedNetworkName: Maybe<string> = null;
  let lastUsedAddress: Maybe<string> = null;
  let lastUsedWalletType: WalletTypes = WalletTypes.Unauthenticated;
  let lastUsedWalletArguments: unknown[] = [];
  if (localStorageAvailable()) {
    const localLastUsedNetworkName = getTypedStorageKey(
      localStorageKeys.lastUsedNetwork
    );
    if (localLastUsedNetworkName) {
      lastUsedNetworkName = localLastUsedNetworkName;
    }

    lastUsedAddress = getTypedStorageKey(localStorageKeys.lastUsedAddress);

    const localLastUsedWalletType = getTypedStorageKey(
      localStorageKeys.lastUsedWalletType
    );
    if (localLastUsedWalletType && localLastUsedWalletType in WalletTypes) {
      lastUsedWalletType = localLastUsedWalletType;
    }

    lastUsedWalletArguments = getLastUsedWalletArgs() || [];
  }

  const lastUsedNetwork = networks.find((n) => n.name === lastUsedNetworkName);

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

export function isValidFeeCurrency(currency: Maybe<string>): boolean {
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
