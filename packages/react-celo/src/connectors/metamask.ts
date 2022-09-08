import { CeloTokenContract } from '@celo/contractkit/lib/base';

import { WalletTypes } from '../constants';
import { Network } from '../types';
import InjectedConnector from './injected';

export default class MetaMaskConnector extends InjectedConnector {
  constructor(
    network: Network,
    manualNetworkingMode: boolean,
    feeCurrency: CeloTokenContract
  ) {
    super(network, manualNetworkingMode, feeCurrency, WalletTypes.MetaMask);
  }
}
