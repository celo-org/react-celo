import { UseCelo } from '@celo/react-celo';
import ethers from 'ethers';
import CeloNativeToken from './celo-native';

export async function sendTestTransaction(
  performActions: UseCelo['performActions']
) {
  await performActions(async (signer) => {
    const celo = await CeloNativeToken(signer);
    await celo.functions
      .transfer(
        // impact market contract
        '0x73D20479390E1acdB243570b5B739655989412f5',
        ethers.utils.formatUnits('1', 'wei') // formatUnits('1', 'wei')
      )
      .sendAndWaitForReceipt({
        from: k.connection.defaultAccount,
        gasPrice: k.connection.defaultGasPrice,
      });
  });
}
