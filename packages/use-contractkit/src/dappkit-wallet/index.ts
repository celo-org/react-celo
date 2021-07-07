import { CeloTx, EncodedTransaction, Signer } from '@celo/connect';
import { ContractKit } from '@celo/contractkit';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
import { RemoteWallet } from '@celo/wallet-remote';

import {
  requestAccountAddress,
  requestTxSig,
  waitForAccountAuth,
  waitForSignedTxs,
} from './dappkit';

export class DappKitSigner implements Signer {
  constructor(protected account: string) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async signTransaction(): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('signTransaction unimplemented; use signRawTransaction');
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async signTypedData(
    _: EIP712TypedData
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('signTypedData() not supported by DappKit wallet');
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async signPersonalMessage(
    _data: string
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('signPersonalMessage() not supported by DappKit wallet');
  }

  getNativeKey = (): string => this.account;

  // eslint-disable-next-line @typescript-eslint/require-await
  async decrypt(_ciphertext: Buffer): Promise<Buffer> {
    throw new Error('decrypt() not supported by DappKit wallet');
  }

  computeSharedSecret(_publicKey: string): Promise<Buffer> {
    throw new Error('computeSharedSecret() not supported by DappKit wallet');
  }
}

const randomString = () => (Math.random() * 100).toString().slice(0, 6);

export class DappKitWallet extends RemoteWallet<DappKitSigner> {
  private kit?: ContractKit;
  public account: string | null = null;

  constructor(protected dappName: string) {
    super();
  }

  async loadAccountSigners(): Promise<Map<string, DappKitSigner>> {
    const addressToSigner = new Map<string, DappKitSigner>();

    const requestId = `login-${randomString()}`;
    requestAccountAddress({
      requestId,
      dappName: this.dappName,
      callback: window.location.href,
    });

    const dappkitResponse = await waitForAccountAuth(requestId);
    addressToSigner.set(
      dappkitResponse.address,
      new DappKitSigner(dappkitResponse.address)
    );
    this.account = dappkitResponse.phoneNumber;
    return addressToSigner;
  }

  setKit(kit: ContractKit): void {
    this.kit = kit;
  }

  /**
   * Override hasAccount for the DappKit wallet as we
   * want to always send users to Valora
   */
  hasAccount = (): boolean => true;

  /**
   * Gets the signer based on the 'from' field in the tx body
   * @param txParams Transaction to sign
   * @dev overrides WalletBase.signTransaction
   */
  override async signTransaction(
    txParams: CeloTx
  ): Promise<EncodedTransaction> {
    if (!this.kit) {
      throw new Error('Must call setKit before using dappKit wallet');
    }

    const requestId = `signTransaction-${randomString()}`;
    await requestTxSig(this.kit, [txParams], {
      requestId,
      dappName: this.dappName,
      callback: window.location.href,
    });

    const dappkitResponse = await waitForSignedTxs(requestId);
    const raw = dappkitResponse.rawTxs[0];
    if (!raw) {
      throw new Error('Raw TX not present');
    }

    return { raw, tx: undefined as unknown as EncodedTransaction['tx'] };
  }
}
