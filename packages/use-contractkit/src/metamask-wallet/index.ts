import { CeloTx, Signer } from '@celo/connect';
import { ContractKit } from '@celo/contractkit';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
import { RemoteWallet } from '@celo/wallet-remote';
import Web3 from 'web3';
import { fromRpcSig } from 'ethereumjs-util';
import { sign } from 'crypto';

export class MetamaskSigner implements Signer {
  constructor(protected address: string, protected web3: Web3) {}

  async signTransaction(): Promise<{ v: number; r: Buffer; s: Buffer }> {
    throw new Error('signTransaction unimplemented; use signRawTransaction');
  }

  // async signRawTransaction(tx: CeloTx) {
  //   console.log('a1');
  //   const a = await this.web3.eth.signTransaction(tx);
  //   console.log('a2', a);
  //   const signedTx = await new Promise((resolve, reject) => {
  //     this.web3.currentProvider!.sendAsync(
  //       {
  //         method: 'eth_signTransaction',
  //         params: [tx],
  //       },
  //       (err, result) => {
  //         if (err) reject(err);
  //         else if (result.error) reject(err);
  //         else resolve(result);
  //       }
  //     );
  //   });
  //   console.log('>>>', signedTx);

  //   return null;
  // }

  async signTypedData(
    typedData: EIP712TypedData
  ): Promise<{ v: number; r: Buffer; s: Buffer }> {
    console.log('>>>', typedData);
    const { result } = await new Promise((resolve, reject) => {
      this.web3.currentProvider!.sendAsync(
        {
          method: 'eth_signTypedData_v4',
          params: [this.address, JSON.stringify(typedData)],
          from: this.address,
        },
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
    const a = await this.web3.eth.personal.sign(data, this.address);
    return fromRpcSig(a) as { v: number; r: Buffer; s: Buffer };
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

  // /**
  //  * Gets the signer based on the 'from' field in the tx body
  //  * @param txParams Transaction to sign
  //  * @dev overrides WalletBase.signTransaction
  //  */
  // async signTransaction(txParams: CeloTx) {
  //   console.log('signing', txParams);
  //   const address = txParams.from!;
  //   const signer = this.getSigner(address as string);
  //   return signer.signRawTransaction(txParams);
  // }
}
