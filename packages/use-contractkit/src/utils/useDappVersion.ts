import { useEffect, useState } from 'react';

import { ChainId } from '..';
import type { Dapp } from '../types';

export type WalletConnectRegistryDapp = {
  app: {
    browser: string | null;
    ios: string | null;
    android: string | null;
    mac: string | null;
    windows: string | null;
  };
  description: string;
  chains: string[];
  desktop: {
    native: string;
    universal: string;
  };
  mobile: {
    native: string;
    universal: string;
  };
  homepage: string;
  id: string;
  metadata: {
    shortName: string;
    colors: Record<string, string>;
  };
  name: string;
  versions: string[];
};
export type WalletConnectRegistry = { [x: string]: WalletConnectRegistryDapp };

const WALLETCONNECT_REGISTRY_URL =
  'https://raw.githubusercontent.com/WalletConnect/walletconnect-registry/production/public/data/dapps.json';

export function useDappVersion(dapp: Dapp): number | null {
  const [version, setVersion] = useState<number | null>(null);
  useEffect(() => {
    async function fetchDapps() {
      const dapps: WalletConnectRegistry = await fetch(
        WALLETCONNECT_REGISTRY_URL
      ).then((_) => _.json() as Promise<WalletConnectRegistry>);

      const celoDApps = Object.values(dapps).filter((dapp) =>
        dapp?.chains?.includes(`eip155:${ChainId.Mainnet}`)
      );
      console.log(dapp, celoDApps);

      // TODO: find the dapp within the dapps and assign the correct version
      setVersion(1);
    }

    void fetchDapps();
  }, [dapp]);

  return version;
}
