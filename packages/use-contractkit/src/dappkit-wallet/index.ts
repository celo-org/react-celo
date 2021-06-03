import { CeloTx, Signer } from '@celo/connect';
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

  async signTransaction(): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('signTransaction unimplemented; use signRawTransaction');
  }

  async signTypedData(
    typedData: EIP712TypedData
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('signTypedData() not supported by DappKit wallet');
    return {
      v: 0,
      r: Buffer.from([]),
      s: Buffer.from([]),
    };
  }

  async signPersonalMessage(
    data: string
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('signPersonalMessage() not supported by DappKit wallet');
    return {
      v: 0,
      r: Buffer.from([]),
      s: Buffer.from([]),
    };
  }

  getNativeKey = () => this.account;

  async decrypt(ciphertext: Buffer) {
    throw new Error('decrypt() not supported by DappKit wallet');
    return Buffer.from([]);
  }

  computeSharedSecret(_publicKey: string) {
    throw new Error('computeSharedSecret() not supported by DappKit wallet');
    return Promise.resolve(Buffer.from([]));
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

  setKit(kit: ContractKit) {
    this.kit = kit;
  }

  /**
   * Override hasAccount for the DappKit wallet as we
   * want to always send users to Valora
   */
  hasAccount = () => true;

  /**
   * Gets the signer based on the 'from' field in the tx body
   * @param txParams Transaction to sign
   * @dev overrides WalletBase.signTransaction
   */
  // @ts-ignore
  async signTransaction(txParams: CeloTx) {
    if (!this.kit) {
      throw new Error('Must call setKit before using dappKit wallet');
    }

    const requestId = `signTransaction-${randomString()}`;
    // @ts-ignore
    requestTxSig(this.kit, [txParams], {
      requestId,
      dappName: this.dappName,
      callback: window.location.href,
    });

    const dappkitResponse = await waitForSignedTxs(requestId);
    const raw = dappkitResponse.rawTxs[0];

    return { raw };
  }
}
