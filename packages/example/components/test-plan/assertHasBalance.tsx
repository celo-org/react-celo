import { CeloTokenContract, ContractKit } from '@celo/contractkit';
import { MiniContractKit } from '@celo/contractkit/lib/mini-kit';
import { useCelo } from '@celo/react-celo';
import { useEffect, useState } from 'react';
import Web3 from 'web3';

import { feeTokenMap } from '../../utils';

export async function assertHasBalance(
  address: string,
  kit: ContractKit | MiniContractKit,
  feeCurrency: CeloTokenContract
): Promise<void> {
  let convertedBalance;
  console.log('[assertHasBalance] address', address);
  try {
    const totalBalance = await kit.getTotalBalance(address);
    const token = feeTokenMap[feeCurrency];
    const tokenBalance = totalBalance[token];

    if (!tokenBalance) {
      throw new Error(`Balance did not include any ${token}`);
    }

    convertedBalance = Number(Web3.utils.fromWei(tokenBalance.toFixed()));
    console.log('[assertHasBalance] convertedBalance', convertedBalance);
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
    console.log('throwing error');
    throw new Error(
      'Your wallet does not have enough funds for the transaction'
    );
  }
}

export function useAssertWalletHasFunds() {
  const { address, feeCurrency, kit } = useCelo();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(
      '[useAssertWalletHasFunds] useEffect running',
      address,
      feeCurrency,
      kit
    );
    if (address) {
      console.log('WHY IS THIS RUNNING');
      assertHasBalance(address, kit, feeCurrency)
        .then(() => {
          console.log('[useAssertWalletHasFunds] will set null');
          setError(null);
        })
        .catch((assertError) => {
          console.log('[useAssertWalletHasFunds] will set error', assertError);
          if (assertError instanceof Error) {
            setError(assertError.message);
          } else {
            setError(
              `Error when checking balance: ${JSON.stringify(assertError)}`
            );
          }
        });
    } else {
      setError(null);
    }
    console.log('[useAssertWalletHasFunds] error', error);
  }, [address, feeCurrency, kit]);

  return error;
}
