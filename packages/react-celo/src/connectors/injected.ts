import { CeloTokenContract } from '@celo/contractkit/lib/base';
import {
  MiniContractKit,
  newKit,
  newKitFromWeb3,
} from '@celo/contractkit/lib/mini-kit';

import { WalletTypes } from '../constants';
import { Connector, Maybe, Network } from '../types';
import { getEthereum, getInjectedEthereum } from '../utils/ethereum';
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
    if (this.initialised) {
      return this;
    }

    const injected = await getInjectedEthereum();
    if (!injected) {
      throw new Error('Ethereum wallet not installed');
    }
    const { web3, ethereum, isMetaMask } = injected;

    this.type = isMetaMask ? WalletTypes.MetaMask : WalletTypes.Injected;

    const [defaultAccount] = await ethereum.request({
      method: 'eth_requestAccounts',
    });

    ethereum.removeListener('chainChanged', this.onChainChanged);
    ethereum.removeListener('accountsChanged', this.onAccountsChanged);
    // TODO better way of auto switching networks on startup
    await switchToCeloNetwork(this.network, ethereum, () =>
      web3.eth.getChainId()
    );
    ethereum.on('chainChanged', this.onChainChanged);
    ethereum.on('accountsChanged', this.onAccountsChanged);

    this.newKit(web3 as unknown as Web3Type, defaultAccount);

    this.initialised = true;

    this.emit(ConnectorEvents.CONNECTED, {
      walletType: this.type,
      address: defaultAccount,
      networkName: this.network.name,
    });

    return this;
  }

  private newKit(web3: Web3Type, defaultAccount: string) {
    this.kit = newKitFromWeb3(web3 as unknown as Web3Type);
    this.kit.connection.defaultAccount = defaultAccount;
    this.account = defaultAccount ?? null;
  }

  async startNetworkChangeFromApp(network: Network) {
    const ethereum = getEthereum();
    await switchToCeloNetwork(network, ethereum!, this.kit.connection.chainId);
    this.continueNetworkUpdateFromWallet(network);
  }

  //
  continueNetworkUpdateFromWallet(network: Network): void {
    this.network = network; // must set to prevent loop
    const web3 = this.kit.connection.web3;
    this.newKit(web3, this.account as string); // kit caches things so it need to be recreated
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
    console.log('chain changed');
    if (this.network.chainId !== chainId) {
      console.log('chain event emitting', chainId);
      this.emit(ConnectorEvents.WALLET_CHAIN_CHANGED, chainId);
    }
  };

  private onAccountsChanged = (accounts: string[]) => {
    this.kit.connection.defaultAccount = accounts[0];
    this.emit(ConnectorEvents.ADDRESS_CHANGED, accounts[0]);
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
    this.kit.connection.stop();
    this.disconnect();
    return;
  }
}
