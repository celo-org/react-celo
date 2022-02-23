import { GoldTokenWrapper } from '@celo/contractkit/lib/wrappers/GoldTokenWrapper';
import { StableTokenWrapper } from '@celo/contractkit/lib/wrappers/StableTokenWrapper';
import { useCallback, useEffect } from 'react';

import { Connector, Dapp, Network } from '../types';
import { useContractKitInternal } from '../use-contractkit';
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
        ? new MetaMaskConnector(network)
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

  const getTokens = useCallback(async (): Promise<Tokens> => {
    return kit.celoTokens.getWrappers() as Promise<Tokens>;
  }, [kit]);

  return { error, dapp, network, getTokens };
}
interface Tokens {
  CELO: GoldTokenWrapper;
  cUSD: StableTokenWrapper;
  cEUR: StableTokenWrapper;
}
export interface UseInjectedConnector {
  error: Error | null;
  network: Network;
  dapp: Dapp;
  getTokens: () => Promise<Tokens>;
}
