import { useEffect } from 'react';
import { InjectedConnector } from '.';

import { Connector, Dapp, Network } from '../types';
import { useContractKitInternal } from '../use-contractkit';
import { MetaMaskConnector } from './connectors';

export function useInjectedConnector(
  onSubmit: (connector: Connector) => void,
  isMetamask: boolean
): UseInjectedConnector {
  const {
    network,
    initConnector,
    initError: error,
    dapp,
  } = useContractKitInternal();

  useEffect(() => {
    let stale;
    void (async () => {
      const connector = isMetamask
        ? new MetaMaskConnector(network)
        : new InjectedConnector(network);

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
  }, [initConnector, network, onSubmit, isMetamask]);

  return { error, dapp, network };
}
export interface UseInjectedConnector {
  error: Error | null;
  network: Network;
  dapp: Dapp;
}
