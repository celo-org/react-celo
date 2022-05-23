import { Alfajores, useCelo } from '@celo/react-celo';
import { useEffect, useState } from 'react';

import { SuccessIcon } from './success-icon';
import { Result, TestBlock } from './ui';
import { useDisabledTest } from './useDisabledTest';
import { Status, useTestStatus } from './useTestStatus';

export function SwitchNetwork() {
  const { updateNetwork, network } = useCelo();
  const { status, errorMessage, wrapActionWithStatus, setStatus } =
    useTestStatus();
  const [disabledTest, setDisabledTest] = useDisabledTest();
  const [connectedNetwork, setConnectedNetwork] = useState('');

  const onSwitchNetworks = wrapActionWithStatus(async () => {
    setDisabledTest(true);
    await updateNetwork(Alfajores);
  });

  useEffect(() => {
    setConnectedNetwork(network.name);
    if (status === Status.NotStarted && network.name === Alfajores.name) {
      setStatus.error('Already set to Alfajores');
      setDisabledTest(true);
    }
  }, [network.name, setStatus, status, setDisabledTest]);

  return (
    <TestBlock
      status={status}
      title="Switch network"
      disabledTest={disabledTest}
      onRunTest={onSwitchNetworks}
    >
      <Result status={status}>
        <Result.Default>
          <p>Currently connected to {connectedNetwork}.</p>
        </Result.Default>
        <Result.Success>
          <SuccessIcon /> Switched to Alfajores
        </Result.Success>
        <Result.Error>{errorMessage}</Result.Error>
      </Result>
    </TestBlock>
  );
}
