import { CeloContract, CeloTokenContract } from '@celo/contractkit/lib/base';
import { MiniContractKit, newKit } from '@celo/contractkit/lib/mini-kit';

import { WalletTypes } from '../constants';
import { Connector, Maybe, Network } from '../types';
import { clearPreviousConfig, forgetConnection } from '../utils/local-storage';
import { ConnectorEvents, EventsMap } from './common';

/**
 * Connectors are our link between a DApp and the users wallet. Each
 * wallet has different semantics and these classes attempt to unify
 * them and present a workable API.
 */

export default class UnauthenticatedConnector implements Connector {
  public initialised = true;
  public type = WalletTypes.Unauthenticated;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;
  public feeCurrency: CeloTokenContract = CeloContract.GoldToken;
  constructor(n: Network) {
    this.kit = newKit(n.rpcUrl);
  }
  // note handle the forgetConnection somewhere ?

  initialise(): this {
    this.initialised = true;
    return this;
  }

  supportsFeeCurrency() {
    return false;
  }

  close(): void {
    clearPreviousConfig();
    return;
  }
  on<E extends ConnectorEvents>(_e: E, _fn: (arg: EventsMap[E]) => void): void {
    // no op
  }
}
