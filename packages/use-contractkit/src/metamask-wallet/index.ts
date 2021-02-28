import { Signer } from '@celo/connect';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
import { RemoteWallet } from '@celo/wallet-remote';
import { fromRpcSig } from 'ethereumjs-util';
import Web3 from 'web3';

export class MetamaskSigner implements Signer {
  constructor(protected address: string, protected web3: Web3) {}

  async signTransaction(): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('signTransaction unimplemented; use signRawTransaction');
  }

  async signTypedData(
    typedData: EIP712TypedData
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    const { result } = await new Promise((resolve, reject) => {
      // @ts-ignore
      this.web3.currentProvider!.sendAsync(
        {
          method: 'eth_signTypedData_v4',
          params: [this.address, JSON.stringify(typedData)],
          from: this.address,
        },
        // @ts-ignore
        (err, result) => {
          if (err) reject(err);
          else if (result.error) reject(err);
          else resolve(result);
        }
      );
    });

    return fromRpcSig(result) as { v: number; r: Buffer; s: Buffer };
  }

  async signPersonalMessage(
    data: string
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    // @ts-ignore
    const result = await this.web3.eth.personal.sign(data, this.address);
    return fromRpcSig(result) as { v: number; r: Buffer; s: Buffer };
  }

  getNativeKey = () => this.address;

  async decrypt(ciphertext: Buffer) {
    throw new Error('decrypt() not supported by Metamask wallet');
    return Buffer.from([]);
  }

  computeSharedSecret(_publicKey: string) {
    throw new Error('computeSharedSecret() not supported by Metamask wallet');
    return Promise.resolve(Buffer.from([]));
  }
}

export class MetamaskWallet extends RemoteWallet<MetamaskSigner> {
  constructor(protected web3: Web3) {
    super();
  }

  async loadAccountSigners(): Promise<Map<string, MetamaskSigner>> {
    const addressToSigner = new Map<string, MetamaskSigner>();

    const addresses = await this.web3.eth.getAccounts();
    addresses.forEach((address) => {
      addressToSigner.set(address, new MetamaskSigner(address, this.web3));
    });
    return addressToSigner;
  }
}
