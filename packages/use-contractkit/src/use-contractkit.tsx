import { ContractKit } from '@celo/contractkit';
import React, {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import ReactModal from 'react-modal';
import { Container, createContainer } from 'unstated-next';
import { CONNECTOR_TYPES } from './connectors';
import { UnauthenticatedConnector } from './connectors/connectors';
import {
  Alfajores,
  localStorageKeys,
  Mainnet,
  NetworkNames,
  SupportedProviders,
  WalletTypes,
} from './constants';
import { ActionModal, ActionModalProps, ConnectModal } from './modals';
import { Connector, Network, Provider } from './types';

let lastUsedNetworkName: NetworkNames = Mainnet.name;
let lastUsedAddress: string | null = null;
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
  defaultNetworks.find((n) => n.name === lastUsedNetworkName) ?? Alfajores;

let initialConnector: Connector;
if (lastUsedWalletType) {
  try {
    initialConnector = new CONNECTOR_TYPES[lastUsedWalletType as WalletTypes](
      lastUsedNetwork,
      ...lastUsedWalletArguments
    );
  } catch (e) {
    initialConnector = new UnauthenticatedConnector(lastUsedNetwork);
  }
}

/**
 * Exports for ContractKit.
 */
interface UseContractKit {
  network: Network;
  updateNetwork: (network: Network) => void;
  /**
   * The address connected.
   */
  address: string | null;
  dapp: Dapp;
  kit: ContractKit;
  walletType: WalletTypes;
  accountName: string | null;

  /**
   * Helper function for handling any interaction with a Celo wallet. Perform action will
   * - open the action modal
   * - handle multiple transactions in order
   */
  performActions: (
    ...operations: ((kit: ContractKit) => any | Promise<any>)[]
  ) => Promise<any[]>;

  /**
   * Whether or not the connector has been fully loaded.
   */
  initialised: boolean;
  /**
   * Initialisation error, if applicable.
   */
  initError: Error | null;

  connect: () => Promise<Connector>;
  destroy: () => Promise<void>;
  getConnectedKit: () => Promise<ContractKit>;
}

interface UseContractKitInternal extends UseContractKit {
  initConnector: (connector: Connector) => Promise<void>;
  pendingActionCount: number;
  connectionCallback: ((x: Connector | false) => void) | null;
}

interface Dapp {
  name: string;
  description: string;
  url: string;
  icon: string;
}

export type DappInput = Omit<Dapp, 'icon'> & Partial<Pick<Dapp, 'icon'>>;

interface KitState {
  networks?: Network[];
  dapp: DappInput;
}

const defaultDapp: Dapp = {
  name: '',
  description: '',
  icon: '',
  url: '',
};

function Kit(
  { networks = defaultNetworks, dapp: dappInput }: KitState = {
    networks: defaultNetworks,
    dapp: defaultDapp,
  }
): UseContractKitInternal {
  const [dapp] = useState<Required<Dapp>>({
    name: dappInput.name,
    description: dappInput.description,
    icon: dappInput.icon ?? `${dappInput.url}/favicon.ico`,
    url: dappInput.url,
  });
  const [address, setAddress] = useState<string | null>(lastUsedAddress);
  const [connectionCallback, setConnectionCallback] =
    useState<((x: Connector | false) => void) | null>(null);

  const initialNetwork =
    networks.find((n) => n.name === lastUsedNetworkName) || networks[0];
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

    const Constructor = CONNECTOR_TYPES[connection.type];
    if (!Constructor) {
      return;
    }

    setConnection(() => {
      try {
        const lastUsedWalletArguments = JSON.parse(
          localStorage.getItem(localStorageKeys.lastUsedWalletArguments) || '[]'
        );
        return new Constructor(network, ...lastUsedWalletArguments);
      } catch (e) {
        return new Constructor(network);
      }
    });
  }, [connection, network]);

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

  // Initialisation error state management
  const [initError, setInitError] = useState<Error | null>(null);
  const initConnector = useCallback(async (connector: Connector) => {
    try {
      await connector.initialise();
    } catch (e) {
      console.error(
        '[use-contractkit] Error initializing connector',
        connector.type,
        e
      );
      setInitError(e);
    }
  }, []);

  const getConnectedKit = useCallback(async () => {
    let initialisedConnection = connection;
    if (connection.type === WalletTypes.Unauthenticated) {
      initialisedConnection = await connect();
    } else if (!initialisedConnection.initialised) {
      await initConnector(initialisedConnection);
    }

    return initialisedConnection.kit;
  }, [connect, connection, initConnector]);

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
    dapp,
    kit: connection.kit,
    walletType: connection.type,
    accountName: connection.accountName,

    performActions,

    connect,
    destroy,
    getConnectedKit,

    initialised: connection.initialised,
    initError,

    // private
    initConnector,
    pendingActionCount,
    connectionCallback,
  };
}

const KitState = createContainer<UseContractKitInternal, KitState>(Kit);

export const useContractKit: Container<
  UseContractKit,
  KitState
>['useContainer'] = KitState.useContainer;

/**
 * UseContractKit with internal methods exposed. Package use only.
 */
export const useInternalContractKit: Container<
  UseContractKitInternal,
  KitState
>['useContainer'] = KitState.useContainer;

interface ContractKitProviderProps {
  children: ReactNode;
  dapp: DappInput;
  networks?: Network[];

  connectModal?: {
    renderProvider?: (p: Provider & { onClick: () => void }) => ReactNode;
    reactModalProps?: Partial<ReactModal.Props>;
    screens?: {
      [x in SupportedProviders]?: FunctionComponent<{
        onSubmit: (connector: Connector) => Promise<void> | void;
      }>;
    };
  };
  actionModal?: {
    reactModalProps?: Partial<ReactModal.Props>;
    render?: (props: ActionModalProps) => ReactNode;
  };
}

export function ContractKitProvider({
  children,
  connectModal,
  actionModal,
  dapp,
  networks,
}: ContractKitProviderProps) {
  return (
    <KitState.Provider initialState={{ networks, dapp }}>
      <ConnectModal {...connectModal} />
      <ActionModal {...actionModal} />

      {children}
    </KitState.Provider>
  );
}
