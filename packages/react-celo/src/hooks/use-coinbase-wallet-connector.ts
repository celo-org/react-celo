import { useEffect } from 'react';

import { CoinbaseWalletConnector } from '../connectors';
import { Connector, Dapp, Maybe, Network } from '../types';
import { useCeloInternal } from '../use-celo';

export function useCoinbaseWalletConnector(
  onSubmit: (connector: Connector) => void
): UseCoinbaseWalletConnector {
  const {
    network,
    feeCurrency,
    initConnector,
    initError: error,
    dapp,
  } = useCeloInternal();

  useEffect(() => {
    let stale;
    void (async () => {
      const connector = new CoinbaseWalletConnector(network, feeCurrency, dapp);
      try {
        await initConnector(connector);
        if (!stale) {
          onSubmit(connector);
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      stale = true;
    };
  }, [initConnector, network, dapp, onSubmit, feeCurrency]);

  return { error, dapp, network };
}

export interface UseCoinbaseWalletConnector {
  error: Maybe<Error>;
  network: Network;
  dapp: Dapp;
}
