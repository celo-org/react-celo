import { CeloTokenContract } from '@celo/contractkit/lib/base';
import {
  MiniContractKit,
  newKit,
  newKitFromWeb3,
} from '@celo/contractkit/lib/mini-kit';
import { Web3Provider } from '@ethersproject/providers';

import { WalletTypes } from '../constants';
import { Connector, Network } from '../types';
import { AbstractConnector, ConnectorEvents, Web3Type } from './common';

export default class CeloExtensionWalletConnector
  extends AbstractConnector
  implements Connector
{
  public provider: Web3Provider;
  public initialised = false;
  public type = WalletTypes.CeloExtensionWallet;
  public kit: MiniContractKit;

  constructor(private network: Network, public feeCurrency: CeloTokenContract) {
    super();
    this.kit = newKit(network.rpcUrl);
    const celo = window.celo;
    if (!celo) {
      throw new Error('Celo Extension Wallet not installed');
    }
    //  @ts-expect-error This probably works right?
    this.provider = new Web3Provider(celo);
  }

  async initialise(): Promise<this> {
    const celo = window.celo;
    if (!celo) {
      throw new Error('Celo Extension Wallet not installed');
    }
    await celo.enable();
    (
      this.provider as unknown as {
        publicConfigStore: {
          on: (
            event: string,
            cb: (args: { networkVersion: number }) => void
          ) => void;
        };
      }
    ).publicConfigStore.on('update', ({ networkVersion }) => {
      if (networkVersion !== this.network.chainId) {
        this.emit(ConnectorEvents.WALLET_CHAIN_CHANGED, networkVersion);
      }
    });

    const [defaultAccount] = await this.kit.connection.web3.eth.getAccounts();
    this.kit.connection.defaultAccount = defaultAccount;

    this.initialised = true;

    const walletChainId = (await celo.request!({
      method: 'eth_chainId',
    })) as string;

    this.emit(ConnectorEvents.CONNECTED, {
      walletChainId: parseInt(walletChainId, 16),
      walletType: WalletTypes.CeloExtensionWallet,
      address: defaultAccount,
      networkName: this.network.name,
    });
    return this;
  }

  continueNetworkUpdateFromWallet(network: Network): void {
    this.network = network; // must set to prevent loop
    const web3 = this.kit.connection.web3;
    this.newKit(web3, this.account as string); // kit caches things so it need to be recreated
    this.emit(ConnectorEvents.NETWORK_CHANGED, network.name);
  }

  startNetworkChangeFromApp() {
    throw new Error(
      'Celo Extension wallet does not support changing network from app'
    );
  }

  supportsFeeCurrency() {
    return false;
  }

  private newKit(web3: Web3Type, defaultAccount: string) {
    this.kit = newKitFromWeb3(web3 as unknown as Web3Type);
    this.kit.connection.defaultAccount = defaultAccount;
  }

  close(): void {
    try {
      this.kit.connection.stop();
    } finally {
      this.disconnect();
    }
  }
}
