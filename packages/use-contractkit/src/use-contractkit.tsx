import { CeloTransactionObject } from '@celo/connect';
import { ContractKit } from '@celo/contractkit';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { createContainer } from 'unstated-next';
import {
  Alfajores,
  localStorageKeys,
  Mainnet,
  NetworkNames,
  WalletTypes,
} from './constants';
import {
  CeloExtensionWalletConnector,
  DappKitConnector,
  LedgerConnector,
  PrivateKeyConnector,
  UnauthenticatedConnector,
} from './connectors';
import { ActionModal, ActionModalProps, ConnectModal } from './modals';
import { Network, Provider, Connector } from './types';

let lastUsedNetworkName = Mainnet.name;
let lastUsedAddress = '';
let lastUsedWalletType = WalletTypes.Unauthenticated;
let lastUsedWalletArguments: any[] = [];
function localStorageOperations() {
  if (typeof localStorage === 'undefined') {
    return;
  }

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
    lastUsedWalletArguments = JSON.parse(localLastUsedWalletArguments);
  }
}
localStorageOperations();

const defaultNetworks = [Mainnet, Alfajores];
const lastUsedNetwork =
  defaultNetworks.find((n) => n.name === lastUsedNetworkName) || Alfajores;

const connectorTypes: { [x in WalletTypes]?: any } = {
  [WalletTypes.Unauthenticated]: UnauthenticatedConnector,
  [WalletTypes.PrivateKey]: PrivateKeyConnector,
  [WalletTypes.Ledger]: LedgerConnector,
  [WalletTypes.WalletConnect]: null,
  [WalletTypes.CeloExtensionWallet]: CeloExtensionWalletConnector,
  // [WalletTypes.Metamask]: null,
  [WalletTypes.DappKit]: DappKitConnector,
};

let initialConnector: Connector;
if (lastUsedWalletType) {
  try {
    initialConnector = new connectorTypes[lastUsedWalletType as WalletTypes](
      lastUsedNetwork,
      ...lastUsedWalletArguments
    );
  } catch (e) {
    initialConnector = new UnauthenticatedConnector(lastUsedNetwork);
  }
}

interface ConnectionResult {
  type: WalletTypes;
  connector: Connector;
}

function Kit(
  { networks = defaultNetworks }: { networks?: Network[] } = {
    networks: defaultNetworks,
  }
) {
  const [address, setAddress] = useState(lastUsedAddress);
  const [connectionCallback, setConnectionCallback] = useState<
    ((x: ConnectionResult | false) => void) | null
  >(null);

  const initialNetwork =
    networks.find((n) => n.name === lastUsedNetworkName) || defaultNetworks[0];
  if (!initialNetwork) {
    throw new Error('Unknown network');
  }

  const [connection, setConnection] = useState<Connector>(initialConnector);
  const [network, updateNetwork] = useState(initialNetwork);
  const [pendingActionCount, setPendingActionCount] = useState(0);

  useEffect(() => {
    const account = connection.kit.defaultAccount;
    if (account) {
      setAddress(account);
      localStorage.setItem(localStorageKeys.lastUsedAddress, account);
    }
  }, [connection.kit]);

  useEffect(() => {
    if (
      localStorage.getItem(localStorageKeys.lastUsedNetwork) === network.name
    ) {
      return;
    }
    localStorage.setItem(localStorageKeys.lastUsedNetwork, network.name);

    setConnection((c) => {
      const Constructor = connectorTypes[c.type];
      if (!Constructor) {
        return null;
      }

      const lastUsedWalletArguments = JSON.parse(
        localStorage.getItem(localStorageKeys.lastUsedWalletArguments) || '[]'
      );
      const newConnection = new Constructor(
        network,
        ...lastUsedWalletArguments
      );
      console.log('newConnection', newConnection);
      return newConnection;
    });
  }, [network]);

  const destroy = useCallback(() => {
    localStorage.removeItem(localStorageKeys.lastUsedAddress);
    localStorage.removeItem(localStorageKeys.lastUsedWalletType);
    localStorage.removeItem(localStorageKeys.lastUsedWalletArguments);

    setAddress('');
    setConnection(new UnauthenticatedConnector(network));
  }, [network]);

  const connect = async (): Promise<Connector> => {
    const connectionResultPromise = new Promise((resolve) => {
      const connectionResultCallback = (
        x:
          | {
              type: WalletTypes;
              connector: Connector;
            }
          | false
      ) => resolve(x);

      // has to be like this and not like setConnectionCallback(connectionResultCallback)
      // as React will try to run any function passed to set state
      setConnectionCallback(() => connectionResultCallback);
    });

    const result = (await connectionResultPromise) as ConnectionResult | false;
    if (result === false) {
      // dismissed
      setConnectionCallback(null);
      throw new Error('Connection cancelled');
    }

    if (result.connector.onNetworkChange) {
      result.connector.onNetworkChange((chainId) => {
        const network = networks?.find((n) => n.chainId === chainId);
        network && updateNetwork(network);
      });
    }

    setConnection(result.connector);
    setConnectionCallback(null);

    return result.connector;
  };

  const getConnectedKit = useCallback(async () => {
    let initialisedConnection = connection;
    if (connection.type === WalletTypes.Unauthenticated) {
      initialisedConnection = await connect();
    } else if (!initialisedConnection.initialised) {
      await initialisedConnection.initialise();
    }

    return initialisedConnection.kit;
  }, [connect, connection]);

  /**
   * Helper function for handling any interaction with a Celo wallet. Perform action will
   *    - open the action modal
   *    - handle multiple transactions in order
   */
  const performActions = useCallback(
    async (...operations: ((kit: ContractKit) => any | Promise<any>)[]) => {
      const kit = await getConnectedKit();

      setPendingActionCount(operations.length);
      const results = [];
      for (const op of operations) {
        try {
          results.push(await op(kit));
        } catch (e) {
          setPendingActionCount(0);
          throw e;
        }

        setPendingActionCount((c) => c - 1);
      }
      return results;
    },
    [getConnectedKit]
  );

  return {
    network,
    updateNetwork,

    address,
    kit: connection.kit,
    walletType: connection.type,

    performActions,

    connect,
    destroy,
    getConnectedKit,

    // private
    pendingActionCount,
    connectionCallback,
  };
}

const KitState = createContainer(Kit);
export const useContractKit = KitState.useContainer;

export function ContractKitProvider({
  children,
  connectModal,
  actionModal,
  dappName,
  networks,
}: {
  children: ReactNode;
  dappName: string;
  networks?: Network[];

  connectModal?: {
    renderProvider?: (p: Provider & { onClick: () => void }) => ReactNode;
    reactModalProps?: Partial<ReactModal.Props>;
  };
  actionModal?: {
    reactModalProps?: Partial<ReactModal.Props>;
    render?: (props: ActionModalProps) => ReactNode;
  };
}) {
  return (
    <KitState.Provider initialState={{ networks }}>
      <ConnectModal dappName={dappName} {...connectModal} />
      <ActionModal dappName={dappName} {...actionModal} />

      {children}
    </KitState.Provider>
  );
}
