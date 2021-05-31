import React from 'react';
import { ChainId } from './types';
import {
  CELO,
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

// can't figure out how to bundle images yet
// so this is our workaround
export const images = {
  [SupportedProviders.Ledger]: LEDGER,
  [SupportedProviders.WalletConnect]: WALLETCONNECT,
  [SupportedProviders.MetaMask]: METAMASK,
  [SupportedProviders.Valora]: 'https://valoraapp.com/favicon.ico',
  [SupportedProviders.CeloExtensionWallet]: CELO,
  [SupportedProviders.PrivateKey]: PRIVATE_KEY,
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
  DappKit = 'DappKit',
  Injected = 'Injected',
  Ledger = 'Ledger',
  MetaMask = 'MetaMask',
  PrivateKey = 'PrivateKey',
  Unauthenticated = 'Unauthenticated',
  WalletConnect = 'WalletConnect',
}

/**
 * Gets the provider associated with a wallet type.
 * @param wallet
 * @returns
 */
export const getProviderForWallet = (
  wallet: WalletTypes
): SupportedProviders | null =>
  wallet === WalletTypes.DappKit
    ? SupportedProviders.Valora
    : wallet === WalletTypes.Unauthenticated
    ? null
    : SupportedProviders[wallet];

/**
 * Default networks to connect to.
 */
export const DEFAULT_NETWORKS = [Mainnet, Alfajores];

/**
 * Chain ID of a default network.
 */
export type DefaultChainId = ChainId.Mainnet | ChainId.Alfajores;
