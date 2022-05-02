import React, { useCallback, useState } from 'react';

import ConnectorScreen from '../components/connector-screen';
import { PrivateKeyConnector } from '../connectors';
import { useContractKit } from '../use-contractkit';
import cls from '../utils/tailwind';
import { ConnectorProps } from '.';

const styles = cls({
  disclaimer: `
    tw-text-sm 
    tw-mt-2 
    tw-text-slate-600 dark:tw-text-slate-400`,
  textareaContainer: `
    tw-flex 
    tw-flex-col`,
  textarea: `
    tw-border 
    tw-border-slate-300 
    dark:tw-border-slate-700 
    dark:tw-bg-slate-700 
    dark:tw-text-slate-300 
    tw-rounded-md 
    tw-mt-3 
    tw-px-3 
    tw-py-2 
    tw-font-mono`,
  button: `
    tw-mt-3 
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
    tw-to-indigo-600 hover:tw-from-purple-700 hover:tw-to-indigo-700`,
});

export const PrivateKey = ({ onSubmit }: ConnectorProps) => {
  const [value, setValue] = useState('');
  const { network, feeCurrency } = useContractKit();

  const handleSubmit = useCallback(() => {
    if (!value) {
      return;
    }

    const connector = new PrivateKeyConnector(network, value, feeCurrency);
    void onSubmit(connector);
  }, [feeCurrency, network, value, onSubmit]);

  return (
    <ConnectorScreen
      title="Enter your plaintext private key"
      content={
        <div>
          <p className={styles.disclaimer}>
            This will be saved locally, so be sure to logout before leaving this
            computer unattended.
          </p>
          <div className={styles.textareaContainer}>
            <textarea
              className={styles.textarea}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <button className={styles.button} onClick={handleSubmit}>
              Submit
            </button>
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
