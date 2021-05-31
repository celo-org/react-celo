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
  DEFAULT_NETWORKS,
  localStorageKeys,
  Mainnet,
  NetworkNames,
  SupportedProviders,
  WalletTypes,
} from './constants';
import { ActionModal, ActionModalProps, ConnectModal } from './modals';
import { Connector, Dapp, Network, Provider } from './types';
import {
  UseConnectorConfig,
  useConnectorConfig,
} from './utils/useConnectorConfig';

/**
 * Exports for ContractKit.
 */
export interface UseContractKit
  extends Omit<UseConnectorConfig, 'connector' | 'connectionCallback'> {
  dapp: Dapp;
  kit: ContractKit;
  walletType: WalletTypes;

  /**
   * Name of the account.
   */
  account: string | null;

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

  /**
   * Gets the connected instance of ContractKit.
   * If the user is not connected, this opens up the connection modal.
   */
  getConnectedKit: () => Promise<ContractKit>;
}

interface UseContractKitInternal
  extends UseContractKit,
    Pick<UseConnectorConfig, 'connectionCallback'> {
  initConnector: (connector: Connector) => Promise<void>;
  pendingActionCount: number;
}

type DappInput = Omit<Dapp, 'icon'> & Partial<Pick<Dapp, 'icon'>>;

/**
 * State of useKit.
 */
interface UseKitState {
  networks?: Network[];
  dapp: DappInput;
}

const DEFAULT_KIT_STATE = {
  networks: DEFAULT_NETWORKS,
  dapp: {
    name: 'Celo dApp',
    description: 'Celo dApp',
    url: 'https://celo.org',
  },
};

const useKit = ({
  networks = DEFAULT_NETWORKS,
  dapp: dappInput,
}: UseKitState = DEFAULT_KIT_STATE): UseContractKitInternal => {
  const [dapp] = useState<Required<Dapp>>({
    name: dappInput.name,
    description: dappInput.description,
    icon: dappInput.icon ?? `${dappInput.url}/favicon.ico`,
    url: dappInput.url,
  });
  const connectorConfig = useConnectorConfig({ networks });

  const [pendingActionCount, setPendingActionCount] = useState(0);

  // Initialisation error state management
  const [initError, setInitError] = useState<Error | null>(null);
  const initConnector = useCallback(async (nextConnector: Connector) => {
    try {
      await nextConnector.initialise();
    } catch (e) {
      console.error(
        '[use-contractkit] Error initializing connector',
        connector.type,
        e
      );
      setInitError(e);
    }
  }, []);

  const { connector, connect } = connectorConfig;
  const getConnectedKit = useCallback(async () => {
    let initialisedConnection = connector;
    if (connector.type === WalletTypes.Unauthenticated) {
      initialisedConnection = await connect();
    } else if (!initialisedConnection.initialised) {
      await initConnector(initialisedConnection);
    }

    return initialisedConnection.kit;
  }, [connect, connector, initConnector]);

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
    ...connectorConfig,
    dapp,

    kit: connector.kit,
    walletType: connector.type,
    account: connector.account,
    initialised: connector.initialised,

    performActions,
    getConnectedKit,

    initError,

    // private
    initConnector,
    pendingActionCount,
  };
};

const KitState = createContainer<UseContractKitInternal, UseKitState>(useKit);

export const useContractKit: Container<
  UseContractKit,
  UseKitState
>['useContainer'] = KitState.useContainer;

/**
 * UseContractKit with internal methods exposed. Package use only.
 */
export const useInternalContractKit: Container<
  UseContractKitInternal,
  UseKitState
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
