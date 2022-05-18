import React from 'react';

import ConnectorScreen from '../components/connector-screen';
import { useCeloInternal } from '../use-celo';
import cls from '../utils/tailwind';

const styles = cls({
  dappName: `
    tw-text-indigo-500`,
  list: `
    tw-list-disc
    tw-pl-8
    tw-pt-2`,
  container: `
    tw-text-slate-900
    tw-text-sm
    dark:tw-text-slate-300`,
});

export default function Placeholder() {
  const { dapp } = useCeloInternal();
  return (
    <ConnectorScreen
      title="Choose your wallet"
      content={
        <div className={styles.container}>
          Wallets are tools that create accounts, manage keys, and help users
          transact on the Celo network.
          <br />
          <br />
          In order to interact with{' '}
          <span className={styles.dappName}>{dapp.name}</span>, you will need to
          connect your wallet.
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
