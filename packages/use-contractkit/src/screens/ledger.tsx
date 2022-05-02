import React, { useState } from 'react';

import ConnectorScreen from '../components/connector-screen';
import Spinner from '../components/spinner';
import { LedgerConnector } from '../connectors';
import { useContractKitInternal } from '../use-contractkit';
import cls from '../utils/tailwind';
import { useIsMounted } from '../utils/useIsMounted';
import { ConnectorProps } from '.';

const styles = cls({
  disclaimer: `
    tw-mt-3
    tw-text-sm
    tw-text-slate-600
    dark:tw-text-slate-400`,
  container: `
    tw-list-disc
    tw-text-sm
    tw-text-slate-600
    tw-list-inside
    tw-mt-4`,
  accountInfo: `
    tw-text-sm
    tw-text-slate-600
    dark:tw-text-slate-400
    tw-mt-4`,
  error: `
    tw-mt-4
    tw-text-xs
    tw-text-red-600`,
  input: `tw-ml-1
    tw-text-center
    tw-text-slate-700
    dark:tw-text-slate-300
    tw-border
    border-light-slate-700
    dark:border-light-slate-300
    tw-rounded
    tw-outline-none
    focus:tw-outline-none`,
  button: `tw-mt-6
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
  spinnerContainer: `tw-flex
    tw-items-center
    tw-justify-center`,
});

export const Ledger = ({ onSubmit }: ConnectorProps) => {
  const {
    network,
    initConnector,
    initError: error,
    feeCurrency,
  } = useContractKitInternal();
  const [submitting, setSubmitting] = useState(false);
  const [index, setIndex] = useState('0');
  const isMountedRef = useIsMounted();

  const submit = async () => {
    setSubmitting(true);
    const connector = new LedgerConnector(
      network,
      parseInt(index, 10),
      feeCurrency
    );
    try {
      await initConnector(connector);
      onSubmit(connector);
    } catch (e) {
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  return (
    <ConnectorScreen
      title="Connect with your Ledger device"
      content={
        <div>
          <p className={styles.disclaimer}>
            Securely connect to your ledger device. Before proceeding, please
            ensure you have:
          </p>
          <ul className={styles.container}>
            <li>Connected your Ledger (via USB)</li>
            <li>Unlocked your Ledger</li>
            <li>
              Opened the{' '}
              <a
                href="https://docs.celo.org/celo-owner-guide/ledger"
                target="_blank"
                rel="noopener noreferrer"
              >
                Celo application
              </a>{' '}
            </li>
          </ul>

          <p className={styles.accountInfo}>
            Connect to account at index{' '}
            <input
              type="number"
              className={styles.input}
              style={{ width: '40px', background: 'unset' }}
              value={index}
              onChange={(e) => setIndex(e.target.value)}
              disabled={submitting}
            />
          </p>

          {error && <p className={styles.error}>{error.message}</p>}

          <button
            className={styles.button}
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? (
              <div className={styles.spinnerContainer}>
                <Spinner />
              </div>
            ) : (
              'Connect'
            )}
          </button>
        </div>
      }
      footer={{
        name: 'a Ledger',
        url: 'https://www.ledger.com/',
      }}
    />
  );
};
