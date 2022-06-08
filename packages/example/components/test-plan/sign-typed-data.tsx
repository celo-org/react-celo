import { useCelo } from '@celo/react-celo';
import { useEffect } from 'react';

import { signTestTypedData } from '../../utils/sign-test-typed-data';
import { assertHasBalance } from './assert-has-balance';
import { SuccessIcon } from './success-icon';
import { Result, TestBlock } from './ui';
import { useDisabledTest } from './useDisabledTest';
import { useTestStatus } from './useTestStatus';

export function SignTypedData() {
  const { performActions, address, kit, feeCurrency } = useCelo();
  const { status, errorMessage, wrapActionWithStatus, setStatus } =
    useTestStatus();
  const [disabled, setDisabled] = useDisabledTest();

  const onRunTest = wrapActionWithStatus(async () => {
    setDisabled(true);
    await signTestTypedData(performActions);
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
        title="Sign typed data"
        disabledTest={disabled}
        onRunTest={onRunTest}
      >
        <Result status={status}>
          <p>This signs a typed data.</p>
          <Result.Default>
            <p>You'll need to approve the signing in the wallet.</p>
          </Result.Default>
          <Result.Success>
            <SuccessIcon /> Signing successful
          </Result.Success>
          <Result.Error>{errorMessage}</Result.Error>
        </Result>
      </TestBlock>
    </>
  );
}
