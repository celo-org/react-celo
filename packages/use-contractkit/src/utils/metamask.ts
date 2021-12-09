import { ContractKit, newKit } from '@celo/contractkit';
import { GoldTokenWrapper } from '@celo/contractkit/lib/wrappers/GoldTokenWrapper';
import { StableTokenWrapper } from '@celo/contractkit/lib/wrappers/StableTokenWrapper';
import Web3 from 'web3';

import { Alfajores, Baklava, Mainnet } from '../constants';
import { Ethereum } from '../global';
import { ChainId, Network } from '../types';

const CELO_PARAMS = Object.freeze({
  chainName: 'Celo',
  testnet: false,
  nativeCurrency: {
    name: 'CELO',
  },
});

const ALFAJORES_PARAMS = Object.freeze({
  chainName: 'Alfajores Testnet',
  testnet: true,
  nativeCurrency: {
    name: 'A-CELO',
  },
});

const BAKLAVA_PARAMS = Object.freeze({
  chainName: 'Baklava Testnet',
  testnet: true,
  nativeCurrency: {
    name: 'B-CELO',
  },
});

const params: { [chain in ChainId]: typeof CELO_PARAMS } = {
  [ChainId.Mainnet]: CELO_PARAMS,
  [ChainId.Alfajores]: ALFAJORES_PARAMS,
  [ChainId.Baklava]: BAKLAVA_PARAMS,
};

interface ERC20Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  image?: string;
}

interface AddERC20TokenParameter {
  type: 'ERC20';
  options: ERC20Token;
}

interface CeloTokens {
  CELO: GoldTokenWrapper;
  cUSD: StableTokenWrapper;
  cEUR: StableTokenWrapper;
}
type StableTokens = Omit<CeloTokens, 'CELO'>;

interface AddEthereumChainParameter {
  chainId: string;
  chainName: string;
  nativeCurrency: Omit<ERC20Token, 'address'>;
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored by metamask
}

const NETWORKS = {
  [ChainId.Mainnet]: Mainnet,
  [ChainId.Alfajores]: Alfajores,
  [ChainId.Baklava]: Baklava,
};

enum MetamaskRPCErrorCode {
  AwaitingUserConfirmation = -32002,
  UnknownNetwork = 4902,
}

interface MetamaskRPCError {
  code: MetamaskRPCErrorCode;
  message: string;
  stack: string;
}

const makeNetworkParams = async (
  info: Network,
  CELO: GoldTokenWrapper
): Promise<AddEthereumChainParameter> => {
  const [symbol, decimals, name] = await Promise.all([
    CELO.symbol(),
    CELO.decimals(),
    CELO.name(),
  ]);

  return {
    chainId: `0x${info.chainId.toString(16)}`,
    chainName: params[info.chainId].chainName ?? info.name,
    nativeCurrency: {
      name: params[info.chainId].nativeCurrency.name,
      symbol,
      decimals,
    },
    rpcUrls: [info.rpcUrl],
    blockExplorerUrls: [info.explorer],
    iconUrls: [`https://celoreserve.org/assets/tokens/${symbol}.svg`], // unfortunately unused
  };
};

const tokenToParam = async (
  token: GoldTokenWrapper | StableTokenWrapper
): Promise<AddERC20TokenParameter> => {
  const [symbol, decimals, name] = await Promise.all([
    token.symbol(),
    token.decimals(),
    token.name(),
  ]);

  return {
    type: 'ERC20',
    options: {
      address: token.address,
      name,
      symbol,
      decimals,
      image: `https://celoreserve.org/assets/tokens/${symbol}.svg`,
    },
  };
};

const makeAddCeloTokensParams = async (
  tokens: StableTokens
): Promise<AddERC20TokenParameter[]> =>
  Promise.all(Object.values(tokens).map(tokenToParam));

const addTokensToMetamask = async (
  ethereum: Ethereum,
  tokens: StableTokens
) => {
  const tokenParams = await makeAddCeloTokensParams(tokens);
  const added = (
    await Promise.all(
      tokenParams.map((params) =>
        ethereum?.request({
          method: 'wallet_watchAsset',
          params,
        })
      )
    )
  ).every(Boolean);

  return added;
};

const addNetworkToMetamask = async (
  ethereum: Ethereum,
  networkConfig: Network
): Promise<void> => {
  const { CELO, ...tokens } = (await newKit(
    networkConfig.rpcUrl
  ).celoTokens.getWrappers()) as CeloTokens;

  if (!CELO) {
    throw new Error(
      `Couldnt fetch CELO information for ${networkConfig.name}. Something's wrong`
    );
  }

  try {
    await ethereum?.request({
      method: 'wallet_addEthereumChain',
      params: [await makeNetworkParams(networkConfig, CELO)],
    });

    await addTokensToMetamask(ethereum, tokens);
  } catch (err) {
    const { code } = err as MetamaskRPCError;
    if (code === MetamaskRPCErrorCode.AwaitingUserConfirmation) {
      // user has already been requested to add the network
      // maybe add a user CTA
      throw new Error(
        `Please check your Metamask window to add ${networkConfig.name} to Metamask`
      );
    } else {
      console.log(err, code);
      throw err;
    }
  }
};

export async function addNetworksToMetamask(ethereum: Ethereum): Promise<void> {
  await Promise.all(
    Object.values(NETWORKS).map((network) =>
      addNetworkToMetamask(ethereum, network)
    )
  );
}

export async function switchToCeloNetwork(
  kit: ContractKit,
  network: Network,
  ethereum: Ethereum
): Promise<void> {
  const web3 = new Web3(ethereum);
  const chainId = await web3.eth.getChainId();

  if (network.chainId !== chainId) {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: `0x${network.chainId.toString(16)}`,
          },
        ],
      });
    } catch (err) {
      const { code } = err as MetamaskRPCError;
      if (code === MetamaskRPCErrorCode.UnknownNetwork) {
        // ChainId not yet added to metamask
        await addNetworkToMetamask(ethereum, network);
        return switchToCeloNetwork(kit, network, ethereum);
      } else if (code === MetamaskRPCErrorCode.AwaitingUserConfirmation) {
        // user has already been requested to switch the network
        return;
      } else {
        console.log(err, code);
        debugger;
        throw err;
      }
    }
  }
}
