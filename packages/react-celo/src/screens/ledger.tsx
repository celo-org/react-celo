import React, { useState } from 'react';

import Button from '../components/button';
import ConnectorScreen from '../components/connector-screen';
import Spinner from '../components/spinner';
import { LedgerConnector } from '../connectors';
import { useIsMounted } from '../hooks/use-is-mounted';
import useTheme from '../hooks/use-theme';
import { useCeloInternal } from '../use-celo';
import cls from '../utils/tailwind';
import { ConnectorProps } from '.';

const styles = cls({
  disclaimer: `
    tw-mt-3
    tw-text-sm`,
  container: `
    tw-list-disc
    tw-text-sm
    tw-list-inside
    tw-mt-4`,
  accountInfo: `
    tw-text-sm
    tw-mt-4`,
  error: `
    tw-mt-4
    tw-text-xs`,
  input: `
    tw-ml-1
    tw-text-center
    tw-border
    tw-rounded
    tw-outline-none
    focus:tw-outline-none
    tw-text-current`,
  button: `
    tw-mt-6
    tw-px-4
    tw-py-2
    tw-w-full`,
  spinnerContainer: `
    tw-mt-5
    tw-w-full
    tw-flex
    tw-justify-center`,
});

export const Ledger = ({ onSubmit }: ConnectorProps) => {
  const {
    network,
    initConnector,
    initError: error,
    feeCurrency,
  } = useCeloInternal();
  const theme = useTheme();
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
        <div style={{ color: theme.textSecondary }}>
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

          {submitting ? (
            <div className={styles.spinnerContainer}>
              <Spinner />
            </div>
          ) : (
            <Button
              as="button"
              className={styles.button}
              onClick={submit}
              disabled={submitting}
            >
              Connect
            </Button>
          )}

          {error && (
            <p className={styles.error} style={{ color: theme.error }}>
              {error.message}
            </p>
          )}
        </div>
      }
      footer={{
        name: 'a Ledger',
        url: 'https://www.ledger.com/',
      }}
    />
  );
};
