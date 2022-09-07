import { CeloTokenContract } from '@celo/contractkit/lib/base';
import { MiniContractKit, newKit } from '@celo/contractkit/lib/mini-kit';
import {
  EthProposal,
  SessionConnect,
  SessionDisconnect,
  SessionProposal,
  SessionUpdate,
  WalletConnectWallet as WalletConnectWalletV1,
  WalletConnectWalletOptions as WalletConnectWalletOptionsV1,
} from '@celo/wallet-walletconnect-v1';
import { BigNumber } from 'bignumber.js';

import { WalletTypes } from '../constants';
import { Connector, Network } from '../types';
import { getApplicationLogger } from '../utils/logger';
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

  // this is called automatically and is what gives us the uri for the qr code to be scanned
  async initialise(): Promise<this> {
    const wallet = this.kit.getWallet() as WalletConnectWalletV1;

    wallet.onSessionCreated = this.onSessionCreated.bind(this);

    wallet.onSessionUpdated = this.onSessionUpdated.bind(this);

    wallet.onCallRequest = this.onCallRequest.bind(this);

    wallet.onWcSessionUpdate = this.onWcSessionUpdate.bind(this);

    wallet.onSessionDeleted = this.onSessionDeleted.bind(this);

    // must be called after all callbacks are set
    await wallet.setupClient();

    await this.handleUri(wallet);

    await wallet.init();

    const [address] = wallet.getAccounts();
    const defaultAccount = await this.fetchWalletAddressForAccount(address);

    this.kit.connection.defaultAccount = defaultAccount;

    this.initialised = true;
    this.emit(ConnectorEvents.WC_INITIALISED);
    return this;
  }

  private async handleUri(wallet: WalletConnectWalletV1) {
    const uri = await wallet.getUri();
    if (uri) {
      this.emit(ConnectorEvents.WC_URI_RECEIVED, uri);
    }

    if (uri && this.autoOpen) {
      const deepLink = this.getDeeplinkUrl ? this.getDeeplinkUrl(uri) : uri;
      if (deepLink) {
        location.href = deepLink;
      }
    }
  }

  async startNetworkChangeFromApp(network: Network) {
    try {
      const wallet = this.kit.getWallet() as WalletConnectWalletV1;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const resp = await wallet.switchToChain({
        ...network,
        networkId: network.chainId,
      });
      getApplicationLogger().debug(
        '[startNetworkChangeFromApp] response',
        resp
      );
      this.restartKit(network);
      this.emit(ConnectorEvents.NETWORK_CHANGED, network.name);
    } catch (e) {
      this.emit(ConnectorEvents.NETWORK_CHANGE_FAILED, e);
    }
  }

  private restartKit(network: Network) {
    const wallet = this.kit.getWallet() as WalletConnectWalletV1;
    this.network = network; // must set to prevent loop
    try {
      this.kit.connection.stop(); // this blows up if its already stopped
    } finally {
      this.kit = newKit(network.rpcUrl, wallet);
    }
  }

  private async onSessionCreated(
    _error: Error | null,
    session: SessionConnect
  ) {
    const connectSession = session;
    await this.onConnected(connectSession).catch((e: Error) => {
      this.emit(ConnectorEvents.WC_ERROR, e);
      getApplicationLogger().error(
        'wallet-connect',
        'onSessionCreated',
        'error',
        e
      );
    });
  }

  private onCallRequest(error: Error | null, payload: EthProposal) {
    getApplicationLogger().debug(
      'wallet-connect',
      'onCallRequest',
      payload,
      error ? `Error ${error.name} ${error.message}` : ''
    );
    if (error) {
      this.emit(ConnectorEvents.WC_ERROR, error);
    }
  }

  private async onWcSessionUpdate(
    _error: Error | null,
    session: SessionProposal
  ) {
    getApplicationLogger().debug(
      'wallet-connect',
      'on-wc-session-update',
      session,
      _error
    );
    const params = session.params[0];
    await this.combinedSessionUpdater(params);
  }

  private async onSessionUpdated(_error: Error | null, session: SessionUpdate) {
    getApplicationLogger().debug(
      'wallet-connect',
      'on-session-update',
      session,
      _error
    );
    const params = session.params[0];

    try {
      await this.combinedSessionUpdater(params);
    } catch (e) {
      getApplicationLogger().error(e);
      this.emit(ConnectorEvents.WC_ERROR, e as Error);
    }
  }

  private onSessionDeleted(_error: Error | null, session: SessionDisconnect) {
    getApplicationLogger().debug(
      'wallet-connect',
      'on-session-delete',
      session,
      _error
    );
    // since dapps send the both when they initiate disconnection and when responding to disconnection requests
    // check if dapp initiated the closure to avoid closing twice.
    if (session.params[0]?.message?.startsWith(END_MESSAGE)) {
      return;
    }
    void this.close();
  }

  private combinedSessionUpdater(params: {
    accounts?: string[];
    chainId: number | null;
  }) {
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
      addressFromSessionUpdate !== this.kit.connection.defaultAccount
    ) {
      return this.onAddressChange(addressFromSessionUpdate);
    }
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

  private async onAddressChange(address: string) {
    this.kit.connection.defaultAccount =
      await this.fetchWalletAddressForAccount(address);
    this.emit(ConnectorEvents.ADDRESS_CHANGED, address);
  }

  private async onConnected(session: SessionConnect) {
    const sessionAccount = session.params[0].accounts[0];
    const walletAddress = await this.fetchWalletAddressForAccount(
      sessionAccount
    );
    if (this.kit.connection.defaultAccount !== walletAddress) {
      this.kit.connection.defaultAccount = walletAddress;
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
    getApplicationLogger().log('wallet-connect', 'close', message);
    try {
      const wallet = this.kit.getWallet() as WalletConnectWalletV1;
      await wallet.close(`${END_MESSAGE} : ${message || ''}`);
      this.kit.connection.stop();
    } finally {
      this.disconnect();
    }
  }
}

const END_MESSAGE = '[react-celo] WC SESSION ENDED BY DAPP';
