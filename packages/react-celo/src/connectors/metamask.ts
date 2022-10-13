import { WalletTypes } from '../constants';
import { Network } from '../types';
import InjectedConnector from './injected';

export default class MetaMaskConnector extends InjectedConnector {
  constructor(network: Network, manualNetworkingMode: boolean) {
    super(network, manualNetworkingMode, WalletTypes.MetaMask);
  }
}
