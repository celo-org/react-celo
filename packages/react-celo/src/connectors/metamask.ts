import { CeloTokenContract } from '@celo/contractkit/lib/base';

import { WalletTypes } from '../constants';
import { Network } from '../types';
import InjectedConnector from './injected';

export default class MetaMaskConnector extends InjectedConnector {
  constructor(network: Network, feeCurrency: CeloTokenContract) {
    super(network, feeCurrency, WalletTypes.MetaMask);
  }
}
