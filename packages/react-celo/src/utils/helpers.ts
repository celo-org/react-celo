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
  defaultFeeCurrencyProp: CeloTokenContract,
  networks: Network[]
): {
  address: Maybe<string>;
  network: Maybe<Network>;
  connector: Connector;
  feeCurrency: Maybe<CeloTokenContract>;
} => {
  let lastUsedNetworkName: Maybe<string> = null;
  let lastUsedAddress: Maybe<string> = null;
  let lastUsedWalletType: WalletTypes = WalletTypes.Unauthenticated;
  let lastUsedWalletArguments: unknown[] = [];
  let lastUsedFeeCurrency: CeloContract = defaultFeeCurrencyProp;
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

    const localLastUsedFeeCurrency = getTypedStorageKey(
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
