import { useCallback, useEffect, useState } from 'react';

import { CONNECTOR_TYPES, UnauthenticatedConnector } from '../connectors';
import {
  DEFAULT_NETWORKS,
  localStorageKeys,
  Mainnet,
  NetworkNames,
  WalletTypes,
} from '../constants';
import { Connector, Network } from '../types';
import { useIsMounted } from '../utils/useIsMounted';

/**
 * Loads previous user configuration from local storage.
 */
const loadPreviousConfig = () => {
  let lastUsedNetworkName: NetworkNames = Mainnet.name;
  let lastUsedAddress: string | null = null;
  let lastUsedWalletType: WalletTypes = WalletTypes.Unauthenticated;
  let lastUsedWalletArguments: unknown[] = [];
  if (typeof localStorage !== 'undefined') {
    const localLastUsedNetworkName = localStorage.getItem(
      localStorageKeys.lastUsedNetwork
    );
    if (localLastUsedNetworkName) {
      lastUsedNetworkName = localLastUsedNetworkName as NetworkNames;
    }

    const localLastUsedAddress = localStorage.getItem(
      localStorageKeys.lastUsedAddress
    );
    if (localLastUsedAddress) {
      lastUsedAddress = localLastUsedAddress;
    }

    const localLastUsedWalletType = localStorage.getItem(
      localStorageKeys.lastUsedWalletType
    );
    if (localLastUsedWalletType) {
      lastUsedWalletType = localLastUsedWalletType as WalletTypes;
    }

    const localLastUsedWalletArguments = localStorage.getItem(
      localStorageKeys.lastUsedWalletArguments
    );
    if (localLastUsedWalletArguments) {
      try {
        lastUsedWalletArguments = JSON.parse(
          localLastUsedWalletArguments
        ) as unknown[];
      } catch (e) {
        lastUsedWalletArguments = [];
      }
    }
  }

  const lastUsedNetwork =
    DEFAULT_NETWORKS.find((n) => n.name === lastUsedNetworkName) ?? Mainnet;

  let initialConnector: Connector;
  if (lastUsedWalletType) {
    try {
      initialConnector = new CONNECTOR_TYPES[lastUsedWalletType](
        lastUsedNetwork,
        ...lastUsedWalletArguments
      );
    } catch (e) {
      initialConnector = new UnauthenticatedConnector(lastUsedNetwork);
    }
  } else {
    initialConnector = new UnauthenticatedConnector(lastUsedNetwork);
  }

  return {
    lastUsedNetworkName,
    lastUsedAddress,
    lastUsedWalletType,
    lastUsedWalletArguments,
    lastUsedNetwork,
    initialConnector,
  };
};

/**
 * Connector-related configuration.
 */
export interface UseConnectorConfig {
  /**
   * The address connected.
   */
  address: string | null;
  network: Network;
  updateNetwork: (network: Network) => void;
  connector: Connector;

  connect: () => Promise<Connector>;
  destroy: () => Promise<void>;

  connectionCallback: ((x: Connector | false) => void) | null;
}

export const useConnectorConfig = ({
  networks,
}: {
  networks: readonly Network[];
}): UseConnectorConfig => {
  const isMountedRef = useIsMounted();
  const [{ lastUsedAddress, lastUsedNetworkName, initialConnector }] = useState(
    loadPreviousConfig()
  );
  const [address, setAddress] = useState<string | null>(lastUsedAddress);
  const initialNetwork =
    networks.find((n) => n.name === lastUsedNetworkName) ?? networks[0];
  if (!initialNetwork) {
    throw new Error('Invalid network configuration');
  }
  const [network, updateNetwork] = useState<Network>(initialNetwork);

  const [connector, setConnector] = useState<Connector>(initialConnector);
  const [connectionCallback, setConnectionCallback] = useState<
    ((x: Connector | false) => void) | null
  >(null);

  // Update address whenever connector kit account changes
  useEffect(() => {
    const account = connector?.kit.defaultAccount;
    if (account) {
      setAddress(account);
      localStorage.setItem(localStorageKeys.lastUsedAddress, account);
    }
  }, [connector?.kit]);

  // Destroys the connector.
  const destroy = useCallback(async () => {
    await connector.close();

    localStorage.removeItem(localStorageKeys.lastUsedAddress);
    localStorage.removeItem(localStorageKeys.lastUsedWalletType);
    localStorage.removeItem(localStorageKeys.lastUsedWalletArguments);

    if (isMountedRef.current) {
      setAddress(null);
      setConnector(new UnauthenticatedConnector(network));
    }
  }, [network, connector, isMountedRef]);

  useEffect(() => {
    if (
      localStorage.getItem(localStorageKeys.lastUsedNetwork) === network.name
    ) {
      return;
    }
    localStorage.setItem(localStorageKeys.lastUsedNetwork, network.name);

    const ConnectorConstructor = CONNECTOR_TYPES[connector.type];
    if (!ConnectorConstructor) {
      return;
    }

    setConnector(() => {
      try {
        const lastUsedWalletArguments = JSON.parse(
          localStorage.getItem(localStorageKeys.lastUsedWalletArguments) || '[]'
        ) as unknown[];
        return new ConnectorConstructor(network, ...lastUsedWalletArguments);
      } catch (e) {
        return new ConnectorConstructor(network);
      }
    });
  }, [connector, network]);

  const connect = useCallback(async (): Promise<Connector> => {
    const connectionResultPromise: Promise<Connector | false> = new Promise(
      (resolve) => {
        const connectionResultCallback = (x: Connector | false) => resolve(x);

        // has to be like this and not like setConnectionCallback(connectionResultCallback)
        // as React will try to run any function passed to set state
        setConnectionCallback(() => connectionResultCallback);
      }
    );

    const connector = await connectionResultPromise;
    if (connector === false) {
      // dismissed
      if (isMountedRef.current) {
        setConnectionCallback(null);
      }
      throw new Error('Connection cancelled');
    }

    if (connector.onNetworkChange) {
      connector.onNetworkChange((chainId) => {
        const network = networks?.find((n) => n.chainId === chainId);
        network && updateNetwork(network);
      });
    }

    if (isMountedRef.current) {
      setConnector(connector);
      setConnectionCallback(null);
    }

    return connector;
  }, [networks, isMountedRef]);

  return {
    address,
    network,
    updateNetwork,
    connector,
    connectionCallback,
    connect,
    destroy,
  };
};
