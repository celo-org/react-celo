export const localStorageKeys = {
  lastUsedAddress: 'use-contractkit/last-used-address',
  lastUsedNetwork: 'use-contractkit/last-used-network',
  lastUsedWalletType: 'use-contractkit/last-used-wallet',
  lastUsedWalletArguments: 'use-contractkit/last-used-wallet-arguments',
};

export enum SupportedProviders {
  WalletConnect = 'Wallet Connect',
  MetaMask = 'MetaMask',
  CeloExtensionWallet = 'Celo Extension Wallet',
  Ledger = 'Ledger',
  Valora = 'Valora',
  PrivateKey = 'Private key',
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
    'https://lh3.googleusercontent.com/oCe1p-7wMa4KOEKLENfZmJW4MrXyPyw-3HYdVnjLlwA1Y3jujRmFRvzvkktmtF8HTuMy_62wBHkBng91YVjUPkXD=w128-h128-e365-rj-sc0x00ffffff',
};

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
};

export const Baklava = {
  name: NetworkNames.Baklava,
  rpcUrl: 'https://baklava-forno.celo-testnet.org',
  graphQl: 'https://baklava-blockscout.celo-testnet.org/graphiql',
  explorer: 'https://baklava-blockscout.celo-testnet.org',
};

export const Mainnet = {
  name: NetworkNames.Mainnet,
  rpcUrl: 'https://forno.celo.org',
  graphQl: 'https://explorer.celo.org/graphiql',
  explorer: 'https://explorer.celo.org',
};

export enum WalletTypes {
  Unauthenticated = 'Unauthenticated',
  PrivateKey = 'PrivateKey',
  WalletConnect = 'WalletConnect',
  Ledger = 'Ledger',
  CeloExtensionWallet = 'CeloExtensionWallet',
  Metamask = 'Metamask',
  DappKit = 'DappKit',
}
