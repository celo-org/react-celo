import { CeloTokenContract } from '@celo/contractkit/lib/base';
import { MiniContractKit, newKit } from '@celo/contractkit/lib/mini-kit';
import { LocalWallet } from '@celo/wallet-local';

import { WalletTypes } from '../constants';
import { Connector, Maybe, Network } from '../types';
import { clearPreviousConfig } from '../utils/local-storage';
import { persist, updateFeeCurrency } from './common';

export default class PrivateKeyConnector implements Connector {
  public initialised = true;
  public type = WalletTypes.PrivateKey;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;

  constructor(
    private network: Network,
    private privateKey: string,
    public feeCurrency: CeloTokenContract
  ) {
    const wallet = new LocalWallet();
    wallet.addAccount(privateKey);

    this.kit = newKit(network.rpcUrl, wallet);
    this.kit.connection.defaultAccount = wallet.getAccounts()[0];
    this.account = this.kit.connection.defaultAccount ?? null;
  }

  persist() {
    persist({
      walletType: WalletTypes.PrivateKey,
      network: this.network,
      options: [this.privateKey],
    });
  }

  async initialise(): Promise<this> {
    await this.updateFeeCurrency(this.feeCurrency);
    this.initialised = true;

    this.persist();

    return this;
  }

  supportsFeeCurrency() {
    return true;
  }

  updateFeeCurrency: typeof updateFeeCurrency = updateFeeCurrency.bind(this);

  close(): void {
    clearPreviousConfig();
    return;
  }
}
