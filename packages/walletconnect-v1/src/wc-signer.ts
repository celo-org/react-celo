import { CeloTx, EncodedTransaction, Signer } from '@celo/connect';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
import WalletConnect from '@walletconnect/client-v1';
import * as ethUtil from 'ethereumjs-util';

import { SupportedMethods, WCSession } from './types';

/**
 * Implements the signer interface on top of the WalletConnect interface.
 */
export class WalletConnectSigner implements Signer {
  /**
   * Construct a new instance of a WalletConnectSigner
   */
  constructor(
    protected client: WalletConnect,
    protected session: WCSession | undefined,
    protected account: string
  ) {}

  signTransaction(): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('signTransaction unimplemented; use signRawTransaction');
  }

  private request<T>(method: SupportedMethods, params: unknown[]): Promise<T> {
    return this.client.sendCustomRequest({
      method,
      params,
      jsonrpc: '2.0',
    }) as Promise<T>;
  }

  async signRawTransaction(tx: CeloTx): Promise<EncodedTransaction> {
    const signedTx = await this.request<EncodedTransaction>(
      SupportedMethods.signTransaction,
      [tx, this.getNativeKey()]
    );
    return signedTx;
  }

  async signTypedData(
    data: EIP712TypedData
  ): Promise<ReturnType<typeof ethUtil.fromRpcSig>> {
    const signature = await this.request<string>(
      SupportedMethods.signTypedData,
      [this.getNativeKey(), JSON.stringify(data)]
    );
    return ethUtil.fromRpcSig(signature);
  }

  async signPersonalMessage(
    data: string
  ): Promise<ReturnType<typeof ethUtil.fromRpcSig>> {
    const signature = await this.request<string>(
      SupportedMethods.personalSign,
      [data, this.getNativeKey()]
    );
    return ethUtil.fromRpcSig(signature);
  }

  getNativeKey = (): string => this.account;

  async decrypt(data: Buffer): Promise<Buffer> {
    const result = await this.request<string>(SupportedMethods.decrypt, [
      this.getNativeKey(),
      data.toString('hex'),
    ]);
    return Buffer.from(result, 'hex');
  }

  async computeSharedSecret(publicKey: string): Promise<Buffer> {
    const result = await this.request<string>(
      SupportedMethods.computeSharedSecret,
      [this.getNativeKey(), publicKey]
    );
    return Buffer.from(result, 'hex');
  }
}
