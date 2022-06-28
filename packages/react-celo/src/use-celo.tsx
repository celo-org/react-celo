import { useReactCeloContext } from './react-celo-provider';
import { ReducerState } from './react-celo-reducer';
import { CeloMethods } from './use-celo-methods';

type SomeReducerStateProps = Pick<
  ReducerState,
  'dapp' | 'address' | 'network' | 'feeCurrency'
>;

type DerivedFromReducerStateProps = {
  networks: readonly ReducerState['network'][];
  initError: ReducerState['connectorInitError'];
};

type SomeReducerConnectorProps = Pick<
  ReducerState['connector'],
  'kit' | 'account' | 'initialised'
>;

type DerivedFromConnectorProps = {
  supportsFeeCurrency: ReturnType<
    ReducerState['connector']['supportsFeeCurrency']
  >;
  walletType: ReducerState['connector']['type'];
};

type SomeCeloMethods = Omit<CeloMethods, 'resetInitError' | 'initConnector'>;
export type UseCelo = SomeReducerStateProps &
  DerivedFromReducerStateProps &
  SomeReducerConnectorProps &
  DerivedFromConnectorProps &
  SomeCeloMethods;

export function useCelo<CC = undefined>(): UseCelo {
  const [reducerState, _dispatch, celoMethods] = useReactCeloContext();

  const {
    dapp,
    address,
    network,
    feeCurrency,
    connectorInitError,
    networks,
    connector,
  } = reducerState;

  const {
    destroy,
    updateNetwork,
    connect,
    getConnectedKit,
    performActions,
    updateFeeCurrency,
    contractsCache,
    updateTheme,
  } = celoMethods;

  return {
    dapp,
    address,
    network,
    feeCurrency,
    initError: connectorInitError,
    // Copy to ensure any accidental mutations dont affect global state
    networks: networks.map((net) => ({ ...net })),

    kit: connector.kit,
    account: connector.account,
    initialised: connector.initialised,
    walletType: connector.type,
    supportsFeeCurrency: connector.supportsFeeCurrency(),

    destroy,
    updateNetwork,
    connect,
    getConnectedKit,
    performActions,
    updateFeeCurrency,
    contractsCache: contractsCache as CC,
    updateTheme,
  };
}

/**
 * @deprecated Use the alias {@link useCelo} hook instead.
 */
export const useContractKit = useCelo;

type UseCeloInternal = UseCelo &
  Pick<ReducerState, 'connectionCallback' | 'pendingActionCount' | 'theme'> &
  Pick<CeloMethods, 'initConnector' | 'resetInitError'>;

/**
 * @internal useCelo with internal methods exposed. Package use only.
 */
export const useCeloInternal = (): UseCeloInternal => {
  const [
    { pendingActionCount, connectionCallback, theme },
    _dispatch,
    { initConnector, resetInitError },
  ] = useReactCeloContext();

  return {
    ...useCelo(),
    connectionCallback,
    initConnector,
    pendingActionCount,
    theme,
    resetInitError,
  };
};
