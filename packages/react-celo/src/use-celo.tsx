import { useReactCeloContext } from './react-celo-provider';
import { ReducerState } from './react-celo-reducer';
import { Maybe } from './types';
import { CeloMethods } from './use-celo-methods';

type SomeReducerStateProps = Pick<
  ReducerState,
  'dapp' | 'address' | 'network' | 'feeCurrency'
>;

type DerivedFromReducerStateProps = {
  walletChainId: ReducerState['walletChainId'];
  networks: readonly ReducerState['network'][];
  initError: ReducerState['connectorInitError'];
};

type SomeReducerConnectorProps = Pick<
  ReducerState['connector'],
  'kit' | 'initialised'
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
  SomeCeloMethods & { account: Maybe<string> };

export function useCelo<CC = undefined>(): UseCelo {
  const [reducerState, _dispatch, celoMethods] = useReactCeloContext();

  const {
    dapp,
    address,
    network,
    walletChainId,
    feeCurrency,
    connectorInitError,
    networks,
    connector,
  } = reducerState;

  const {
    destroy,
    disconnect,
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
    address, // The account address
    network,
    walletChainId,
    feeCurrency,
    initError: connectorInitError,
    // Copy to ensure any accidental mutations dont affect global state
    networks: networks.map((net) => ({ ...net })),

    kit: connector.kit,
    // the wallet address from Account.getWalletAddress => The address at which the account expects to receive transfers.
    // If it's empty/0x0, the account indicates that an address exchange should be initiated with the dataEncryptionKey
    /*
     * @deprecated this will likely be removed in favor of just address
     */
    account: connector.kit.connection.defaultAccount,
    initialised: connector.initialised,
    walletType: connector.type,
    supportsFeeCurrency: connector.supportsFeeCurrency(),
    destroy,
    disconnect,
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
  Pick<
    ReducerState,
    'connectionCallback' | 'pendingActionCount' | 'theme' | 'manualNetworkMode'
  > &
  Pick<CeloMethods, 'initConnector' | 'resetInitError'>;

/**
 * @internal useCelo with internal methods exposed. Package use only.
 */
export const useCeloInternal = (): UseCeloInternal => {
  const [
    { pendingActionCount, connectionCallback, theme, manualNetworkMode },
    _dispatch,
    { initConnector, resetInitError },
  ] = useReactCeloContext();

  return {
    ...useCelo(),
    manualNetworkMode,
    connectionCallback,
    initConnector,
    pendingActionCount,
    theme,
    resetInitError,
  };
};
