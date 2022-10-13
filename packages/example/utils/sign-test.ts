import { UseCelo } from '@celo/react-celo';
import { ensureLeading0x } from '@celo/utils/lib/address';

export async function signTest(performActions: UseCelo['performActions']) {
  await performActions(async (signer) => {
    console.info('signer', signer._isSigner);
    const account = await signer.getAddress();
    if (!account) {
      throw new Error('No default account');
    }
    return await signer.signMessage(
      ensureLeading0x(Buffer.from('Hello').toString('hex'))
    );
  });
}
