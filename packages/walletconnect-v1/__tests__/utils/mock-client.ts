import { EncodedTransaction } from '@celo/connect/lib/types';
import { EventEmitter } from 'events';

import { CLIENT_EVENTS, EthProposal, SupportedMethods } from '../../src/types';
import {
  parseComputeSharedSecret,
  parseDecrypt,
  parsePersonalSign,
  parseSignTransaction,
  parseSignTypedData,
  testAddress,
  testWallet,
} from './common';

export class MockWalletConnectClient extends EventEmitter {
  connected = false;
  session: {
    accounts: string[];
  } | null = null;

  init(): void {
    // noop
  }

  connect(): void {
    this.emit(CLIENT_EVENTS.session_request, {
      signal: {
        params: {
          uri: 'mockURI',
        },
      },
    });
    this.emit(CLIENT_EVENTS.connect, {});
  }

  createSession(): void {
    this.connected = true;
    this.session = {
      accounts: [testAddress],
    };
  }

  killSession(): void {
    this.connected = false;
    this.session = null;
  }

  async sendCustomRequest({
    method,
    params,
  }: {
    method: SupportedMethods;
    params: unknown[];
    jsonrpc: string;
  }): Promise<string[] | string | EncodedTransaction> {
    return this.request({
      method,
      params,
      jsonrpc: '2.0',
    } as EthProposal);
  }

  async request(
    event: EthProposal
  ): Promise<string[] | string | EncodedTransaction> {
    let payload, from, publicKey;

    switch (event.method) {
      case SupportedMethods.accounts:
        return testWallet.getAccounts();

      case SupportedMethods.personalSign:
        ({ from, payload } = parsePersonalSign(event.params));
        return testWallet.signPersonalMessage(from, payload);

      case SupportedMethods.signTypedData:
        ({ from, payload } = parseSignTypedData(event.params));
        return testWallet.signTypedData(from, payload);

      case SupportedMethods.signTransaction:
        return testWallet.signTransaction(parseSignTransaction(event.params));

      case SupportedMethods.decrypt:
        ({ from, payload } = parseDecrypt(event.params));
        return (await testWallet.decrypt(from, payload)).toString('hex');

      case SupportedMethods.computeSharedSecret:
        ({ from, publicKey } = parseComputeSharedSecret(event.params));
        return (await testWallet.computeSharedSecret(from, publicKey)).toString(
          'hex'
        );
    }
  }

  disconnect(): void {
    // noop
  }
}
