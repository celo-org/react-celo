import { MiniContractKit } from '@celo/contractkit/lib/mini-kit';
import { UseCelo } from '@celo/react-celo';

import { TYPED_DATA } from '.';

export async function signTestTypedData(
  performActions: UseCelo['performActions']
) {
  await performActions(async (kit: MiniContractKit) => {
    if (kit.connection.defaultAccount) {
      return await kit.connection.signTypedData(
        kit.connection.defaultAccount,
        TYPED_DATA
      );
    } else {
      throw new Error('No default account');
    }
  });
}
