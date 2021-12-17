/// <reference path='../../../node_modules/@walletconnect/types-v1/index.d.ts' />

import {
  IClientMeta,
  ICreateSessionOptions,
  IJsonRpcRequest,
  IWalletConnectSDKOptions,
} from '@walletconnect/types';
import { TransactionConfig } from 'web3-core/types';

export enum SupportedMethods {
  accounts = 'eth_accounts',
  signTransaction = 'eth_signTransaction',
  personalSign = 'personal_sign',
  signTypedData = 'eth_signTypedData',
  decrypt = 'personal_decrypt',
  computeSharedSecret = 'personal_computeSharedSecret',
}

// Note: Pulled events from https://docs.walletconnect.com/1.0/client-api#register-event-subscription
export enum CLIENT_EVENTS {
  connect = 'connect',
  disconnect = 'disconnect',
  session_request = 'session_request',
  session_update = 'session_update',
  call_request = 'call_request',
  wc_sessionRequest = 'wc_sessionRequest',
  wc_sessionUpdate = 'wc_sessionUpdate',
}

export interface WalletConnectWalletOptions {
  init?: IWalletConnectSDKOptions;
  connect?: ICreateSessionOptions;
}

export interface Request<T extends unknown[], V extends string = string>
  extends IJsonRpcRequest {
  params: T;
  method: V;
}

export interface WCSession {
  connected: boolean;
  accounts: string[];
  chainId: number;
  bridge: string;
  key: string;
  clientId: string;
  clientMeta: IClientMeta | null;
  peerId: string;
  peerMeta: IClientMeta | null;
  handshakeId: number;
  handshakeTopic: string;
}

export type SessionProposal = Request<
  [
    {
      chainId: number;
      peerId: string;
      peerMeta: {
        description: string;
        icons: string[];
        name: string;
        url: string;
      };
    }
  ]
>;
export type AccountsProposal = Request<unknown[], SupportedMethods.accounts>;

export type SignTransactionProposal = Request<
  [/*tx*/ TransactionConfig, /*address*/ string],
  SupportedMethods.signTransaction
>;

export type PersonalSignProposal = Request<
  [/*data*/ string, /*address*/ string],
  SupportedMethods.personalSign
>;

export type SignTypedSignProposal = Request<
  [/*address*/ string, /*json string of EIP712TypedData*/ string],
  SupportedMethods.signTypedData
>;

export type DecryptProposal = Request<
  [/*address*/ string, /*encrypted*/ string],
  SupportedMethods.decrypt
>;

export type ComputeSharedSecretProposal = Request<
  [/*address*/ string, /*publicKey*/ string],
  SupportedMethods.computeSharedSecret
>;

export type EthProposal =
  | AccountsProposal
  | SignTransactionProposal
  | PersonalSignProposal
  | SignTypedSignProposal
  | DecryptProposal
  | ComputeSharedSecretProposal;
