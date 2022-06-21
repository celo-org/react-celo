import { CeloTokenContract } from '@celo/contractkit/lib/base';
import { ReactNode } from 'react';
import { ContractCacheBuilder } from './hooks/use-contracts-cache';
import { ActionModalProps, ConnectModalProps } from './modals';
import { Dapp, Network, Theme } from './types';

export interface CeloProviderProps {
  children: ReactNode;
  dapp: Dapp;
  /**
   * `network` has been deprecated and replaced with defaultNetwork
   *  since passing a full object could lead to bugs
   */
  network?: Network;
  defaultNetwork?: string; // must match the name of a network in networks Array
  networks?: Network[];
  theme?: Theme;
  feeCurrency?: CeloTokenContract;
  buildContractsCache?: ContractCacheBuilder;
  connectModal?: ConnectModalProps;
  actionModal?: {
    reactModalProps?: Partial<ReactModal.Props>;
    render?: (props: ActionModalProps) => ReactNode;
  };
}

export default CeloProviderProps;
