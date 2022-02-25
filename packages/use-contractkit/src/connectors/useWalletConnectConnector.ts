// Uncomment with WCV2 support
// import { SupportedMethods } from '@celo/wallet-walletconnect-v1';
import { useEffect, useState } from 'react';

import { WalletIds } from '../constants';
import { Connector } from '../types';
import { useContractKitInternal } from '../use-contractkit';
import { useWalletVersion } from '../utils/useWalletVersion';
import { WalletConnectConnector } from './connectors';

export function useWalletConnectConnector(
  onSubmit: (connector: Connector) => void,
  autoOpen: boolean,
  getDeeplinkUrl?: (uri: string) => string,
  walletId?: WalletIds
): string {
  const { network, feeCurrency, destroy, initConnector } =
    useContractKitInternal();
  const [uri, setUri] = useState('');
  const version = useWalletVersion(walletId);

  useEffect(() => {
    let mounted = true;
    const initialiseConnection = async () => {
      if (version == null) {
        console.warn(
          'WalletconnectConnector initialization awaiting for registry'
        );
        return;
      }

      const connector = new WalletConnectConnector(
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
      connector.onClose(() => void destroy());
      await initConnector(connector);
      onSubmit(connector);
    };

    initialiseConnection()
      .then(() => console.info('WalletConnect connection initialised'))
      // TODO surface error to user here
      .catch((reason) =>
        console.error('Failed to initialise WalletConnect connection', reason)
      );

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  return uri;
}
