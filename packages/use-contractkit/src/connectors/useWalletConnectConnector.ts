import { useCallback, useEffect, useState } from 'react';
import { WalletConnectConnector } from '../connectors';
import { Alfajores } from '../constants';
import { Connector } from '../types';
import { useInternalContractKit } from '../use-contractkit';

export function useWalletConnectConnector(
  onSubmit: (connector: Connector) => void,
  autoOpenOnMobile = true
) {
  const { network, dapp, destroy, initConnector } = useInternalContractKit();
  const [uri, setUri] = useState('');

  const initialiseConnection = useCallback(async () => {
    const relayProvider =
      network.name === Alfajores.name
        ? 'wss://walletconnect.celo-networks-dev.org'
        : 'wss://walletconnect.celo.org';
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
      autoOpenOnMobile
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
  ]);

  useEffect(() => {
    initialiseConnection().catch((reason) =>
      console.error('Failed to initialise WalletConnect connection', reason)
    );
  }, [initialiseConnection]);

  return uri;
}
