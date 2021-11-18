import { useEffect, useState } from 'react';

import { ChainId, WalletIds } from '..';

export interface AppEntry {
  id: string;
  name: string;
  description: string;
  homepage: string;
  chains: string[];
  versions: string[];
  app: {
    browser: string;
    ios: string;
    android: string;
    mac: string;
    windows: string;
    linux: string;
  };
  mobile: {
    native: string;
    universal: string;
  };
  desktop: {
    native: string;
    universal: string;
  };
  metadata: {
    shortName: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
}

export interface AppRegistry {
  [id: string]: AppEntry;
}

const WALLETCONNECT_REGISTRY_WALLETS_URL =
  'https://raw.githubusercontent.com/WalletConnect/walletconnect-registry/master/public/data/wallets.json';
const WALLETCONNECT_REGISTRY_DAPPS_URL =
  'https://raw.githubusercontent.com/WalletConnect/walletconnect-registry/master/public/data/dapps.json';

export async function fetchWallets(): Promise<AppEntry[]> {
  const appRegistry = await Promise.all(
    [
      fetch(WALLETCONNECT_REGISTRY_WALLETS_URL),
      fetch(WALLETCONNECT_REGISTRY_DAPPS_URL),
    ].map((_) => _.then((r) => r.json() as Promise<AppRegistry>))
  ).then((_) =>
    _.reduce((acc, apps) => acc.concat(Object.values(apps)), [] as AppEntry[])
  );

  return appRegistry.filter((Wallet) =>
    Wallet?.chains?.includes(`eip155:${ChainId.Mainnet}`)
  );
}

const VERSION_OVERRIDE: { [x: string]: number } = Object.freeze({
  [WalletIds.Valora]: 1,
  [WalletIds.CeloWallet]: 2,
  [WalletIds.CeloTerminal]: 2,
  [WalletIds.CeloDance]: 2,
});

export function useWalletVersion(walletId?: WalletIds): number | null {
  // TODO: decide if to use v1 or v2 as a default for unknown wallectconnect? Or if to expose both
  const [version, setVersion] = useState<number | null>(walletId ? null : 2);

  useEffect(() => {
    if (!walletId) {
      return;
    }

    void fetchWallets().then((celoWallets) => {
      const wallet = celoWallets.find((appEntry) => appEntry.id === walletId);
      if (wallet) {
        const versionFromRegistry = Math.max(
          ...wallet.versions.map((_) => parseInt(_, 10))
        );

        if (
          VERSION_OVERRIDE[walletId] &&
          VERSION_OVERRIDE[walletId] !== versionFromRegistry
        ) {
          console.warn(
            `Override version found in registry(${versionFromRegistry}) by hard-coded version(${VERSION_OVERRIDE[walletId]}) for ${wallet.name}`
          );
          setVersion(VERSION_OVERRIDE[walletId]);
        } else {
          setVersion(versionFromRegistry);
        }
      } else if (!VERSION_OVERRIDE[walletId]) {
        throw new Error('Unknown wallectconnect wallet');
      }
    });
  }, [walletId]);

  return version;
}
