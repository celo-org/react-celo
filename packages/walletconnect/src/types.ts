import { SignClientTypes, SessionTypes } from '@walletconnect/types';
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

export type WCSession = SessionTypes.Struct;
