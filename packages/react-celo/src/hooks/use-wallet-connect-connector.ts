// Uncomment with WCV2 support
// import { SupportedMethods } from '@celo/wallet-walletconnect-v1';
import { CANCELED } from '@celo/wallet-walletconnect-v1';
import { useCallback, useEffect, useState } from 'react';

import { WalletConnectConnector } from '../connectors';
import { buildOptions } from '../connectors/wallet-connect';
import { Connector, Maybe } from '../types';
import { useCeloInternal } from '../use-celo';
import { getApplicationLogger } from '../utils/logger';
import { useWalletVersion } from './use-wallet-version';

import { ConnectorEvents } from '../connectors/common';

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
  const { network, feeCurrency, initConnector, destroy } = useCeloInternal();
  const [uri, setUri] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Maybe<string>>(null);
  const version = useWalletVersion(walletId);
  const [retryValue, setRetry] = useState(0);

  const retry = useCallback(() => {
    setUri(null);
    setError(null);
    setLoading(false);
    setRetry((x) => x + 1);
  }, []);

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

      connector = new WalletConnectConnector(
        network,
        feeCurrency,
        buildOptions(network),
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
          // destroy so we dont have open connectors all over the place
          return destroy();
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
        // destroy so we dont have open connectors all over the place
        destroy();
      }

      setUri(null);
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, network.chainId, retryValue]);

  return { uri, error, loading, retry };
}
