import React, { useCallback, useMemo, useState } from 'react';
import { isMobile } from 'react-device-detect';
import ReactModal from 'react-modal';

import { ProviderSelect } from '../components/ProviderSelect';
import { PROVIDERS, SupportedProviders, WalletIds } from '../constants';
import { ConnectorProps, defaultScreens } from '../screens';
import { WalletConnectCustom } from '../screens/wallet-connect-custom';
import { Connector, CustomWCWallet, Provider, WalletEntry } from '../types';
import { useContractKitInternal } from '../use-contractkit';
import { defaultProviderSort } from '../utils/sort';
import { useFetchWCWallets } from '../utils/useFetchWCWallets';
import { defaultModalStyles } from './styles';

export interface ConnectModalProps {
  screens?: {
    [x in SupportedProviders]?: React.FC<ConnectorProps>;
  };
  RenderProvider?: React.FC<{ provider: Provider; onClick: () => void }>;
  reactModalProps?: Partial<ReactModal.Props>;
  title?: string | React.ReactElement;
  providersOptions?: {
    hideFromDefaults?: true | SupportedProviders[];
    hideFromWCRegistry?: true | string[];
    additionalWCWallets?: CustomWCWallet[];
    sort?: (a: Provider, b: Provider) => number;
  };
}

function walletToScreen(wallet: WalletEntry): React.FC<ConnectorProps> {
  const WalletConnectCustomWrapper: React.FC<ConnectorProps> = ({
    onSubmit,
  }: ConnectorProps) => (
    <WalletConnectCustom onSubmit={onSubmit} wallet={wallet} />
  );

  return WalletConnectCustomWrapper;
}

function walletToProvider(wallet: WalletEntry): Provider {
  return {
    name: wallet.name,
    description: wallet.description || 'Missing description in registry',
    icon: wallet.logos,
    canConnect: () => true,
    showInList: () =>
      isMobile ? Object.values(wallet.mobile).some(Boolean) : true,
    listPriority: () => (wallet.id === WalletIds.Valora ? 0 : 1),
    installURL: wallet.homepage,
    walletConnectRegistryId: wallet.id,
  };
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  reactModalProps,
  RenderProvider = ProviderSelect,
  screens = defaultScreens,
  title = 'Connect a wallet',
  providersOptions = {},
}: ConnectModalProps) => {
  const { connectionCallback } = useContractKitInternal();
  const [adding, setAdding] = useState<SupportedProviders | null>(null);
  const [showMore, setShowMore] = useState(false);
  const celoWallets = useFetchWCWallets();
  const {
    hideFromDefaults,
    hideFromWCRegistry,
    additionalWCWallets = [],
    sort = defaultProviderSort,
  } = providersOptions;

  const {
    wallets,
    allScreens,
  }: {
    wallets: WalletEntry[];
    allScreens: Record<string, React.FC<ConnectorProps>>;
  } = useMemo(() => {
    let _screens: Record<string, React.FC<ConnectorProps>>;
    let _wallets = celoWallets.concat(
      (additionalWCWallets || []) as WalletEntry[]
    );

    if (hideFromDefaults) {
      if (hideFromDefaults === true) {
        _screens = {};
      } else {
        _screens = Object.keys(screens)
          .filter((x) => !hideFromDefaults.includes(x as SupportedProviders))
          .reduce(
            (acc, provider) => ({
              ...acc,
              [provider]: screens[provider as SupportedProviders],
            }),
            {}
          );
      }
    } else {
      _screens = screens;
    }

    if (hideFromWCRegistry) {
      if (hideFromWCRegistry === true) {
        return {
          wallets: (additionalWCWallets || []) as WalletEntry[],
          allScreens: {
            ..._screens,
            ...((additionalWCWallets || []) as WalletEntry[]).reduce(
              (acc, wallet) => {
                acc[wallet.id] = walletToScreen(wallet);
                return acc;
              },
              {} as Record<string, React.FC<ConnectorProps>>
            ),
          },
        };
      }
      _wallets = _wallets.filter(({ id }) => !hideFromWCRegistry.includes(id));
    }

    return {
      wallets: _wallets,
      allScreens: {
        ..._screens,
        ..._wallets.reduce((acc, wallet) => {
          acc[wallet.id] = walletToScreen(wallet);
          return acc;
        }, {} as Record<string, React.FC<ConnectorProps>>),
      },
    };
  }, [
    celoWallets,
    screens,
    hideFromWCRegistry,
    hideFromDefaults,
    additionalWCWallets,
  ]);

  const _providers: Record<string, Provider> = useMemo(
    () => ({
      ...PROVIDERS,
      ...wallets.reduce((acc, wallet) => {
        acc[wallet.id] = walletToProvider(wallet);
        return acc;
      }, {} as Record<string, Provider>),
    }),
    [wallets]
  );

  const close = useCallback((): void => {
    setAdding(null);
    setShowMore(false);
    connectionCallback?.(false);
  }, [connectionCallback]);

  const onSubmit = useCallback(
    (connector: Connector): void => {
      setAdding(null);
      connectionCallback?.(connector);
    },
    [connectionCallback]
  );

  const onToggleShowMore = useCallback(() => {
    setShowMore((state) => !state);
  }, []);

  const providers = useMemo<[providerKey: string, provider: Provider][]>(
    () =>
      Object.entries(_providers)
        .filter(
          ([providerKey, provider]) =>
            typeof window !== 'undefined' &&
            provider.showInList() &&
            Object.keys(allScreens).find((screen) => screen === providerKey)
        )
        .sort(([, a], [, b]) => sort(a, b)),
    [_providers, allScreens, sort]
  );

  const HAS_MORE_ITEMS = providers.length > 5; // TODO: is 5 a good default?
  const prioritizedProviders = useMemo<
    [providerKey: string, provider: Provider][]
  >(
    () =>
      HAS_MORE_ITEMS
        ? providers.filter(([, provider]) => provider.listPriority() === 0)
        : providers,
    [providers, HAS_MORE_ITEMS]
  );

  let modalContent;
  if (!adding) {
    const providersToDisplay = showMore ? providers : prioritizedProviders;
    modalContent = (
      <div className="tw-flex tw-flex-col tw-items-stretch">
        <h1 className="tw-pl-3 tw-pb-2 tw-text-lg tw-font-medium dark:tw-text-gray-300">
          {title}
        </h1>
        {providersToDisplay.map(([providerKey, provider]) => {
          return (
            <RenderProvider
              key={providerKey}
              provider={provider}
              onClick={() => setAdding(providerKey as SupportedProviders)}
            />
          );
        })}
        {HAS_MORE_ITEMS && (
          <button
            onClick={onToggleShowMore}
            className="tw-font-medium tw-text-md tw-w-32 tw-self-center tw-mt-4 tw-text-blue-800 dark:tw-text-blue-400 hover:tw-text-blue-600 focus:tw-outline-none"
          >
            Show {showMore ? 'Less' : 'More'}
          </button>
        )}
      </div>
    );
  } else {
    const ProviderElement = allScreens?.[adding];
    if (!ProviderElement) {
      return null;
    }
    modalContent = <ProviderElement onSubmit={onSubmit} />;
  }

  return (
    <ReactModal
      isOpen={!!connectionCallback}
      onRequestClose={close}
      style={defaultModalStyles}
      overlayClassName="tw-fixed tw-bg-gray-100 dark:tw-bg-gray-700 tw-bg-opacity-75 tw-inset-0"
      {...reactModalProps}
      ariaHideApp={false}
    >
      <div className="use-ck tw-bg-white dark:tw-bg-gray-800 tw-p-2">
        <div className="tw-relative use-ck-connect-container">
          <button
            onClick={close}
            className="tw-absolute tw-top-3 tw-right-2 tw-text-gray-700 dark:tw-text-gray-400 hover:tw-text-gray-800 dark:hover:tw-text-gray-300 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700 tw-p-1 tw-rounded"
          >
            <svg
              className="tw-h-5 tw-w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>{' '}
          </button>
          <div className="tw-px-4 tw-py-4">{modalContent}</div>
        </div>
      </div>
    </ReactModal>
  );
};
