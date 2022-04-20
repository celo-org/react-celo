import React from 'react';
import { isMobile } from 'react-device-detect';

import { ChainId, Provider } from './types';
import { isEthereumFromMetamask, isEthereumPresent } from './utils/ethereum';
import {
  CELO,
  CELO_DANCE,
  CHROME_EXTENSION_STORE,
  ETHEREUM,
  LEDGER,
  METAMASK,
  PRIVATE_KEY,
  VALORA,
  WALLETCONNECT,
} from './walletIcons';

export const localStorageKeys = {
  lastUsedAddress: 'use-contractkit/last-used-address',
  lastUsedNetwork: 'use-contractkit/last-used-network',
  lastUsedWalletType: 'use-contractkit/last-used-wallet',
  lastUsedWalletArguments: 'use-contractkit/last-used-wallet-arguments',
  lastUsedFeeCurrency: 'use-contractkit/last-used-fee-currency',
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

export const PROVIDERS: {
  [K in SupportedProviders]: Provider;
} = {
  [SupportedProviders.Valora]: {
    name: SupportedProviders.Valora,
    type: WalletTypes.WalletConnect,
    description:
      'Connect to Valora, a mobile payments app that works worldwide',
    icon: VALORA,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => 0,
    installURL: 'https://valoraapp.com/',
  },
  [SupportedProviders.WalletConnect]: {
    name: SupportedProviders.WalletConnect,
    type: WalletTypes.WalletConnect,
    description: 'Scan a QR code to connect your wallet',
    icon: WALLETCONNECT,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => 0,
  },
  [SupportedProviders.Ledger]: {
    name: SupportedProviders.Ledger,
    type: WalletTypes.Ledger,
    description: 'Sync with your Ledger hardware wallet',
    icon: LEDGER,
    canConnect: () => true,
    showInList: () => !isMobile,
    listPriority: () => 0,
  },
  [SupportedProviders.CeloWallet]: {
    name: SupportedProviders.CeloWallet,
    type: WalletTypes.WalletConnect,
    description: 'Connect to Celo Wallet for web or desktop',
    icon: CELO,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => (!isMobile ? 0 : 1),
  },
  [SupportedProviders.CeloTerminal]: {
    name: SupportedProviders.CeloTerminal,
    type: WalletTypes.WalletConnect,
    description: 'Connect to the Celo Terminal desktop app',
    // TODO get SVG icon
    icon: 'https://raw.githubusercontent.com/zviadm/celoterminal/main/static/icon.png',
    canConnect: () => true,
    showInList: () => !isMobile,
    listPriority: () => 1,
  },
  [SupportedProviders.MetaMask]: {
    name: SupportedProviders.MetaMask,
    type: WalletTypes.MetaMask,
    description: isMobile ? (
      isEthereumFromMetamask() ? (
        'Connect with MetaMask Mobile App'
      ) : (
        'Open MetaMask Mobile App'
      )
    ) : (
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
    canConnect: () => isEthereumFromMetamask(),
    showInList: () => true,
    listPriority: () => 0,
    installURL: 'https://metamask.app.link/',
  },
  [SupportedProviders.CeloExtensionWallet]: {
    name: SupportedProviders.CeloExtensionWallet,
    type: WalletTypes.CeloExtensionWallet,
    description: 'Use a wallet from the the Celo chrome extension',
    icon: CHROME_EXTENSION_STORE,
    canConnect: () => !!window.celo,
    showInList: () => !isMobile,
    listPriority: () => 1,
    installURL:
      'https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh/related',
  },
  [SupportedProviders.Injected]: {
    name: SupportedProviders.Injected,
    type: WalletTypes.Injected,
    description: 'Connect any Ethereum wallet to Celo',
    icon: ETHEREUM,
    canConnect: () => isEthereumPresent(),
    showInList: () => isEthereumFromMetamask(),
    listPriority: () => 1,
  },
  [SupportedProviders.PrivateKey]: {
    name: SupportedProviders.PrivateKey,
    type: WalletTypes.PrivateKey,
    description:
      'Enter a plaintext private key to load your account (testing only)',
    icon: PRIVATE_KEY,
    canConnect: () => true,
    showInList: () => process.env.NODE_ENV !== 'production',
    listPriority: () => 1,
  },
  [SupportedProviders.CeloDance]: {
    name: SupportedProviders.CeloDance,
    type: WalletTypes.WalletConnect,
    description: 'Send, vote, and earn rewards within one wallet',
    icon: CELO_DANCE,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => 1,
    installURL: 'https://celo.dance/',
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
  Localhost = 'Localhost',
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

export const Localhost = {
  name: NetworkNames.Localhost,
  rpcUrl: 'http://localhost:8545',
  graphQl: '',
  explorer: '',
  chainId: 1337,
} as const;

export enum WalletIds {
  Valora = 'd01c7758d741b363e637a817a09bcf579feae4db9f5bb16f599fdd1f66e2f974',
  CeloWallet = '36d854b702817e228d5c853c528d7bdb46f4bb041d255f67b82eb47111e5676b',
  CeloDance = 'TODO',
  CeloTerminal = '8f8506b7f191a8ab95a8295fc8ca147aa152b1358bee4283d6ad2468d97e0ca4',
}

/**
 * These wallets cannot have their networks
 * updated via use-contractkit
 */
export const STATIC_NETWORK_WALLETS = [WalletTypes['CeloExtensionWallet']];

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
export const DEFAULT_NETWORKS = [
  Mainnet,
  Alfajores,
  Baklava,
  ...(process.env.NODE_ENV !== 'production' ? [Localhost] : []),
];

/**
 * Chain ID of a default network.
 */
export type DefaultChainId = ChainId.Mainnet | ChainId.Alfajores;
