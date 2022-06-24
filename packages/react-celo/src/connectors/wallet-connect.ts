import { CeloTokenContract } from '@celo/contractkit/lib/base';
import { MiniContractKit, newKit } from '@celo/contractkit/lib/mini-kit';
import {
  WalletConnectWallet as WalletConnectWalletV1,
  WalletConnectWalletOptions as WalletConnectWalletOptionsV1,
} from '@celo/wallet-walletconnect-v1';
import { BigNumber } from 'bignumber.js';

import { WalletTypes } from '../constants';
import { Connector, Maybe, Network } from '../types';
import {
  AbstractConnector,
  ConnectorEvents,
  updateFeeCurrency,
} from './common';

export function buildOptions(network: Network): WalletConnectWalletOptionsV1 {
  return {
    connect: {
      chainId: network.chainId,
    },
  };
}

export default class WalletConnectConnector
  extends AbstractConnector
  implements Connector
{
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
    super();
    const wallet = new WalletConnectWalletV1(options);
    // Uncomment with WCV2 support
    // version == 1
    //   ? new WalletConnectWalletV1(options as WalletConnectWalletOptionsV1)
    //   : new WalletConnectWallet(options as WalletConnectWalletOptions);
    this.kit = newKit(network.rpcUrl, wallet);
    this.version = version;
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
        console.info('SESSION+WC+UPDATE', session);
        if (session.params[0].chainId == null) {
          this.onCloseCallback?.();
        }
      };
      wallet.onSessionUpdated = (_error, session) => {
        console.info('SESSION+UPDATE', session);
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
    this.emit(ConnectorEvents.CONNECTED, {
      walletType: this.type,
      walletId: this.walletId as string,
      networkName: this.network.name,
      address: defaultAccount!,
    });
    return this;
  }

  async startNetworkChangeFromApp() {
    await this.initialise(); // change to specific method
    this.emit(ConnectorEvents.NETWORK_CHANGED, '');
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

  async close(message?: string): Promise<void> {
    const wallet = this.kit.getWallet() as WalletConnectWalletV1;
    await wallet.close(message);
    this.kit.connection.stop();
    this.disconnect();
  }
}
