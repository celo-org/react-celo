/// <reference path='../../../node_modules/@walletconnect/types-v1/index.d.ts' />

import { sleep } from '@celo/base';
import { CeloTx, EncodedTransaction } from '@celo/connect';
import { RemoteWallet } from '@celo/wallet-remote';
import WalletConnect from '@walletconnect/client-v1';
import {
  ICreateSessionOptions,
  IInternalEvent,
  IWalletConnectSDKOptions,
} from '@walletconnect/types';
import debugConfig from 'debug';

import { defaultBridge } from './constants';
import {
  AccountsProposal,
  CLIENT_EVENTS,
  ComputeSharedSecretProposal,
  DecryptProposal,
  PersonalSignProposal,
  SessionProposal,
  SignTransactionProposal,
  SignTypedSignProposal,
  WalletConnectWalletOptions,
} from './types';
import { WalletConnectSigner } from './wc-signer';

const debug = debugConfig('kit:wallet:wallet-connect-wallet-v1');

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
  chainId: 42220, // Celo Mainnet
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
  public async getUri(): Promise<string | undefined> {
    this.client = this.getWalletConnectClient();

    this.client.on(CLIENT_EVENTS.connect, this.onSessionCreated);
    this.client.on(CLIENT_EVENTS.disconnect, this.onSessionDeleted);
    this.client.on(CLIENT_EVENTS.session_request, this.onSessionRequest);
    this.client.on(CLIENT_EVENTS.session_update, this.onSessionUpdated);
    this.client.on(CLIENT_EVENTS.call_request, this.onCallRequest);
    this.client.on(CLIENT_EVENTS.wc_sessionRequest, this.onWcSessionRequest);
    this.client.on(CLIENT_EVENTS.wc_sessionUpdate, this.onWcSessionUpdate);

    // Check if connection is already established
    if (!this.client.connected) {
      // create new session
      await this.client.createSession(this.connectOptions);
    }

    return this.client?.uri;
  }

  onSessionCreated = (error: Error | null, session: IInternalEvent): void => {
    debug('onSessionCreated', error, session);
    if (error) {
      throw error;
    }
  };
  onSessionDeleted = (error: Error | null, session: IInternalEvent): void => {
    debug('onSessionDeleted', error);
    if (error) {
      throw error;
    }

    if (session.event === 'disconnect') {
      const params = session.params as { message: string }[];
      const error =
        params && params[0] && params[0].message
          ? params[0].message
          : 'Unknown error';
      void this.close(error);
    }
  };
  onSessionRequest = (error: Error | null, session: SessionProposal): void => {
    debug('onSessionRequest', error, session);
    if (error) {
      throw error;
    }
  };
  onSessionUpdated = (error: Error | null, session: SessionProposal): void => {
    debug('onSessionUpdated', error, session);
    if (error) {
      throw error;
    }
  };
  onCallRequest = (
    error: Error | null,
    payload:
      | AccountsProposal
      | SignTransactionProposal
      | PersonalSignProposal
      | SignTypedSignProposal
      | DecryptProposal
      | ComputeSharedSecretProposal
  ): void => {
    debug('onCallRequest', error, payload);
    if (error) {
      throw error;
    }
  };
  onWcSessionRequest = (
    error: Error | null,
    payload: SessionProposal
  ): void => {
    debug('onWcSessionRequest', error, payload);
    if (error) {
      throw error;
    }
  };
  onWcSessionUpdate = (error: Error | null, payload: SessionProposal): void => {
    debug('onWcSessionUpdate', error, payload);
    if (error) {
      throw error;
    }
  };

  async loadAccountSigners(): Promise<Map<string, WalletConnectSigner>> {
    /**
     * Session establishment happens out of band so after somehow
     * communicating the connection URI (often via QR code) we can
     * continue with the setup process
     */
    await waitForTruthy(() => !!this.client?.connected);

    const addressToSigner = new Map<string, WalletConnectSigner>();
    this.client?.session.accounts.forEach((address) => {
      const signer = new WalletConnectSigner(
        this.client as WalletConnect,
        this.client?.session,
        address
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
