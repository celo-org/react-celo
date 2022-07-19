import { CeloContract, CeloTokenContract } from '@celo/contractkit/lib/base';
import { MiniContractKit, newKit } from '@celo/contractkit/lib/mini-kit';

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
  public kit: MiniContractKit;
  public feeCurrency: CeloTokenContract = CeloContract.GoldToken;
  constructor(n: Network) {
    super();
    this.kit = newKit(n.rpcUrl);
  }

  initialise(): this {
    this.initialised = true;
    return this;
  }

  supportsFeeCurrency() {
    return false;
  }

  startNetworkChangeFromApp(network: Network) {
    this.kit = newKit(network.rpcUrl);
    this.emit(ConnectorEvents.NETWORK_CHANGED, network.name);
  }

  close(): void {
    this.kit.connection.stop();
    this.disconnect();
    return;
  }
}
