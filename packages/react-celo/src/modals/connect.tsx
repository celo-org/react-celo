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
import { useCeloInternal } from '../use-celo';
import { hexToRGB } from '../utils/helpers';
import { defaultProviderSort, SortingPredicate } from '../utils/sort';
import cls from '../utils/tailwind';
import useProviders, { walletToProvider } from '../utils/useProviders';
import useTheme from '../utils/useTheme';

export const styles = cls({
  overlay: isMobile
    ? `
      tw-fixed
      tw-inset-0`
    : `
      tw-fixed
      tw-inset-0`,
  modal: isMobile
    ? `
      tw-h-screen
      tw-w-screen`
    : `
      tw-overflow-hidden
      tw-absolute
      tw-top-1/2
      tw-right-auto
      tw-bottom-auto
      tw-left-1/2
      tw--translate-x-1/2
      tw--translate-y-1/2
      tw-border-none
      tw-padding-0
      tw-rounded-lg
      tw-drop-shadow
      dark:tw-drop-shadow`,
  portal: `
    tw-overflow-hidden`,
});

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
  const theme = useTheme();
  const { connectionCallback } = useCeloInternal();
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
  const content = ProviderElement ? (
    <ProviderElement
      onSubmit={onSubmit}
      provider={PROVIDERS[adding] as WalletConnectProvider}
    />
  ) : (
    <Placeholder />
  );

  return (
    <ReactModal
      portalClassName={styles.portal}
      isOpen={!!connectionCallback}
      onRequestClose={close}
      className={styles.modal}
      overlayClassName={styles.overlay}
      style={{
        content: {
          background: theme.background,
        },
        overlay: {
          background: hexToRGB(theme.background, 0.75),
        },
      }}
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
