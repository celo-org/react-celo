import fetch from 'isomorphic-fetch';

import { ChainId } from '..';
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

export type AppRegistry = Record<string, AppEntry>;

const WALLETCONNECT_REGISTRY_WALLETS_URL =
  'https://raw.githubusercontent.com/WalletConnect/walletconnect-registry/master/public/data/wallets.json';
const WALLETCONNECT_REGISTRY_DAPPS_URL =
  'https://raw.githubusercontent.com/WalletConnect/walletconnect-registry/master/public/data/dapps.json';

export default async function fetchWCWallets(): Promise<AppEntry[]> {
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
