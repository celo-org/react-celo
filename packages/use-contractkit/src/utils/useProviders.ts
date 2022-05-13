import { useMemo } from 'react';
import { isMobile } from 'react-device-detect';

import {
  localStorageKeys,
  Priorities,
  PROVIDERS,
  WalletTypes,
} from '../constants';
import { Maybe, Provider, WalletConnectProvider, WalletEntry } from '../types';
import localStorage from './localStorage';
import { defaultProviderSort } from './sort';

export function walletToProvider(wallet: WalletEntry): WalletConnectProvider {
  return {
    name: wallet.name,
    type: WalletTypes.WalletConnect,
    description: wallet.description || 'Missing description in registry',
    icon: wallet.logos.md,
    canConnect: () => true,
    showInList: () =>
      isMobile ? Object.values(wallet.mobile).some(Boolean) : true,
    listPriority: () => 0,
    installURL: wallet.homepage,
  };
}

export function getRecent(): Maybe<Provider> {
  const type = localStorage.getItem(localStorageKeys.lastUsedWalletType);
  const id = localStorage.getItem(localStorageKeys.lastUsedWalletId);
  let provider;

  if (id && WalletTypes.WalletConnect === type) {
    provider = Object.values(PROVIDERS).find(
      (p) => (p as WalletConnectProvider).walletConnectId === id
    );
  } else {
    provider = Object.values(PROVIDERS).find((p) => p.type === type);
  }

  if (provider) return provider;
  return null;
}

export default function useProviders(
  wallets: WalletEntry[] = [],
  sort = defaultProviderSort,
  search?: string
) {
  const record: Record<string, Provider> = useMemo(
    () => ({
      ...PROVIDERS,
      ...wallets.reduce((acc, wallet) => {
        acc[wallet.id] = walletToProvider(wallet);
        return acc;
      }, {} as Record<string, Provider>),
    }),
    [wallets]
  );

  const providers = useMemo<[providerKey: string, provider: Provider][]>(() => {
    let _record = Object.entries(record);
    if (search) {
      _record = _record.filter(([providerKey, _]) =>
        providerKey.toLowerCase().includes(search.toLowerCase())
      );
    }

    return _record
      .filter(
        ([_, provider]) =>
          typeof window !== 'undefined' && provider.showInList()
      )
      .sort(([, a], [, b]) => sort(a, b));
  }, [record, sort, search]);

  const recentlyUsedProvider = getRecent();
  const prioritizedProviders = useMemo(() => {
    const map = providers.reduce((acc, [providerKey, provider]) => {
      const priority =
        recentlyUsedProvider && recentlyUsedProvider.name === provider.name
          ? Priorities.Recent
          : Priorities.Default;

      if (!acc.has(priority)) {
        acc.set(priority, []);
      }

      acc.get(priority)?.push([providerKey, provider]);
      return acc;
    }, new Map<Priorities, [providerKey: string, provider: Provider][]>());

    return [...map.entries()].sort(([prioA], [prioB]) => prioB - prioA);
  }, [recentlyUsedProvider, providers]);

  return prioritizedProviders;
}
