import React, { useState } from 'react';

import { PrivateKeyConnector } from '../connectors';
import { useContractKit } from '../use-contractkit';
import { ConnectorProps } from '.';

export const PrivateKey: React.FC<ConnectorProps> = ({
  onSubmit,
}: ConnectorProps) => {
  const [value, setValue] = useState('');
  const { network, feeCurrency } = useContractKit();

  const handleSubmit = () => {
    if (!value) {
      return;
    }

    const connector = new PrivateKeyConnector(network, value, feeCurrency);
    void onSubmit(connector);
  };

  return (
    <div className="tw-p-2">
      <div className="tw-flex tw-flex-col">
        <div className="tw-text-xl tw-text-gray-800 dark:tw-text-gray-200">
          Enter your plaintext private key
        </div>
        <p className="tw-text-sm tw-mt-2 tw-text-gray-600 dark:tw-text-gray-400">
          This will be saved locally, so be sure to logout before leaving this
          computer unattended.
        </p>
        <div className="tw-flex tw-flex-col">
          <textarea
            className="tw-border tw-border-gray-300 dark:tw-border-gray-700 dark:tw-bg-gray-700 dark:tw-text-gray-300 tw-rounded-md tw-mt-3 tw-px-3 tw-py-2"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button
            className="tw-mt-3 tw-px-4 tw-py-2 tw-border tw-border-transparent tw-rounded-md tw-shadow-sm tw-text-base tw-font-medium tw-text-white tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 hover:tw-from-purple-700 hover:tw-to-indigo-700"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};
