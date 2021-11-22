import fetch from 'isomorphic-fetch';

import { ChainId } from '../types';

export interface AppEntryLogos {
  sm: string;
  md: string;
  lg: string;
}
export interface AppEntry {
  id: string;
  name: string;
  description: string;
  homepage: string;
  chains: string[];
  versions: string[];
  logos: AppEntryLogos;
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
const LOGO_BASE_URL =
  'https://raw.githubusercontent.com/WalletConnect/walletconnect-registry/master/public/logo';

const makeLogos = (id: string): AppEntryLogos => ({
  sm: `${LOGO_BASE_URL}/sm/${id}.jpeg`,
  md: `${LOGO_BASE_URL}/md/${id}.jpeg`,
  lg: `${LOGO_BASE_URL}/lg/${id}.jpeg`,
});

const CACHE: { ts: number | null; wallets: AppEntry[] | null } = {
  ts: null,
  wallets: null,
};
const MINUTE = 60 * 1_000;

export default async function fetchWCWallets(): Promise<AppEntry[]> {
  if (CACHE.wallets && CACHE.ts !== null && Date.now() - MINUTE <= CACHE.ts) {
    return CACHE.wallets;
  }

  const appRegistry = await Promise.all(
    [
      fetch(WALLETCONNECT_REGISTRY_WALLETS_URL),
      fetch(WALLETCONNECT_REGISTRY_DAPPS_URL),
    ].map((_) => _.then((r) => r.json() as Promise<AppRegistry>))
  ).then((_) =>
    _.reduce((acc, apps) => acc.concat(Object.values(apps)), [] as AppEntry[])
  );

  const celoApps = appRegistry.filter((app) =>
    app?.chains?.includes(`eip155:${ChainId.Mainnet}`)
  );

  celoApps.forEach((app) => {
    app.logos = makeLogos(app.id);
  });

  CACHE.ts = Date.now();
  CACHE.wallets = celoApps;

  return celoApps;
}
