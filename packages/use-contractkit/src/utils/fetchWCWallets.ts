import fetch from 'isomorphic-fetch';
import { isMobile } from 'react-device-detect';

import { AppRegistry, ChainId, WalletEntry, WalletEntryLogos } from '../types';

const WALLETCONNECT_REGISTRY_WALLETS_URL =
  'https://raw.githubusercontent.com/WalletConnect/walletconnect-registry/production/public/data/wallets.json';
const LOGO_BASE_URL =
  'https://raw.githubusercontent.com/WalletConnect/walletconnect-registry/production/public/logo';

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

export async function preloadLogos(wallet: WalletEntry): Promise<void> {
  if (typeof window === 'undefined') return;

  const sizesToPreload = isMobile ? ['sm'] : ['md', 'lg'];

  await Promise.all<void>(
    Object.entries(wallet.logos)
      .filter(([size, _]) => sizesToPreload.includes(size))
      .map(([_, logoUrl]: [string, string]) => {
        const image = new Image();
        const promise = new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject();
        });

        image.src = logoUrl;
        return promise;
      })
  );
}

export default async function fetchWCWallets(): Promise<WalletEntry[]> {
  if (CACHE.wallets && CACHE.ts !== null && Date.now() - MINUTE <= CACHE.ts) {
    return CACHE.wallets;
  }
  const appRegistry: WalletEntry[] = await fetch(
    WALLETCONNECT_REGISTRY_WALLETS_URL
  )
    .then((r) => r.json())
    .catch((err) => {
      console.log(err);

      // NOTE: nextjs doesn't allow to write an import with a variable so the
      // magic string needs to stay.
      return import('@walletconnect/registry/public/data/wallets.json');
    })
    .then((apps: AppRegistry) => Object.values(apps));

  const celoWallets = appRegistry.filter(
    (app) => app?.chains && app.chains.includes(`eip155:${ChainId.Mainnet}`)
  );

  celoWallets.forEach((wallet) => {
    const mobileFriendly = Object.values(wallet.mobile).some(Boolean);
    const browserFriendly = Boolean(wallet.app.browser);
    const mobileOnly = !browserFriendly && mobileFriendly;
    const browserOnly = browserFriendly && !mobileFriendly;

    // NOTE: makeLogos still points to the github registry
    // even if the initial fetch failed. This is because I think a
    // missing image is acceptable, while adding _all_ images from the registry
    // into the bundle isn't.
    wallet.logos = makeLogos(wallet.id);
    wallet.responsive = {
      mobileFriendly,
      browserFriendly,
      mobileOnly,
      browserOnly,
    };
    void preloadLogos(wallet);
  });

  CACHE.ts = Date.now();
  CACHE.wallets = celoWallets;

  return celoWallets;
}
