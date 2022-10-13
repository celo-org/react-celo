import { UseCelo } from '@celo/react-celo';
import { Signer } from 'ethers';

import { getTypedData } from '.';

export async function signTestTypedData(
  performActions: UseCelo['performActions']
) {
  await performActions(async (signer: Signer) => {
    const address = await signer.getAddress();
    if (address) {
      const chainId = await signer.getChainId();
      return await signer._signTypedData(address, getTypedData(chainId));
    } else {
      throw new Error('No default account');
    }
  });
}
