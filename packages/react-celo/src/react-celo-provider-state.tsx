import { CeloContract } from '@celo/contractkit/lib/base';
import React, { useCallback, useMemo, useReducer } from 'react';

import { UnauthenticatedConnector } from './connectors';
import { DEFAULT_NETWORKS, Mainnet } from './constants';
import { useIsMounted } from './hooks/use-is-mounted';
import { CeloProviderProps } from './react-celo-provider-props';
import {
  Actions,
  ActionsMap,
  celoReactReducer,
  ReducerState,
} from './react-celo-reducer';
import { Network } from './types';
import { getInitialNetwork } from './utils/get-initial-network';
import { loadPreviousState } from './utils/helpers';
import { resurrector } from './utils/resurrector';

const initialState: ReducerState = {
  connector: new UnauthenticatedConnector(Mainnet),
  connectorInitError: null,
  manualNetworkMode: false,
  dapp: {
    name: 'Celo dApp',
    description: 'Celo dApp',
    url: 'https://celo.org',
    icon: 'https://celo.org/favicon.ico',
  },
  walletChainId: null,
  network: Mainnet,
  networks: DEFAULT_NETWORKS,
  pendingActionCount: 0,
  address: null,
  connectionCallback: null,
  feeCurrency: CeloContract.GoldToken,
  theme: null,
};

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

function useDispatch(dispatch: React.Dispatch<Actions>): Dispatcher {
  const isMountedRef = useIsMounted();
  return useCallback(
    (type, ...payload) => {
      if (isMountedRef.current) {
        dispatch({ type, payload: payload[0] } as Actions);
      }
    },
    [dispatch, isMountedRef]
  );
}

type CeloStateProps = Pick<
  CeloProviderProps,
  | 'dapp'
  | 'theme'
  | 'network'
  | 'defaultNetwork'
  | 'networks'
  | 'feeCurrency'
  | 'manualNetworkMode'
> & { networks: Network[] };

export function useCeloState({
  dapp,
  network,
  defaultNetwork,
  manualNetworkMode,
  theme,
  networks,
  feeCurrency,
}: CeloStateProps): [ReducerState, Dispatcher] {
  const stateFromLocalStorage = useMemo(
    () => loadPreviousState(),
    // We only want this to run on mount so the deps array is empty.
    // This is OK because the stateFromLocalStorage is only used to create the initial reducer state
    /* eslint-disable-next-line */
    []
  );

  const connector = useMemo(() => {
    return resurrector(
      networks,
      dapp,
      manualNetworkMode ?? initialState.manualNetworkMode
    );
    /* eslint-disable-next-line */
  }, []);

  const initialNetwork = getInitialNetwork(
    networks,
    defaultNetwork,
    network,
    stateFromLocalStorage.networkName
  );

  const [state, _dispatch] = useReducer(celoReactReducer, {
    ...initialState,
    manualNetworkMode: manualNetworkMode ?? initialState.manualNetworkMode,
    address: stateFromLocalStorage.address,
    connector: connector || initialState.connector,
    network: initialNetwork,
    feeCurrency:
      stateFromLocalStorage.feeCurrency ||
      feeCurrency ||
      CeloContract.GoldToken,
    networks,
    theme,
    dapp: {
      ...dapp,
      icon: dapp.icon ?? `${dapp.url}/favicon.ico`,
    },
  });

  const dispatch: Dispatcher = useDispatch(_dispatch);

  return [state, dispatch];
}
