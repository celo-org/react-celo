import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import { CONNECTOR_TYPES, UnauthenticatedConnector } from './connectors';
import { DEFAULT_NETWORKS, Mainnet } from './constants';
import {
  Actions,
  ActionsMap,
  contractKitReducer,
  ReducerState,
} from './contract-kit-reducer';
import {
  ActionModal,
  ActionModalProps,
  ConnectModal,
  ConnectModalProps,
} from './modals';
import { Dapp, Network } from './types';
import {
  ContractKitMethods,
  useContractKitMethods,
} from './use-contract-kit-methods';
import { loadPreviousConfig } from './utils/helpers';
import { useIsMounted } from './utils/useIsMounted';

// This type lets you call dispatch with one or two arguments:
// First a type, and second an optional payload that matches an
// action's payload with that type.
export type Dispatcher = <
  Type extends Actions['type'],
  Payload extends ActionsMap[Type]
>(
  type: Type,
  // This line makes it so if there shouldn't be a payload then
  // you only need to call the function with the type, but if
  // there should be a payload then you need the second argument.
  ...payload: Payload extends undefined ? [undefined?] : [Payload]
) => void;

type ContractKitContextInterface = readonly [
  ReducerState,
  Dispatcher,
  ContractKitMethods
];

const initialState = {
  connector: new UnauthenticatedConnector(Mainnet),
  connectorInitError: null,
  dapp: {
    name: 'Celo dApp',
    description: 'Celo dApp',
    url: 'https://celo.org',
    icon: 'https://celo.org/favicon.ico',
  },
  network: Mainnet,
  networks: DEFAULT_NETWORKS,
  pendingActionCount: 0,
  address: null,
  connectionCallback: null,
};

export const [useContractKitContext, ContextProvider] =
  createContractKitContext();

// This makes it so we don't have to provide defaults for our context
// and also so that if our hooks are used outside of the Provider it
// will throw an error.
function createContractKitContext() {
  const contractKitContext = React.createContext<
    ContractKitContextInterface | undefined
  >(undefined);
  const useCtx = () => {
    const c = React.useContext(contractKitContext);
    if (!c)
      throw new Error(
        'Components using the use-contractkit hook must be a child of a ContractKitProvider'
      );
    return c;
  };
  return [useCtx, contractKitContext.Provider] as const;
}

export const ContractKitProvider: React.FC<ContractKitProviderProps> = ({
  children,
  connectModal,
  actionModal,
  dapp,
  network = Mainnet,
  networks = DEFAULT_NETWORKS,
}: ContractKitProviderProps) => {
  const isMountedRef = useIsMounted();
  const previousConfig = useMemo(() => loadPreviousConfig(network), [network]);
  const [state, _dispatch] = useReducer(contractKitReducer, {
    ...initialState,
    ...previousConfig,
    network: previousConfig.network || network,
    networks,
    dapp: {
      ...dapp,
      icon: dapp.icon ?? `${dapp.url}/favicon.ico`,
    },
  });

  const dispatch: Dispatcher = useCallback(
    (type, ...payload) => {
      if (isMountedRef.current) {
        _dispatch({ type, payload: payload[0] } as Actions);
      }
    },
    [isMountedRef]
  );

  const methods = useContractKitMethods(state, dispatch);

  useEffect(() => {
    if (CONNECTOR_TYPES[state.connector.type] !== UnauthenticatedConnector) {
      methods.initConnector(state.connector).catch(() => {
        // If the connector fails to initialise on mount then we reset.
        dispatch('destroy');
      });
    }
    /* eslint-disable */
    // We only want this to run on mount so the deps array is empty.
  }, []);
  /* eslint-enable */

  return (
    <ContextProvider value={[state, dispatch, methods]}>
      <ConnectModal {...connectModal} />
      <ActionModal {...actionModal} />
      {children}
    </ContextProvider>
  );
};

interface ContractKitProviderProps {
  children: ReactNode;
  dapp: Dapp;
  network?: Network;
  networks?: Network[];

  connectModal?: ConnectModalProps;
  actionModal?: {
    reactModalProps?: Partial<ReactModal.Props>;
    render?: (props: ActionModalProps) => ReactNode;
  };
}
