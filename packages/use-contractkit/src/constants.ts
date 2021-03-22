import { Networks } from './types';

export const localStorageKeys = {
  privateKey: 'use-contractkit/private-key',
  lastUsedAddress: 'use-contractkit/last-used-address',
  lastUsedNetwork: 'use-contractkit/last-used-network',
};

const fornoUrls: { [n in Networks]: string } = {
  [Networks.Alfajores]: 'https://alfajores-forno.celo-testnet.org',
  [Networks.Baklava]: 'https://baklava-forno.celo-testnet.org',
  [Networks.Mainnet]: 'https://forno.celo.org',
};
export function getFornoUrl(n: Networks): string {
  return fornoUrls[n];
}

// can't figure out how to bundle images yet
// so this is our workaround
export const images = {
  ledger: 'https://www.ledger.com/wp-content/uploads/2020/02/puce_blue.png',
  walletconnect:
    'https://gblobscdn.gitbook.com/spaces%2F-LJJeCjcLrr53DcT1Ml7%2Favatar.png?alt=media',
  metamask: 'https://metamask.io/images/favicon-256.png',
  valora: 'https://valoraapp.com/favicon.ico',
};
