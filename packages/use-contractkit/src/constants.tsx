import React from 'react';
import { ChainId } from './types';

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
  [SupportedProviders.Ledger]:
    'https://www.ledger.com/wp-content/uploads/2020/02/puce_blue.png',
  [SupportedProviders.WalletConnect]:
    'https://gblobscdn.gitbook.com/spaces%2F-LJJeCjcLrr53DcT1Ml7%2Favatar.png?alt=media',
  [SupportedProviders.MetaMask]: 'https://metamask.io/images/favicon-256.png',
  [SupportedProviders.Valora]: 'https://valoraapp.com/favicon.ico',
  [SupportedProviders.CeloExtensionWallet]:
    'https://dl.airtable.com/.attachmentThumbnails/765f7478015a0aa7f823d1350c6181c1/9ea0f8db',
  [SupportedProviders.PrivateKey]: (
    <svg
      className="dark:tw-text-gray-300"
      style={{ height: '24px', width: '24px' }}
      aria-hidden="true"
      focusable="false"
      data-prefix="fas"
      data-icon="key"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <path
        fill="currentColor"
        d="M512 176.001C512 273.203 433.202 352 336 352c-11.22 0-22.19-1.062-32.827-3.069l-24.012 27.014A23.999 23.999 0 0 1 261.223 384H224v40c0 13.255-10.745 24-24 24h-40v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24v-78.059c0-6.365 2.529-12.47 7.029-16.971l161.802-161.802C163.108 213.814 160 195.271 160 176 160 78.798 238.797.001 335.999 0 433.488-.001 512 78.511 512 176.001zM336 128c0 26.51 21.49 48 48 48s48-21.49 48-48-21.49-48-48-48-48 21.49-48 48z"
      ></path>
    </svg>
  ),
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
