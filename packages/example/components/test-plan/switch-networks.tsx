import { MiniContractKit } from '@celo/contractkit/lib/mini-kit';
import { Alfajores, Mainnet, useCelo } from '@celo/react-celo';

import { SuccessIcon } from './success-icon';
import { Result, TestBlock } from './ui';
import { useDisabledTest } from './useDisabledTest';
import { useTestStatus } from './useTestStatus';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
// Hacky workaround to wait for the network to change.
const hasNetworkUpdated = async (
  kit: MiniContractKit,
  expectedChainId: number
) => {
  let attempts = 0;
  let isNetworkUpdated = false;
  while (!isNetworkUpdated) {
    attempts++;
    if (attempts >= 3) {
      throw new Error('Network did not change');
    }
    const chainId = await kit.connection.chainId();
    if (chainId === expectedChainId) {
      isNetworkUpdated = true;
      return;
    }
    await sleep(500);
  }
};

export function SwitchNetwork() {
  const { updateNetwork, kit } = useCelo();
  const { status, errorMessage, wrapActionWithStatus, setStatus } =
    useTestStatus();
  const [disabledTest, setDisabledTest] = useDisabledTest();

  const onSwitchNetworks = wrapActionWithStatus(async () => {
    setDisabledTest(true);
    await updateNetwork(Alfajores);

    try {
      await hasNetworkUpdated(kit, Alfajores.chainId);
      await updateNetwork(Mainnet);
      await hasNetworkUpdated(kit, Mainnet.chainId);
    } catch (error) {
      if (error instanceof Error) {
        setStatus.failed(error.message);
      } else {
        setStatus.failed('Update network did not succeed');
      }
    }
  });

  return (
    <TestBlock
      status={status}
      title="Switch network"
      disabledTest={disabledTest}
      onRunTest={onSwitchNetworks}
    >
      <Result status={status}>
        <Result.Default>
          <p>This test will switch networks (possibly twice).</p>
          <p>The last switch will be to go back to Mainnet.</p>
        </Result.Default>
        <Result.Success>
          <SuccessIcon /> Switching networks was successful
        </Result.Success>
        <Result.Error>{errorMessage}</Result.Error>
      </Result>
    </TestBlock>
  );
}
