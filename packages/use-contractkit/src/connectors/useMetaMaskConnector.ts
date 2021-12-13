import { useEffect } from 'react';

import { Connector, Dapp, Network } from '../types';
import { useContractKitInternal } from '../use-contractkit';
import { InjectedConnector } from '.';
import { MetaMaskConnector } from './connectors';

export function useInjectedConnector(
  onSubmit: (connector: Connector) => void,
  isMetamask: boolean
): UseInjectedConnector {
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
      const connector = isMetamask
        ? new MetaMaskConnector(network, feeCurrency)
        : new InjectedConnector(network, feeCurrency);

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
  }, [initConnector, network, onSubmit, isMetamask, feeCurrency]);

  return { error, dapp, network };
}
export interface UseInjectedConnector {
  error: Error | null;
  network: Network;
  dapp: Dapp;
}
