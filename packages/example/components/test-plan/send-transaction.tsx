import { CeloTokenContract, ContractKit } from '@celo/contractkit';
import { MiniContractKit } from '@celo/contractkit/lib/mini-kit';
import { useCelo } from '@celo/react-celo';
import { useEffect } from 'react';
import Web3 from 'web3';

import { feeTokenMap } from '../../utils';
import { sendTestTransaction } from '../../utils/send-test-transaction';
import { SuccessIcon } from './success-icon';
import { Result, TestBlock } from './ui';
import { useDisabledTest } from './useDisabledTest';
import { useTestStatus } from './useTestStatus';

async function assertHasBalance(
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
    console.log('throwing error');
    throw new Error(
      'Your wallet does not have enough funds for the transaction'
    );
  }
}

export function SendTransaction() {
  const { performActions, address, feeCurrency, kit } = useCelo();
  const { status, errorMessage, wrapActionWithStatus, setStatus } =
    useTestStatus();
  const [disabled, setDisabled] = useDisabledTest();

  const onRunTest = wrapActionWithStatus(async () => {
    setDisabled(true);
    await sendTestTransaction(performActions);
  });

  useEffect(() => {
    if (address) {
      assertHasBalance(address, kit, feeCurrency)
        .then(() => {
          setStatus.notStarted();
        })
        .catch((error) => {
          setDisabled(true);
          setStatus.error(error);
        });
    }
  }, [address, kit, feeCurrency, setStatus, setDisabled]);

  return (
    <TestBlock
      status={status}
      title="Send transaction"
      disabledTest={disabled}
      onRunTest={onRunTest}
    >
      <Result status={status}>
        <p>This sends a very small transaction to impact market contract.</p>
        <Result.Default>
          <p>You'll need to approve the transaction in the wallet.</p>
        </Result.Default>
        <Result.Success>
          <SuccessIcon /> Transaction sent
        </Result.Success>
        <Result.Error>{errorMessage}</Result.Error>
      </Result>
    </TestBlock>
  );
}
