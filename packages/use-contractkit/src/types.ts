import { ReactNode } from 'react';

export enum Networks {
  Alfajores = 'Alfajores',
  Baklava = 'Baklava',
  Mainnet = 'Mainnet',
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
