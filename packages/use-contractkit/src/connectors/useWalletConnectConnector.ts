import { SupportedMethods } from '@celo/wallet-walletconnect-v1';
import { useEffect, useState } from 'react';

import { Mainnet } from '../constants';
import { Connector, WalletEntry } from '../types';
import { useContractKitInternal } from '../use-contractkit';
import { useWalletVersion } from '../utils/useWalletVersion';
import { WalletConnectConnector } from './connectors';

export function useWalletConnectConnector(
  onSubmit: (connector: Connector) => void,
  autoOpen: boolean,
  getDeeplinkUrl?: (uri: string) => string,
  wallet?: WalletEntry
): string {
  const { network, feeCurrency, dapp, destroy, initConnector } =
    useContractKitInternal();
  const [uri, setUri] = useState('');
  const version = useWalletVersion(wallet);

  useEffect(() => {
    let mounted = true;
    const initialiseConnection = async () => {
      if (version == null) {
        console.warn(
          'WalletconnectConnector initialization awaiting for registry'
        );
        return;
      }

      const isMainnet = network.name === Mainnet.name;
      const connector = new WalletConnectConnector(
        network,
        feeCurrency,
        {
          connect: {
            metadata: {
              name: dapp.name,
              description: dapp.description,
              url: dapp.url,
              icons: [dapp.icon],
            },
            permissions: {
              blockchain: {
                chains: [`eip155:${network.chainId}`],
              },
              jsonrpc: {
                methods: Object.values(SupportedMethods),
              },
            },
          },
        },
        autoOpen && isMainnet,
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
