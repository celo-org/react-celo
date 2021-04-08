import { ContractKit } from '@celo/contractkit';
import { WalletConnectWallet } from '@celo/wallet-walletconnect';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { createContainer } from 'unstated-next';
import {
  CeloExtensionWalletConnector,
  DappKitConnector,
  LedgerConnector,
  PrivateKeyConnector,
  UnauthenticatedConnector,
  WalletConnectConnector,
} from './connectors';
import {
  Alfajores,
  localStorageKeys,
  Mainnet,
  NetworkNames,
  WalletTypes,
} from './constants';
import { ActionModal, ActionModalProps, ConnectModal } from './modals';
import { Connector, Network, Provider } from './types';

let lastUsedNetworkName = Mainnet.name;
let lastUsedAddress = '';
let lastUsedWalletType: WalletTypes = WalletTypes.Unauthenticated;
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
    try {
      lastUsedWalletArguments = JSON.parse(localLastUsedWalletArguments);
    } catch (e) {
      lastUsedWalletArguments = [];
    }
  }
}
localStorageOperations();

const defaultNetworks = [Mainnet, Alfajores];
const lastUsedNetwork =
  defaultNetworks.find((n) => n.name === lastUsedNetworkName) || Alfajores;

const connectorTypes: { [x in WalletTypes]: any } = {
  [WalletTypes.Unauthenticated]: UnauthenticatedConnector,
  [WalletTypes.PrivateKey]: PrivateKeyConnector,
  [WalletTypes.Ledger]: LedgerConnector,
  [WalletTypes.WalletConnect]: WalletConnectConnector,
  [WalletTypes.CeloExtensionWallet]: CeloExtensionWalletConnector,
  [WalletTypes.Metamask]: null,
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

function Kit(
  {
    networks = defaultNetworks,
    dappName,
    dappDescription,
    dappIcon,
    dappUrl,
  }: {
    networks?: Network[];
    dappName: string;
    dappDescription: string;
    dappUrl: string;
    dappIcon?: string;
  } = {
    networks: defaultNetworks,
    dappName: '',
    dappDescription: '',
    dappIcon: '',
    dappUrl: '',
  }
) {
  const [dapp] = useState({
    name: dappName,
    description: dappDescription,
    icon: dappIcon || `${dappUrl}/favicon.ico`,
    url: dappUrl,
  });
  const [address, setAddress] = useState(lastUsedAddress);
  const [connectionCallback, setConnectionCallback] = useState<
    ((x: Connector | false) => void) | null
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
    const account = connection?.kit.defaultAccount;
    if (account) {
      setAddress(account);
      localStorage.setItem(localStorageKeys.lastUsedAddress, account);
    }
  }, [connection?.kit]);

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
      return new Constructor(network, ...lastUsedWalletArguments);
    });
  }, [network]);

  const destroy = useCallback(async () => {
    await connection.close();

    localStorage.removeItem(localStorageKeys.lastUsedAddress);
    localStorage.removeItem(localStorageKeys.lastUsedWalletType);
    localStorage.removeItem(localStorageKeys.lastUsedWalletArguments);

    setAddress('');
    setConnection(new UnauthenticatedConnector(network));
  }, [network, connection]);

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
      setConnectionCallback(null);
      throw new Error('Connection cancelled');
    }

    if (connector.onNetworkChange) {
      connector.onNetworkChange((chainId) => {
        const network = networks?.find((n) => n.chainId === chainId);
        network && updateNetwork(network);
      });
    }

    setConnection(connector);
    setConnectionCallback(null);

    return connector;
  }, [network]);

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
    dappName: dapp.name,
    dapp,
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
  dappDescription,
  dappUrl,
  dappIcon,
  networks,
}: {
  children: ReactNode;
  dappName: string;
  dappDescription: string;
  dappUrl: string;
  dappIcon?: string;
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
    <KitState.Provider
      initialState={{ networks, dappName, dappDescription, dappUrl, dappIcon }}
    >
      <ConnectModal {...connectModal} />
      <ActionModal {...actionModal} />

      {children}
    </KitState.Provider>
  );
}
