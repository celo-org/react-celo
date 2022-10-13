import { CeloContract, CeloTokenContract } from '@celo/contractkit/lib/base';
import { newKitFromWeb3 } from '@celo/contractkit/lib/mini-kit';
import {
  CoinbaseWalletProvider,
  CoinbaseWalletSDK,
} from '@coinbase/wallet-sdk';
import { ExternalProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';

import { WalletTypes } from '../constants';
import { Ethereum } from '../global';
import { Connector, Dapp, Network } from '../types';
import { getApplicationLogger } from '../utils/logger';
import { switchToNetwork } from '../utils/metamask';
import { AbstractConnector, ConnectorEvents, Web3Type } from './common';

export default class CoinbaseWalletConnector
  extends AbstractConnector
  implements Connector
{
  public initialised = false;
  public type = WalletTypes.CoinbaseWallet;
  public feeCurrency: CeloTokenContract = CeloContract.GoldToken;
  public provider!: ethers.providers.Web3Provider;
  private CBprovider: CoinbaseWalletProvider | null = null;

  constructor(
    private network: Network,
    private manualNetworkingMode: boolean,
    dapp: Pick<Dapp, 'name' | 'icon'>
  ) {
    super();

    const sdk = new CoinbaseWalletSDK({
      appName: dapp?.name ?? '',
      appLogoUrl: dapp?.icon ?? '',
      reloadOnDisconnect: false,
      diagnosticLogger: {
        log: (e, p) => {
          // this fixes the app trying to resurrect the cb connector after the wallet has initiated a disconnection as the sdk then reloads the page
          if (
            'walletlink_sdk_metadata_destroyed' === e &&
            p?.alreadyDestroyed === false
          ) {
            this.close();
          }
          getApplicationLogger().debug(
            '[coinbase-wallet] sdk event',
            e,
            'properties',
            p
          );
        },
      },
    });
    this.CBprovider = sdk.makeWeb3Provider(network.rpcUrl, network.chainId);
    this.newProvider();
  }

  get signer() {
    return this.provider.getSigner();
  }

  async initialise(): Promise<this> {
    if (!this.CBprovider) {
      throw new Error('Coinbase wallet provider not instantiated');
    }
    if (this.initialised) {
      return this;
    }
    this.newProvider();

    const [defaultAccount]: string[] = await this.CBprovider.request({
      method: 'eth_requestAccounts',
    });

    this.removeListeners();

    try {
      if (!this.manualNetworkingMode) {
        await switchToNetwork(
          this.network,
          this.CBprovider as unknown as Ethereum,
          async () => {
            const { chainId } = await this.provider.getNetwork();
            return chainId;
          }
        );
      }
    } catch (e) {
      // if user rejects the switch it will throw but we dont want it to disrupt everything
      // they different chain ids will be enough for dapp devs to decided to reprompt
    }

    const walletChainId: string = await this.CBprovider.request({
      method: 'eth_chainId',
    });

    this.CBprovider.on('chainChanged', this.onChainChanged);
    this.CBprovider.on('accountsChanged', this.onAccountsChanged);

    this.newProvider();
    this.initialised = true;

    this.emit(ConnectorEvents.CONNECTED, {
      walletType: this.type,
      walletChainId: parseInt(walletChainId, 16),
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

  private newProvider() {
    this.provider = new ethers.providers.Web3Provider(
      this.CBprovider as unknown as ExternalProvider
    );
  }

  private removeListeners() {
    if (this.CBprovider) {
      this.CBprovider.removeListener('chainChanged', this.onChainChanged);
      this.CBprovider.removeListener('accountsChanged', this.onAccountsChanged);
    }
  }

  private newKit(web3: Web3Type, defaultAccount: string) {
    this.kit = newKitFromWeb3(web3 as unknown as Web3Type);
    this.kit.connection.defaultAccount = defaultAccount;
    return this.kit;
  }

  private onAccountsChanged = (accounts: string[]) => {
    if (accounts[0]) {
      // TODO do we need to set the account anywhere?
      this.emit(ConnectorEvents.ADDRESS_CHANGED, accounts[0]);
    }
  };

  supportsFeeCurrency() {
    return false;
  }
  async startNetworkChangeFromApp(network: Network) {
    await switchToNetwork(
      network,
      this.CBprovider! as unknown as Ethereum,
      async () => {
        const { chainId } = await this.provider.getNetwork();
        return chainId;
      }
    );
    this.continueNetworkUpdateFromWallet(network);
  }

  // for when the wallet is already on the desired network and the kit / dapp need to catch up.
  continueNetworkUpdateFromWallet(network: Network): void {
    this.network = network; // must set to prevent loop
    // TODO kit cached things so it needed to be recreated what about ethers?
    this.emit(ConnectorEvents.NETWORK_CHANGED, network.name);
  }

  close(): void {
    this.removeListeners();
    try {
      // this.kit.connection.stop(); TODO do we need to do something like this?
    } catch (e) {
      getApplicationLogger().error(
        '[methods.close] could not stop a already stopped CeloConnection',
        e
      );
    }
    this.disconnect();
    if (this.CBprovider?.connected) {
      // must be called last as it refreshes page which then starts the resurrector if disconnect has not been called
      void this.CBprovider?.close();
    }
    return;
  }
}
