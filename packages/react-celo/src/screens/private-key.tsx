import React, { useCallback, useState } from 'react';

import Button from '../components/button';
import ConnectorScreen from '../components/connector-screen';
import { PrivateKeyConnector } from '../connectors';
import useTheme from '../hooks/use-theme';
import { useCelo, useCeloInternal } from '../use-celo';
import cls from '../utils/tailwind';
import { ConnectorProps } from '.';

const styles = cls({
  disclaimer: `
    tw-text-sm
    tw-mt-2`,
  textareaContainer: `
    tw-flex
    tw-flex-col`,
  textarea: `
    tw-border
    tw-rounded-md
    tw-mt-3
    tw-px-3
    tw-py-2
    tw-font-mono`,
  button: `
    tw-mt-3
    tw-px-4
    tw-py-2`,
});

export const PrivateKey = ({ onSubmit }: ConnectorProps) => {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const { network, feeCurrency, initConnector } = useCeloInternal();

  const handleSubmit = useCallback(async () => {
    if (!value) {
      return;
    }

    const connector = new PrivateKeyConnector(network, value, feeCurrency);
    await initConnector(connector);
    void onSubmit(connector);
  }, [feeCurrency, network, value, onSubmit, initConnector]);

  return (
    <ConnectorScreen
      title="Enter your plaintext private key"
      content={
        <div style={{ color: theme.textSecondary }}>
          <p className={styles.disclaimer}>
            This will be saved locally, so be sure to logout before leaving this
            computer unattended.
          </p>
          <div className={styles.textareaContainer}>
            <textarea
              className={styles.textarea}
              style={{ borderColor: theme.muted }}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <Button
              as="button"
              className={styles.button}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        </div>
      }
      footer={{
        desc: 'Not sure where to find your Private Key?',
        url: 'https://docs.celo.org/key-concepts',
        CTA: 'Learn',
      }}
    />
  );
};
