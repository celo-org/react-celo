import React from 'react';

import ConnectorScreen from '../components/connector-screen';
import Spinner from '../components/spinner';
import { PROVIDERS } from '../constants';
import { useCoinbaseWalletConnector } from '../hooks/use-coinbase-wallet-connector';
import useTheme from '../hooks/use-theme';
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

const provider = PROVIDERS['Coinbase Wallet'];
export const CoinbaseWallet = ({ onSubmit }: ConnectorProps) => {
  const theme = useTheme();
  const { error } = useCoinbaseWalletConnector(onSubmit);

  let content: React.ReactElement;

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
          No pop-up? Check your if your Coinbase Wallet extension is unlocked.
        </p>
      </div>
    );
  } else {
    content = (
      <div>
        <p className={styles.disclaimer} style={{ color: theme.textSecondary }}>
          {provider.name} not detected.
          <br />
          Are you sure it is installed in this browser?
        </p>
      </div>
    );
  }

  return (
    <ConnectorScreen
      title="Connect your Coinbase wallet"
      content={<div className={styles.container}>{content}</div>}
      footer={{ name: 'Coinbase Wallet', url: '' }}
    />
  );
};
