import { Network } from './types';
import { localStorageKeys } from './constants';
import { ContractKit, newKit, newKitFromWeb3 } from '@celo/contractkit';
import { LocalWallet } from '@celo/wallet-local';
import { ReadOnlyWallet } from '@celo/connect';
// we can't lazy load this due to the new tab bug, it must be imported
// so that the new tab handler fires.
import { DappKitWallet } from './dappkit-wallet';

/**
 * Connectors are our link between a DApp and the users wallet. Each
 * wallet has different semantics and these classes attempt to outline
 * them.
 */

export interface Connector {
  kit: ContractKit;
  type: WalletTypes;

  initialised: boolean;
  initialise: () => any;
}

export enum WalletTypes {
  Unauthenticated = 'Unauthenticated',
  PrivateKey = 'PrivateKey',
  WalletConnect = 'WalletConnect',
  Ledger = 'Ledger',
  CeloExtensionWallet = 'CeloExtensionWallet',
  Metamask = 'Metamask',
}

export class UnauthenticatedConnector implements Connector {
  public initialised = false;
  public type = WalletTypes.PrivateKey;
  public kit: ContractKit;

  constructor(n: Network) {
    this.kit = newKit(n.rpcUrl);
  }

  initialise() {
    return;
  }
}

export class PrivateKeyConnector implements Connector {
  public initialised = true;
  public type = WalletTypes.PrivateKey;
  public kit: ContractKit;

  constructor(n: Network, privateKey: string) {
    localStorage.setItem(localStorageKeys.privateKey, privateKey);
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
    return;
  }
}

export class LedgerConnector {
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
  }
}

export class CeloExtensionWalletConnector {
  public initialised = false;
  public type = WalletTypes.CeloExtensionWallet;
  public kit: ContractKit;

  constructor(network: Network) {
    localStorage.setItem(
      localStorageKeys.lastUsedWalletType,
      WalletTypes.CeloExtensionWallet
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

    this.kit = newKitFromWeb3(web3 as any);
  }
}

export const fromDappKit = async (n: Network, dappName: string) => {
  const wallet = new DappKitWallet(dappName);
  await wallet.init();

  const k = newKit(n.rpcUrl, (wallet as any) as ReadOnlyWallet);
  k.defaultAccount = wallet.getAccounts()[0];

  wallet.setKit(k);
  return k;
};

export const fromWalletConnect = async (
  n: Network,
  w: any // WalletConnectWallet
) => {
  const [account] = w.getAccounts();
  const kit = newKit(n.rpcUrl, w);
  kit.defaultAccount = account;
  return kit;
};

export const fromWeb3 = async (n: Network, w: any) => {
  const [defaultAccount] = await w.eth.getAccounts();
  const kit = newKitFromWeb3(w);
  kit.defaultAccount = defaultAccount;

  return kit;
};
