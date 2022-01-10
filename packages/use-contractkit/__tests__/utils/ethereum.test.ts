import Web3 from 'web3';

import {
  AddEthereumEventListener,
  Ethereum,
  EthereumRequest,
  RemoveEthereumEventListener,
} from '../../src/global';
import {
  getEthereum,
  getInjectedEthereum,
  isEthereumFromMetamask,
  isEthereumPresent,
} from '../../src/utils/ethereum';

const jestEthereumOn: AddEthereumEventListener = jest.fn();
const jestEthereumOff: RemoveEthereumEventListener = jest.fn();
const jestEthereumRequest: EthereumRequest = jest.fn();
const jestEthereum = jest.fn(() => ({
  on: jestEthereumOn,
  removeListener: jestEthereumOff,
  request: jestEthereumRequest,
  enable: () => Promise.resolve(),
  isMetaMask: true,
}))();

let windowSpy: jest.SpyInstance;
const setEthereum = (implementation?: Ethereum) => {
  windowSpy.mockImplementation(() => ({ ethereum: implementation }));
};

beforeEach(() => {
  windowSpy = jest.spyOn(global, 'window', 'get');
  setEthereum(jestEthereum as Ethereum);
});
afterAll(() => {
  windowSpy.mockRestore();
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
