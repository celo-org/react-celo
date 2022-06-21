import { CeloContract, CeloTokenContract } from '@celo/contractkit/lib/base';
import { useEffect } from 'react';

import { localStorageKeys } from '../constants';
import { Maybe } from '../types';
import { getTypedStorageKey } from './local-storage';

export function loadPreviousState(): {
  address: string | null;
  networkName: string | null;
  feeCurrency: CeloTokenContract;
} {
  const address = getTypedStorageKey(localStorageKeys.lastUsedAddress);
  const networkName = getTypedStorageKey(localStorageKeys.lastUsedNetwork);

  const localLastUsedFeeCurrency = getTypedStorageKey(
    localStorageKeys.lastUsedFeeCurrency
  );

  const feeCurrency = isValidFeeCurrency(localLastUsedFeeCurrency)
    ? (localLastUsedFeeCurrency as CeloTokenContract)
    : CeloContract.GoldToken;

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

export function useFixedBody(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPadding = document.body.style.paddingRight;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPadding;
      };
    }
  }, [isOpen]);
}
