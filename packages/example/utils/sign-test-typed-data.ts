import { MiniContractKit } from '@celo/contractkit/lib/mini-kit';
import { UseCelo } from '@celo/react-celo';

import { getTypedData } from '.';

export async function signTestTypedData(
  performActions: UseCelo['performActions']
) {
  await performActions(async (kit: MiniContractKit) => {
    if (kit.connection.defaultAccount) {
      const chainId = await kit.connection.chainId();
      return await kit.connection.signTypedData(
        kit.connection.defaultAccount,
        getTypedData(chainId)
      );
    } else {
      throw new Error('No default account');
    }
  });
}
