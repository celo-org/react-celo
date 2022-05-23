import { Alfajores, useCelo } from '@celo/react-celo';
import { useEffect, useState } from 'react';

import { SuccessIcon } from './success-icon';
import { useTestStatus } from './useTestStatus';
import { Result, TestBlock } from './ui';

export function SwitchNetwork() {
  const { updateNetwork, network, address } = useCelo();
  const { status, errorMessage, wrapActionWithStatus } = useTestStatus();
  const [disabled, setDisabled] = useState(true);
  const [connectedNetwork, setConnectedNetwork] = useState('');

  const onSwitchNetworks = wrapActionWithStatus(async () => {
    await updateNetwork(Alfajores);
  });

  useEffect(() => {
    setDisabled(!address);
  }, [address]);

  useEffect(() => {
    setConnectedNetwork(network.name);
  }, [network.name]);

  return (
    <TestBlock
      status={status}
      title="Switch network"
      disabledTest={disabledTest}
      onRunTest={onSwitchNetworks}
    >
      <Result status={status}>
        <Result.Default>
          <>
            <p>Currently connected to {connectedNetwork}.</p>
            <br />
            <p>Press the button above to connect to Alfajores network.</p>
          </>
        </Result.Default>
        <Result.Success>
          <SuccessIcon /> Switched to Alfajores
        </Result.Success>
        <Result.Error>{errorMessage}</Result.Error>
      </Result>
    </TestBlock>
  );
}
