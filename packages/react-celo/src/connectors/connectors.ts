import { CeloContract, CeloTokenContract } from '@celo/contractkit/lib/base';
import {
  MiniContractKit,
  newKit,
  newKitFromWeb3,
} from '@celo/contractkit/lib/mini-kit';
import { LocalWallet } from '@celo/wallet-local';
// Uncomment with WCV2 support
// import {
//   WalletConnectWallet,
//   WalletConnectWalletOptions,
// } from '@celo/wallet-walletconnect';
import {
  WalletConnectWallet as WalletConnectWalletV1,
  WalletConnectWalletOptions as WalletConnectWalletOptionsV1,
} from '@celo/wallet-walletconnect-v1';
import { BigNumber } from 'bignumber.js';

import { localStorageKeys, WalletTypes } from '../constants';
import { Connector, Maybe, Network } from '../types';
import { getEthereum, getInjectedEthereum } from '../utils/ethereum';
import {
  clearPreviousConfig,
  forgetConnection,
  setLastUsedWalletArgs,
  setTypedStorageKey,
  WalletArgs,
} from '../utils/localStorage';
import { switchToCeloNetwork } from '../utils/metamask';

type Web3Type = Parameters<typeof newKitFromWeb3>[0];

/**
 * Connectors are our link between a DApp and the users wallet. Each
 * wallet has different semantics and these classes attempt to unify
 * them and present a workable API.
 */

export class UnauthenticatedConnector implements Connector {
  public initialised = true;
  public type = WalletTypes.Unauthenticated;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;
  public feeCurrency: CeloTokenContract = CeloContract.GoldToken;
  constructor(n: Network) {
    this.kit = newKit(n.rpcUrl);
  }

  persist() {
    forgetConnection();
  }

  initialise(): this {
    this.initialised = true;
    this.persist();
    return this;
  }

  supportsFeeCurrency() {
    return false;
  }

  close(): void {
    clearPreviousConfig();
    return;
  }
}

export class PrivateKeyConnector implements Connector {
  public initialised = true;
  public type = WalletTypes.PrivateKey;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;

  constructor(
    private network: Network,
    private privateKey: string,
    public feeCurrency: CeloTokenContract
  ) {
    const wallet = new LocalWallet();
    wallet.addAccount(privateKey);

    this.kit = newKit(network.rpcUrl, wallet);
    this.kit.connection.defaultAccount = wallet.getAccounts()[0];
    this.account = this.kit.connection.defaultAccount ?? null;
  }

  persist() {
    persist({
      walletType: WalletTypes.PrivateKey,
      network: this.network,
      options: [this.privateKey],
    });
  }

  async initialise(): Promise<this> {
    await this.updateFeeCurrency(this.feeCurrency);
    this.initialised = true;

    this.persist();

    return this;
  }

  supportsFeeCurrency() {
    return true;
  }

  updateFeeCurrency: typeof updateFeeCurrency = updateFeeCurrency.bind(this);

  close(): void {
    clearPreviousConfig();
    return;
  }
}

export class LedgerConnector implements Connector {
  public initialised = false;
  public type = WalletTypes.Ledger;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;

  constructor(
    private network: Network,
    private index: number,
    public feeCurrency: CeloTokenContract
  ) {
    setLastUsedWalletArgs([index]);
    setTypedStorageKey(localStorageKeys.lastUsedWalletType, WalletTypes.Ledger);
    setTypedStorageKey(localStorageKeys.lastUsedNetwork, network.name);
    this.kit = newKit(network.rpcUrl);
  }

  persist() {
    persist({
      walletType: WalletTypes.Ledger,
      network: this.network,
      options: [this.index],
    });
  }

  async initialise(): Promise<this> {
    const { default: TransportUSB } = await import(
      '@ledgerhq/hw-transport-webusb'
    );
    const { newLedgerWalletWithSetup } = await import('@celo/wallet-ledger');
    const transport = await TransportUSB.create();
    const wallet = await newLedgerWalletWithSetup(transport, [this.index]);
    this.kit = newKit(this.network.rpcUrl, wallet);
    this.kit.connection.defaultAccount = wallet.getAccounts()[0];

    this.initialised = true;
    this.account = this.kit.connection.defaultAccount ?? null;

    if (this.feeCurrency) {
      await this.updateFeeCurrency(this.feeCurrency);
    }

    this.persist();

    return this;
  }

  supportsFeeCurrency() {
    return true;
  }

  updateFeeCurrency: typeof updateFeeCurrency = updateFeeCurrency.bind(this);

  close(): void {
    clearPreviousConfig();
    return;
  }
}

export class UnsupportedChainIdError extends Error {
  public static readonly NAME: string = 'UnsupportedChainIdError';
  constructor(public readonly chainID: number) {
    super(`Unsupported chain ID: ${chainID}`);
    this.name = UnsupportedChainIdError.NAME;
  }
}

export class InjectedConnector implements Connector {
  public initialised = false;
  public type = WalletTypes.Injected;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;
  private onNetworkChangeCallback?: (chainId: number) => void;
  private onAddressChangeCallback?: (address: Maybe<string>) => void;
  private network: Network;

  constructor(
    network: Network,
    public feeCurrency: CeloTokenContract,
    defaultType: WalletTypes = WalletTypes.Injected
  ) {
    this.type = defaultType;
    this.kit = newKit(network.rpcUrl);
    this.network = network;
  }

  persist() {
    persist({
      walletType: this.type,
      network: this.network,
    });
  }

  async initialise(): Promise<this> {
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
    await switchToCeloNetwork(this.kit, this.network, ethereum);
    ethereum.on('chainChanged', this.onChainChanged);
    ethereum.on('accountsChanged', this.onAccountsChanged);

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
    const ethereum = getEthereum();
    if (ethereum) {
      ethereum.removeListener('chainChanged', this.onChainChanged);
      ethereum.removeListener('accountsChanged', this.onAccountsChanged);
    }
    this.onNetworkChangeCallback = undefined;
    this.onAddressChangeCallback = undefined;
    return;
  }
}

export class MetaMaskConnector extends InjectedConnector {
  constructor(network: Network, feeCurrency: CeloTokenContract) {
    super(network, feeCurrency, WalletTypes.MetaMask);
  }
}

export class CeloExtensionWalletConnector implements Connector {
  public initialised = false;
  public type = WalletTypes.CeloExtensionWallet;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;
  private onNetworkChangeCallback?: (chainId: number) => void;

  constructor(private network: Network, public feeCurrency: CeloTokenContract) {
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
    return;
  }
}

export class WalletConnectConnector implements Connector {
  public initialised = false;
  public type = WalletTypes.WalletConnect;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;

  private onUriCallback?: (uri: string) => void;
  private onConnectCallback?: (account: string) => void;
  private onCloseCallback?: () => void;

  constructor(
    readonly network: Network,
    public feeCurrency: CeloTokenContract,
    // options: WalletConnectWalletOptions | WalletConnectWalletOptionsV1,
    readonly options: WalletConnectWalletOptionsV1,
    readonly autoOpen = false,
    public getDeeplinkUrl?: (uri: string) => string | false,
    readonly version?: number,
    readonly walletId?: string
  ) {
    const wallet = new WalletConnectWalletV1(options);
    // Uncomment with WCV2 support
    // version == 1
    //   ? new WalletConnectWalletV1(options as WalletConnectWalletOptionsV1)
    //   : new WalletConnectWallet(options as WalletConnectWalletOptions);
    this.kit = newKit(network.rpcUrl, wallet);
    this.version = version;
  }

  persist() {
    persist({
      walletType: WalletTypes.WalletConnect,
      walletId: this.walletId,
      network: this.network,
      options: [this.options],
    });
  }

  onUri(callback: (uri: string) => void): void {
    this.onUriCallback = callback;
  }

  onConnect(callback: (account: string) => void): void {
    this.onConnectCallback = callback;
  }

  onClose(callback: () => void): void {
    this.onCloseCallback = callback;
  }

  async initialise(): Promise<this> {
    const wallet = this.kit.getWallet() as WalletConnectWalletV1;

    if (this.onCloseCallback) {
      // Uncomment with WCV2 support
      // wallet.onPairingDeleted = () => this.onCloseCallback?.();
      wallet.onSessionDeleted = () => this.onCloseCallback?.();
      wallet.onWcSessionUpdate = (_error, session) => {
        if (session.params[0].chainId == null) {
          this.onCloseCallback?.();
        }
      };
      wallet.onSessionUpdated = (_error, session) => {
        if (session.params[0].chainId == null) {
          this.onCloseCallback?.();
        }
      };
    }

    if (this.onConnectCallback) {
      wallet.onSessionCreated = (error, session) => {
        this.onConnectCallback?.(session.params as string);
      };
    }

    const uri = await wallet.getUri();
    if (uri && this.onUriCallback) {
      this.onUriCallback(uri);
    }

    if (uri && this.autoOpen) {
      const deepLink = this.getDeeplinkUrl ? this.getDeeplinkUrl(uri) : uri;
      if (deepLink) {
        location.href = deepLink;
      }
    }

    await wallet.init();
    const [address] = wallet.getAccounts();
    const defaultAccount = await this.fetchWalletAddressForAccount(address);
    this.kit.connection.defaultAccount = defaultAccount;
    this.account = defaultAccount ?? null;

    await this.updateFeeCurrency(this.feeCurrency);
    this.initialised = true;

    this.persist();

    return this;
  }

  supportsFeeCurrency() {
    // If on WC 1 it will not work due to fields being dropped
    if (!this.version || this.version === 1) {
      return false;
    }
    // TODO when V2 is used again check based on wallet?
    return true;
  }

  private async fetchWalletAddressForAccount(address?: string) {
    if (!address) {
      return undefined;
    }
    const accounts = await this.kit.contracts.getAccounts();
    const walletAddress = await accounts.getWalletAddress(address);
    return new BigNumber(walletAddress).isZero() ? address : walletAddress;
  }

  updateFeeCurrency: typeof updateFeeCurrency = updateFeeCurrency.bind(this);

  close(message?: string): Promise<void> {
    clearPreviousConfig();
    const wallet = this.kit.getWallet() as WalletConnectWalletV1;
    return wallet.close(message);
  }
}

async function updateFeeCurrency(
  this: Connector,
  feeContract: CeloTokenContract
): Promise<void> {
  if (!this.supportsFeeCurrency()) {
    return;
  }
  this.feeCurrency = feeContract;
  const address =
    feeContract === CeloContract.GoldToken
      ? undefined
      : await this.kit.registry.addressFor(feeContract);

  this.kit.connection.defaultFeeCurrency = address;
}

function persist({
  walletType,
  walletId,
  options = [],
  network,
}: {
  walletType?: WalletTypes;
  walletId?: string;
  options?: WalletArgs;
  network?: Network;
}): void {
  if (walletType) {
    setTypedStorageKey(localStorageKeys.lastUsedWalletType, walletType);
  }
  if (walletId) {
    setTypedStorageKey(localStorageKeys.lastUsedWalletId, walletId);
  }
  if (network) {
    setTypedStorageKey(localStorageKeys.lastUsedNetwork, network.name);
  }
  setLastUsedWalletArgs(options);
}
