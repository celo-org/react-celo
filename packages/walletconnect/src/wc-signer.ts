import { CeloTx, EncodedTransaction, Signer } from '@celo/connect';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
import Client from '@walletconnect/sign-client';
import { SessionTypes } from '@walletconnect/types';
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
    protected client: Client,
    protected session: SessionTypes.Struct,
    protected account: string,
    protected readonly chainId: string
  ) {}

  signTransaction(): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('signTransaction unimplemented; use signRawTransaction');
  }

  private request<T>(method: SupportedMethods, params: unknown) {
    return this.client.request<T>({
      topic: this.session.topic,
      chainId: `eip155:${this.chainId}`,
      request: {
        method,
        params,
      },
    });
  }

  // is this misnamed its not raw ? https://docs.walletconnect.com/2.0/advanced/rpc-reference/ethereum-rpc#eth_sendrawtransaction
  async signRawTransaction(tx: CeloTx): Promise<EncodedTransaction> {
    const result = await this.request<EncodedTransaction | string>(
      SupportedMethods.signTransaction,
      [tx]
    );

    // Note: this change was added because wallets can either return an
    // EncodedTransaction object or just the raw signed tx.
    // Both should work.
    if (typeof result === 'string') {
      return { raw: result } as EncodedTransaction;
    }
    return result;
  }

  async signTypedData(
    data: EIP712TypedData
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    const result = await this.request<string>(SupportedMethods.signTypedData, [
      this.account,
      JSON.stringify(data),
    ]);
    return ethUtil.fromRpcSig(result) as {
      v: number;
      r: Buffer;
      s: Buffer;
    };
  }

  async signPersonalMessage(
    data: string
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    const result = await this.request<string>(SupportedMethods.personalSign, [
      data,
      this.account,
    ]);
    return ethUtil.fromRpcSig(result) as { v: number; r: Buffer; s: Buffer };
  }

  getNativeKey = () => this.account;

  async decrypt(data: Buffer) {
    const result = await this.request<string>(SupportedMethods.decrypt, [
      this.account,
      data,
    ]);
    return Buffer.from(result, 'hex');
  }

  async computeSharedSecret(publicKey: string) {
    const result = await this.request<string>(
      SupportedMethods.computeSharedSecret,
      [this.account, publicKey]
    );
    return Buffer.from(result, 'hex');
  }
}
