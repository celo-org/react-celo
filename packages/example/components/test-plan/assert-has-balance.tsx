import { CeloTokenContract, ContractKit } from '@celo/contractkit';
import { MiniContractKit } from '@celo/contractkit/lib/mini-kit';
import Web3 from 'web3';

import { feeTokenMap } from '../../utils';

export async function assertHasBalance(
  address: string,
  kit: ContractKit | MiniContractKit,
  feeCurrency: CeloTokenContract
): Promise<void> {
  let convertedBalance;
  try {
    const totalBalance = await kit.getTotalBalance(address);
    const token = feeTokenMap[feeCurrency];
    const tokenBalance = totalBalance[token];

    if (!tokenBalance) {
      throw new Error(`Balance did not include any ${token}`);
    }

    convertedBalance = Number(Web3.utils.fromWei(tokenBalance.toFixed()));
  } catch (error) {
    let message;
    if (error instanceof Error) {
      message = error.message;
    } else {
      message = JSON.stringify(error);
    }

    throw new Error(`Got an error when trying to check balance: ${message}`);
  }
  if (convertedBalance < 0.1) {
    throw new Error(
      'Your wallet does not have enough funds for the transaction'
    );
  }
}
