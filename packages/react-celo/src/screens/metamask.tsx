import React from 'react';
import { isMobile } from 'react-device-detect';

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
  button: `
    tw-mt-6
    tw-px-4
    tw-py-2
    tw-border
    tw-border-transparent
    tw-rounded-md
    tw-shadow-sm
    tw-text-base
    tw-font-medium
    tw-text-white
    tw-bg-gradient-to-r
    tw-from-purple-600
    tw-to-indigo-600
    hover:tw-from-purple-700
    hover:tw-to-indigo-700`,
});

const provider = PROVIDERS['MetaMask'];
export const MetaMaskOrInjectedWallet = ({ onSubmit }: ConnectorProps) => {
  const isMetaMask = isEthereumFromMetamask();
  const { error } = useInjectedConnector(onSubmit, isMetaMask);

  let content: React.ReactElement;

  if (isMobile) {
    content = (
      <a
        href={provider.installURL}
        target="_blank"
        rel="noreferrer"
        className={styles.button}
      >
        {provider.description}
      </a>
    );
  } else {
    if (error) {
      content = <p className={styles.error}>{error.message}</p>;
    } else if (provider.canConnect()) {
      content = (
        <div className={styles.spinnerContainer}>
          <Spinner />
          <p className={styles.disclaimer}>
            No pop-up? Check your if your MetaMask extension is unlocked.
          </p>
        </div>
      );
    } else {
      content = (
        <div>
          <p className={styles.disclaimer}>
            {provider.name} not detected.
            <br />
            Are you sure it is installed in this browser?
          </p>
        </div>
      );
    }
  }

  return (
    <ConnectorScreen
      title="Connect your MetaMask wallet"
      content={<div className={styles.container}>{content}</div>}
      footer={{ name: 'MetaMask', url: provider.installURL as string }}
    />
  );
};
