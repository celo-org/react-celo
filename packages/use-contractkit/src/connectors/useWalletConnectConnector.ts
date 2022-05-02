// Uncomment with WCV2 support
// import { SupportedMethods } from '@celo/wallet-walletconnect-v1';
import { CANCELED } from '@celo/wallet-walletconnect-v1';
import { useEffect, useState } from 'react';

import { Connector, Maybe } from '../types';
import { useContractKitInternal } from '../use-contractkit';
import { useWalletVersion } from '../utils/useWalletVersion';
import { WalletConnectConnector } from './connectors';

export function useWalletConnectConnector(
  onSubmit: (connector: Connector) => void,
  autoOpen: boolean,
  getDeeplinkUrl?: (uri: string) => string,
  walletId?: string
): { error: Maybe<string>; uri: Maybe<string>; loading: boolean } {
  const { network, feeCurrency, initConnector } = useContractKitInternal();
  const [uri, setUri] = useState<Maybe<string>>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Maybe<string>>(null);
  const version = useWalletVersion(walletId);

  useEffect(() => {
    let mounted = true;
    let connector: Maybe<WalletConnectConnector>;

    void (async () => {
      if (version == null) {
        console.warn(
          'WalletconnectConnector initialization awaiting for registry'
        );
        return;
      }

      connector = new WalletConnectConnector(
        network,
        feeCurrency,
        {
          connect: {
            chainId: network.chainId,
            // Uncomment with WCV2 support
            // metadata: {
            //   name: dapp.name,
            //   description: dapp.description,
            //   url: dapp.url,
            //   icons: [dapp.icon],
            // },
            // permissions: {
            //   blockchain: {
            //     chains: [`eip155:${}`],
            //   },
            //   jsonrpc: {
            //     methods: Object.values(SupportedMethods),
            //   },
            // },
          },
        },
        autoOpen,
        getDeeplinkUrl,
        version
      );
      connector.onUri((newUri) => {
        if (mounted) {
          setUri(newUri);
        }
      });
      connector.onConnect(() => {
        setLoading(true);
      });
      connector.onClose(() => {
        setError('Connection with wallet was closed.');
        setUri(null);
      });
      try {
        await initConnector(connector);

        onSubmit(connector);
      } catch (reason) {
        if (reason === CANCELED) {
          return;
        }
        setError((reason as Error).message);
      }
    })();

    return () => {
      // This will be called when unmounting the component rendering the qrcode
      // if initialised is false, it means the connection was canceled or errored.
      // We should cleanup the state
      if (!connector?.initialised) {
        void connector?.close('Connection canceled');
      }

      setUri(null);
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, network.chainId]);

  return { uri, error, loading };
}
