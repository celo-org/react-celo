import { CeloTokenContract, ContractKit } from '@celo/contractkit';
import { useCallback } from 'react';
import { isMobile } from 'react-device-detect';

import { CONNECTOR_TYPES } from './connectors';
import {
  localStorageKeys,
  STATIC_NETWORK_WALLETS,
  WalletTypes,
} from './constants';
import { Dispatcher } from './contract-kit-provider';
import { Connector, Network } from './types';

export function useContractKitMethods(
  {
    connector,
    networks,
    network,
  }: {
    connector: Connector;
    networks: Network[];
    network: Network;
  },
  dispatch: Dispatcher
): ContractKitMethods {
  const destroy = useCallback(async () => {
    await connector.close();
    dispatch('destroy');
  }, [dispatch, connector]);

  const initConnector = useCallback(
    async (nextConnector: Connector) => {
      try {
        const initialisedConnector = await nextConnector.initialise();
        dispatch('initialisedConnector', initialisedConnector);

        // If the new wallet already has a specific network it's
        // using then we should go with that one.
        const netId = await initialisedConnector.kit.web3.eth.net.getId();
        const newNetwork = networks.find((n) => netId === n.chainId);
        if (newNetwork !== network) {
          dispatch('setNetwork', network);
        }

        // This happens if the network changes on the wallet side
        // and we need to update what network we're storing
        // accordingly.
        initialisedConnector.onNetworkChange?.((chainId) => {
          const network = networks.find((n) => n.chainId === chainId);
          if (netId === chainId || !network) return;

          // TODO: We should probably throw an error if we can't find the new chainId

          if (network) {
            dispatch('setNetwork', network);
            initialisedConnector.updateKitWithNetwork &&
              initialisedConnector
                .updateKitWithNetwork(network)
                .then(() => {
                  dispatch('initialisedConnector', initialisedConnector);
                })
                .catch((e) => {
                  console.error(
                    '[use-contractkit] Error switching network',
                    nextConnector.type,
                    e
                  );
                  const error =
                    e instanceof Error
                      ? e
                      : new Error(
                          `Failed to initialise connector with ${network.name}`
                        );
                  dispatch('setConnectorInitError', error);
                  throw e;
                });
          }
        });
        initialisedConnector.onAddressChange?.((address) => {
          dispatch('setAddress', address);
        });
        return initialisedConnector;
      } catch (e) {
        console.error(
          '[use-contractkit] Error initializing connector',
          nextConnector.type,
          e
        );
        const error =
          e instanceof Error ? e : new Error('Failed to initialise connector');
        dispatch('setConnectorInitError', error);
        throw e;
      }
    },
    [dispatch, network, networks]
  );

  // This is just to be used to for users to explicitly change
  // the network. It doesn't work for all wallets.
  const updateNetwork = useCallback(
    async (newNetwork: Network) => {
      if (STATIC_NETWORK_WALLETS.includes(connector.type)) {
        throw new Error(
          "The connected wallet's network must be changed from the wallet."
        );
      }
      if (network === newNetwork) return;
      if (connector.initialised) {
        const connectorArgs = JSON.parse(
          localStorage.getItem(localStorageKeys.lastUsedWalletArguments) || '[]'
        ) as unknown[];
        await connector.close();
        const ConnectorConstructor = CONNECTOR_TYPES[connector.type];
        const newConnector = new ConnectorConstructor(
          newNetwork,
          ...connectorArgs
        );
        await initConnector(newConnector);
      }

      dispatch('setNetwork', newNetwork);
    },
    [dispatch, connector, network, initConnector]
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

  const getConnectedKit = useCallback(async (): Promise<ContractKit> => {
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
      await connector.updateFeeCurrency(newFeeCurrency);
      dispatch('setFeeCurrency', newFeeCurrency);
    },
    [connector, dispatch]
  );

  const performActions = useCallback(
    async (
      ...operations: ((kit: ContractKit) => unknown | Promise<unknown>)[]
    ) => {
      const kit = await getConnectedKit();
      dispatch('setPendingActionCount', operations.length);

      const results: unknown[] = [];
      for (const op of operations) {
        try {
          // When on mobile direct user to their wallet app.
          if (isMobile && connector.getDeeplinkUrl) {
            window.open(connector.getDeeplinkUrl(''), '_blank');
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

  return {
    destroy,
    initConnector,
    updateNetwork,
    connect,
    getConnectedKit,
    performActions,
    updateFeeCurrency,
  };
}

export interface ContractKitMethods {
  destroy: () => Promise<void>;
  initConnector: (connector: Connector) => Promise<Connector>;
  updateNetwork: (network: Network) => Promise<void>;
  connect: () => Promise<Connector>;
  getConnectedKit: () => Promise<ContractKit>;
  performActions: (
    ...operations: ((kit: ContractKit) => unknown | Promise<unknown>)[]
  ) => Promise<unknown[]>;
  updateFeeCurrency: (newFeeCurrency: CeloTokenContract) => Promise<void>;
}
