import { CeloTokenContract } from '@celo/contractkit/lib/base';
import { MiniContractKit, newKit } from '@celo/contractkit/lib/mini-kit';

import { localStorageKeys, WalletTypes } from '../constants';
import { Connector, Maybe, Network } from '../types';
import {
  setLastUsedWalletArgs,
  setTypedStorageKey,
} from '../utils/local-storage';
import {
  AbstractConnector,
  ConnectorEvents,
  updateFeeCurrency,
} from './common';

export default class LedgerConnector
  extends AbstractConnector
  implements Connector
{
  public initialised = false;
  public type = WalletTypes.Ledger;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;

  constructor(
    private network: Network,
    private index: number,
    public feeCurrency: CeloTokenContract
  ) {
    super();
    setLastUsedWalletArgs([index]);
    setTypedStorageKey(localStorageKeys.lastUsedWalletType, WalletTypes.Ledger);
    setTypedStorageKey(localStorageKeys.lastUsedNetwork, network.name);
    this.kit = newKit(network.rpcUrl);
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

    this.emit(ConnectorEvents.CONNECTED, {
      walletType: this.type,
      address: this.account,
      index: this.index,
      networkName: this.network.name,
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
