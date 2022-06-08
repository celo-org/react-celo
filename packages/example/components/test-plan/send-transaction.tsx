import { useCelo } from '@celo/react-celo';
import { useEffect } from 'react';

import { sendTestTransaction } from '../../utils/send-test-transaction';
import { SuccessIcon } from './success-icon';
import { Result, TestBlock } from './ui';
import { useDisabledTest } from './useDisabledTest';
import { useTestStatus } from './useTestStatus';
import { assertHasBalance } from './assertHasBalance';

export function SendTransaction() {
  const { performActions, address, kit, feeCurrency } = useCelo();
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
          setDisabled(false);
          setStatus.notStarted();
        })
        .catch((assertError) => {
          if (assertError instanceof Error) {
            setStatus.error(assertError.message);
          } else {
            setStatus.error(
              `Error when checking balance: ${JSON.stringify(assertError)}`
            );
          }
        });
    }
  }, [address, feeCurrency, kit, setDisabled, setStatus]);

  return (
    <>
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
    </>
  );
}
