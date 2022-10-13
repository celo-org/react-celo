import { Ethereum } from '../global';
import { Maybe } from '../types';

const getEthereum = (): Ethereum | undefined =>
  typeof window !== 'undefined' ? window.ethereum : undefined;
const isEthereumPresent = (): boolean => Boolean(getEthereum());
const isEthereumFromMetamask = (): boolean =>
  Boolean(isEthereumPresent() && window.ethereum?.isMetaMask);

export interface InjectedEthereum {
  ethereum: Ethereum;
  isMetaMask: boolean;
}

const getInjectedEthereum = async (): Promise<Maybe<InjectedEthereum>> => {
  const ethereum = getEthereum();
  if (!ethereum) return null;

  return {
    ethereum,
    isMetaMask: Boolean(ethereum.isMetaMask),
  };
};

export {
  getEthereum,
  getInjectedEthereum,
  isEthereumFromMetamask,
  isEthereumPresent,
};
