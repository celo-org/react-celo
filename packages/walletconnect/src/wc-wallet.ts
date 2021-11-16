import { sleep } from '@celo/base';
import { CeloTx, EncodedTransaction } from '@celo/connect';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
import { RemoteWallet } from '@celo/wallet-remote';
import WalletConnect from '@walletconnect/client';
import {
  ICreateSessionOptions,
  IInternalEvent,
  ISessionParams,
  IWalletConnectSDKOptions,
} from '@walletconnect/types';

// import { ERROR } from '@walletconnect/utils';
import { defaultBridge } from '.';
import { WalletConnectWalletOptions } from './types';
import { WalletConnectSigner } from './wc-signer';

// const debug = debugConfig('kit:wallet:wallet-connect-wallet');
const debug = console.log.bind(console);

// Note: Pulled events from https://docs.walletconnect.com/1.0/client-api#register-event-subscription
const CLIENT_EVENTS = {
  connect: 'connect',
  disconnect: 'disconnect',
  session_request: 'session_request',
  session_update: 'session_update',
  call_request: 'call_request',
  wc_sessionRequest: 'wc_sessionRequest',
  wc_sessionUpdate: 'wc_sessionUpdate',
};

/**
 * Session establishment happens out of band so after somehow
 * communicating the connection URI (often via QR code) we can
 * continue with the setup process
 */
async function waitForTruthy(getValue: () => boolean, attempts = 10) {
  let waitDuration = 500;
  for (let i = 0; i < attempts; i++) {
    console.log('loop', i, attempts, getValue());
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

const defaultInitOptions: IWalletConnectSDKOptions = {
  bridge: defaultBridge,
  clientMeta: {
    name: 'ContractKit',
    description:
      "Celo's ContractKit is a library to help developers and validators to interact with the celo-blockchain.",
    url: 'https://github.com/celo-org/celo-monorepo/tree/master/packages/sdk/contractkit',
    icons: [],
  },
};

const defaultConnectOptions: ICreateSessionOptions = {
  chainId: 44787, // TODO
  // permissions: {
  //   blockchain: {
  //     // alfajores, mainnet, baklava
  //     chains: [
  //       'eip155:44787',
  //       'eip155:42220',
  //       'eip155:62320',
  //       // 'celo',
  //       // 'alfajores',
  //       // 'baklava',
  //     ],
  //   },
  //   jsonrpc: {
  //     methods: Object.values(SupportedMethods),
  //   },
  // },
};

export class WalletConnectWallet extends RemoteWallet<WalletConnectSigner> {
  private initOptions: IWalletConnectSDKOptions;
  private connectOptions: ICreateSessionOptions;

  private client?: WalletConnect;

  constructor({ init, connect }: WalletConnectWalletOptions) {
    super();

    this.initOptions = { ...defaultInitOptions, ...init };
    this.connectOptions = { ...defaultConnectOptions, ...connect };
  }

  /**
   * Pulled out to allow mocking
   */
  private getWalletConnectClient() {
    return new WalletConnect(this.initOptions);
  }

  /**
   * Get the URI needed for out of band session establishment
   */
  public async getUri(): Promise<string | void> {
    this.client = this.getWalletConnectClient();

    this.client.on(CLIENT_EVENTS.connect, this.onSessionCreated);
    this.client.on(CLIENT_EVENTS.disconnect, this.onSessionDeleted);
    this.client.on(CLIENT_EVENTS.session_request, this.onSessionRequest);
    this.client.on(CLIENT_EVENTS.session_update, this.onSessionUpdated);
    this.client.on(CLIENT_EVENTS.call_request, this.onCallRequest);
    this.client.on(
      CLIENT_EVENTS.wc_sessionRequest,
      console.log.bind(console, 'wc_sessionRequest')
    );
    this.client.on(
      CLIENT_EVENTS.wc_sessionUpdate,
      console.log.bind(console, 'wc_sessionUpdate')
    );

    // Check if connection is already established
    if (!this.client.connected) {
      // create new session
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await this.client.createSession(this.connectOptions);
    }
    console.log('here v1 uri', this.client?.uri);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.client?.uri;
  }

  onSessionCreated = (error: Error | null, session: IInternalEvent) => {
    debug('onSessionCreated', error, session);
    if (error) {
      throw error;
    }
  };
  onSessionDeleted = async (error: Error | null, session: IInternalEvent) => {
    debug('onSessionDeleted', error);
    if (error) {
      throw error;
    }

    if (session.event === 'disconnect') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      await this.close(session.params[0].message as string);
    }
  };
  onSessionRequest = (error: Error | null, session: ISessionParams) => {
    debug('onSessionRequest', error, session);
    if (error) {
      throw error;
    }
  };
  onSessionUpdated = (error: Error | null, session: ISessionParams) => {
    debug('onSessionUpdated', error, session);
    if (error) {
      throw error;
    }
  };
  onCallRequest = (error: Error | null, payload: any) => {
    debug('onCallRequest', error, payload);
    if (error) {
      throw error;
    }
  };
  // onWcSessionRequest = (error: Error | null, payload: any) => {
  //   debug('onWcSessionRequest', error, payload);
  //   if (error) {
  //     throw error;
  //   }
  // };
  // onWcSessionUpdate = (error: Error | null, payload: any) => {
  //   debug('onWcSessionUpdate', error, payload);
  //   if (error) {
  //     throw error;
  //   }
  // };

  async loadAccountSigners(): Promise<Map<string, WalletConnectSigner>> {
    /**
     * Session establishment happens out of band so after somehow
     * communicating the connection URI (often via QR code) we can
     * continue with the setup process
     */
    await waitForTruthy(() => !!this.client?.connected);

    const addressToSigner = new Map<string, WalletConnectSigner>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.client?.session.accounts.forEach((address) => {
      const signer = new WalletConnectSigner(
        this.client as WalletConnect,
        this.client?.session,
        address
      );
      console.log('HERE', signer);
      addressToSigner.set(address, signer);
    });

    return addressToSigner;
  }

  /**
   * Gets the signer based on the 'from' field in the tx body
   * @param txParams Transaction to sign
   * @dev overrides WalletBase.signTransaction
   */
  async signTransaction(txParams: CeloTx): Promise<EncodedTransaction> {
    if (!txParams.from) {
      throw new Error('txParams.from must be defined');
    }

    const fromAddress = txParams.from?.toString();
    const signer = this.getSigner(fromAddress);
    return signer.signRawTransaction(txParams);
  }

  async close(message?: string): Promise<void> {
    if (!this.client) {
      throw new Error('Wallet must be initialized before calling close()');
    }

    if (this.client.connected) {
      await this.client.killSession({ message });
    }
  }
}
