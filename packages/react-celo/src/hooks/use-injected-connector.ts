import { useCallback, useEffect } from 'react';

import { InjectedConnector, MetaMaskConnector } from '../connectors';
import { Connector, Dapp, Maybe, Network } from '../types';
import { useCeloInternal } from '../use-celo';
import { getApplicationLogger } from '../utils/logger';
import { CeloTokens } from '../utils/metamask';

export function useInjectedConnector(
  onSubmit: (connector: Connector) => void,
  isMetaMask: boolean
): UseInjectedConnector {
  const {
    network,
    manualNetworkMode,
    feeCurrency,
    initConnector,
    initError: error,
    dapp,
    kit,
  } = useCeloInternal();

  useEffect(() => {
    let stale;
    void (async () => {
      const connector = isMetaMask
        ? new MetaMaskConnector(network, manualNetworkMode, feeCurrency)
        : new InjectedConnector(network, manualNetworkMode, feeCurrency);

      try {
        await initConnector(connector);
        if (!stale) {
          onSubmit(connector);
        }
      } catch (e) {
        getApplicationLogger().error('[useMetaMaskConnector]', e);
      }
    })();

    return () => {
      stale = true;
    };
  }, [
    initConnector,
    network,
    onSubmit,
    isMetaMask,
    feeCurrency,
    manualNetworkMode,
  ]);

  const getTokens = useCallback(async (): Promise<CeloTokens> => {
    return kit.celoTokens.getWrappers() as Promise<CeloTokens>;
  }, [kit]);

  return { error, dapp, network, getTokens };
}

export interface UseInjectedConnector {
  error: Maybe<Error>;
  network: Network;
  dapp: Dapp;
  getTokens: () => Promise<CeloTokens>;
}
