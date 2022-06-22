import { CeloContract, CeloTokenContract } from '@celo/contractkit/lib/base';

import { localStorageKeys } from '../constants';
import { Maybe } from '../types';
import { getTypedStorageKey } from './local-storage';

export function loadPreviousState(): {
  address: string | null;
  networkName: string | null;
  feeCurrency: CeloTokenContract | null;
} {
  const address = getTypedStorageKey(localStorageKeys.lastUsedAddress);
  const networkName = getTypedStorageKey(localStorageKeys.lastUsedNetwork);

  const localLastUsedFeeCurrency = getTypedStorageKey(
    localStorageKeys.lastUsedFeeCurrency
  );

  const feeCurrency = isValidFeeCurrency(localLastUsedFeeCurrency)
    ? (localLastUsedFeeCurrency as CeloTokenContract)
    : null;

  return {
    address,
    networkName,
    feeCurrency,
  };
}

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
