import { ContractKit } from '@celo/contractkit';
import React from 'react';

import { NetworkNames, WalletTypes } from './constants';

/**
 * ID of a Celo chain.
 */
export enum ChainId {
  Alfajores = 44787,
  Baklava = 62320,
  Mainnet = 42220,
}

/**
 * Network connection information.
 */
export interface Network {
  name: NetworkNames;
  rpcUrl: string;
  graphQl: string;
  explorer: string;
  chainId: ChainId;
}

/**
 * Information about a provider to use for the dApp.
 */
export interface Provider {
  name: string;
  description: string;
  icon: string | React.FC<React.SVGProps<SVGSVGElement>>;
  canConnect: () => boolean;
  showInList: () => boolean;
  installURL?: string;
}

/**
 * Connects to the blockchain.
 */
export interface Connector {
  kit: ContractKit;
  type: WalletTypes;
  account: string | null;

  initialised: boolean;
  initialise: () => Promise<this> | this;
  close: () => Promise<void> | void;

  onNetworkChange?: (callback: (chainId: number) => void) => void;
}

/**
 * Dapp information.
 */
export interface Dapp {
  name: string;
  description: string;
  url: string;
  icon: string;
}
