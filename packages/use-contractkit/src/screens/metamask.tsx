import React from 'react';

import ConnectorScreen from '../components/connector-screen';
import Spinner from '../components/spinner';
import { useInjectedConnector } from '../connectors/useMetaMaskConnector';
import { PROVIDERS } from '../constants';
import { isEthereumFromMetamask } from '../utils/ethereum';
import cls from '../utils/tailwind';
import { ConnectorProps } from '.';

const styles = cls({
  container: `
    tw-my-8
    tw-flex
    tw-flex-col
    tw-items-center
    tw-justify-center
    grid
    tw-gap-8
    tw-flex-grow`,
  error: `
    tw-text-red-500
    tw-text-md
    tw-pb-4`,
  spinnerContainer: `
    tw-relative
    tw-gap-2
    tw-items-center
    tw-flex
    tw-flex-col`,
  disclaimer: `
    tw-text-center
    tw-text-slate-500
    tw-text-sm`,
});

const provider = PROVIDERS['MetaMask'];
export const MetaMaskOrInjectedWallet = ({ onSubmit }: ConnectorProps) => {
  const isMetaMask = isEthereumFromMetamask();
  const { error } = useInjectedConnector(onSubmit, isMetaMask);

  return (
    <ConnectorScreen
      title="Connect your MetaMask wallet"
      content={
        <div className={styles.container}>
          {error ? (
            <p className={styles.error}>{error.message}</p>
          ) : provider.canConnect() ? (
            <div className={styles.spinnerContainer}>
              <Spinner />
              <p className={styles.disclaimer}>
                No pop-up? Check your if your MetaMask extension is unlocked.
              </p>
            </div>
          ) : (
            <div>
              <p className={styles.disclaimer}>
                {provider.name} not detected.
                <br />
                Are you sure it is installed in this browser?
              </p>
            </div>
          )}
        </div>
      }
      footer={{ name: 'MetaMask', url: 'https://metamask.io/' }}
    />
  );
};
