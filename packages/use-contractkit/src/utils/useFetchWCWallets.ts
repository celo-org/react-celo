import { useEffect, useState } from 'react';

import { WalletEntry } from '../types';
import fetchWCWallets from './fetchWCWallets';

export function useFetchWCWallets(): WalletEntry[] {
  const [wallets, setWallets] = useState<WalletEntry[]>([]);

  useEffect(() => {
    void fetchWCWallets().then((celoWallets) => {
      setWallets(celoWallets);
    });
  }, []);

  return wallets;
}
