import { CeloContract, CeloTokenContract } from '@celo/contractkit/lib/base';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import { CONNECTOR_TYPES, UnauthenticatedConnector } from './connectors';
import { DEFAULT_NETWORKS, Mainnet } from './constants';
import { ContractCacheBuilder } from './ContractCacheBuilder';
import {
  ActionModal,
  ActionModalProps,
  ConnectModal,
  ConnectModalProps,
} from './modals';
import {
  Actions,
  ActionsMap,
  celoReactReducer,
  ReducerState,
} from './react-celo-reducer';
import { Dapp, Network } from './types';
import { CeloMethods, useCeloMethods } from './use-celo-methods';
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

type ReactCeloContextInterface = readonly [
  ReducerState,
  Dispatcher,
  CeloMethods
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
  feeCurrency: CeloContract.GoldToken,
};

export const [useReactCeloContext, ContextProvider] = createReactCeloContext();

// This makes it so we don't have to provide defaults for our context
// and also so that if our hooks are used outside of the Provider it
// will throw an error.
function createReactCeloContext() {
  const contractKitContext = React.createContext<
    ReactCeloContextInterface | undefined
  >(undefined);
  const useCtx = () => {
    const c = React.useContext(contractKitContext);
    if (!c)
      throw new Error(
        'Components using the react-celo hook must be a child of a CeloProvider'
      );
    return c;
  };
  return [useCtx, contractKitContext.Provider] as const;
}

export const CeloProvider: React.FC<CeloProviderProps> = ({
  children,
  connectModal,
  actionModal,
  dapp,
  network = Mainnet,
  networks = DEFAULT_NETWORKS,
  feeCurrency = CeloContract.GoldToken,
  buildContractsCache,
}: CeloProviderProps) => {
  const isMountedRef = useIsMounted();
  const previousConfig = useMemo(
    () => loadPreviousConfig(network, feeCurrency, networks),
    // We only want this to run on mount so the deps array is empty.
    /* eslint-disable-next-line */
    []
  );
  const [state, _dispatch] = useReducer(celoReactReducer, {
    ...initialState,
    ...previousConfig,
    network: previousConfig.network || network,
    feeCurrency: previousConfig.feeCurrency || feeCurrency,
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

  const methods = useCeloMethods(state, dispatch, buildContractsCache);

  useEffect(() => {
    if (CONNECTOR_TYPES[state.connector.type] !== UnauthenticatedConnector) {
      methods.initConnector(state.connector).catch(() => {
        // If the connector fails to initialise on mount then we reset.
        dispatch('destroy');
      });
    }
    // We only want this to run on mount so the deps array is empty.
    /* eslint-disable-next-line */
  }, []);

  return (
    <ContextProvider value={[state, dispatch, methods]}>
      <ConnectModal {...connectModal} />
      <ActionModal {...actionModal} />
      {children}
    </ContextProvider>
  );
};

export interface CeloProviderProps {
  children: ReactNode;
  dapp: Dapp;
  network?: Network;
  networks?: Network[];
  feeCurrency?: CeloTokenContract;
  buildContractsCache?: ContractCacheBuilder;
  connectModal?: ConnectModalProps;
  actionModal?: {
    reactModalProps?: Partial<ReactModal.Props>;
    render?: (props: ActionModalProps) => ReactNode;
  };
}
