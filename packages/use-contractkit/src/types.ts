import { ContractKit } from '@celo/contractkit';
import React, { ReactNode } from 'react';
import { NetworkNames, SupportedProviders, WalletTypes } from './constants';

/**
 * ID of a Celo chain.
 */
export enum ChainId {
  Alfajores = 44787,
  Baklava = 62320,
  Mainnet = 42220,
}

export interface Network {
  name: NetworkNames;
  rpcUrl: string;
  graphQl: string;
  explorer: string;
  chainId: ChainId;
}

export interface Provider {
  name: SupportedProviders;
  description: string;
  image: string | React.FC<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
}

export interface Connector {
  kit: ContractKit;
  type: WalletTypes;
  accountName: string | null;

  initialised: boolean;
  initialise: () => Promise<this> | this;
  close: () => Promise<void> | void;

  onNetworkChange?: (callback: (chainId: number) => void) => void;
}
