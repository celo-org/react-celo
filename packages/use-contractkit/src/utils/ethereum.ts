import type Web3 from 'web3';

import { Ethereum } from '../global';

const getEthereum = (): Ethereum | undefined => window.ethereum;
const isEthereumPresent = (): boolean => Boolean(getEthereum());
const isEthereumFromMetamask = (): boolean =>
  Boolean(isEthereumPresent() && window.ethereum?.isMetaMask);

export interface InjectedEthereum {
  ethereum: Ethereum;
  web3: Web3;
  isMetaMask: boolean;
}

const getInjectedEthereum = async (): Promise<InjectedEthereum | null> => {
  const { default: Web3 } = await import('web3');

  const ethereum = getEthereum();
  if (!ethereum) return null;

  return {
    ethereum,
    web3: new Web3(ethereum),
    isMetaMask: Boolean(ethereum.isMetaMask),
  };
};

export {
  getEthereum,
  getInjectedEthereum,
  isEthereumFromMetamask,
  isEthereumPresent,
};
