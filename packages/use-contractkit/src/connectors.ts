import { Network, Connector } from './types';
import { localStorageKeys, WalletTypes } from './constants';
import { ContractKit, newKit, newKitFromWeb3 } from '@celo/contractkit';
import { LocalWallet } from '@celo/wallet-local';
// we can't lazy load this due to the new tab bug, it must be imported
// so that the new tab handler fires.
import { DappKitWallet } from './dappkit-wallet';
import { WalletConnectWalletOptions } from 'contractkit-walletconnect';

/**
 * Connectors are our link between a DApp and the users wallet. Each
 * wallet has different semantics and these classes attempt to unify
 * them and present a workable API.
 */

export class UnauthenticatedConnector implements Connector {
  public initialised = true;
  public type = WalletTypes.Unauthenticated;
  public kit: ContractKit;

  constructor(n: Network) {
    this.kit = newKit(n.rpcUrl);
  }

  initialise() {
    return this;
  }

  close() {
    return;
  }
}

export class PrivateKeyConnector implements Connector {
  public initialised = true;
  public type = WalletTypes.PrivateKey;
  public kit: ContractKit;

  constructor(n: Network, privateKey: string) {
    localStorage.setItem(
      localStorageKeys.lastUsedWalletType,
      WalletTypes.PrivateKey
    );
    localStorage.setItem(
      localStorageKeys.lastUsedWalletArguments,
      JSON.stringify([privateKey])
    );

    const wallet = new LocalWallet();
    wallet.addAccount(privateKey);

    this.kit = newKit(n.rpcUrl, wallet);
    this.kit.defaultAccount = wallet.getAccounts()[0];
  }

  initialise() {
    return this;
  }

  close() {
    return;
  }
}

export class LedgerConnector implements Connector {
  public initialised = false;
  public type = WalletTypes.Ledger;
  public kit: ContractKit;

  constructor(private network: Network, private index: number) {
    localStorage.setItem(
      localStorageKeys.lastUsedWalletType,
      WalletTypes.Ledger
    );
    localStorage.setItem(
      localStorageKeys.lastUsedWalletArguments,
      JSON.stringify([index])
    );

    this.kit = newKit(network.rpcUrl);
  }

  async initialise() {
    const { default: TransportUSB } = await import(
      '@ledgerhq/hw-transport-webusb'
    );
    const { newLedgerWalletWithSetup } = await import('@celo/wallet-ledger');

    const transport = await TransportUSB.create();
    const wallet = await newLedgerWalletWithSetup(transport, [this.index]);
    this.kit = newKit(this.network.rpcUrl, wallet);
    this.kit.defaultAccount = wallet.getAccounts()[0];

    this.initialised = true;
    return this;
  }

  close() {
    return;
  }
}

export class CeloExtensionWalletConnector implements Connector {
  public initialised = false;
  public type = WalletTypes.CeloExtensionWallet;
  public kit: ContractKit;
  private onNetworkChangeCallback?: (chainId: number) => void;

  constructor(network: Network) {
    localStorage.setItem(
      localStorageKeys.lastUsedWalletType,
      WalletTypes.CeloExtensionWallet
    );
    localStorage.setItem(
      localStorageKeys.lastUsedWalletArguments,
      JSON.stringify([])
    );

    this.kit = newKit(network.rpcUrl);
  }

  async initialise() {
    const { default: Web3 } = await import('web3');

    // @ts-ignore
    const celo: any = window.celo;
    if (!celo) {
      throw new Error('Celo Extension Wallet not installed');
    }
    const web3 = new Web3(celo);
    await celo.enable();

    // @ts-ignore
    web3.currentProvider.publicConfigStore.on(
      'update',
      async ({ networkVersion }: { networkVersion: number }) => {
        if (this.onNetworkChangeCallback) {
          this.onNetworkChangeCallback(networkVersion);
        }
      }
    );

    this.kit = newKitFromWeb3(web3 as any);
    const [defaultAccount] = await this.kit.web3.eth.getAccounts();
    this.kit.defaultAccount = defaultAccount;

    return this;
  }

  onNetworkChange(callback: (chainId: number) => void) {
    this.onNetworkChangeCallback = callback;
  }

  close() {
    return;
  }
}

export class DappKitConnector implements Connector {
  public initialised = true;
  public type = WalletTypes.DappKit;
  public kit: ContractKit;

  constructor(private network: Network, private dappName: string) {
    localStorage.setItem(
      localStorageKeys.lastUsedWalletType,
      WalletTypes.DappKit
    );
    localStorage.setItem(
      localStorageKeys.lastUsedWalletArguments,
      JSON.stringify([dappName])
    );

    const wallet = new DappKitWallet(dappName);
    this.kit = newKit(network.rpcUrl, wallet as any);
    wallet.setKit(this.kit);
  }

  async initialise() {
    const wallet = new DappKitWallet(this.dappName);
    await wallet.init();

    this.kit = newKit(this.network.rpcUrl, wallet as any);
    this.kit.defaultAccount = wallet.getAccounts()[0];
    wallet.setKit(this.kit);

    return this;
  }

  close() {
    return;
  }
}

export class WalletConnectConnector implements Connector {
  public initialised = false;
  public type = WalletTypes.WalletConnect;
  public kit: ContractKit;

  private onUriCallback?: (uri: string) => void;
  private onCloseCallback?: () => void;

  constructor(private network: Network, options: WalletConnectWalletOptions) {
    localStorage.setItem(
      localStorageKeys.lastUsedWalletType,
      WalletTypes.WalletConnect
    );
    localStorage.setItem(
      localStorageKeys.lastUsedWalletArguments,
      JSON.stringify(options)
    );

    const { WalletConnectWallet } = require('contractkit-walletconnect');
    const wallet = new WalletConnectWallet(options);
    this.kit = newKit(network.rpcUrl, wallet);
  }

  onUri(callback: (uri: string) => void) {
    this.onUriCallback = callback;
  }

  onClose(callback: () => void) {
    this.onCloseCallback = callback;
  }

  async initialise() {
    const { WalletConnectWallet } = require('contractkit-walletconnect');
    const wallet = this.kit.getWallet() as typeof WalletConnectWallet;

    if (this.onCloseCallback) {
      wallet.onPairingDeleted = () => this.onCloseCallback?.();
      wallet.onSessionDeleted = () => this.onCloseCallback?.();
    }

    const uri = await wallet.getUri();
    if (uri && this.onUriCallback) {
      this.onUriCallback(uri);
    }

    await wallet.init();
    const [defaultAccount] = await wallet.getAccounts();
    this.kit.defaultAccount = defaultAccount;

    return this;
  }

  async close() {
    const { WalletConnectWallet } = require('contractkit-walletconnect');
    const wallet = this.kit.getWallet() as typeof WalletConnectWallet;
    return wallet.close();
  }
}
