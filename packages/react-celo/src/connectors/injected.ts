import { Web3Provider } from '@ethersproject/providers';

import { WalletTypes } from '../constants';
import { Connector, Network } from '../types';
import { getEthereum, getInjectedEthereum } from '../utils/ethereum';
import { getApplicationLogger } from '../utils/logger';
import { switchToNetwork } from '../utils/metamask';
import { AbstractConnector, ConnectorEvents } from './common';

export default class InjectedConnector
  extends AbstractConnector
  implements Connector
{
  public initialised = false;
  public type = WalletTypes.Injected;
  public provider: Web3Provider;
  private network: Network;

  constructor(
    network: Network,
    private manualNetworkMode: boolean,
    defaultType: WalletTypes = WalletTypes.Injected
  ) {
    super();
    this.type = defaultType;
    this.provider = this.newProvider();

    this.network = network;
  }

  async initialise(lastUsedAddress?: string): Promise<this> {
    if (this.initialised) {
      return this;
    }

    let defaultAccount = lastUsedAddress;

    const injected = await getInjectedEthereum();

    if (!injected) {
      throw new Error('Ethereum wallet not installed');
    }
    const { ethereum, isMetaMask } = injected;

    this.type = isMetaMask ? WalletTypes.MetaMask : WalletTypes.Injected;
    const metamask = ethereum._metamask;
    const isUnlocked = isMetaMask && (await metamask?.isUnlocked());
    const isConnected = ethereum.isConnected && ethereum.isConnected();

    if (isUnlocked || !isConnected || !defaultAccount) {
      [defaultAccount] = await ethereum.request({
        method: 'eth_requestAccounts',
      });
    }
    ethereum.removeListener('chainChanged', this.onChainChanged);
    ethereum.removeListener('accountsChanged', this.onAccountsChanged);

    if (!this.manualNetworkMode) {
      await switchToNetwork(this.network, ethereum, async () => {
        const { chainId } = await this.provider.getNetwork();
        return chainId;
      });
    }

    ethereum.on('chainChanged', this.onChainChanged);
    ethereum.on('accountsChanged', this.onAccountsChanged);

    this.provider = this.newProvider();

    const walletChainId = await ethereum.request({ method: 'eth_chainId' });

    this.initialised = true;

    this.emit(ConnectorEvents.CONNECTED, {
      walletType: this.type,
      address: defaultAccount,
      networkName: this.network.name,
      walletChainId: parseInt(walletChainId, 16),
    });

    return this;
  }

  get signer() {
    return this.provider.getSigner();
  }

  private newProvider() {
    // @ts-expect-error this is right tho
    return new Web3Provider(window.ethereum);
  }

  async startNetworkChangeFromApp(network: Network) {
    const ethereum = getEthereum();
    await switchToNetwork(network, ethereum!, async () => {
      const { chainId } = await this.provider.getNetwork();
      return chainId;
    });

    this.continueNetworkUpdateFromWallet(network);
  }

  //
  continueNetworkUpdateFromWallet(network: Network): void {
    this.network = network; // must set to prevent loop
    this.provider = this.newProvider();

    this.emit(ConnectorEvents.NETWORK_CHANGED, network.name);
  }

  // wallet changes net chain
  // emits 'chainChanged'
  // onChainChanged called and emits WALLET_CHAIN_CHANGED if chain ids dont match
  // networkWatcher sees that and if a suitable network can be found calls continueNetworkUpdateFromWallet()
  // else it dies.
  private onChainChanged = (chainIdHex: string) => {
    const chainId = parseInt(chainIdHex, 16);

    // if this change was initiated by app the chainIds will already match and we can abort
    getApplicationLogger().log('onChainChanged', chainId);

    if (this.network.chainId !== chainId) {
      this.emit(ConnectorEvents.WALLET_CHAIN_CHANGED, chainId);
    }
  };

  private onAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // wallet is locked properly close the connection.
      this.close();
    } else {
      // almost certain we dont need to set the account/address on ethers

      this.emit(ConnectorEvents.ADDRESS_CHANGED, accounts[0]);
    }
  };

  supportsFeeCurrency() {
    return false;
  }

  private removeListenersFromEth() {
    const ethereum = getEthereum();

    if (ethereum) {
      ethereum.removeListener('chainChanged', this.onChainChanged);
      ethereum.removeListener('accountsChanged', this.onAccountsChanged);
    }
  }

  close(): void {
    this.removeListenersFromEth();

    try {
      // TODO does ethers provider need stopping?
      // this.kit.connection.stop();
    } finally {
      this.disconnect();
    }
  }
}
