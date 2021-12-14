import Web3 from 'web3';

import {
  AddEthereumEventListener,
  Ethereum,
  EthereumRequest,
} from '../../src/global';
import {
  getEthereum,
  getInjectedEthereum,
  isEthereumFromMetamask,
  isEthereumPresent,
} from '../../src/utils/ethereum';

const jestEthereumOn: AddEthereumEventListener = jest.fn();
const jestEthereumRequest: EthereumRequest = jest.fn();
const jestEthereum = jest.fn(() => ({
  on: jestEthereumOn,
  request: jestEthereumRequest,
  enable: () => Promise.resolve(),
  isMetaMask: true,
}))();

const setEthereum = (implementation?: Ethereum) => {
  // eslint-disable-next-line
  // @ts-ignore
  global.window = {
    ethereum: implementation,
  };
};

beforeEach(() => {
  setEthereum(jestEthereum as Ethereum);
});

describe('getEthereum', () => {
  it('reads the window object', () => {
    expect(getEthereum()).toEqual(jestEthereum);
  });
  it("indicates if it doesn't exist", () => {
    setEthereum();
    expect(getEthereum()).toEqual(undefined);
  });
});

describe('isEthereumPresent', () => {
  it('transform getEthereum into a bool', () => {
    expect(isEthereumPresent()).toEqual(true);
    setEthereum();
    expect(isEthereumPresent()).toEqual(false);
  });
});

describe('isEthereumFromMetamask', () => {
  it('indicates if ethereum was provider by metamask', () => {
    expect(isEthereumFromMetamask()).toEqual(true);
    setEthereum();
    expect(isEthereumFromMetamask()).toEqual(false);
  });
});

describe('getInjectedEthereum', () => {
  it('imports web3 and sends back a nice object', async () => {
    const injected = await getInjectedEthereum();
    expect(injected?.ethereum).toEqual(jestEthereum);
    expect(injected?.isMetaMask).toEqual(true);
    expect(injected?.web3).toBeInstanceOf(Web3);
  });
  it('returns null if ethereum isnt present', async () => {
    setEthereum();
    const injected = await getInjectedEthereum();
    expect(injected).toBeNull();
  });
});
