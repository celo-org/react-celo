import { useEffect, useState } from 'react';

import { Mainnet } from '../constants';
import { Connector } from '../types';
import { useContractKitInternal } from '../use-contractkit';
import { WalletConnectConnector } from './connectors';

export function useWalletConnectConnector(
  onSubmit: (connector: Connector) => void,
  autoOpen: boolean,
  getDeeplinkUrl?: (uri: string) => string
): string {
  const { network, dapp, destroy, initConnector } = useContractKitInternal();
  const [uri, setUri] = useState('');

  useEffect(() => {
    let mounted = true;
    const initialiseConnection = async () => {
      const isMainnet = network.name === Mainnet.name;
      const relayProvider = isMainnet
        ? 'wss://walletconnect.celo.org'
        : 'wss://walletconnect.celo-networks-dev.org';
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
          },
          init: {
            relayProvider,
            logger: 'error',
          },
        },
        autoOpen && isMainnet,
        getDeeplinkUrl
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
  }, []);

  return uri;
}
