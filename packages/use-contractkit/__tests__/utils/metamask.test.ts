import { ContractKit, newKit } from '@celo/contractkit';
import { GoldTokenWrapper } from '@celo/contractkit/lib/wrappers/GoldTokenWrapper';

import { Alfajores } from '../../src';
import {
  AddEthereumEventListener,
  Ethereum,
  EthereumRequest,
  RemoveEthereumEventListener,
} from '../../src/global';
import {
  addNetworksToMetamask,
  addNetworkToMetamask,
  addTokensToMetamask,
  makeAddCeloTokensParams,
  makeNetworkParams,
  MetamaskRPCErrorCode,
  StableTokens,
  switchToCeloNetwork,
  tokenToParam,
} from '../../src/utils/metamask';

let kit: ContractKit;
let CELO: GoldTokenWrapper;
let tokens: StableTokens;

const jestEthereumOn = jest.fn();
const jestEthereumOff = jest.fn();
const jestEthereumRequest = jest.fn();
const jestEthereum = {
  on: jestEthereumOn as AddEthereumEventListener,
  removeListener: jestEthereumOff as RemoveEthereumEventListener,
  request: jestEthereumRequest as EthereumRequest,
  enable: () => Promise.resolve(),
  isMetaMask: true,
} as Ethereum;

let windowSpy: jest.SpyInstance;
const setEthereum = (implementation?: Ethereum) => {
  windowSpy.mockImplementation(() => ({ ethereum: implementation }));
};

beforeEach(() => {
  windowSpy = jest.spyOn(global, 'window', 'get');
  setEthereum(jestEthereum);
});
afterEach(() => {
  jestEthereumOn.mockReset();
  jestEthereumOff.mockReset();
  jestEthereumRequest.mockReset();
});

beforeAll(async () => {
  kit = newKit(Alfajores.rpcUrl);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ({ CELO, ...tokens } = await kit.celoTokens.getWrappers());
});
afterAll(() => {
  windowSpy.mockRestore();
});

describe('makeNetworkParams', () => {
  it('creates a valid metamask rpc parameter to add a network', async () => {
    const params = await makeNetworkParams(Alfajores, CELO);
    expect(params).toEqual({
      chainId: `0x${(44787).toString(16)}`,
      chainName: 'Alfajores Testnet',
      nativeCurrency: {
        name: 'A-CELO',
        symbol: 'CELO',
        decimals: 18,
      },
      rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
      blockExplorerUrls: ['https://alfajores-blockscout.celo-testnet.org'],
      iconUrls: ['https://celoreserve.org/assets/tokens/CELO.svg'],
    });
  });
});

describe('tokenToParam', () => {
  it('creates a valid metamask rpc parameterto add a network', async () => {
    const param = await tokenToParam(tokens.cEUR);
    expect(param).toEqual({
      type: 'ERC20',
      options: {
        address: tokens.cEUR.address,
        name: 'Celo Euro',
        symbol: 'cEUR',
        decimals: 18,
        image: 'https://celoreserve.org/assets/tokens/cEUR.svg',
      },
    });
  });
});

describe('makeAddCeloTokensParams', () => {
  it('transforms StableTokens in rpc params', async () => {
    const params = await makeAddCeloTokensParams(tokens);

    params.forEach((param) => {
      expect(param.type).toEqual('ERC20');
      expect(Object.keys(tokens)).toContain(param.options.symbol);
      expect(param.options.address).toEqual(
        tokens[param.options.symbol as keyof StableTokens].address
      );
    });
  });
});

describe('addTokensToMetamask', () => {
  it('successfully requests metamask to add StableTokens to the interface', async () => {
    jestEthereumRequest.mockImplementation(() => {
      return Promise.resolve(true);
    });
    const _params = await makeAddCeloTokensParams(tokens);
    const metamaskAdded = await addTokensToMetamask(jestEthereum, tokens);

    _params.forEach((param, i) => {
      expect(jestEthereumRequest.mock.calls[i]).toEqual([
        {
          method: 'wallet_watchAsset',
          params: param,
        },
      ]);
    });
    expect(metamaskAdded).toBe(true);
  });
});
describe('addNetworkToMetamask', () => {
  it('successfully requests metamask to add a celo network to the interface', async () => {
    await addNetworkToMetamask(jestEthereum, Alfajores);
    expect(jestEthereumRequest.mock.calls[0]).toEqual([
      {
        method: 'wallet_addEthereumChain',
        params: [await makeNetworkParams(Alfajores, CELO)],
      },
    ]);
  });
  it('handles known errors in a specific way', async () => {
    jestEthereumRequest.mockImplementation(() => {
      throw { code: MetamaskRPCErrorCode.AwaitingUserConfirmation };
    });

    await expect(addNetworkToMetamask(jestEthereum, Alfajores)).rejects.toThrow(
      `Please check your Metamask window to add Alfajores to Metamask`
    );
  });
  it('doesnt yet handle unknown errors', async () => {
    jestEthereumRequest.mockImplementation(() => {
      throw new Error('test-error');
    });

    await expect(addNetworkToMetamask(jestEthereum, Alfajores)).rejects.toThrow(
      'test-error'
    );
  });
});
describe('addNetworksToMetamask', () => {
  it('successfully requests metamask to add all celo networks to the interface', async () => {
    await addNetworksToMetamask(jestEthereum);
  });
});
describe('switchToCeloNetwork', () => {
  it('todo', async () => {
    jestEthereumRequest.mockImplementation((...args) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (args[0].method === 'eth_chainId') {
        // mock the web.eth.getChainId call
        return Promise.resolve(-1);
      }
    });

    await switchToCeloNetwork(kit, Alfajores, jestEthereum);
    expect(jestEthereumRequest.mock.calls[1]).toEqual([
      {
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: `0x${Alfajores.chainId.toString(16)}`,
          },
        ],
      },
    ]);
  });
  it('handles known errors in a specific way', async () => {
    let calls = 0;
    jestEthereumRequest.mockImplementation((...args) => {
      calls += 1;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (args[0].method === 'eth_chainId') {
        // mock the web.eth.getChainId call
        return Promise.resolve(-1);
      }
      if (calls === 3) throw { code: MetamaskRPCErrorCode.UnknownNetwork };
    });

    await expect(
      switchToCeloNetwork(kit, Alfajores, jestEthereum)
    ).resolves.toBe(undefined);
  });
  it('handles known errors in a specific way', async () => {
    jestEthereumRequest.mockImplementation((...args) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (args[0].method === 'eth_chainId') {
        // mock the web.eth.getChainId call
        return Promise.resolve(-1);
      }
      throw { code: MetamaskRPCErrorCode.AwaitingUserConfirmation };
    });

    await expect(
      switchToCeloNetwork(kit, Alfajores, jestEthereum)
    ).resolves.toBe(undefined);
  });
  it('doesnt yet handle unknown errors', async () => {
    jestEthereumRequest.mockImplementation((...args) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (args[0].method === 'eth_chainId') {
        // mock the web.eth.getChainId call
        return Promise.resolve(-1);
      }
      throw new Error('test-error');
    });

    await expect(
      switchToCeloNetwork(kit, Alfajores, jestEthereum)
    ).rejects.toThrow('test-error');
  });
});
