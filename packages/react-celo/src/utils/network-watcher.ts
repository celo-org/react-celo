import { ConnectorEvents } from '../connectors/common';
import { Connector, Network } from '../types';
import { getApplicationLogger } from './logger';

function networkWatcher(connector: Connector, networks: Network[]) {
  connector.on(ConnectorEvents.WALLET_CHAIN_CHANGED, (chainId) => {
    const network = networks?.find((net) => net.chainId === chainId);
    getApplicationLogger().debug(
      '[network-watcher] received',
      chainId,
      'found',
      network ? network : 'nothing'
    );
    if (network && connector.continueNetworkUpdateFromWallet) {
      void connector.continueNetworkUpdateFromWallet(network);
    }
  });
}

export default networkWatcher;
