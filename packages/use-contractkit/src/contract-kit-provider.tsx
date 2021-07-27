import React, {
  createContext,
  ReactNode,
  useCallback,
  useReducer,
} from 'react';

import { UnauthenticatedConnector } from './connectors';
import { Mainnet } from './constants';
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
import { loadPreviousConfig } from './utils/helpers';
import { useIsMounted } from './utils/useIsMounted';

// This type lets you call dispatch with one or two arguments:
// First a type, and second an optional payload that matches an
// action's payload with that type.
type Dispatcher = <
  Type extends Actions['type'],
  Payload extends ActionsMap[Type]
>(
  type: Type,
  // This line makes it so if there shouldn't be a payload then
  // you only need to call the function with the type, but if
  // there should be a payload then you need the second argument.
  ...payload: Payload extends undefined ? [undefined?] : [Payload]
) => void;

type ContractKitContextInterface = readonly [ReducerState, Dispatcher];

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
  networks: [],
  pendingActionCount: 0,
  address: null,
  connectionCallback: null,
};

export const ContractKitContext = createContext<ContractKitContextInterface>([
  initialState,
  () => undefined,
]);

export const ContractKitProvider: React.FC<ContractKitProviderProps> = ({
  children,
  connectModal,
  actionModal,
  dapp,
  networks = [],
}: ContractKitProviderProps) => {
  const isMountedRef = useIsMounted();
  const [state, _dispatch] = useReducer(contractKitReducer, {
    ...initialState,
    ...loadPreviousConfig(),
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

  return (
    <ContractKitContext.Provider value={[state, dispatch]}>
      <ConnectModal {...connectModal} />
      <ActionModal {...actionModal} />
      {children}
    </ContractKitContext.Provider>
  );
};

interface ContractKitProviderProps {
  children: ReactNode;
  dapp: Dapp;
  networks?: Network[];

  connectModal?: ConnectModalProps;
  actionModal?: {
    reactModalProps?: Partial<ReactModal.Props>;
    render?: (props: ActionModalProps) => ReactNode;
  };
}
