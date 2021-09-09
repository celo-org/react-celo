import React from 'react';
import { isMobile } from 'react-device-detect';

import { ChainId, Provider } from './types';
import {
  CELO,
  CHROME_EXTENSION_STORE,
  ETHEREUM,
  LEDGER,
  METAMASK,
  PRIVATE_KEY,
  VALORA,
  WALLETCONNECT,
  CELO_DANCE,
} from './walletIcons';

export const localStorageKeys = {
  lastUsedAddress: 'use-contractkit/last-used-address',
  lastUsedNetwork: 'use-contractkit/last-used-network',
  lastUsedWalletType: 'use-contractkit/last-used-wallet',
  lastUsedWalletArguments: 'use-contractkit/last-used-wallet-arguments',
};

export enum SupportedProviders {
  CeloExtensionWallet = 'Celo Extension Wallet',
  CeloTerminal = 'Celo Terminal',
  CeloWallet = 'Celo Wallet',
  CeloDance = 'CeloDance',
  Injected = 'Injected',
  Ledger = 'Ledger',
  MetaMask = 'MetaMask',
  PrivateKey = 'Private key',
  Valora = 'Valora',
  WalletConnect = 'WalletConnect',
}

export const PROVIDERS: {
  [K in SupportedProviders]: Provider;
} = {
  [SupportedProviders.Valora]: {
    name: 'Valora',
    description:
      'Connect to Valora, a mobile payments app that works worldwide',
    icon: VALORA,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => 0,
    installURL: 'https://valoraapp.com/',
  },
  [SupportedProviders.WalletConnect]: {
    name: 'WalletConnect',
    description: 'Scan a QR code to connect your wallet',
    icon: WALLETCONNECT,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => 0,
  },
  [SupportedProviders.CeloDance]: {
    name: 'CeloDance',
    description: 'Send, vote, and earn rewards within one wallet',
    icon: CELO_DANCE,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => 1,
  },
  [SupportedProviders.Ledger]: {
    name: 'Ledger',
    description: 'Sync with your Ledger hardware wallet',
    icon: LEDGER,
    canConnect: () => true,
    showInList: () => !isMobile,
    listPriority: () => 0,
  },
  [SupportedProviders.CeloWallet]: {
    name: 'Celo Wallet',
    description: 'Connect to Celo Wallet for web or deskop',
    icon: CELO,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => (!isMobile ? 0 : 1),
  },
  [SupportedProviders.CeloTerminal]: {
    name: 'Celo Terminal',
    description: 'Connect to the Celo Terminal desktop app',
    // TODO get SVG icon
    icon: 'https://raw.githubusercontent.com/zviadm/celoterminal/main/static/icon.png',
    canConnect: () => true,
    showInList: () => !isMobile,
    listPriority: () => 1,
  },
  [SupportedProviders.MetaMask]: {
    name: 'MetaMask',
    description: (
      <>
        Use the Metamask browser extension. Celo support is limited.{' '}
        <a
          href="https://docs.celo.org/getting-started/wallets/using-metamask-with-celo"
          target="_blank"
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopPropagation();
          }}
          className="tw-underline tw-text-gray-900 dark:tw-text-gray-200 tw-font-medium"
          rel="noopener noreferrer"
        >
          Learn more
        </a>
      </>
    ),
    icon: METAMASK,
    canConnect: () => !!window.ethereum?.isMetaMask,
    showInList: () => !isMobile,
    listPriority: () => 0,
    installURL: 'https://metamask.app.link/',
  },
  [SupportedProviders.CeloExtensionWallet]: {
    name: 'Celo Extension Wallet',
    description: 'Use a wallet from the the Celo chrome extension',
    icon: CHROME_EXTENSION_STORE,
    canConnect: () => !!window.celo,
    showInList: () => !isMobile,
    listPriority: () => 1,
    installURL:
      'https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh/related',
  },
  [SupportedProviders.Injected]: {
    name: 'Ethereum Web3',
    description: 'Connect any Ethereum wallet to Celo',
    icon: ETHEREUM,
    canConnect: () => !!window.ethereum,
    showInList: () => !!window.ethereum && !window.ethereum.isMetaMask,
    listPriority: () => 1,
  },
  [SupportedProviders.PrivateKey]: {
    name: 'Private Key',
    description:
      'Enter a plaintext private key to load your account (testing only)',
    icon: PRIVATE_KEY,
    canConnect: () => true,
    showInList: () => process.env.NODE_ENV !== 'production',
    listPriority: () => 1,
  },
};

export const images = {
  [SupportedProviders.Valora]: VALORA,
  [SupportedProviders.MetaMask]: METAMASK,
  [SupportedProviders.WalletConnect]: WALLETCONNECT,
  [SupportedProviders.Ledger]: LEDGER,
  [SupportedProviders.CeloWallet]: CELO,
  [SupportedProviders.CeloDance]: CELO_DANCE,
  [SupportedProviders.CeloTerminal]: CELO,
  [SupportedProviders.CeloExtensionWallet]: CHROME_EXTENSION_STORE,
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
  Valora = 'Valora',
  MetaMask = 'MetaMask',
  WalletConnect = 'WalletConnect',
  CeloDance = 'CeloDance',
  CeloWallet = 'CeloWallet',
  CeloTerminal = 'CeloTerminal',
  CeloExtensionWallet = 'CeloExtensionWallet',
  Ledger = 'Ledger',
  Injected = 'Injected',
  PrivateKey = 'PrivateKey',
  Unauthenticated = 'Unauthenticated',
}

/**
 * These wallets cannot have their networks
 * updated via use-contractkit
 */
export const STATIC_NETWORK_WALLETS = [
  WalletTypes['MetaMask'],
  WalletTypes['CeloExtensionWallet'],
];

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
export const DEFAULT_NETWORKS = [Mainnet, Alfajores, Baklava];

/**
 * Chain ID of a default network.
 */
export type DefaultChainId = ChainId.Mainnet | ChainId.Alfajores;
