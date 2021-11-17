import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
import {
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

export interface Request extends IJsonRpcRequest {
  params: unknown[];
}
export interface SessionProposal extends IJsonRpcRequest {
  params: [
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
  ];
}
export interface AccountsProposal extends IJsonRpcRequest {
  method: SupportedMethods.accounts;
  params: unknown[];
}

export interface SignTransactionProposal extends IJsonRpcRequest {
  method: SupportedMethods.signTransaction;
  params: [/*tx*/ TransactionConfig, /*address*/ string];
}

export interface PersonalSignProposal extends IJsonRpcRequest {
  method: SupportedMethods.personalSign;
  params: [/*data*/ string, /*address*/ string];
}

export interface SignTypedSignProposal extends IJsonRpcRequest {
  method: SupportedMethods.signTypedData;
  params: [/*address*/ string, /*data*/ EIP712TypedData];
}

export interface DecryptProposal extends IJsonRpcRequest {
  method: SupportedMethods.decrypt;
  params: [/*address*/ string, /*encrypted*/ Buffer];
}

export interface ComputeSharedSecretProposal extends IJsonRpcRequest {
  method: SupportedMethods.computeSharedSecret;
  params: [/*address*/ string, /*publicKey*/ string];
}
