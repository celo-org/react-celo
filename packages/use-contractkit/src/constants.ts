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
