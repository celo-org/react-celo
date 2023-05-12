import { Address, sleep } from '@celo/base';
import { CeloTx } from '@celo/connect';
import { RemoteWallet } from '@celo/wallet-remote';
import Client from '@walletconnect/sign-client';
import {
  EngineTypes,
  SessionTypes,
  SignClientTypes,
} from '@walletconnect/types';
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
    chains: [], // the spec says wallet should throw an error unless it supports ALL chains. so the current chain id is added at request time to the chains array
    methods: [SupportedMethods.signTransaction],
    events: ['accountsChanged'],
  },
};

const optionalNamespaces = {
  eip155: {
    chains: [
      'eip155:44787', // alajores
      'eip155:42220', // celo
      'eip155:17323', // cannoli
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
    fn: (error: Error | null, data?: SignClientTypes.EventArguments[E]) => void
  ) => {
    this.emitter.on(event, fn);
  };

  private emit = <E extends SignClientTypes.Event>(
    event: E,
    error: Error | null,
    data?: SignClientTypes.EventArguments[E]
  ) => {
    console.info('emit', event, error, data);
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
            // It might be better not to emit an event here. after all this is a fake event anyway.
            this.emit('session_update', null, {
              id: 0,
              topic: session.topic,
              params: { namespaces: session.namespaces },
            });
          }
        }
      })
      .catch((e) => {
        debug('session resurrection failed', e);
        this.emit('session_update', e as Error);
      });
  }

  async hasSession() {
    await waitForTruthy(() => !!this.session, this.canceler.status);
  }

  private setupListeners() {
    if (!this.client) return;

    this.client.on('session_proposal', this.onSessionProposal);
    this.client.on('session_update', this.onSessionUpdated);
    this.client.on('session_delete', this.onSessionDeleted);
    // currently when disconnecting the pairing from the offical wc w implementation
    // https://react-wallet.walletconnect.com/pairings our dapp does not disconnect.
    this.client.pairing.core.events.on(
      'wc_pairingDeleted',
      this.onSessionDeleted
    );
    this.client.core.on('subscription_deleted', this.onSessionDeleted);
    this.client.pairing.core.on('wc_pairingDeleted', this.onSessionDeleted);
    this.client.on('session_extend', this.onSessionExtended);
    this.client.on('session_event', this.onSessionEvent);
    this.client.on('session_expire', this.onSessionExpire);
    this.client.on('session_ping', this.onSessionPing);
    this.client.on('session_request', this.onSessionRequest);
  }

  /**
   * Pulled out to allow mocking
   */
  private getWalletConnectClient() {
    return Client.init(this.initOptions);
  }

  async switchToChain(params: {
    chainId: number;
    networkId: number;
    rpcUrl: string;
    nativeCurrency?: { name: string; symbol: string };
  }) {
    if (!this.client) {
      return true;
    }
    // check if session already has the desired chain in it by checking accounts and chains
    const accountSessions = this.session?.namespaces?.eip155?.accounts?.filter(
      (eip155ChainAccount) =>
        this.chainId.toString() === parseAddress(eip155ChainAccount).networkId
    );
    const chainSessions = this.session?.namespaces.eip155.chains?.filter(
      (prefixedChain) => prefixedChain === `eip155:${params.chainId}`
    );
    if (!accountSessions?.length && !chainSessions?.length) {
      const accounts = this.session!.namespaces.eip155!.accounts;
      // update the chain data in the session.
      // this is necessary since we only require the current chain when connecting and some wallets
      //  might not notice the optional namespace chains and thus not include them on the namespaces when connecting even if they do in fact support them
      try {
        const updatingSession: EngineTypes.UpdateParams = {
          topic: this.session!.topic,
          namespaces: {
            eip155: {
              accounts: accounts.concat(
                accounts.map((account) => {
                  return `eip155:${params.chainId}:${
                    parseAddress(account).address
                  }`;
                })
              ),
              chains: (this.session?.namespaces.eip155.chains || []).concat([
                `eip155:${params.chainId}`,
              ]),
              methods: this.session!.namespaces.eip155!.methods,
              events: this.session!.namespaces.eip155!.events,
            },
          },
        };
        const resp = await this.client?.update(updatingSession);
        await resp?.acknowledged();
        // ensure we have the new data on the local session.
        this.onSessionUpdated({
          id: 0, //this is fine since its not used internally
          topic: updatingSession.topic,
          params: { namespaces: updatingSession.namespaces },
        });
        return true;
      } catch (e) {
        console.error(
          `switchToChain failed, wallet likely does not support ${params.chainId}`,
          e
        );
        return false;
      }
    }

    this.chainId = params.chainId;
    await this.loadAccountSigners();
    return true;
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

    // wallets will literally fail if they don't support a chainId in the required namespaces
    // likewise wallets return an error if they dont support a method in the required namespaces
    // therefore required really is required and we add new chain to namespaces when switching chains. see switchToChain
    const { uri, approval } = await this.client.connect({
      requiredNamespaces: {
        eip155: {
          ...requiredNamespaces.eip155,
          chains: [`eip155:${this.chainId}`],
        },
      },
      optionalNamespaces,
    });

    void approval()
      .then((session) => {
        console.info('approved session', session);
        this.session = session;
        this.emit('session_update', null, {
          id: 1,
          topic: session.topic,
          params: { namespaces: session.namespaces },
        });
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

  onSessionExpire = ({ topic }: { topic: string }) => {
    // can you be connected to a topic that isnt the main topic? how to just disconnect that topic?
    if (this.session?.topic === topic) {
      void this.close();
    } else if (this.client?.pairing.values) {
      const sessionForTopic = this.client.pairing.values.find(
        (connection) => connection.topic === topic
      );
      console.warn(
        'received session expired for topic',
        topic,
        'which is not the topic of session',
        this.session?.topic,
        'session with such topic in storage',
        sessionForTopic || 'false'
      );
    }
  };

  onSessionDeleted = (
    session: SignClientTypes.EventArguments['session_delete']
  ) => {
    this.emit('session_delete', null, session);
    void this.close().catch((e) => {
      console.error('error closing session', e);
    });
  };

  onSessionEvent = (event: SignClientTypes.EventArguments['session_event']) => {
    this.emit('session_event', null, event);
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

    // namespace.accounts is an array of chain prefixed addresses,
    // we should not be assuming that every address can work for every chain. but instead filtering based on chain prefix.
    allNamespaceAccounts
      .filter((addressLike) => {
        const { networkId } = parseAddress(addressLike);
        return networkId === String(this.chainId); // chain id matches this.chainId
      })
      .forEach((addressLike) => {
        const { address } = parseAddress(addressLike);
        const signer = new WalletConnectSigner(
          this.client!,
          this.session!,
          address,
          String(this.chainId)
        );
        addressToSigner.set(address, signer);
        this.addSigner(address, signer);
      });
    // note the parent of this class has  a private signers map at addressSigners. which is what addSigner and GetSigner access
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
      connections.map((connection) => {
        try {
          console.info('closing wc connection', connection, reason);
          return this.client!.disconnect({
            topic: connection.topic,
            reason,
          });
        } catch (e) {
          console.error('Error closing wc connection', connection, reason, e);
        }
      })
    );
    // ensures pairing is deleted so wallet doesnt have a lingering one.
    if (this.session?.topic && this.client.pairing) {
      await this.client.pairing?.delete(this.session.topic, reason);
    }
    this.client = undefined;
    this.session = undefined;
  };
}
