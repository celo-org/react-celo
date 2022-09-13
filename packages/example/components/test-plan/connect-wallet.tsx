import { Mainnet, useCelo } from '@celo/react-celo';
import React, { useEffect } from 'react';

import { SuccessIcon } from './success-icon';
import { Result, TestBlock } from './ui';
import { Status, useTestStatus } from './useTestStatus';

export function ConnectWalletCheck() {
  const { connect, address, updateNetwork } = useCelo();
  const { status, errorMessage, wrapActionWithStatus, setStatus } =
    useTestStatus();

  const onConnectWallet = wrapActionWithStatus(async () => {
    await updateNetwork(Mainnet);
    await connect();
  });

  useEffect(() => {
    if (address) {
      setStatus.success();
    }
  }, [address, setStatus]);

  return (
    <TestBlock
      status={status}
      title="Connect wallet to mainnet"
      disabledTest={status !== Status.NotStarted}
      onRunTest={onConnectWallet}
    >
      <Result status={status}>
        <Result.Default>
          <p>Press the button above to choose a wallet to connect to.</p>
        </Result.Default>
        <Result.Success>
          <SuccessIcon /> Connected to {address}
        </Result.Success>
        <Result.Error>{errorMessage}</Result.Error>
      </Result>
    </TestBlock>
  );
}
