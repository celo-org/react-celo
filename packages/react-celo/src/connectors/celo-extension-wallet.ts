import { CeloTokenContract } from '@celo/contractkit/lib/base';
import {
  MiniContractKit,
  newKit,
  newKitFromWeb3,
} from '@celo/contractkit/lib/mini-kit';

import { WalletTypes } from '../constants';
import { Connector, Maybe, Network } from '../types';
import { clearPreviousConfig } from '../utils/local-storage';
import {
  AbstractConnector,
  ConnectorEvents,
  persist,
  Web3Type,
} from './common';

export default class CeloExtensionWalletConnector
  extends AbstractConnector
  implements Connector
{
  public initialised = false;
  public type = WalletTypes.CeloExtensionWallet;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;
  private onNetworkChangeCallback?: (chainId: number) => void;

  constructor(private network: Network, public feeCurrency: CeloTokenContract) {
    super();
    this.kit = newKit(network.rpcUrl);
  }

  persist() {
    persist({
      walletType: WalletTypes.CeloExtensionWallet,
      network: this.network,
      options: [this.feeCurrency],
    });
  }

  async initialise(): Promise<this> {
    const { default: Web3 } = await import('web3');

    const celo = window.celo;
    if (!celo) {
      throw new Error('Celo Extension Wallet not installed');
    }
    const web3 = new Web3(celo);
    await celo.enable();

    (
      web3.currentProvider as unknown as {
        publicConfigStore: {
          on: (
            event: string,
            cb: (args: { networkVersion: number }) => void
          ) => void;
        };
      }
    ).publicConfigStore.on('update', ({ networkVersion }) => {
      if (this.onNetworkChangeCallback) {
        this.onNetworkChangeCallback(networkVersion);
      }
    });

    this.kit = newKitFromWeb3(web3 as unknown as Web3Type);
    const [defaultAccount] = await this.kit.connection.web3.eth.getAccounts();
    this.kit.connection.defaultAccount = defaultAccount;
    this.account = defaultAccount ?? null;

    this.initialised = true;

    this.persist();

    return this;
  }

  supportsFeeCurrency() {
    return false;
  }

  onNetworkChange(callback: (chainId: number) => void): void {
    this.onNetworkChangeCallback = callback;
  }

  close(): void {
    clearPreviousConfig();
    this.emit(ConnectorEvents.DISCONNECTED);
    return;
  }
}
