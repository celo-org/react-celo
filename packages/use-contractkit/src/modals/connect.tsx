import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { isMobile } from 'react-device-detect';
import ReactModal from 'react-modal';

import ModalContainer from '../components/modal-container';
import Tray from '../components/tray';
import { PROVIDERS, SupportedProviders } from '../constants';
import { ConnectorProps, defaultScreens } from '../screens';
import Placeholder from '../screens/placeholder';
import { WalletConnect } from '../screens/wallet-connect';
import {
  Connector,
  Maybe,
  Provider,
  WalletConnectProvider,
  WalletEntry,
} from '../types';
import { useContractKitInternal } from '../use-contractkit';
import { defaultProviderSort, SortingPredicate } from '../utils/sort';
import useProviders, { walletToProvider } from '../utils/useProviders';
import { defaultModalStyles, mobileModalStyles } from './styles';

export interface ConnectModalProps {
  screens?: {
    [x in SupportedProviders]?: FunctionComponent<{
      onSubmit: (connector: Connector) => void;
      provider?: WalletConnectProvider;
    }>;
  };
  RenderProvider?: React.FC<{
    provider: Provider;
    onClick: () => void;
    selected: boolean;
  }>;
  reactModalProps?: Partial<ReactModal.Props>;
  title?: string | React.ReactElement;
  providersOptions?: {
    hideFromDefaults?: true | SupportedProviders[];
    additionalWCWallets?: WalletEntry[];
    sort?: SortingPredicate<Provider>;
    searchable?: boolean;
  };
}

function walletToScreen(wallet: WalletEntry): React.FC<ConnectorProps> {
  const WalletConnectCustomWrapper: React.FC<ConnectorProps> = ({
    onSubmit,
  }: ConnectorProps) => (
    <WalletConnect onSubmit={onSubmit} provider={walletToProvider(wallet)} />
  );

  return WalletConnectCustomWrapper;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  reactModalProps,
  screens = defaultScreens,
  title = 'Connect a wallet',
  providersOptions = {},
}: ConnectModalProps) => {
  const { connectionCallback } = useContractKitInternal();
  const [search, setSearch] = useState<string>('');
  const [adding, setAdding] = useState<Maybe<SupportedProviders>>(null);

  const back = useCallback((): void => {
    setSearch('');
    setAdding(null);
  }, []);

  const close = useCallback((): void => {
    back();
    connectionCallback?.(false);
  }, [back, connectionCallback]);

  const onSubmit = useCallback(
    (connector: Connector): void => {
      connectionCallback?.(connector);
      back();
    },
    [back, connectionCallback]
  );

  const {
    hideFromDefaults,
    additionalWCWallets,
    sort = defaultProviderSort,
    searchable = true,
  } = providersOptions;

  const { wallets, allScreens } = useMemo(() => {
    let _screens: Record<string, React.FC<ConnectorProps>>;
    const _wallets = additionalWCWallets || [];

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

    return {
      wallets: _wallets,
      allScreens: _wallets.reduce((acc, wallet) => {
        acc[wallet.id] = walletToScreen(wallet);
        return acc;
      }, _screens),
    };
  }, [screens, hideFromDefaults, additionalWCWallets]);

  const providers = useProviders(wallets, sort, search);

  const ProviderElement = adding && allScreens?.[adding];
  const content = !ProviderElement ? (
    <Placeholder />
  ) : (
    <ProviderElement
      onSubmit={onSubmit}
      provider={PROVIDERS[adding] as WalletConnectProvider}
    />
  );

  return (
    <ReactModal
      portalClassName="tw-overflow-hidden"
      isOpen={!!connectionCallback}
      // isOpen
      onRequestClose={close}
      style={isMobile ? mobileModalStyles : defaultModalStyles}
      overlayClassName={
        isMobile
          ? 'tw-fixed tw-bg-white dark:tw-bg-slate-800 tw-inset-0'
          : 'tw-fixed tw-bg-slate-100 dark:tw-bg-slate-700 tw-bg-opacity-75 tw-inset-0'
      }
      {...reactModalProps}
      shouldCloseOnOverlayClick={!isMobile}
      ariaHideApp={false}
    >
      <ModalContainer
        onClose={close}
        onBack={back}
        selectedProvider={adding}
        tray={
          <Tray
            providers={providers}
            title={title}
            onClickProvider={setAdding}
            selectedProvider={adding}
            {...(searchable && {
              search: search,
              onSearch: (str) => setSearch(str),
            })}
          />
        }
        content={content}
      />
    </ReactModal>
  );
};
