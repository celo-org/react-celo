import React from 'react';

import ConnectorScreen from '../components/connector-screen';
import { useCeloInternal } from '../use-celo';
import cls from '../utils/tailwind';
import useTheme from '../utils/useTheme';

const styles = cls({
  list: `
    tw-list-disc
    tw-pl-8
    tw-pt-2`,
  container: `
    tw-text-sm`,
});

export default function Placeholder() {
  const { dapp } = useCeloInternal();
  const theme = useTheme();

  return (
    <ConnectorScreen
      title="Choose your wallet"
      content={
        <div
          className={styles.container}
          style={{ color: theme.textSecondary }}
        >
          Wallets are tools that create accounts, manage keys, and help users
          transact on the Celo network.
          <br />
          <br />
          In order to interact with{' '}
          <span style={{ color: theme.primary }}>{dapp.name}</span>
          , you will need to connect your wallet.
          <br />
          Connecting your wallet means a couple things:
          <ul className={styles.list}>
            <li>
              You will <strong>not</strong> give control of your assets or keys.
            </li>
            <li>You will grant read access the assets you own.</li>
            <li>
              You will still need to verify and sign the pending operations.
            </li>
          </ul>
        </div>
      }
      footer={{
        desc: `Don't have a wallet yet?`,
        url: 'https://docs.celo.org/getting-started/wallets#celo-compatible-wallets',
        CTA: 'Learn',
      }}
    />
  );
}
