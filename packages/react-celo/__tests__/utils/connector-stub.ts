import { CeloContract, CeloTokenContract } from '@celo/contractkit/lib/base';
import { MiniContractKit, newKit } from '@celo/contractkit/lib/mini-kit';

import {
  AbstractConnector,
  ConnectorEvents,
  EventsMap,
} from '../../src/connectors/common';
import { WalletTypes } from '../../src/constants';
import { Connector, Network } from '../../src/types';

export class ConnectorStub extends AbstractConnector implements Connector {
  public initialised = true;
  public type = WalletTypes.Unauthenticated;
  public kit: MiniContractKit;
  public feeCurrency: CeloTokenContract = CeloContract.GoldToken;

  constructor(n: Network) {
    super();
    this.kit = newKit(n.rpcUrl);
  }

  startNetworkChangeFromApp(network: Network) {}

  initialise = () => Promise.resolve(this);

  testEmit = <E extends ConnectorEvents>(event: E, args?: EventsMap[E]) => {
    this.emit(event, args);
  };

  close: () => void = () => undefined;
}
