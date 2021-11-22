import fetch from 'isomorphic-fetch';

import { AppRegistry, ChainId, WalletEntry, WalletEntryLogos } from '../types';

// TODO: remove dapps' URL when CeloTerminal is moved into the wallets.json
// https://github.com/WalletConnect/walletconnect-registry/issues/350
const WALLETCONNECT_REGISTRY_DAPPS_URL =
  'https://raw.githubusercontent.com/WalletConnect/walletconnect-registry/master/public/data/dapps.json';
const WALLETCONNECT_REGISTRY_WALLETS_URL =
  'https://raw.githubusercontent.com/WalletConnect/walletconnect-registry/master/public/data/wallets.json';
const LOGO_BASE_URL =
  'https://raw.githubusercontent.com/WalletConnect/walletconnect-registry/master/public/logo';

const makeLogos = (id: string): WalletEntryLogos => ({
  sm: `${LOGO_BASE_URL}/sm/${id}.jpeg`,
  md: `${LOGO_BASE_URL}/md/${id}.jpeg`,
  lg: `${LOGO_BASE_URL}/lg/${id}.jpeg`,
});

const CACHE: { ts: number | null; wallets: WalletEntry[] | null } = {
  ts: null,
  wallets: null,
};
const MINUTE = 60 * 1_000;

export default async function fetchWCWallets(): Promise<WalletEntry[]> {
  if (CACHE.wallets && CACHE.ts !== null && Date.now() - MINUTE <= CACHE.ts) {
    return CACHE.wallets;
  }
  const appRegistry: WalletEntry[] = await Promise.all(
    [
      // TODO: remove dapps' URL when CeloTerminal is moved into the wallets.json
      // https://github.com/WalletConnect/walletconnect-registry/issues/350
      fetch(WALLETCONNECT_REGISTRY_DAPPS_URL),
      fetch(WALLETCONNECT_REGISTRY_WALLETS_URL),
    ].map((_) => _.then((r) => r.json() as Promise<AppRegistry>))
  ).then((_) =>
    _.reduce(
      (acc, apps) => acc.concat(Object.values(apps)),
      [] as WalletEntry[]
    )
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
