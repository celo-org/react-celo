import { ConnectorEvents } from '../connectors/common';
import { Connector, Network } from '../types';

function networkWatcher(connector: Connector, networks: Network[]) {
  connector.on(ConnectorEvents.WALLET_CHAIN_CHANGED, (chainId) => {
    const network = networks?.find((net) => net.chainId === chainId);
    if (network && connector.continueNetworkUpdateFromWallet) {
      void connector.continueNetworkUpdateFromWallet(network);
    }
  });
}

export default networkWatcher;
