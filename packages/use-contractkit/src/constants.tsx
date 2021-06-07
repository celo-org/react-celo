import { isMobile } from 'react-device-detect';

import { ChainId, Provider } from './types';
import {
  CELO,
  ETHEREUM,
  LEDGER,
  METAMASK,
  PRIVATE_KEY,
  WALLETCONNECT,
} from './walletIcons';

export const localStorageKeys = {
  lastUsedAddress: 'use-contractkit/last-used-address',
  lastUsedNetwork: 'use-contractkit/last-used-network',
  lastUsedWalletType: 'use-contractkit/last-used-wallet',
  lastUsedWalletArguments: 'use-contractkit/last-used-wallet-arguments',
};

export enum SupportedProviders {
  CeloExtensionWallet = 'Celo Extension Wallet',
  Injected = 'Injected',
  Ledger = 'Ledger',
  MetaMask = 'MetaMask',
  PrivateKey = 'Private key',
  Valora = 'Valora',
  WalletConnect = 'Wallet Connect',
}

export const PROVIDERS: {
  [K in SupportedProviders]: Provider;
} = {
  [SupportedProviders.CeloExtensionWallet]: {
    name: 'Celo Extension Wallet',
    description: 'Celo desktop wallet compatible with Valora',
    icon: CELO,
    canConnect: () => !!window.celo,
    showInList: () => !isMobile,
    installURL:
      'https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh/related',
  },
  [SupportedProviders.Injected]: {
    name: 'Ethereum Web3',
    description: 'Connect any Ethereum wallet to Celo',
    icon: ETHEREUM,
    canConnect: () => !!window.ethereum,
    showInList: () => !!window.ethereum && !window.ethereum.isMetaMask,
  },
  [SupportedProviders.Ledger]: {
    name: 'Ledger',
    description: 'Connect to your Ledger wallet',
    icon: LEDGER,
    canConnect: () => true,
    showInList: () => !isMobile,
  },
  [SupportedProviders.MetaMask]: {
    name: 'MetaMask',
    description: 'A crypto gateway to blockchain apps',
    icon: METAMASK,
    canConnect: () => !!window.ethereum?.isMetaMask,
    showInList: () => true,
    installURL: 'https://metamask.app.link/',
  },
  [SupportedProviders.PrivateKey]: {
    name: 'Private Key',
    description:
      'Enter a plaintext private key to load your account (testing only)',
    icon: PRIVATE_KEY,
    canConnect: () => true,
    showInList: () => process.env.NODE_ENV !== 'production',
  },
  [SupportedProviders.Valora]: {
    name: 'Valora',
    description: 'A mobile payments app that works worldwide',
    icon: 'https://valoraapp.com/favicon.ico',
    canConnect: () => true,
    showInList: () => isMobile,
    installURL: 'https://valoraapp.com/',
  },
  [SupportedProviders.WalletConnect]: {
    name: 'WalletConnect',
    description: 'Scan a QR code to connect your wallet',
    icon: WALLETCONNECT,
    canConnect: () => true,
    showInList: () => true,
  },
};

// can't figure out how to bundle images yet
// so this is our workaround
export const images = {
  [SupportedProviders.CeloExtensionWallet]: CELO,
  [SupportedProviders.Ledger]: LEDGER,
  [SupportedProviders.MetaMask]: METAMASK,
  [SupportedProviders.PrivateKey]: PRIVATE_KEY,
  [SupportedProviders.Valora]: 'https://valoraapp.com/favicon.ico',
  [SupportedProviders.WalletConnect]: WALLETCONNECT,
} as const;

export enum NetworkNames {
  Alfajores = 'Alfajores',
  Baklava = 'Baklava',
  Mainnet = 'Mainnet',
}

export const Alfajores = {
  name: NetworkNames.Alfajores,
  rpcUrl: 'https://alfajores-forno.celo-testnet.org',
  graphQl: 'https://alfajores-blockscout.celo-testnet.org/graphiql',
  explorer: 'https://alfajores-blockscout.celo-testnet.org',
  chainId: ChainId.Alfajores,
} as const;

export const Baklava = {
  name: NetworkNames.Baklava,
  rpcUrl: 'https://baklava-forno.celo-testnet.org',
  graphQl: 'https://baklava-blockscout.celo-testnet.org/graphiql',
  explorer: 'https://baklava-blockscout.celo-testnet.org',
  chainId: ChainId.Baklava,
} as const;

export const Mainnet = {
  name: NetworkNames.Mainnet,
  rpcUrl: 'https://forno.celo.org',
  graphQl: 'https://explorer.celo.org/graphiql',
  explorer: 'https://explorer.celo.org',
  chainId: ChainId.Mainnet,
} as const;

export enum WalletTypes {
  CeloExtensionWallet = 'CeloExtensionWallet',
  Injected = 'Injected',
  Ledger = 'Ledger',
  MetaMask = 'MetaMask',
  PrivateKey = 'PrivateKey',
  Unauthenticated = 'Unauthenticated',
  WalletConnect = 'WalletConnect',
  Valora = 'Valora',
}

/**
 * Gets the provider associated with a wallet type.
 * @param wallet
 * @returns
 */
export const getProviderForWallet = (
  wallet: WalletTypes
): SupportedProviders | null =>
  wallet === WalletTypes.Unauthenticated ? null : SupportedProviders[wallet];

/**
 * Default networks to connect to.
 */
export const DEFAULT_NETWORKS = [Mainnet, Alfajores];

/**
 * Chain ID of a default network.
 */
export type DefaultChainId = ChainId.Mainnet | ChainId.Alfajores;
