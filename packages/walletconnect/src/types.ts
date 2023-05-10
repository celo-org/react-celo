import { SessionTypes, SignClientTypes } from '@walletconnect/types';

export enum SupportedMethods {
  accounts = 'eth_accounts',
  signTransaction = 'eth_signTransaction',
  personalSign = 'personal_sign',
  signTypedData = 'eth_signTypedData',
  decrypt = 'personal_decrypt',
  computeSharedSecret = 'personal_computeSharedSecret',
  wc_pairingDelete = 'wc_pairingDelete',
}

export interface WalletConnectWalletOptions {
  init?: SignClientTypes.Options;
  projectId?: string;
  chainId: number;
}

export type WCSession = SessionTypes.Struct;
