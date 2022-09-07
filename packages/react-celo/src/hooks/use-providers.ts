import { useMemo } from 'react';
import { isMobile } from 'react-device-detect';

import {
  Platform,
  Priorities,
  PROVIDERS,
  SupportedProviders,
  WalletTypes,
} from '../constants';
import { Provider, WalletConnectProvider, WalletEntry } from '../types';
import { getRecentWallets } from '../utils/local-storage';
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

export function getRecent(): { ids: Set<string>; providers: Provider[] } {
  const listOfRecentWalletTypeIds = getRecentWallets();

  // create mapping by the identifier we saved so its easy to get the recent provider from the id
  const providersByTypeId = Object.values(PROVIDERS).reduce(
    (collection, current) => {
      const unifiedID =
        current.type === WalletTypes.WalletConnect
          ? `${(current as WalletConnectProvider).type}:${
              (current as WalletConnectProvider).walletConnectId
            }`
          : current.type;
      collection.set(unifiedID as string, current);
      return collection;
    },
    new Map<string, Provider>()
  );

  // map over type-ids and get the actual provider
  const recentProviders = listOfRecentWalletTypeIds
    .map((unifiedID) => {
      const provider = providersByTypeId.get(unifiedID);
      return provider;
    })
    .filter((p) => p !== undefined);

  return {
    providers: recentProviders as Provider[],
    // return as a set to make it easy to filter these out of the default list
    ids: new Set(listOfRecentWalletTypeIds),
  };
}

export default function useProviders(
  wallets: WalletEntry[] = [],
  includedDefaultProviders: SupportedProviders[],
  sort = defaultProviderSort,
  search?: string
): [
  priority: Priorities,
  entry: [providerKey: string, provider: Provider][]
][] {
  const record: Record<string, Provider> = useMemo(
    () => ({
      ...includedDefaultProviders.reduce((all, current) => {
        all[current] = PROVIDERS[current];
        return all;
      }, {} as Record<SupportedProviders, Provider>),

      ...wallets.reduce((acc, wallet) => {
        acc[wallet.id] = walletToProvider(wallet);
        return acc;
      }, {} as Record<string, Provider>),
    }),
    [wallets, includedDefaultProviders]
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

  const recentlyUsedProviders = getRecent();
  if (recentlyUsedProviders.ids.size !== 0) {
    const recent = recentlyUsedProviders.providers.map((provider) => {
      return [provider.name, provider] as [string, Provider];
    });
    const rest = providers.filter(([_, provider]) => {
      const unifiedID =
        provider.type === WalletTypes.WalletConnect
          ? `${(provider as WalletConnectProvider).type}:${
              (provider as WalletConnectProvider).walletConnectId
            }`
          : (provider.type as string);
      return !recentlyUsedProviders.ids.has(unifiedID);
    });

    return [
      [Priorities.Recent, recent],
      [Priorities.Default, rest],
    ];
  }

  return [[Priorities.Default, providers]];
}
