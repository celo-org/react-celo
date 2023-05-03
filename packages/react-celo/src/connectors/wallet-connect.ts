import { CeloTokenContract } from '@celo/contractkit/lib/base';
import { MiniContractKit, newKit } from '@celo/contractkit/lib/mini-kit';
import {
  WalletConnectWallet,
  WalletConnectWalletOptions,
} from '@celo/wallet-walletconnect';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
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

    // onSessionCreated and onSessionUpdated are both listening to the same event?
    wallet.on('session_update', this.onSessionUpdated);
    wallet.on('session_event', this.onSessionEvent);
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

  startNetworkChangeFromApp(network: Network) {
    try {
      const wallet = this.kit.getWallet() as WalletConnectWallet;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const resp = wallet.switchToChain({
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

  private onSessionEvent = (
    _error: Error | null,
    data: SignClientTypes.EventArguments['session_event']
  ) => {
    getApplicationLogger().debug(
      'wallet-connect',
      'on-session-event',
      data.params.event.name,
      data
    );
    if (_error) {
      this.emit(ConnectorEvents.WC_ERROR, _error);
    }

    const info: string = Array.isArray(data.params.event.data)
      ? (data.params.event.data[0] as string)
      : (data.params.event.data as string);

    switch (data.params.event.name) {
      case 'accountsChanged': {
        if (
          Array.isArray(data.params.event.data) &&
          data.params.event.data[0]
        ) {
          return this.onAddressChange(data.params.event.data[0] as string);
        }
        break;
      }
      case 'chainChanged': {
        if (info.startsWith('eip155')) {
          this.emit(
            ConnectorEvents.WALLET_CHAIN_CHANGED,
            Number(info.split(':')[1])
          );
        }
        break;
      }
      default:
        getApplicationLogger().warn(
          'unsupported session_event received',
          data.params.event.name
        );
    }
  };

  private onSessionUpdated = async (
    _error: Error | null,
    data: SessionTypes.Struct
  ) => {
    getApplicationLogger().debug('wallet-connect', 'on-session-update', data);

    if (_error) {
      this.emit(ConnectorEvents.WC_ERROR, _error);
    }
    try {
      await this.onConnected(data);
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

  private async onConnected(session: SessionTypes.Struct) {
    // first look for an account on the current chain if not found use the first one
    const accountForChain =
      session.namespaces.eip155.accounts.find((eipChainAccount) => {
        return (
          eipChainAccount.split(':')[1] === this.network.chainId.toString()
        );
      }) || session.namespaces.eip155.accounts[0];

    const [_eip, chainId, account] = accountForChain?.split(':') ?? [];

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
