import { Ethereum } from '../global';

const getEthereum = (): Ethereum | undefined => window.ethereum;
const isEthereumPresent = (): boolean => Boolean(getEthereum());
const isEthereumFromMetamask = (): boolean =>
  Boolean(isEthereumPresent() && window.ethereum?.isMetaMask);

export { getEthereum, isEthereumFromMetamask, isEthereumPresent };
