import { UseCelo } from '@celo/react-celo';
import Web3 from 'web3';

export async function sendTestTransactionStable(
  performActions: UseCelo['performActions']
) {
  await performActions(async (k) => {
    const account = await k.connection.defaultAccount;
    const celo = await k.contracts.getGoldToken();
    const cEURtoken = await k.contracts.getStableToken('cEUR');
    const cUSDtoken = await k.contracts.getStableToken();

    const userAddress = await account.address;

    console.log(userAddress);

    const cUSDBalance = await cUSDtoken.balanceOf(k.connection.defaultAccount);
    const cEURBalance = await cEURtoken.balanceOf(k.connection.defaultAccount);

    const feeCurrencyToken = cEURBalance > cUSDBalance ? cEURtoken : cUSDtoken;

    await celo
      .transfer(
        // impact market contract
        '0x73D20479390E1acdB243570b5B739655989412f5',
        Web3.utils.toWei('1', 'wei')
      )
      .sendAndWaitForReceipt({
        from: k.connection.defaultAccount,
        gasPrice: k.connection.defaultGasPrice,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        feeCurrency: feeCurrencyToken.address,
      });
  });
}
