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
  public type: WalletTypes.WalletConnect = WalletTypes.WalletConnect;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;

  private onUriCallback?: (uri: string) => void;
  private onCloseCallback?: () => void;

  constructor(
    private network: Network,
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

    this.kit = newKit(network.rpcUrl, wallet);
  }

  onUri(callback: (uri: string) => void): void {
    this.onUriCallback = callback;
  }

  onClose(callback: () => void): void {
    this.onCloseCallback = callback;
  }

  async initialise(): Promise<this> {
    const wallet = this.kit.getWallet() as WalletConnectWalletV1;

    wallet.onSessionCreated = (_error, session) => {
      // TODO HANDLE FAILED TO CONNECT STATE
      const connectSession = session as ConnectSession;
      this.onConnected(connectSession);
    };

    wallet.onSessionDeleted = (_error, session) => {
      console.info('SESSION+DELETED', session);
      void this.close();
    };
    // wallet.onPairingDeleted = () => this.onCloseCallback?.();

    // TODO why do both these methods exist? data is duplicated on them always from when ive seen
    wallet.onWcSessionUpdate = (_error, session) => {
      console.info('SESSION+WC+UPDATE', session);
      if (session.params[0].chainId == null) {
        this.onCloseCallback?.();
      }
    };
    wallet.onSessionUpdated = (_error, session) => {
      console.info('SESSION+UPDATE', session);
      const params = session.params[0];

      if (params.chainId == null) {
        return this.close();
      }

      if (params.chainId !== this.network.chainId) {
        return this.emit(ConnectorEvents.WALLET_CHAIN_CHANGED, params.chainId);
      }

      const accounts = params.accounts as string[];
      const addressFromSessionUpdate = accounts[0];
      if (
        typeof addressFromSessionUpdate === 'string' &&
        addressFromSessionUpdate !== this.account
      ) {
        return this.onAddressChange(addressFromSessionUpdate);
      }
    };
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
    // EMIT something that indicates we have started to connect
    return this;
  }

  // TODO do any wallets support this?
  async startNetworkChangeFromApp(network: Network) {
    try {
      const wallet = this.kit.getWallet() as WalletConnectWalletV1;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const resp = await wallet.switchToChain({
        ...network,
        networkId: network.chainId,
      });
      this.restartKit(network);
      this.emit(ConnectorEvents.NETWORK_CHANGED, network.name);
    } catch (e) {
      console.error('NETWORK CANT CHANGE', e);
    }
  }

  private restartKit(network: Network) {
    const wallet = this.kit.getWallet() as WalletConnectWalletV1;
    this.network = network; // must set to prevent loop
    this.kit.connection.stop(); // this blows up if its already stopped (make it conditional?)
    this.kit = newKit(network.rpcUrl, wallet);
  }

  // for when the wallet is already on the desired network and the kit / dapp need to catch up.
  continueNetworkUpdateFromWallet(network: Network): void {
    this.restartKit(network);
    this.emit(ConnectorEvents.NETWORK_CHANGED, network.name);
  }

  supportsFeeCurrency() {
    // If on WC 1 it will not work due to fields being dropped
    if (!this.version || this.version === 1) {
      return false;
    }
    // TODO when V2 is used again check based on wallet?
    return true;
  }

  private onAddressChange(address: string) {
    this.kit.connection.defaultAccount = address;
    this.emit(ConnectorEvents.ADDRESS_CHANGED, address);
  }

  private onConnected(session: ConnectSession) {
    const sessionAccount = session.params[0].accounts[0];
    console.info(this.account, sessionAccount);
    if (this.account !== sessionAccount) {
      this.kit.connection.defaultAccount = sessionAccount;
    }

    this.emit(ConnectorEvents.CONNECTED, {
      walletType: this.type,
      walletId: this.walletId as string,
      networkName: this.network.name,
      address: sessionAccount,
    });
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
    try {
      const wallet = this.kit.getWallet() as WalletConnectWalletV1;
      await wallet.close(`session ended from dapp side ${message || ''}`);
      this.kit.connection.stop();
    } finally {
      this.disconnect();
    }
  }
}

interface ConnectSession {
  event: 'connect';
  params: [
    {
      accounts: string[];
      chainId: number;
      peerId: string;
      peerMeta: unknown;
    }
  ];
}
