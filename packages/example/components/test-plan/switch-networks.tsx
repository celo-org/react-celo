import { Alfajores, useCelo } from '@celo/react-celo';
import { useEffect, useState } from 'react';

import { PrimaryButton } from '../buttons';
import { SuccessIcon } from './success-icon';
import { Header, Result, TestBlock } from './ui';
import { useTestStatus } from './useTestStatus';

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
    <TestBlock status={status}>
      <Header>Switch network</Header>
      <PrimaryButton onClick={onSwitchNetworks} disabled={disabled}>
        Test switching networks
      </PrimaryButton>
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
