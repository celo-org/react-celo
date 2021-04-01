import { ContractKit } from '@celo/contractkit';
import { ReactNode } from 'react';
import { SupportedProviders, WalletTypes } from './constants';

export interface Network {
  name: string;
  rpcUrl: string;
  graphQl: string;
  explorer: string;
  chainId: number;
}

export interface Provider {
  name: SupportedProviders;
  description: string;
  image: string | ReactNode;
  disabled?: boolean;
}

export interface Connector {
  kit: ContractKit;
  type: WalletTypes;

  initialised: boolean;
  initialise: () => Promise<this> | this;

  onNetworkChange?: (callback: (chainId: number) => void) => void;
}
