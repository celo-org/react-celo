import { CeloTokenContract } from '@celo/contractkit/lib/base';
import { MiniContractKit, newKit } from '@celo/contractkit/lib/mini-kit';
import { LedgerWallet } from '@celo/wallet-ledger';

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
  private wallet: LedgerWallet | undefined;
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

  private async createWallet(index: number) {
    const { default: TransportUSB } = await import(
      '@ledgerhq/hw-transport-webusb'
    );
    const { newLedgerWalletWithSetup } = await import('@celo/wallet-ledger');
    const transport = await TransportUSB.create();
    this.wallet = await newLedgerWalletWithSetup(transport, [index]);
    return this.wallet;
  }

  private async createKit(wallet: LedgerWallet, network: Network) {
    this.kit = newKit(network.rpcUrl, wallet);
    this.kit.connection.defaultAccount = wallet.getAccounts()[0];
    this.account = this.kit.connection.defaultAccount ?? null;
    if (this.feeCurrency) {
      await this.updateFeeCurrency(this.feeCurrency);
    }
  }

  async initialise(): Promise<this> {
    if (this.initialised) {
      return this;
    }

    const wallet = await this.createWallet(this.index);
    await this.createKit(wallet, this.network);

    this.initialised = true;

    this.emit(ConnectorEvents.CONNECTED, {
      walletType: this.type,
      address: this.kit.connection.defaultAccount as string,
      index: this.index,
      networkName: this.network.name,
    });
    return this;
  }

  supportsFeeCurrency() {
    return true;
  }

  async startNetworkChangeFromApp(network: Network) {
    await this.createKit(this.wallet as LedgerWallet, network);
    this.emit(ConnectorEvents.NETWORK_CHANGED, network.name);
  }

  updateFeeCurrency: typeof updateFeeCurrency = updateFeeCurrency.bind(this);

  close(): void {
    this.kit.connection.stop();
    this.disconnect();
    return;
  }
}
