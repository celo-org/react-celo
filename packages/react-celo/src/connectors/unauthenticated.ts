import { CeloContract, CeloTokenContract } from '@celo/contractkit/lib/base';
import { StaticCeloProvider } from '@celo-tools/celo-ethers-wrapper';

import { WalletTypes } from '../constants';
import { Connector, Network } from '../types';
import { AbstractConnector, ConnectorEvents } from './common';

/**
 * Connectors are our link between a DApp and the users wallet. Each
 * wallet has different semantics and these classes attempt to unify
 * them and present a workable API.
 */

export default class UnauthenticatedConnector
  extends AbstractConnector
  implements Connector
{
  public initialised = true;
  public type = WalletTypes.Unauthenticated;
  public provider: StaticCeloProvider;
  public feeCurrency: CeloTokenContract = CeloContract.GoldToken;
  constructor(n: Network) {
    super();
    this.provider = new StaticCeloProvider(n.rpcUrl);
  }

  initialise(): this {
    this.initialised = true;
    return this;
  }

  supportsFeeCurrency() {
    return false;
  }

  startNetworkChangeFromApp(network: Network) {
    this.provider = new StaticCeloProvider(network.rpcUrl);
    this.emit(ConnectorEvents.NETWORK_CHANGED, network.name);
  }

  close(): void {
    try {
      this.provider;
      // this.kit.connection.stop();
    } finally {
      this.disconnect();
    }
  }
}
