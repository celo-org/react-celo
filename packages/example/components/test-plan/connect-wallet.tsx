import { Mainnet, useCelo } from '@celo/react-celo';
import React from 'react';

import { PrimaryButton } from '..';
import { SuccessIcon } from './success-icon';
import { Header, Result, TestBlock } from './ui';
import { Status, useTestStatus } from './useTestStatus';

export function ConnectWalletCheck() {
  const { connect, address, updateNetwork } = useCelo();
  const { status, errorMessage, wrapActionWithStatus } = useTestStatus();

  const onConnectWallet = wrapActionWithStatus(async () => {
    await updateNetwork(Mainnet);
    await connect();
  });

  return (
    <TestBlock status={status}>
      <Header>Connect wallet (Mainnet)</Header>
      <PrimaryButton
        onClick={onConnectWallet}
        disabled={status !== Status.NotStarted}
      >
        Connect wallet
      </PrimaryButton>
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
