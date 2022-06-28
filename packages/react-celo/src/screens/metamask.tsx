import React from 'react';
import { isMobile } from 'react-device-detect';

import Button from '../components/button';
import ConnectorScreen from '../components/connector-screen';
import Spinner from '../components/spinner';
import { PROVIDERS } from '../constants';
import { useInjectedConnector } from '../hooks/use-injected-connector';
import useTheme from '../hooks/use-theme';
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
    tw-text-sm`,
  button: `
    tw-mt-6
    tw-px-4
    tw-py-2`,
});

const provider = PROVIDERS['MetaMask'];
export const MetaMaskOrInjectedWallet = ({ onSubmit }: ConnectorProps) => {
  const theme = useTheme();
  const isMetaMask = isEthereumFromMetamask();
  const { error } = useInjectedConnector(onSubmit, isMetaMask);

  let content: React.ReactElement;

  if (isMobile) {
    content = (
      <Button
        as="a"
        href={provider.installURL}
        target="_blank"
        rel="noreferrer"
        className={styles.button}
      >
        {provider.description}
      </Button>
    );
  } else {
    if (error) {
      content = (
        <p className={styles.error} style={{ color: theme.error }}>
          {error.message}
        </p>
      );
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
          <p
            className={styles.disclaimer}
            style={{ color: theme.textSecondary }}
          >
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
