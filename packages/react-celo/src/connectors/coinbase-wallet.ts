import { CeloTokenContract } from '@celo/contractkit/lib/base';
import {
  MiniContractKit,
  newKit,
  newKitFromWeb3,
} from '@celo/contractkit/lib/mini-kit';
import {
  CoinbaseWalletProvider,
  CoinbaseWalletSDK,
} from '@coinbase/wallet-sdk';

import { localStorageKeys, WalletTypes } from '../constants';
import { Ethereum } from '../global';
import { Connector, Maybe, Network } from '../types';
import {
  clearPreviousConfig,
  setTypedStorageKey,
} from '../utils/local-storage';
import { switchToCeloNetwork } from '../utils/metamask';
import { persist, Web3Type } from './common';

export default class CoinbaseWalletConnector implements Connector {
  public initialised = false;
  public type = WalletTypes.CoinbaseWallet;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;
  private onNetworkChangeCallback?: (chainId: number) => void;
  private onAddressChangeCallback?: (address: Maybe<string>) => void;
  private network: Network;

  private provider: CoinbaseWalletProvider | null = null;

  constructor(network: Network, public feeCurrency: CeloTokenContract) {
    this.kit = newKit(network.rpcUrl);
    this.network = network;

    const sdk = new CoinbaseWalletSDK({
      appName: '',
      appLogoUrl: '',
    });
    this.provider = sdk.makeWeb3Provider(network.rpcUrl, network.chainId);
  }

  persist() {
    persist({
      walletType: this.type,
      network: this.network,
    });
  }

  async initialise(): Promise<this> {
    if (!this.provider) {
      throw new Error('Coinbase wallet provider not instantiated');
    }
    const { default: Web3 } = await import('web3');
    const web3 = new Web3(this.provider);
    const [defaultAccount]: string[] = await this.provider.request({
      method: 'eth_requestAccounts',
    });

    this.provider.removeListener('chainChanged', this.onChainChanged);
    this.provider.removeListener('accountsChanged', this.onAccountsChanged);

    await switchToCeloNetwork(
      this.kit,
      this.network,
      this.provider as unknown as Ethereum
    );

    this.provider.on('chainChanged', this.onChainChanged);
    this.provider.on('accountsChanged', this.onAccountsChanged);

    this.kit = newKitFromWeb3(web3 as unknown as Web3Type);

    this.kit.connection.defaultAccount = defaultAccount;
    this.account = defaultAccount ?? null;
    this.initialised = true;

    this.persist();

    return this;
  }

  private onChainChanged = (chainIdHex: string) => {
    const chainId = parseInt(chainIdHex, 16);
    if (this.onNetworkChangeCallback && this.network.chainId !== chainId) {
      this.onNetworkChangeCallback(chainId);
    }
  };

  private onAccountsChanged = (accounts: string[]) => {
    if (this.onAddressChangeCallback) {
      this.kit.connection.defaultAccount = accounts[0];
      this.onAddressChangeCallback(accounts[0] ?? null);
    }
  };

  supportsFeeCurrency() {
    return false;
  }

  async updateKitWithNetwork(network: Network): Promise<void> {
    setTypedStorageKey(localStorageKeys.lastUsedNetwork, network.name);
    this.network = network;
    await this.initialise();
  }

  onNetworkChange(callback: (chainId: number) => void): void {
    this.onNetworkChangeCallback = callback;
  }

  onAddressChange(callback: (address: Maybe<string>) => void): void {
    this.onAddressChangeCallback = callback;
  }

  close(): void {
    clearPreviousConfig();
    if (this.provider) {
      this.provider.removeListener('chainChanged', this.onChainChanged);
      this.provider.removeListener('accountsChanged', this.onAccountsChanged);
    }
    this.onNetworkChangeCallback = undefined;
    this.onAddressChangeCallback = undefined;
    return;
  }
}
