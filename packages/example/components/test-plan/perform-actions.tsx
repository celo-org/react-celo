import { UseCelo, useCelo } from '@celo/react-celo';
import { useEffect, useState } from 'react';

import { sendTestTransaction } from '../../utils/send-test-transaction';
import { signTest } from '../../utils/sign-test';
import { signTestTypedData } from '../../utils/sign-test-typed-data';
import { assertHasBalance } from './assert-has-balance';
import { SuccessIcon } from './success-icon';
import { Result, TestBlock } from './ui';
import { useTestStatus } from './useTestStatus';

/**
 * PerformActionInWallet is a wrapper component that takes an action
 * that will be performed using a wallet. The common logic of all actions
 * is that we need to check if the wallet has funds.
 */
export function PerformActionInWallet({
  title,
  action,
  description,
  successMessage,
}: {
  title: string;
  description: string;
  action: (performActions: UseCelo['performActions']) => Promise<void>;
  successMessage: string;
}) {
  const { performActions, address, kit, feeCurrency } = useCelo();
  const { status, errorMessage, wrapActionWithStatus, setStatus } =
    useTestStatus();
  const [disabled, setDisabled] = useState(true);

  const onRunTest = wrapActionWithStatus(async () => {
    setDisabled(true);
    await action(performActions);
  });

  useEffect(() => {
    if (address) {
      assertHasBalance(address, kit, feeCurrency)
        .then(() => {
          setDisabled(false);
          setStatus.notStarted();
        })
        .catch((assertError) => {
          setDisabled(true);
          if (assertError instanceof Error) {
            setStatus.failed(assertError.message);
          } else {
            setStatus.failed(
              `Error when checking balance: ${JSON.stringify(assertError)}`
            );
          }
        });
    } else {
      setDisabled(true);
    }
  }, [address, feeCurrency, kit, setDisabled, setStatus]);

  return (
    <>
      <TestBlock
        status={status}
        title={title}
        disabledTest={disabled}
        onRunTest={onRunTest}
      >
        <Result status={status}>
          <p>{description}</p>
          <Result.Default>
            <p>You'll need to approve it in your wallet.</p>
          </Result.Default>
          <Result.Success>
            <SuccessIcon /> {successMessage}
          </Result.Success>
          <Result.Error>{errorMessage}</Result.Error>
        </Result>
      </TestBlock>
    </>
  );
}

export const SendTransaction = () => {
  const { performActions } = useCelo();
  const action = () => sendTestTransaction(performActions);
  return (
    <PerformActionInWallet
      title="Send transaction"
      successMessage="Transaction sent"
      description="This sends a very small transaction to impact market contract."
      action={action}
    />
  );
};

export const SignTypedData = () => {
  const { performActions } = useCelo();
  const action = () => signTestTypedData(performActions);
  return (
    <PerformActionInWallet
      title="Sign typed data"
      successMessage="Signing successful"
      description="This signs a typed data."
      action={action}
    />
  );
};

export const Sign = () => {
  const { performActions } = useCelo();
  const action = () => signTest(performActions);
  return (
    <PerformActionInWallet
      title="Sign"
      successMessage="Signing successful"
      description="This signs not typed data."
      action={action}
    />
  );
};
