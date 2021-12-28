/// <reference path='../../../../node_modules/@walletconnect/types-v1/index.d.ts' />

import { newKit } from '@celo/contractkit';
import { toChecksumAddress } from '@celo/utils/lib/address';
import WalletConnect from '@walletconnect/client-v1';
import { IInternalEvent } from '@walletconnect/types';
import debugConfig from 'debug';

import {
  CLIENT_EVENTS,
  EthProposal,
  Request,
  SessionProposal,
  SupportedMethods,
} from '../../src/types';
import {
  parseComputeSharedSecret,
  parseDecrypt,
  parsePersonalSign,
  parseSignTransaction,
  parseSignTypedData,
} from './common';

const debug = debugConfig('in-memory-wallet');

const privateKey =
  '04f9d516be49bb44346ca040bdd2736d486bca868693c74d51d274ad92f61976';
const kit = newKit('https://alfajores-forno.celo-testnet.org');
kit.addAccount(privateKey);
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const wallet = kit.getWallet()!;
const [account] = wallet.getAccounts();

export const testPrivateKey = privateKey;
export const testAddress = toChecksumAddress(account);

export function getTestWallet(): {
  init: (uri: string) => void;
  close: (message?: string) => Promise<void>;
} {
  let client: WalletConnect;

  const onSessionCreated = (
    error: Error | null,
    session: IInternalEvent
  ): void => {
    debug('onSessionCreated', error, session);
    if (error) {
      throw error;
    }
  };
  const onSessionDeleted = (
    error: Error | null,
    session: IInternalEvent
  ): void => {
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
      console.log('DISCONNECT', params, error);
    }
  };
  const onSessionRequest = (
    error: Error | null,
    session: SessionProposal
  ): void => {
    debug('onSessionRequest', error, session);
    if (error) {
      throw error;
    }
    return client.approveSession({
      chainId: 44787, // Alfajores
      accounts: [account],
      networkId: 0,
      rpcUrl: 'https://alfajores-forno.celo-testnet.org',
    });
  };
  const onSessionUpdated = (
    error: Error | null,
    session: Request<unknown[]>
  ): void => {
    debug('onSessionUpdated', error, session);
    if (error) {
      throw error;
    }
  };
  const onWcSessionRequest = (
    error: Error | null,
    payload: Request<unknown[]>
  ): void => {
    debug('onWcSessionRequest', error, payload);
    if (error) {
      throw error;
    }
  };
  const onWcSessionUpdate = (
    error: Error | null,
    payload: Request<unknown[]>
  ): void => {
    debug('onWcSessionUpdate', error, payload);
    if (error) {
      throw error;
    }
  };

  async function onCallRequest(error: Error | null, event: EthProposal) {
    const { method, id } = event;

    let result;
    let payload, from, publicKey, tx;
    switch (method) {
      case SupportedMethods.accounts:
        result = wallet.getAccounts();
        break;
      case SupportedMethods.personalSign:
        ({ payload, from } = parsePersonalSign(event.params));
        result = await wallet.signPersonalMessage(from, payload);
        break;
      case SupportedMethods.signTypedData:
        ({ from, payload } = parseSignTypedData(event.params));
        result = await wallet.signTypedData(from, payload);
        break;
      case SupportedMethods.signTransaction:
        tx = parseSignTransaction(event.params);
        result = await wallet.signTransaction(tx);
        break;
      case SupportedMethods.computeSharedSecret:
        ({ from, publicKey } = parseComputeSharedSecret(event.params));
        result = (await wallet.computeSharedSecret(from, publicKey)).toString(
          'hex'
        );
        break;
      case SupportedMethods.decrypt:
        ({ from, payload } = parseDecrypt(event.params));
        result = (await wallet.decrypt(from, payload)).toString('hex');
        break;
      default:
        client.rejectRequest({
          id,
          error: { message: `Unhandled method ${method}` }, // eslint-disable-line @typescript-eslint/restrict-template-expressions
        });
        return;
    }

    client.approveRequest({
      id,
      result,
    });
  }

  return {
    init(uri: string) {
      client = new WalletConnect({
        uri,
        bridge: process.env.WALLET_CONNECT_BRIDGE,
      });

      client.on(CLIENT_EVENTS.connect, onSessionCreated);
      client.on(CLIENT_EVENTS.disconnect, onSessionDeleted);
      client.on(CLIENT_EVENTS.session_request, onSessionRequest);
      client.on(CLIENT_EVENTS.session_update, onSessionUpdated);
      client.on(CLIENT_EVENTS.call_request, onCallRequest); // eslint-disable-line @typescript-eslint/no-misused-promises
      client.on(CLIENT_EVENTS.wc_sessionRequest, onWcSessionRequest);
      client.on(CLIENT_EVENTS.wc_sessionUpdate, onWcSessionUpdate);
    },
    async close(message?: string) {
      if (!client) {
        throw new Error('Wallet must be initialized before calling close()');
      }
      await client.killSession({ message });
    },
  };
}
