import { CeloContract, CeloTokenContract } from '@celo/contractkit/lib/base';
import {
  MiniContractKit,
  newKit,
  newKitFromWeb3,
} from '@celo/contractkit/lib/mini-kit';
import {
  CoinbaseWalletProvider,
  CoinbaseWalletSDK,
} from '@coinbase/wallet-sdk';

import { WalletTypes } from '../constants';
import { Ethereum } from '../global';
import { Connector, Dapp, Maybe, Network } from '../types';
import { switchToCeloNetwork } from '../utils/metamask';
import { AbstractConnector, ConnectorEvents, Web3Type } from './common';

export default class CoinbaseWalletConnector
  extends AbstractConnector
  implements Connector
{
  public initialised = false;
  public type = WalletTypes.CoinbaseWallet;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;
  public feeCurrency: CeloTokenContract = CeloContract.GoldToken;

  private provider: CoinbaseWalletProvider | null = null;

  constructor(private network: Network, dapp: Pick<Dapp, 'name' | 'icon'>) {
    super();
    this.kit = newKit(network.rpcUrl);

    const sdk = new CoinbaseWalletSDK({
      appName: dapp?.name ?? '',
      appLogoUrl: dapp?.icon ?? '',
    });
    this.provider = sdk.makeWeb3Provider(network.rpcUrl, network.chainId);
  }

  async initialise(): Promise<this> {
    if (!this.provider) {
      throw new Error('Coinbase wallet provider not instantiated');
    }
    if (this.initialised) {
      return this;
    }
    const { default: Web3 } = await import('web3');
    const web3 = new Web3(this.provider);

    const [defaultAccount]: string[] = await this.provider.request({
      method: 'eth_requestAccounts',
    });

    this.removeListeners();

    await switchToCeloNetwork(
      this.network,
      this.provider as unknown as Ethereum,
      () => web3.eth.getChainId()
    );

    this.provider.on('chainChanged', this.onChainChanged);
    this.provider.on('accountsChanged', this.onAccountsChanged);

    this.newKit(web3 as unknown as Web3Type, defaultAccount);
    this.initialised = true;

    this.emit(ConnectorEvents.CONNECTED, {
      walletType: this.type,
      networkName: this.network.name,
      address: defaultAccount,
    });

    return this;
  }

  private onChainChanged = (chainIdHex: string) => {
    const chainId = parseInt(chainIdHex, 16);
    if (this.network.chainId !== chainId) {
      this.emit(ConnectorEvents.WALLET_CHAIN_CHANGED, chainId);
    }
  };

  private removeListeners() {
    if (this.provider) {
      this.provider.removeListener('chainChanged', this.onChainChanged);
      this.provider.removeListener('accountsChanged', this.onAccountsChanged);
    }
  }

  private newKit(web3: Web3Type, defaultAccount: string) {
    this.kit = newKitFromWeb3(web3 as unknown as Web3Type);
    this.kit.connection.defaultAccount = defaultAccount;
    this.account = defaultAccount ?? null;
    return this.kit;
  }

  private onAccountsChanged = (accounts: string[]) => {
    if (accounts[0]) {
      this.kit.connection.defaultAccount = accounts[0];
      this.emit(ConnectorEvents.ADDRESS_CHANGED, accounts[0]);
    }
  };

  supportsFeeCurrency() {
    return false;
  }
  async startNetworkChangeFromApp(network: Network) {
    const web3 = this.kit.connection.web3;
    await switchToCeloNetwork(
      network,
      this.provider! as unknown as Ethereum,
      () => web3.eth.getChainId()
    );
    this.continueNetworkUpdateFromWallet(network);
  }

  // for when the wallet is already on the desired network and the kit / dapp need to catch up.
  continueNetworkUpdateFromWallet(network: Network): void {
    this.network = network; // must set to prevent loop
    const web3 = this.kit.connection.web3;
    this.newKit(web3, this.account as string); // kit caches things so it need to be recreated
    this.emit(ConnectorEvents.NETWORK_CHANGED, network.name);
  }

  close(): void {
    this.removeListeners();
    try {
      this.kit.connection.stop();
    } catch (e) {
      console.info('stopped dead', e, e === 'CeloProvider already stopped');
    }

    this.disconnect();
    return;
  }
}
