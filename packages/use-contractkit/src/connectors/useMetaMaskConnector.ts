import { useEffect } from 'react';

import { Connector, Dapp, Network } from '../types';
import { useContractKitInternal } from '../use-contractkit';
import { MetaMaskConnector } from './connectors';

export function useMetaMaskConnector(
  onSubmit: (connector: Connector) => void
): UseMetaMaskConnector {
  const {
    network,
    feeCurrency,
    initConnector,
    initError: error,
    dapp,
  } = useContractKitInternal();

  useEffect(() => {
    let stale;
    void (async () => {
      const connector = new MetaMaskConnector(network, feeCurrency);
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
  }, [initConnector, network, onSubmit, feeCurrency]);

  return { error, dapp, network };
}

interface UseMetaMaskConnector {
  error: Error | null;
  network: Network;
  dapp: Dapp;
}
