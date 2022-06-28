import { useMemo } from 'react';
import { isMobile } from 'react-device-detect';

import {
  localStorageKeys,
  Platform,
  Priorities,
  PROVIDERS,
  WalletTypes,
} from '../constants';
import { Maybe, Provider, WalletConnectProvider, WalletEntry } from '../types';
import { getTypedStorageKey } from '../utils/local-storage';
import { defaultProviderSort } from '../utils/sort';

export function walletToProvider(wallet: WalletEntry): WalletConnectProvider {
  return {
    name: wallet.name,
    walletConnectId: wallet.id,
    type: WalletTypes.WalletConnect,
    description: wallet.description || 'Missing description in registry',
    icon: wallet.logos.md,
    canConnect: () => true,
    showInList: () =>
      isMobile ? Object.values(wallet.mobile).some(Boolean) : true,
    listPriority: () => Priorities.Default,
    installURL: wallet.homepage,
    supportedPlatforms: [Platform.Mobile],
  };
}

export function getRecent(): Maybe<Provider> {
  const type = getTypedStorageKey(localStorageKeys.lastUsedWalletType);
  const id = getTypedStorageKey(localStorageKeys.lastUsedWalletId);
  let provider: Maybe<Provider>;

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
): [
  priority: Priorities,
  entry: [providerKey: string, provider: Provider][]
][] {
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
    return Object.entries(record)
      .filter(
        ([providerKey, provider]) =>
          provider.showInList() &&
          (!search || providerKey.toLowerCase().includes(search.toLowerCase()))
      )
      .sort(([, a], [, b]) => sort(a, b));
  }, [record, sort, search]);

  if (!providers.length) {
    return [];
  }

  const recentlyUsedProvider = getRecent();
  if (recentlyUsedProvider) {
    const index = providers.findIndex(
      ([providerKey]) => providerKey === recentlyUsedProvider.name
    );

    if (index > -1) {
      return [
        [
          Priorities.Recent,
          [[recentlyUsedProvider.name, recentlyUsedProvider]],
        ],
        [Priorities.Default, providers.filter((_, i) => index !== i)],
      ];
    }
  }

  return [[Priorities.Default, providers]];
}
