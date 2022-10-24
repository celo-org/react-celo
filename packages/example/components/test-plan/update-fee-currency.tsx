import { CeloContract } from '@celo/contractkit/lib/base';
import { useCelo } from '@celo/react-celo';
import { useEffect } from 'react';

import { SuccessIcon } from './success-icon';
import { Result, TestBlock } from './ui';
import { useDisabledTest } from './useDisabledTest';
import { useTestStatus } from './useTestStatus';

export function UpdateFeeCurrency() {
  const { updateFeeCurrency, feeCurrency, supportsFeeCurrency, address } =
    useCelo();
  const [disabledTest, setDisabledTest] = useDisabledTest();
  const { status, errorMessage, wrapActionWithStatus, setStatus } =
    useTestStatus();

  useEffect(() => {
    if (address && supportsFeeCurrency !== undefined && !supportsFeeCurrency) {
      setDisabledTest(true);
      setStatus.failed('Wallet does not support updating fee currency.');
    }
  }, [address, supportsFeeCurrency, setStatus, setDisabledTest]);

  const onUpdateCurrency = wrapActionWithStatus(async () => {
    setDisabledTest(true);
    await updateFeeCurrency(CeloContract.StableTokenBRL);
    if (feeCurrency !== CeloContract.StableTokenBRL) {
      throw new Error('Fee currency did not update.');
    }
  });

  return (
    <TestBlock
      status={status}
      title="Update fee currency"
      disabledTest={disabledTest}
      onRunTest={onUpdateCurrency}
    >
      <Result status={status}>
        <p>Fee currency used: {feeCurrency}</p>
        <Result.Default>
          <>
            <p>Change the currency used in transactions.</p>
          </>
        </Result.Default>
        <Result.Success>
          <SuccessIcon /> Fee currency {feeCurrency}
        </Result.Success>
        <Result.Error>{errorMessage}</Result.Error>
      </Result>
    </TestBlock>
  );
}
