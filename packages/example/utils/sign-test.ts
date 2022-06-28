import { UseCelo } from '@celo/react-celo';
import { ensureLeading0x } from '@celo/utils/lib/address';

export async function signTest(performActions: UseCelo['performActions']) {
  await performActions(async (k) => {
    if (!k.connection.defaultAccount) {
      throw new Error('No default account');
    }
    return await k.connection.sign(
      ensureLeading0x(Buffer.from('Hello').toString('hex')),
      k.connection.defaultAccount
    );
  });
}
