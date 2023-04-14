import { CeloTx, EncodedTransaction } from '@celo/connect';
import { newKit } from '@celo/contractkit/lib/mini-kit';
import { toChecksumAddress } from '@celo/utils/lib/address';
import WalletConnect from '@walletconnect/sign-client';
import { EngineTypes, SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
import debugConfig from 'debug';

import { SupportedMethods } from '../../src/types';
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
kit.connection.addAccount(privateKey);
const wallet = kit.getWallet()!;
const [account] = wallet.getAccounts();

export const testPrivateKey = privateKey;
export const testAddress = toChecksumAddress(account);

export function getTestWallet() {
  let client: WalletConnect;
  let sessionTopic: string;

  const onSessionProposal = async (
    proposal: SignClientTypes.EventArguments['session_proposal']
  ) => {
    const response: EngineTypes.ApproveParams = {
      id: Math.floor(Math.random() * 1_000_000),
      namespaces: {
        eip155: {
          methods: Object.values(SupportedMethods),
          events: ['chainChanged', 'accountsChanged'],
          accounts: [
            `eip155:44787:${account}`,
            `eip155:42220:${account}`,
            `eip155:62320:${account}`,
          ],
        },
      },
    };
    const { topic, acknowledged } = await client.approve({
      id: proposal.id,
      namespaces: response.namespaces,
    });
    sessionTopic = topic;
    await acknowledged();
  };
  const onSessionUpdated = (
    session: SignClientTypes.EventArguments['session_update']
  ) => {
    debug('onSessionUpdated', session);
  };
  const onSessionDeleted = (
    session: SignClientTypes.EventArguments['session_delete']
  ) => {
    debug('onSessionDeleted', session);
  };
  const onSessionExtended = (
    session: SignClientTypes.EventArguments['session_extend']
  ) => {
    debug('onSessionExtended', session);
  };
  const onSessionEvent = (
    event: SignClientTypes.EventArguments['session_event']
  ) => {
    debug('onSessionEvent', event);
  };
  const onSessionPing = (
    ping: SignClientTypes.EventArguments['session_ping']
  ) => {
    debug('onSessionPing', ping);
  };

  async function onSessionRequest(
    event: SignClientTypes.EventArguments['session_request']
  ) {
    const {
      id,
      topic,
      params: { request },
    } = event;
    const { method } = request;
    let result: string | EncodedTransaction;

    if (method === SupportedMethods.personalSign) {
      const { payload, from } = parsePersonalSign(
        request.params as [string, string]
      );
      result = await wallet.signPersonalMessage(from, payload);
    } else if (method === SupportedMethods.signTypedData) {
      const { from, payload } = parseSignTypedData(
        request.params as [string, string]
      );
      result = await wallet.signTypedData(from, payload);
    } else if (method === SupportedMethods.signTransaction) {
      const tx = parseSignTransaction(request.params as CeloTx);
      result = await wallet.signTransaction(tx);
    } else if (method === SupportedMethods.computeSharedSecret) {
      const { from, publicKey } = parseComputeSharedSecret(
        request.params as [string, string]
      );
      result = (await wallet.computeSharedSecret(from, publicKey)).toString(
        'hex'
      );
    } else if (method === SupportedMethods.decrypt) {
      const { from, payload } = parseDecrypt(
        request.params as [string, string]
      );
      result = (await wallet.decrypt(from, payload)).toString('hex');
    } else {
      // client.reject({})
      // in memory wallet should always approve actions
      debug('unknown method', method);
      return;
    }

    return client.respond({
      topic,
      response: {
        id,
        jsonrpc: '2.0',
        result,
      },
    });
  }

  return {
    init: async (uri: string) => {
      client = await WalletConnect.init({
        relayUrl: process.env.WALLET_CONNECT_BRIDGE,
        logger: 'error',
        projectId: '3ee9bf02f3a89a03837044fc7cdeb232',
      });

      client.on('session_proposal', onSessionProposal);
      client.on('session_update', onSessionUpdated);
      client.on('session_delete', onSessionDeleted);
      client.on('session_extend', onSessionExtended);
      client.on('session_request', onSessionRequest);
      client.on('session_event', onSessionEvent);
      client.on('session_ping', onSessionPing);

      await client.core.pairing.pair({ uri });
    },
    async close() {
      const reason = getSdkError('USER_DISCONNECTED');
      if (sessionTopic) {
        await client.disconnect({
          topic: sessionTopic,
          reason,
        });
        await client.session.delete(sessionTopic, reason);
      }
    },
  };
}
