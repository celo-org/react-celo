import { SupportedMethods } from '@celo-tools/walletconnect';
import { useEffect, useState } from 'react';

import { Mainnet } from '../constants';
import { Connector } from '../types';
import { useContractKitInternal } from '../use-contractkit';
import { useDappVersion } from '../utils/useDappVersion';
import { WalletConnectConnector } from './connectors';

export function useWalletConnectConnector(
  onSubmit: (connector: Connector) => void,
  autoOpen: boolean,
  getDeeplinkUrl?: (uri: string) => string
): string {
  const { network, dapp, destroy, initConnector } = useContractKitInternal();
  const [uri, setUri] = useState('');
  const version = useDappVersion(dapp);

  useEffect(() => {
    let mounted = true;
    const initialiseConnection = async () => {
      if (version == null) {
        throw ', supported version not fetched yet';
      }

      const isMainnet = network.name === Mainnet.name;
      const relayProvider = 'wss://relay.walletconnect.org';
      const connector = new WalletConnectConnector(
        network,
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
          init: {
            relayProvider,
            logger: 'error',
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
