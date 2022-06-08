import { CeloTokenContract } from '@celo/contractkit/lib/base';
import { MiniContractKit, newKit } from '@celo/contractkit/lib/mini-kit';

import { localStorageKeys, WalletTypes } from '../constants';
import { Connector, Maybe, Network } from '../types';
import {
  clearPreviousConfig,
  setLastUsedWalletArgs,
  setTypedStorageKey,
} from '../utils/local-storage';
import { persist, updateFeeCurrency } from './common';

export default class LedgerConnector implements Connector {
  public initialised = false;
  public type = WalletTypes.Ledger;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;

  constructor(
    private network: Network,
    private index: number,
    public feeCurrency: CeloTokenContract
  ) {
    setLastUsedWalletArgs([index]);
    setTypedStorageKey(localStorageKeys.lastUsedWalletType, WalletTypes.Ledger);
    setTypedStorageKey(localStorageKeys.lastUsedNetwork, network.name);
    this.kit = newKit(network.rpcUrl);
  }

  persist() {
    persist({
      walletType: WalletTypes.Ledger,
      network: this.network,
      options: [this.index],
    });
  }

  async initialise(): Promise<this> {
    const { default: TransportUSB } = await import(
      '@ledgerhq/hw-transport-webusb'
    );
    const { newLedgerWalletWithSetup } = await import('@celo/wallet-ledger');
    const transport = await TransportUSB.create();
    const wallet = await newLedgerWalletWithSetup(transport, [this.index]);
    this.kit = newKit(this.network.rpcUrl, wallet);
    this.kit.connection.defaultAccount = wallet.getAccounts()[0];

    this.initialised = true;
    this.account = this.kit.connection.defaultAccount ?? null;

    if (this.feeCurrency) {
      await this.updateFeeCurrency(this.feeCurrency);
    }

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
