import { CANCELED } from '@celo/wallet-walletconnect';
import { useCallback, useEffect, useState } from 'react';

import { WalletConnectConnector } from '../connectors';
import { ConnectorEvents } from '../connectors/common';
import { Connector, Maybe } from '../types';
import { useCeloInternal } from '../use-celo';
import { getApplicationLogger } from '../utils/logger';
import { useWalletVersion } from './use-wallet-version';

interface UseWalletConnectConnector {
  error: Maybe<string>;
  uri: Maybe<string>;
  loading: boolean;
  retry: () => void;
}

export default function useWalletConnectConnector(
  onSubmit: (connector: Connector) => void,
  autoOpen: boolean,
  walletId: string,
  getDeeplinkUrl?: (uri: string) => string | false
): UseWalletConnectConnector {
  const {
    dapp,
    network,
    feeCurrency,
    initConnector,
    resetInitError,
    initError,
    disconnect,
    manualNetworkMode,
  } = useCeloInternal();
  const [uri, setUri] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Maybe<string>>(null);
  const version = useWalletVersion(walletId);
  const [retryValue, setRetry] = useState(0);

  const retry = useCallback(() => {
    setUri(null);
    setError(null);
    resetInitError();
    disconnect;
    setLoading(false);
    setRetry((x) => x + 1);
  }, [disconnect, resetInitError]);

  useEffect(() => {
    let mounted = true;
    let connector: Maybe<WalletConnectConnector>;

    void (async () => {
      if (version == null) {
        getApplicationLogger().debug(
          '[useWalletConnectConnector]',
          'Initialization awaiting for registry'
        );
        return;
      }

      if (!dapp.walletConnectProjectId) {
        const err =
          'Missing WalletConnect Project Id, create one here: https://docs.walletconnect.com/2.0/cloud/relay';
        getApplicationLogger().debug('[useWalletConnectConnector]', err);
        setError(err);
        return;
      }

      connector = new WalletConnectConnector(
        network,
        manualNetworkMode,
        feeCurrency,
        {
          projectId: dapp.walletConnectProjectId,
          chainId: network.chainId,
          init: {
            metadata: { ...dapp, icons: [dapp.icon] },
          },
        },
        autoOpen,
        getDeeplinkUrl,
        version,
        walletId
      );
      connector.on(ConnectorEvents.WC_URI_RECEIVED, (nextURI) => {
        getApplicationLogger().debug(
          '[useWalletConnectConnector]',
          'Generated WC URI',
          nextURI
        );
        if (mounted) {
          setUri(nextURI);
        }
      });
      connector.on(ConnectorEvents.DISCONNECTED, () => {
        getApplicationLogger().debug(
          '[useWalletConnectConnector]',
          'Lost connection to WC servers'
        );
        setError('Connection with wallet was closed.');
        setUri(null);
      });

      try {
        await initConnector(connector);

        onSubmit(connector);
      } catch (reason) {
        if (reason === CANCELED) {
          getApplicationLogger().debug(
            '[useWalletConnectConnector]',
            'User canceled connection'
          );
          // disconnect so we dont have open connectors all over the place
          return disconnect();
        }
        getApplicationLogger().debug(
          '[useWalletConnectConnector]',
          'WC error',
          reason
        );
        setError((reason as Error).message);
      }
    })();

    return () => {
      // This will be called when unmounting the component rendering the qrcode
      // if initialised is false, it means the connection was canceled or errored.
      // We should cleanup the state
      if (!connector?.initialised) {
        // disconnect so we dont have open connectors all over the place
        void disconnect();
      }

      setUri(null);
      mounted = false;
    };
    // adding all deps here causes an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletId, network.chainId, retryValue]);

  return { uri, error: error || initError?.message, loading, retry };
}
