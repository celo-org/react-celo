export const localStorageKeys = {
  privateKey: 'use-contractkit/private-key',
  lastUsedAddress: 'use-contractkit/last-used-address',
  lastUsedNetwork: 'use-contractkit/last-used-network',
};

// can't figure out how to bundle images yet
// so this is our workaround
export const images = {
  ledger: 'https://www.ledger.com/wp-content/uploads/2020/02/puce_blue.png',
  walletconnect:
    'https://gblobscdn.gitbook.com/spaces%2F-LJJeCjcLrr53DcT1Ml7%2Favatar.png?alt=media',
  metamask: 'https://metamask.io/images/favicon-256.png',
  valora: 'https://valoraapp.com/favicon.ico',
};

export const Alfajores = {
  name: 'Alfajores',
  rpcUrl: 'https://alfajores-forno.celo-testnet.org',
  graphQl: 'https://alfajores-blockscout.celo-testnet.org/graphiql',
  explorer: 'https://alfajores-blockscout.celo-testnet.org',
};

export const Baklava = {
  name: 'Baklava',
  rpcUrl: 'https://baklava-forno.celo-testnet.org',
  graphQl: 'https://baklava-blockscout.celo-testnet.org/graphiql',
  explorer: 'https://baklava-blockscout.celo-testnet.org',
};

export const Mainnet = {
  name: 'Mainnet',
  rpcUrl: 'https://forno.celo.org',
  graphQl: 'https://explorer.celo.org/graphiql',
  explorer: 'https://explorer.celo.org',
};
