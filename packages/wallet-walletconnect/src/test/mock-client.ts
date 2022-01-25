/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { CLIENT_EVENTS } from '@walletconnect/client';
import { ErrorResponse } from '@walletconnect/jsonrpc-types/dist/cjs';
import { SessionTypes } from '@walletconnect/types/dist/cjs';
import { EventEmitter } from 'events';

import { SupportedMethods } from '../types';
import {
  parseComputeSharedSecret,
  parseDecrypt,
  parsePersonalSign,
  parseSignTransaction,
  parseSignTypedData,
  testAddress,
  testWallet,
} from './common';

const pairingTopic = 'XXX';

export class MockWalletConnectClient extends EventEmitter {
  init(): void {
    // noop
  }

  pairing = {
    delete: ({ topic, reason }: { topic: string; reason: ErrorResponse }) => {
      // noop
    },
  };

  connect() {
    this.emit(CLIENT_EVENTS.pairing.proposal, {
      signal: {
        params: {
          uri: 'mockURI',
        },
      },
    });
    this.emit(CLIENT_EVENTS.pairing.created, {
      topic: pairingTopic,
      peer: {
        metadata: {},
        delete: () => {
          // noop
        },
      },
    });
    this.emit(CLIENT_EVENTS.session.created, {
      topic: pairingTopic,
      state: {
        accounts: [`${testAddress}@celo:44787`],
      },
    });
  }

  async request(event: SessionTypes.RequestEvent) {
    const { request } = event;
    const { method } = request;

    // the request gets transformed between the client
    // and wallet, here we reassign to use our decoding
    //  methods in ./common.ts.
    let result = null;
    if (method === SupportedMethods.personalSign) {
      const { payload, from } = parsePersonalSign(
        request.params as [string, string]
      );
      result = await testWallet.signPersonalMessage(from, payload);
    } else if (method === SupportedMethods.signTypedData) {
      const { from, payload } = parseSignTypedData(
        request.params as [string, string]
      );
      result = await testWallet.signTypedData(from, payload);
    } else if (method === SupportedMethods.signTransaction) {
      const tx = parseSignTransaction(request.params);
      result = await testWallet.signTransaction(tx);
    } else if (method === SupportedMethods.computeSharedSecret) {
      const { from, publicKey } = parseComputeSharedSecret(request.params);
      result = (await testWallet.computeSharedSecret(from, publicKey)).toString(
        'hex'
      );
    } else if (method === SupportedMethods.decrypt) {
      const { from, payload } = parseDecrypt(request.params);
      result = (await testWallet.decrypt(from, payload)).toString('hex');
    } else {
      return;
    }

    return result;
  }

  disconnect() {
    // noop
  }
}
