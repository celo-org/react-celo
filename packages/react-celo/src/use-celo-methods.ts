import { CeloTokenContract } from '@celo/contractkit/lib/base';
import { MiniContractKit } from '@celo/contractkit/lib/mini-kit';
import { useCallback } from 'react';
import { isMobile } from 'react-device-detect';

import { UnauthenticatedConnector } from './connectors';
import { STATIC_NETWORK_WALLETS, WalletTypes } from './constants';
import {
  ContractCacheBuilder,
  useContractsCache,
} from './hooks/use-contracts-cache';
import { Dispatcher } from './react-celo-provider-state';
import { Connector, Network, Theme } from './types';
import { contrastCheck, fixTheme } from './utils/colors';
import { getApplicationLogger } from './utils/logger';
import networkWatcher from './utils/network-watcher';
import persistor from './utils/persistor';
import { updater } from './utils/updater';

interface CeloMethodsInput {
  connector: Connector;
  networks: Network[];
  network: Network;
}

export function useCeloMethods(
  { connector, networks, network }: CeloMethodsInput,
  dispatch: Dispatcher,
  buildContractsCache?: ContractCacheBuilder
): CeloMethods {
  // TODO how to ensure previous connector is disbanded properly. thinking of case of from UnAuthenticated to AnyConnector. then unauth would still need to be closed. (not sure if others could be in that state too)
  const initConnector = useCallback(
    async (nextConnector: Connector) => {
      try {
        // need to set the event listeners here before initialise()
        updater(nextConnector, dispatch);
        persistor(nextConnector);
        networkWatcher(nextConnector, networks);
        const initialisedConnector = await nextConnector.initialise();
        dispatch('initialisedConnector', initialisedConnector);
      } catch (e) {
        if (typeof e === 'symbol') {
          getApplicationLogger().debug(
            '[initConnector]',
            'Ignoring error initializing connector with reason',
            e.description
          );
          throw e;
        }

        getApplicationLogger().error(
          '[initConnector]',
          'Error initializing connector',
          nextConnector.type,
          e
        );

        const error =
          e instanceof Error ? e : new Error('Failed to initialise connector');
        dispatch('setConnectorInitError', error);
        throw e;
      }
    },
    [dispatch, networks]
  );
  const destroy = useCallback(async () => {
    await connector.close();
    const passiveConnector = new UnauthenticatedConnector(network);
    await initConnector(passiveConnector);
  }, [connector, network, initConnector]);

  // This is just to be used to for users to explicitly change
  // the network. It doesn't work for all wallets.
  const updateNetwork = useCallback(
    async (newNetwork: Network) => {
      getApplicationLogger().debug(
        '[updateNetwork]',
        newNetwork,
        connector.type
      );
      if (STATIC_NETWORK_WALLETS.includes(connector.type)) {
        throw new Error(
          "The connected wallet's network must be changed from the wallet."
        );
      }
      await connector.startNetworkChangeFromApp(newNetwork);
    },
    [connector]
  );

  const connect = useCallback(async (): Promise<Connector> => {
    const connectionResultPromise: Promise<Connector | false> = new Promise(
      (resolve) => {
        dispatch('setConnectionCallback', resolve);
      }
    );
    const newConnector = await connectionResultPromise;
    dispatch('setConnectionCallback', null);
    if (newConnector === false) {
      throw new Error('Connection cancelled');
    }
    return newConnector;
  }, [dispatch]);

  const getConnectedKit = useCallback(async (): Promise<MiniContractKit> => {
    let initialisedConnection = connector;
    if (connector.type === WalletTypes.Unauthenticated) {
      initialisedConnection = await connect();
    } else if (!initialisedConnection.initialised) {
      await initConnector(initialisedConnection);
    }

    return initialisedConnection.kit;
  }, [connect, connector, initConnector]);

  const updateFeeCurrency = useCallback(
    async (newFeeCurrency: CeloTokenContract): Promise<void> => {
      try {
        if (connector.supportsFeeCurrency() && connector.updateFeeCurrency) {
          await connector.updateFeeCurrency(newFeeCurrency);
          dispatch('setFeeCurrency', newFeeCurrency);
        }
      } catch (error) {
        getApplicationLogger().warn(
          '[updateFeeCurrency]',
          'updating Fee Currency not supported by this wallet or network',
          error
        );
      }
    },
    [connector, dispatch]
  );

  const updateTheme = useCallback(
    (theme: Theme | null) => {
      if (!theme) return dispatch('setTheme', null);

      if (process.env.NODE_ENV !== 'production') {
        fixTheme(theme);
        contrastCheck(theme);
      }

      dispatch('setTheme', theme);
    },
    [dispatch]
  );

  const performActions = useCallback(
    async (
      ...operations: ((kit: MiniContractKit) => unknown | Promise<unknown>)[]
    ) => {
      const kit = await getConnectedKit();
      dispatch('setPendingActionCount', operations.length);

      const results: unknown[] = [];
      for (const op of operations) {
        try {
          // When on mobile direct user to their wallet app.
          if (isMobile && connector.getDeeplinkUrl) {
            const url = connector.getDeeplinkUrl('');
            if (url) window.open(url, '_blank');
          }
          results.push(await op(kit));
        } catch (e) {
          dispatch('setPendingActionCount', 0);
          throw e;
        }

        dispatch('decrementPendingActionCount');
      }
      return results;
    },
    [getConnectedKit, dispatch, connector]
  );

  const contractsCache = useContractsCache(buildContractsCache, connector);

  const resetInitError = useCallback(() => {
    dispatch('setConnectorInitError', null);
  }, [dispatch]);

  return {
    destroy,
    initConnector,
    resetInitError,
    updateNetwork,
    connect,
    getConnectedKit,
    performActions,
    updateFeeCurrency,
    contractsCache,
    updateTheme,
  };
}

export interface CeloMethods {
  /**
   * `destroy` removes the connection to the wallet from state and from
   * localStorage where it's persisted.
   */
  destroy: () => Promise<void>;
  /**
   * `updateNetwork` changes the network used in the wallet.
   *
   * Note: _not compatible with all wallets_
   */
  updateNetwork: (network: Network, forceUpdate?: boolean) => Promise<void>;
  /**
   * `connect` initiates the connection to a wallet and
   * opens a modal from which the user can choose a
   * wallet to connect to.
   */
  connect: () => Promise<Connector>;
  /**
   * `getConnectedKit` gets the connected instance of MiniContractKit.
   * If the user is not connected, this opens up the connection modal.
   */
  getConnectedKit: () => Promise<MiniContractKit>;
  /**
   * `performActions` is a helper function for handling any interaction with a Celo wallet.
   * Perform action will:
   * - open the action modal
   * - handle multiple transactions in order
   */
  performActions: (
    ...operations: ((kit: MiniContractKit) => unknown | Promise<unknown>)[]
  ) => Promise<unknown[]>;
  /**
   * `updateFeeCurrency` updates the currency that will be used
   * in future transactions.
   *
   * Note: _not compatible with all wallets_
   */
  updateFeeCurrency: (newFeeCurrency: CeloTokenContract) => Promise<void>;

  contractsCache?: unknown;
  /**
   * `updateTheme` programmaticaly updates the theme used in the
   * wallet connection modal. This is useful if you want to give
   * the user the option to change the theme.
   */
  updateTheme: (theme: Theme | null) => void;
  /**
   * @internal
   * resetInitError cleans up the error that occurred
   * when trying to initialize a wallet connector.
   */
  resetInitError: () => void;
  /**
   * @internal
   *
   * `initConnector` is used to initialize a connector
   *  for the wallet chosen by the user.
   */
  initConnector: (connector: Connector) => Promise<void>;
}
