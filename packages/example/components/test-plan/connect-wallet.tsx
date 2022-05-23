import { Mainnet, useCelo } from '@celo/react-celo';
import React from 'react';

import { SuccessIcon } from './success-icon';
import { Result, TestBlock } from './ui';
import { Status, useTestStatus } from './useTestStatus';

export function ConnectWalletCheck() {
  const { connect, address, updateNetwork } = useCelo();
  const { status, errorMessage, wrapActionWithStatus } = useTestStatus();

  const onConnectWallet = wrapActionWithStatus(async () => {
    await updateNetwork(Mainnet);
    await connect();
  });

  return (
    <TestBlock
      status={status}
      title="Connect wallet (Mainnet)"
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
