import { useCallback, useEffect, useState } from 'react';

import { WalletConnectConnector } from '../connectors';
import { Mainnet } from '../constants';
import { Connector } from '../types';
import { useInternalContractKit } from '../use-contractkit';

export function useWalletConnectConnector(
  onSubmit: (connector: Connector) => void,
  autoOpen: boolean,
  getDeeplinkUrl?: (uri: string) => string
): string {
  const { network, dapp, destroy, initConnector } = useInternalContractKit();
  const [uri, setUri] = useState('');

  const initialiseConnection = useCallback(async () => {
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

    connector.onUri((newUri) => setUri(newUri));
    connector.onClose(() => void destroy());

    await initConnector(connector);

    onSubmit(connector);
  }, [
    network,
    dapp.name,
    dapp.description,
    dapp.url,
    dapp.icon,
    initConnector,
    onSubmit,
    destroy,
    autoOpen,
    getDeeplinkUrl,
  ]);

  useEffect(() => {
    initialiseConnection().catch((reason) =>
      console.error('Failed to initialise WalletConnect connection', reason)
    );
  }, [initialiseConnection]);

  return uri;
}
