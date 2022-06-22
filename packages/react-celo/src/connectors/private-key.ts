import { CeloTokenContract } from '@celo/contractkit/lib/base';
import { MiniContractKit, newKit } from '@celo/contractkit/lib/mini-kit';
import { LocalWallet } from '@celo/wallet-local';

import { localStorageKeys, WalletTypes } from '../constants';
import { Connector, Maybe, Network } from '../types';
import { setTypedStorageKey } from '../utils/local-storage';
import {
  AbstractConnector,
  ConnectorEvents,
  updateFeeCurrency,
} from './common';

export default class PrivateKeyConnector
  extends AbstractConnector
  implements Connector
{
  public initialised = true;
  public type = WalletTypes.PrivateKey;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;

  constructor(
    private network: Network,
    private privateKey: string,
    public feeCurrency: CeloTokenContract
  ) {
    super();
    const wallet = new LocalWallet();
    wallet.addAccount(privateKey);

    this.kit = newKit(network.rpcUrl, wallet);
    this.kit.connection.defaultAccount = wallet.getAccounts()[0];
    this.account = this.kit.connection.defaultAccount ?? null;
  }

  async initialise(): Promise<this> {
    await this.updateFeeCurrency(this.feeCurrency);
    this.initialised = true;

    setTypedStorageKey(localStorageKeys.lastUsedPrivateKey, this.privateKey);
    this.emit(ConnectorEvents.CONNECTED, {
      networkName: this.network.name,
      walletType: this.type,
      address: this.account as string,
    });
    return this;
  }

  supportsFeeCurrency() {
    return true;
  }

  updateFeeCurrency: typeof updateFeeCurrency = updateFeeCurrency.bind(this);

  close(): void {
    this.emit(ConnectorEvents.DISCONNECTED);
    return;
  }
}
