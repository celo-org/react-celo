import { Alfajores, Mainnet, useCelo } from '@celo/react-celo';
import { useEffect, useState } from 'react';

import { SuccessIcon } from './success-icon';
import { Result, TestBlock } from './ui';
import { useDisabledTest } from './useDisabledTest';
import { Status, useTestStatus } from './useTestStatus';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export function SwitchNetwork() {
  const { updateNetwork, network, kit } = useCelo();
  const { status, errorMessage, wrapActionWithStatus, setStatus } =
    useTestStatus();
  const [disabledTest, setDisabledTest] = useDisabledTest();
  const [connectedNetwork, setConnectedNetwork] = useState('');

  const onSwitchNetworks = wrapActionWithStatus(async () => {
    setDisabledTest(true);
    await updateNetwork(Alfajores);

    // Hacky workaround to wait for the network to change.
    const hasNetworkUpdated = async () => {
      let attempts = 0;
      let isNetworkUpdated = false;
      while (!isNetworkUpdated) {
        attempts++;
        if (attempts >= 3) {
          throw new Error('Network did not change');
        }
        const chainId = await kit.connection.chainId();
        if (chainId === Alfajores.chainId) {
          isNetworkUpdated = true;
          return;
        }
        await sleep(500);
      }
    };

    try {
      await hasNetworkUpdated();
      await updateNetwork(Mainnet);
    } catch (error) {
      if (error instanceof Error) {
        setStatus.error(error.message);
      } else {
        console.log('error', error);
        setStatus.error('Update network did not succeed');
      }
    }
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
          <SuccessIcon /> Switching networks was successful
        </Result.Success>
        <Result.Error>{errorMessage}</Result.Error>
      </Result>
    </TestBlock>
  );
}
