import { CeloTokenContract } from '@celo/contractkit/lib/base';
import { MiniContractKit, newKit } from '@celo/contractkit/lib/mini-kit';
import {
  WalletConnectWallet,
  WalletConnectWalletOptions,
  WCSession,
} from '@celo/wallet-walletconnect';
import { BigNumber } from 'bignumber.js';

import { WalletTypes } from '../constants';
import { Connector, Network } from '../types';
import { getApplicationLogger } from '../utils/logger';
import {
  AbstractConnector,
  ConnectorEvents,
  updateFeeCurrency,
} from './common';

export default class WalletConnectConnector
  extends AbstractConnector
  implements Connector
{
  public initialised = false;
  public type: WalletTypes.WalletConnect = WalletTypes.WalletConnect;
  public kit: MiniContractKit;

  constructor(
    private network: Network,
    manualNetworkMode: boolean,
    public feeCurrency: CeloTokenContract,
    readonly options: WalletConnectWalletOptions,
    readonly autoOpen = false,
    public getDeeplinkUrl?: (uri: string) => string | false,
    readonly version?: number,
    readonly walletId?: string
  ) {
    super();
    const wallet = new WalletConnectWallet({
      ...options,
      chainId: network.chainId,
    });

    this.kit = newKit(network.rpcUrl, wallet);
  }

  // this is called automatically and is what gives us the uri for the qr code to be scanned
  async initialise(): Promise<this> {
    const wallet = this.kit.getWallet() as WalletConnectWallet;

    wallet.on('session_update', this.onSessionCreated);
    wallet.on('session_update', this.onSessionUpdated);
    wallet.on('session_delete', this.onSessionDeleted);
    wallet.on('session_request', this.onCallRequest);

    await this.handleUri(wallet);

    await wallet.init();

    const [address] = wallet.getAccounts();
    const defaultAccount = await this.fetchWalletAddressForAccount(address);

    this.kit.connection.defaultAccount = defaultAccount;

    this.initialised = true;
    this.emit(ConnectorEvents.WC_INITIALISED);
    return this;
  }

  private async handleUri(wallet: WalletConnectWallet) {
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
      const wallet = this.kit.getWallet() as WalletConnectWallet;
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
    const wallet = this.kit.getWallet() as WalletConnectWallet;
    this.network = network; // must set to prevent loop
    try {
      this.kit.connection.stop(); // this blows up if its already stopped
    } finally {
      this.kit = newKit(network.rpcUrl, wallet);
    }
  }

  private onSessionCreated = async (error: Error | null, data: unknown) => {
    if (error) {
      getApplicationLogger().error(
        '[wallet-connect] Error while connecting',
        error.name,
        error.message
      );
      this.emit(ConnectorEvents.WC_ERROR, error);
    }
    await this.onConnected(data as WCSession).catch((e: Error) => {
      this.emit(ConnectorEvents.WC_ERROR, e);
      getApplicationLogger().error(
        'wallet-connect',
        'onSessionCreated',
        'error',
        e
      );
    });
  };

  private onCallRequest = (error: Error | null, payload: unknown) => {
    getApplicationLogger().debug(
      'wallet-connect',
      'onCallRequest',
      payload,
      error ? `Error ${error.name} ${error.message}` : ''
    );
    if (error) {
      getApplicationLogger().debug(
        'wallet-connect',
        'on-call-request',
        payload,
        error
      );
      this.emit(ConnectorEvents.WC_ERROR, error);
    }
  };

  private onSessionUpdated = async (_error: Error | null, data: unknown) => {
    getApplicationLogger().debug('wallet-connect', 'on-session-update', data);

    if (_error) {
      this.emit(ConnectorEvents.WC_ERROR, _error);
    }
    try {
      await this.combinedSessionUpdater(data as WCSession);
    } catch (e) {
      getApplicationLogger().error('wallet-connect', 'on-session-update', e);
      this.emit(ConnectorEvents.WC_ERROR, e as Error);
    }
  };

  private onSessionDeleted = async (_error: Error | null, data: unknown) => {
    getApplicationLogger().debug(
      'wallet-connect',
      'on-session-delete',
      data,
      _error
    );
    // since dapps send the event both when they initiate disconnection and
    // when responding to disconnection requests, check if dapp initiated the
    // connection to avoid closing twice.

    try {
      await this.close();
    } catch (e) {
      console.warn(e);
    }
  };

  private combinedSessionUpdater(session: WCSession) {
    if (!session.namespaces.eip155.accounts.length) {
      return this.close();
    }

    const chainPredicate = `eip155:${this.network.chainId}:`;
    const accounts = session.namespaces.eip155.accounts;
    const account = accounts.find((x) => x.startsWith(chainPredicate));

    if (!account) {
      return this.emit(
        ConnectorEvents.WALLET_CHAIN_CHANGED,
        parseInt(accounts[0].split(chainPredicate)[0])
      );
    }

    const addressFromSessionUpdate = account.split(chainPredicate)[1];
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

  private async onConnected(session: WCSession) {
    const [_eip155, chainId, account] =
      session.namespaces.eip155.accounts[0].split(':');

    const walletAddress = await this.fetchWalletAddressForAccount(account);
    if (this.kit.connection.defaultAccount !== walletAddress) {
      this.kit.connection.defaultAccount = walletAddress;
    }
    this.emit(ConnectorEvents.CONNECTED, {
      walletType: this.type,
      walletId: this.walletId as string,
      walletChainId: parseInt(chainId),
      networkName: this.network.name,
      address: walletAddress!,
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
      const wallet = this.kit.getWallet() as WalletConnectWallet;
      await wallet.close();
      this.kit.connection.stop();
    } finally {
      this.disconnect();
    }
  }
}

const END_MESSAGE = '[react-celo] WC SESSION ENDED BY DAPP';
