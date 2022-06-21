import { CeloTokenContract } from '@celo/contractkit/lib/base';
import {
  MiniContractKit,
  newKit,
  newKitFromWeb3,
} from '@celo/contractkit/lib/mini-kit';

import { localStorageKeys, WalletTypes } from '../constants';
import { Connector, Maybe, Network } from '../types';
import { getEthereum, getInjectedEthereum } from '../utils/ethereum';
import {
  clearPreviousConfig,
  setTypedStorageKey,
} from '../utils/local-storage';
import { switchToCeloNetwork } from '../utils/metamask';
import { AbstractConnector, ConnectorEvents, Web3Type } from './common';

export default class InjectedConnector
  extends AbstractConnector
  implements Connector
{
  public initialised = false;
  public type = WalletTypes.Injected;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;
  private onNetworkChangeCallback?: (chainId: number) => void;
  private network: Network;

  constructor(
    network: Network,
    public feeCurrency: CeloTokenContract,
    defaultType: WalletTypes = WalletTypes.Injected
  ) {
    super();
    this.type = defaultType;
    this.kit = newKit(network.rpcUrl);
    this.network = network;
  }

  async initialise(): Promise<this> {
    const injected = await getInjectedEthereum();
    if (!injected) {
      throw new Error('Ethereum wallet not installed');
    }
    if (this.initialised) {
      return this;
    }

    const { web3, ethereum, isMetaMask } = injected;

    this.type = isMetaMask ? WalletTypes.MetaMask : WalletTypes.Injected;

    const [defaultAccount] = await ethereum.request({
      method: 'eth_requestAccounts',
    });

    ethereum.removeListener('chainChanged', this.onChainChanged);
    ethereum.removeListener('accountsChanged', this.onAccountsChanged);
    await switchToCeloNetwork(this.kit, this.network, ethereum);
    ethereum.on('chainChanged', this.onChainChanged);
    ethereum.on('accountsChanged', this.onAccountsChanged);

    this.kit = newKitFromWeb3(web3 as unknown as Web3Type);

    this.kit.connection.defaultAccount = defaultAccount;
    this.account = defaultAccount ?? null;
    this.initialised = true;

    this.emit(ConnectorEvents.CONNECTED, {
      walletType: this.type,
      address: defaultAccount,
      networkName: this.network.name,
    });

    return this;
  }

  private onChainChanged = (chainIdHex: string) => {
    const chainId = parseInt(chainIdHex, 16);
    if (this.onNetworkChangeCallback && this.network.chainId !== chainId) {
      this.onNetworkChangeCallback(chainId);
    }
  };

  private onAccountsChanged = (accounts: string[]) => {
    this.kit.connection.defaultAccount = accounts[0];
    this.emit(ConnectorEvents.ADDRESS_CHANGED, accounts[0]);
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
  close(): void {
    clearPreviousConfig();
    const ethereum = getEthereum();
    if (ethereum) {
      ethereum.removeListener('chainChanged', this.onChainChanged);
      ethereum.removeListener('accountsChanged', this.onAccountsChanged);
    }
    this.onNetworkChangeCallback = undefined;
    this.emit(ConnectorEvents.DISCONNECTED);
    return;
  }
}
