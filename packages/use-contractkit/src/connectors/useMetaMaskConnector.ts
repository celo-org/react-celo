import { useEffect } from 'react';

import { Connector, Dapp, Network } from '../types';
import { useInternalContractKit } from '../use-contractkit';
import { MetaMaskConnector } from './connectors';

export function useMetaMaskConnector(
  onSubmit: (connector: Connector) => void
): UseMetaMaskConnector {
  const {
    network,
    initConnector,
    initError: error,
    dapp,
  } = useInternalContractKit();

  useEffect(() => {
    let stale;
    void (async () => {
      const connector = new MetaMaskConnector(network);
      const { error } = await initConnector(connector);
      if (error) console.log('got an error');
      if (!error && !stale) {
        onSubmit(connector);
      }
    })();

    return () => {
      stale = true;
    };
  }, [initConnector, network, onSubmit]);

  return { error, dapp, network };
}

interface UseMetaMaskConnector {
  error: Error | null;
  network: Network;
  dapp: Dapp;
}
