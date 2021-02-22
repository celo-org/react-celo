import { CeloTx, Signer } from '@celo/connect';
import { ContractKit } from '@celo/contractkit';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
import { RemoteWallet } from '@celo/wallet-remote';

if (window) {
  // @ts-ignore
  console.log(window.ethereum);
}

export class MetamaskSigner implements Signer {
  constructor(protected account: string) {}

  init = (privateKey: string, passphrase: string) => {};

  async signTransaction(): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('signTransaction unimplemented; use signRawTransaction');
  }

  async signTypedData(
    typedData: EIP712TypedData
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    return {
      v: 0,
      r: Buffer.from([]),
      s: Buffer.from([]),
    };
  }

  async signPersonalMessage(
    data: string
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    return {
      v: 0,
      r: Buffer.from([]),
      s: Buffer.from([]),
    };
  }

  getNativeKey = () => this.account;

  async decrypt(ciphertext: Buffer) {
    return Buffer.from([]);
  }

  computeSharedSecret(_publicKey: string) {
    throw new Error('Not implemented');
    return Promise.resolve(Buffer.from([]));
  }
}

export enum MetamaskWalletErrors {
  FetchAccounts = 'MetamaskWallet: failed to fetch accounts from server',
  AccountAlreadyExists = 'MetamaskWallet: account already exists',
}

export class MetamaskWallet extends RemoteWallet<MetamaskSigner> {
  private kit?: ContractKit;

  constructor(protected dappName: string) {
    super();
  }

  async loadAccountSigners(): Promise<Map<string, MetamaskSigner>> {
    const addressToSigner = new Map<string, MetamaskSigner>();

    addressToSigner.set('dappkitResponse.address', new MetamaskSigner(''));
    return addressToSigner;
  }

  setKit(kit: ContractKit) {
    this.kit = kit;
  }

  /**
   * Gets the signer based on the 'from' field in the tx body
   * @param txParams Transaction to sign
   * @dev overrides WalletBase.signTransaction
   */
  // @ts-ignore
  async signTransaction(txParams: CeloTx) {
    const requestId = `signTransaction-${Math.random()}`;
    console.trace('signTransaction', txParams);

    return {} as CeloTx;
  }
}
