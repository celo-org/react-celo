import { Address, sleep } from '@celo/base';
import { CeloTx } from '@celo/connect';
import { RemoteWallet } from '@celo/wallet-remote';
import Client from '@walletconnect/sign-client';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
import debugConfig from 'debug';
import EventEmitter from 'events';

import { CANCELED } from './constants';
import { SupportedMethods, WalletConnectWalletOptions } from './types';
import { parseAddress } from './utils';
import Canceler from './utils/canceler';
import { WalletConnectSigner } from './wc-signer';

const debug = debugConfig('kit:wallet:wallet-connect-wallet');

/**
 * Session establishment happens out of band so after somehow
 * communicating the connection URI (often via QR code) we can
 * continue with the setup process
 */
async function waitForTruthy(
  getValue: () => boolean,
  signal: Canceler['status'],
  waitDuration = 500
): Promise<void> {
  if (signal.canceled || getValue()) {
    return;
  }
  await sleep(waitDuration);
  return waitForTruthy(getValue, signal, waitDuration);
}

const defaultInitOptions: SignClientTypes.Options = {
  logger: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  metadata: {
    name: 'react-celo',
    description:
      "Celo's react-celo is a library to help developers and validators to interact with the celo-blockchain.",
    url: 'https://github.com/celo-org/celo-monorepo/tree/master/packages/sdk/contractkit',
    icons: ['https://avatars.githubusercontent.com/u/37552875?s=200&v=4'],
  },
};

const requiredNamespaces = {
  eip155: {
    chains: [
      'eip155:44787', // alajores
      'eip155:42220', // celo
      'eip155:62320', // baklava
    ],
    methods: Object.values(SupportedMethods),
    events: ['chainChanged', 'accountsChanged'],
  },
};

export class WalletConnectWallet extends RemoteWallet<WalletConnectSigner> {
  private initOptions: SignClientTypes.Options & {
    projectId?: string;
  };

  private client?: Client;
  private session?: SessionTypes.Struct;

  private canceler: Canceler;
  private emitter = new EventEmitter();

  private chainId: number;
  private signers: Map<Address, WalletConnectSigner> = new Map();

  on = <E extends SignClientTypes.Event>(
    event: E,
    fn: (error: Error | null, data?: unknown) => void
  ) => {
    this.emitter.on(event, fn);
  };

  private emit = <E extends SignClientTypes.Event>(
    event: E,
    error: Error | null,
    data?: unknown
  ) => {
    debug('emit', event, error, data);
    this.emitter.emit(event, error, data);
  };

  constructor({ init, projectId, chainId }: WalletConnectWalletOptions) {
    super();

    this.canceler = new Canceler();
    this.initOptions = {
      ...defaultInitOptions,
      ...init,
      projectId,
    };
    this.chainId = chainId;

    void this.getWalletConnectClient()
      .then(async (client) => {
        this.client = client;
        this.setupListeners();
        // when we're in certain environments (like the browser) the
        // WalletConnect client will handle retrieving old sessions.
        if (client.session) {
          const session = client.session
            .getAll()
            .sort((a, b) => b.expiry - a.expiry)
            .find((x) => x.acknowledged && x.expiry * 1000 > Date.now());

          if (session) {
            try {
              await client.extend({
                topic: session.topic,
              });
            } catch (e) {
              debug(
                'session resurrection, extend failed, wallet most likely refuses session extensions',
                e
              );
            }
            this.session = session;
            this.emit('session_update', null, this.session);
          }
        }
      })
      .catch((e) => {
        debug('session resurrection failed', e);
        this.emit('session_update', e as Error);
      });
  }

  private setupListeners() {
    if (!this.client) return;

    this.client.on('session_proposal', this.onSessionProposal);
    this.client.on('session_update', this.onSessionUpdated);
    this.client.on('session_delete', this.onSessionDeleted);
    this.client.on('session_extend', this.onSessionExtended);
    this.client.on('session_event', this.onSessionEvent);
    this.client.on('session_ping', this.onSessionPing);
    this.client.on('session_request', this.onSessionRequest);
  }

  /**
   * Pulled out to allow mocking
   */
  private getWalletConnectClient() {
    return Client.init(this.initOptions);
  }

  switchToChain(params: {
    chainId: number;
    networkId: number;
    rpcUrl: string;
    nativeCurrency: { name: string; symbol: string };
  }) {
    this.chainId = params.chainId;
    this.signers.forEach((signer) =>
      signer.updateChain(String(params.chainId))
    );

    this.emit('session_update', null, this.session);
  }

  /**
   * Get the URI needed for out of band session establishment
   */
  public async getUri(): Promise<string | void> {
    this.client = this.client || (await this.getWalletConnectClient());

    if (
      this.session?.acknowledged &&
      this.session?.expiry &&
      this.session?.expiry * 1000 > Date.now()
    ) {
      return;
    }

    this.setupListeners();

    const { uri, approval } = await this.client.connect({
      requiredNamespaces,
    });

    void approval()
      .then((session) => {
        this.session = session;
        this.emit('session_update', null, this.session);
      })
      .catch((err) => {
        this.emit('session_update', err as Error);
      });

    return uri;
  }

  onSessionProposal = (
    session: SignClientTypes.EventArguments['session_proposal']
  ) => {
    this.emit('session_proposal', null, session);
  };

  onSessionUpdated = (
    session: SignClientTypes.EventArguments['session_update']
  ) => {
    const {
      topic,
      params: { namespaces },
    } = session;
    const _session = this.client?.session.get(topic);
    this.session = { ..._session!, namespaces };
    this.emit('session_update', null, session);
  };

  onSessionExtended = (
    session: SignClientTypes.EventArguments['session_extend']
  ) => {
    const { topic } = session;
    const _session = this.client?.session.get(topic);
    this.session = { ..._session! };
    this.emit('session_extend', null, session);
  };

  onSessionDeleted = (
    session: SignClientTypes.EventArguments['session_delete']
  ) => {
    this.client = undefined;
    this.session = undefined;
    this.emit('session_delete', null, session);
  };

  onSessionEvent = (event: SignClientTypes.EventArguments['session_event']) => {
    this.emit('session_ping', null, event);
  };

  onSessionPing = (ping: SignClientTypes.EventArguments['session_ping']) => {
    this.emit('session_ping', null, ping);
  };

  onSessionRequest = (
    request: SignClientTypes.EventArguments['session_request']
  ) => {
    this.emit('session_request', null, request);
  };

  async loadAccountSigners(): Promise<Map<string, WalletConnectSigner>> {
    /**
     * Session establishment happens out of band so after somehow
     * communicating the connection URI (often via QR code) we can
     * continue with the setup process
     */
    await waitForTruthy(() => !!this.session, this.canceler.status);
    if (this.canceler.status.canceled) {
      // This will be true if this.canceler.cancel() was called earlier
      throw CANCELED;
    }

    const addressToSigner = new Map<string, WalletConnectSigner>();

    const allNamespaceAccounts = Object.values(this.session!.namespaces)
      .map((namespace) => namespace.accounts)
      .flat();

    allNamespaceAccounts.forEach((addressLike) => {
      const { address } = parseAddress(addressLike);
      const signer = new WalletConnectSigner(
        this.client!,
        this.session!,
        address,
        String(this.chainId)
      );
      addressToSigner.set(address, signer);
    });

    this.signers = addressToSigner;
    return addressToSigner;
  }

  /**
   * Gets the signer based on the 'from' field in the tx body
   * @param txParams Transaction to sign
   * @dev overrides WalletBase.signTransaction
   */
  async signTransaction(txParams: CeloTx) {
    const fromAddress = txParams.from!.toString();
    const signer = this.getSigner(fromAddress);
    return signer.signRawTransaction(txParams);
  }

  close = async () => {
    if (!this.client) {
      throw new Error('Wallet must be initialized before calling close()');
    }

    this.canceler.cancel();
    const reason = getSdkError('USER_DISCONNECTED');
    const connections = this.client.pairing.values;

    this.session && this.client.session.delete(this.session?.topic, reason);
    await Promise.all(
      connections.map((connection) =>
        this.client!.disconnect({
          topic: connection.topic,
          reason,
        })
      )
    );
  };
}
