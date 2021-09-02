import { ContractKit } from '@celo/contractkit';
import { useCallback, useContext } from 'react';

import { WalletTypes } from './constants';
import { ContractKitContext } from './contract-kit-provider';
import { Connector, Network } from './types';

export function useContractKitMethods(): ContractKitMethods {
  const [{ connector, networks }, dispatch] = useContext(ContractKitContext);

  const destroy = useCallback(async () => {
    await connector.close();
    dispatch('destroy');
  }, [dispatch, connector]);

  const initConnector = useCallback(
    async (nextConnector: Connector) => {
      try {
        const initialisedConnector = await nextConnector.initialise();
        dispatch('initialisedConnector', initialisedConnector);
        initialisedConnector.onNetworkChange?.((chainId) => {
          const network = networks.find((n) => n.chainId === chainId);
          // TODO: We should probably throw an error if we can't find the new chainId
          network && dispatch('setNetwork', network);
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
    [dispatch, networks]
  );

  const updateNetwork = useCallback(
    (network: Network) => {
      dispatch('setNetwork', network);
    },
    [dispatch]
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

  const performActions = useCallback(
    async (
      ...operations: ((kit: ContractKit) => unknown | Promise<unknown>)[]
    ) => {
      const kit = await getConnectedKit();

      dispatch('setPendingActionCount', operations.length);
      const results: unknown[] = [];
      for (const op of operations) {
        try {
          results.push(await op(kit));
        } catch (e) {
          dispatch('setPendingActionCount', 0);
          throw e;
        }

        dispatch('decrementPendingActionCount');
      }
      return results;
    },
    [getConnectedKit, dispatch]
  );

  return {
    destroy,
    initConnector,
    updateNetwork,
    connect,
    getConnectedKit,
    performActions,
  };
}

interface ContractKitMethods {
  destroy: () => Promise<void>;
  initConnector: (connector: Connector) => Promise<Connector>;
  updateNetwork: (network: Network) => void;
  connect: () => Promise<Connector>;
  getConnectedKit: () => Promise<ContractKit>;
  performActions: (
    ...operations: ((kit: ContractKit) => unknown | Promise<unknown>)[]
  ) => Promise<unknown[]>;
}
