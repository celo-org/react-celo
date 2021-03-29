import { ReactNode } from 'react';

export interface Network {
  name: string;
  rpcUrl: string;
  graphQl: string;
  explorer: string;
}

export enum SupportedProviders {
  WalletConnect = 'Wallet Connect',
  MetaMask = 'MetaMask',
  Ledger = 'Ledger',
  Valora = 'Valora',
  PrivateKey = 'Private key',
}

export interface Provider {
  name: SupportedProviders;
  description: string;
  image: string | ReactNode;
  disabled?: boolean;
}
