import { CeloTx, EncodedTransaction, Signer } from '@celo/connect';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
import WalletConnect from '@walletconnect/client';
import { SessionTypes } from '@walletconnect/types/dist/cjs';
import * as ethUtil from 'ethereumjs-util';

import { SupportedMethods } from './types';

/**
 * Implements the signer interface on top of the WalletConnect interface.
 */
export class WalletConnectSigner implements Signer {
  /**
   * Construct a new instance of a WalletConnectSigner
   */
  constructor(
    protected client: WalletConnect,
    protected session: SessionTypes.Settled,
    protected account: string,
    protected chainId: string
  ) {}

  signTransaction(): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('signTransaction unimplemented; use signRawTransaction');
  }

  private request<T>(method: SupportedMethods, params: T) {
    return this.client.request({
      topic: this.session.topic,
      chainId: `eip155:${this.chainId}`,
      request: {
        method,
        params,
      },
    });
  }

  signRawTransaction(tx: CeloTx): Promise<EncodedTransaction> {
    return this.request<CeloTx>(
      SupportedMethods.signTransaction,
      tx
    ) as Promise<EncodedTransaction>;
  }

  async signTypedData(
    data: EIP712TypedData
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    const result = (await this.request<[string, string]>(
      SupportedMethods.signTypedData,
      [this.account, JSON.stringify(data)]
    )) as string;
    return ethUtil.fromRpcSig(result) as {
      v: number;
      r: Buffer;
      s: Buffer;
    };
  }

  async signPersonalMessage(
    data: string
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    const result = (await this.request(SupportedMethods.personalSign, [
      data,
      this.account,
    ])) as string;

    return ethUtil.fromRpcSig(result) as { v: number; r: Buffer; s: Buffer };
  }

  getNativeKey = () => this.account;

  async decrypt(data: Buffer) {
    const result = (await this.request<[string, Buffer]>(
      SupportedMethods.decrypt,
      [this.account, data]
    )) as string;
    return Buffer.from(result, 'hex');
  }

  async computeSharedSecret(publicKey: string) {
    const result = (await this.request<[string, string]>(
      SupportedMethods.computeSharedSecret,
      [this.account, publicKey]
    )) as string;
    return Buffer.from(result, 'hex');
  }
}
