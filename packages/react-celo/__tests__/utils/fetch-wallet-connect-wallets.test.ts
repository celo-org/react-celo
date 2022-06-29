import { ChainId } from '../../src';
import fetchWCWallets from '../../src/utils/fetch-wallet-connect-wallets';

describe('fetchWCWallets', () => {
  it.skip('gets only the CELO compatible wallets from the WC registry', async () => {
    const wallets = await fetchWCWallets();
    expect(
      wallets.every((x) => x.chains.includes(`eip155:${ChainId.Mainnet}`))
    ).toBe(true);
  });
});
