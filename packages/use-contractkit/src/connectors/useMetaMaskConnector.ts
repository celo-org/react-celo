import { useCallback, useEffect } from 'react';

import { Connector, Dapp, Network } from '../types';
import { useContractKitInternal } from '../use-contractkit';
import { CeloTokens } from '../utils/metamask';
import { InjectedConnector, MetaMaskConnector } from './connectors';

export function useInjectedConnector(
  onSubmit: (connector: Connector) => void,
  isMetaMask: boolean
): UseInjectedConnector {
  const {
    network,
    feeCurrency,
    initConnector,
    initError: error,
    dapp,
    kit,
  } = useContractKitInternal();

  useEffect(() => {
    let stale;
    void (async () => {
      const connector = isMetaMask
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
  }, [initConnector, network, onSubmit, isMetaMask, feeCurrency]);

  const getTokens = useCallback(async (): Promise<CeloTokens> => {
    return kit.celoTokens.getWrappers() as Promise<CeloTokens>;
  }, [kit]);

  return { error, dapp, network, getTokens };
}

export interface UseInjectedConnector {
  error: Error | null;
  network: Network;
  dapp: Dapp;
  getTokens: () => Promise<CeloTokens>;
}
