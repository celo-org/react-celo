import { useEffect } from 'react';

import { CoinbaseWalletConnector } from '../connectors';
import { Connector, Dapp, Maybe, Network } from '../types';
import { useCeloInternal } from '../use-celo';
import { getApplicationLogger } from '../utils/logger';

export function useCoinbaseWalletConnector(
  onSubmit: (connector: Connector) => void
): UseCoinbaseWalletConnector {
  const {
    network,
    feeCurrency,
    manualNetworkMode,
    initConnector,
    initError: error,
    dapp,
  } = useCeloInternal();

  useEffect(() => {
    let stale;
    void (async () => {
      const connector = new CoinbaseWalletConnector(
        network,
        manualNetworkMode,
        dapp
      );
      try {
        await initConnector(connector);
        if (!stale) {
          onSubmit(connector);
        }
      } catch (e) {
        getApplicationLogger().error('[use-coinbase-wallet-connector]', e);
      }
    })();

    return () => {
      stale = true;
    };
  }, [initConnector, network, dapp, onSubmit, feeCurrency, manualNetworkMode]);

  return { error, dapp, network };
}

export interface UseCoinbaseWalletConnector {
  error: Maybe<Error>;
  network: Network;
  dapp: Dapp;
}
