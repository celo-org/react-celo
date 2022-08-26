import { CeloContract } from '@celo/contractkit/lib/base';
import React, { useEffect } from 'react';

import IOSViewportFix from './components/ios-viewport-fix';
import { DEFAULT_NETWORKS, Mainnet } from './constants';
import { ActionModal, ConnectModal } from './modals';
import { CeloProviderProps } from './react-celo-provider-props';
import { Dispatcher, useCeloState } from './react-celo-provider-state';
import { ReducerState } from './react-celo-reducer';
import { CeloMethods, useCeloMethods } from './use-celo-methods';
import { getApplicationLogger, setApplicationLogger } from './utils/logger';

type ReactCeloContextInterface = readonly [
  ReducerState,
  Dispatcher,
  CeloMethods
];

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
  manualNetworkMode,
  network, // TODO:#246 remove when network prop is removed
  defaultNetwork = Mainnet.name,
  theme,
  networks = DEFAULT_NETWORKS,
  feeCurrency = CeloContract.GoldToken,
  buildContractsCache,
  logger,
}: CeloProviderProps) => {
  if (logger) {
    setApplicationLogger(logger);
  }

  const [state, dispatch] = useCeloState({
    dapp,
    manualNetworkMode,
    network,
    defaultNetwork,
    theme,
    networks,
    feeCurrency,
  });

  const methods = useCeloMethods(state, dispatch, buildContractsCache);

  // what happens when i disconnect, need to be able to switch chains still.
  // need to init Unauthenticated connector both at startup and when last chain was disconnected or Replace the null object pattern
  // benefit is that you might still want to just passively watch a chain
  // downside is there are some sementics that get weird
  useEffect(() => {
    getApplicationLogger().debug(
      'onLoad Initialisation of',
      state.connector.type,
      'Connector'
    );
    methods
      .initConnector(state.connector, state.address as string)
      .catch(async (e) => {
        getApplicationLogger().error(
          'onLoad Initialisation Failed',
          state.connector.type,
          e
        );
        // If the connector fails to initialise on mount then we reset.
        await methods.disconnect();
      });
    // We only want this to run on mount so the deps array is empty.
    /* eslint-disable-next-line */
  }, []);
  return (
    <ContextProvider value={[state, dispatch, methods]}>
      <IOSViewportFix />
      <ConnectModal {...connectModal} />
      <ActionModal {...actionModal} />
      {children}
    </ContextProvider>
  );
};

/**
 *
 * @deprecated Use the alias {@link CeloProvider} Component instead.
 */
export const ContractKitProvider = CeloProvider;
