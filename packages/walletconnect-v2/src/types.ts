import { SignClientTypes } from '@walletconnect/types';
export enum SupportedMethods {
  accounts = 'eth_accounts',
  signTransaction = 'eth_signTransaction',
  personalSign = 'personal_sign',
  signTypedData = 'eth_signTypedData',
  decrypt = 'personal_decrypt',
  computeSharedSecret = 'personal_computeSharedSecret',
}

export interface WalletConnectWalletOptions {
  init?: SignClientTypes.Options;
}

// export interface Request<T extends unknown[], V extends string = string> {
//   params: T;
//   method: V;
// }
// export type AccountsProposal = Request<unknown[], SupportedMethods.accounts>;

// export type SignTransactionProposal = Request<
//   [/*tx*/ TransactionConfig, /*address*/ string],
//   SupportedMethods.signTransaction
// >;

// export type PersonalSignProposal = Request<
//   [/*data*/ string, /*address*/ string],
//   SupportedMethods.personalSign
// >;

// export type SignTypedSignProposal = Request<
//   [/*address*/ string, /*json string of EIP712TypedData*/ string],
//   SupportedMethods.signTypedData
// >;

// export type DecryptProposal = Request<
//   [/*address*/ string, /*encrypted*/ string],
//   SupportedMethods.decrypt
// >;

// export type ComputeSharedSecretProposal = Request<
//   [/*address*/ string, /*publicKey*/ string],
//   SupportedMethods.computeSharedSecret
// >;

// export type EthProposal =
//   | AccountsProposal
//   | SignTransactionProposal
//   | PersonalSignProposal
//   | SignTypedSignProposal
//   | DecryptProposal
//   | ComputeSharedSecretProposal;
