import { EncodedTransaction } from '@celo/connect/lib/types';
import { EventEmitter } from 'events';

import {
  AccountsProposal,
  ComputeSharedSecretProposal,
  DecryptProposal,
  PersonalSignProposal,
  SignTransactionProposal,
  SignTypedSignProposal,
} from '../src';
import { CLIENT_EVENTS, SupportedMethods } from '../src/types';
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init(): void {}

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
    } as AccountsProposal | SignTransactionProposal | PersonalSignProposal | SignTypedSignProposal | DecryptProposal | ComputeSharedSecretProposal);
  }

  async request(
    event:
      | AccountsProposal
      | SignTransactionProposal
      | PersonalSignProposal
      | SignTypedSignProposal
      | DecryptProposal
      | ComputeSharedSecretProposal
  ): Promise<string[] | string | EncodedTransaction> {
    const { method, params } = event;

    let payload, from, publicKey;
    switch (method) {
      case SupportedMethods.accounts:
        return testWallet.getAccounts();
      case SupportedMethods.personalSign:
        ({ from, payload } = parsePersonalSign(params));
        return testWallet.signPersonalMessage(from, payload);

      case SupportedMethods.signTypedData:
        ({ from, payload } = parseSignTypedData(params));
        return testWallet.signTypedData(from, payload);

      case SupportedMethods.signTransaction:
        return testWallet.signTransaction(parseSignTransaction(params));

      case SupportedMethods.decrypt:
        ({ from, payload } = parseDecrypt(params));
        return (await testWallet.decrypt(from, payload)).toString('hex');

      case SupportedMethods.computeSharedSecret:
        ({ from, publicKey } = parseComputeSharedSecret(params));
        return (await testWallet.computeSharedSecret(from, publicKey)).toString(
          'hex'
        );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect(): void {}
}
