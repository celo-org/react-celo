import { sleep } from '@celo/base';
import { CeloTx } from '@celo/connect';
import { RemoteWallet } from '@celo/wallet-remote';
import Client from '@walletconnect/sign-client';
import {
  PairingTypes,
  SessionTypes,
  SignClientTypes,
} from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
import debugConfig from 'debug';
import EventEmitter from 'events';

import { PROJECT_ID, RELAY_URL } from './constants';
import { SupportedMethods, WalletConnectWalletOptions } from './types';
import { parseAddress } from './utils';
import { WalletConnectSigner } from './wc-signer';

const debug = debugConfig('kit:wallet:wallet-connect-wallet');

/**
 * Session establishment happens out of band so after somehow
 * communicating the connection URI (often via QR code) we can
 * continue with the setup process
 */
async function waitForTruthy(getValue: () => boolean, attempts = 10) {
  let waitDuration = 500;
  for (let i = 0; i < attempts; i++) {
    if (getValue()) {
      return;
    }

    await sleep(waitDuration);
    waitDuration = waitDuration * 1.5;
  }

  throw new Error(
    'Unable to get pairing session, did you lose internet connection?'
  );
}

const defaultInitOptions: SignClientTypes.Options = {
  relayUrl: RELAY_URL,
  projectId: PROJECT_ID,
  logger: 'error',
  metadata: {
    name: 'react-celo',
    description:
      "Celo's react-celo is a library to help developers and validators to interact with the celo-blockchain.",
    url: 'https://github.com/celo-org/celo-monorepo/tree/master/packages/sdk/contractkit',
    icons: ['https://avatars.githubusercontent.com/u/37552875?s=200&v=4'],
  },
};

export class WalletConnectWallet extends RemoteWallet<WalletConnectSigner> {
  private initOptions: SignClientTypes.Options;

  private client?: Client;
  private pairing?: PairingTypes.Struct;
  private session?: SessionTypes.Struct;

  private emitter = new EventEmitter();

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

  constructor({ init }: WalletConnectWalletOptions) {
    super();

    this.initOptions = { ...defaultInitOptions, ...init };

    void this.getWalletConnectClient().then((client) => {
      this.client = client;
      // when we're in certain environments (like the browser) the
      // WalletConnect client will handle retrieving old sessions.
      if (client.session) {
        const session = client.session
          .getAll()
          .sort((a, b) => b.expiry - a.expiry)
          .find((x) => x.acknowledged && x.expiry * 1000 > Date.now());

        if (session) {
          this.session = session;
          this.emit('session_update', null, this.session);
        }
      }
    });
  }

  /**
   * Pulled out to allow mocking
   */
  private getWalletConnectClient() {
    return Client.init(this.initOptions);
  }

  async switchToChain(_params: unknown) {}

  /**
   * Get the URI needed for out of band session establishment
   */
  public async getUri(): Promise<string | void> {
    this.client = this.client || (await this.getWalletConnectClient());

    this.client.on('session_proposal', this.onSessionProposal);
    this.client.on('session_update', this.onSessionUpdated);
    this.client.on('session_delete', this.onSessionDeleted);
    this.client.on('session_extend', this.onSessionExtended);

    this.client.on('session_event', (args) =>
      console.log('EVENT', 'session_event', args)
    );
    this.client.on('session_ping', (args) =>
      console.log('EVENT', 'session_ping', args)
    );

    const { uri, approval } = await this.client.connect({
      pairingTopic: this.pairing?.topic,
      requiredNamespaces: {
        eip155: {
          chains: [
            'eip155:44787', // alajores
            'eip155:42220', // celo
            'eip155:62320', // baklava
          ],
          methods: Object.values(SupportedMethods),
          events: ['chainChanged', 'accountsChanged'],
        },
      },
    });
    console.log('uri', this.pairing?.topic, uri, approval);
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
    sessionProposal: SignClientTypes.EventArguments['session_proposal']
  ) => {
    this.emit('session_proposal', null, sessionProposal);
  };

  onSessionUpdated = (
    sessionUpdate: SignClientTypes.EventArguments['session_update']
  ) => {
    const {
      topic,
      params: { namespaces },
    } = sessionUpdate;
    const _session = this.client?.session.get(topic);
    this.session = { ..._session!, namespaces };
    this.emit('session_update', null, sessionUpdate);
  };

  onSessionExtended = (
    sessionExtend: SignClientTypes.EventArguments['session_extend']
  ) => {
    const { topic } = sessionExtend;
    const _session = this.client?.session.get(topic);
    this.session = { ..._session! };
    this.emit('session_extend', null, sessionExtend);
  };

  onSessionDeleted = (
    sessionDeleted: SignClientTypes.EventArguments['session_delete']
  ) => {
    this.client = undefined;
    this.session = undefined;
    this.emit('session_delete', null, sessionDeleted);
  };

  async loadAccountSigners(): Promise<Map<string, WalletConnectSigner>> {
    /**
     * Session establishment happens out of band so after somehow
     * communicating the connection URI (often via QR code) we can
     * continue with the setup process
     */
    await waitForTruthy(() => !!this.session);

    const addressToSigner = new Map<string, WalletConnectSigner>();

    const allNamespaceAccounts = Object.values(this.session!.namespaces)
      .map((namespace) => namespace.accounts)
      .flat();

    allNamespaceAccounts.forEach((addressLike) => {
      console.log(addressLike);
      const { address, networkId } = parseAddress(addressLike);
      const signer = new WalletConnectSigner(
        this.client!,
        this.session!,
        address,
        networkId
      );
      addressToSigner.set(address, signer);
    });

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

    const reason = getSdkError('USER_DISCONNECTED');
    if (this.session) {
      await this.client.disconnect({
        topic: this.session.topic,
        reason,
      });
      await this.client.session.delete(this.session.topic, reason);
    }
  };
}
