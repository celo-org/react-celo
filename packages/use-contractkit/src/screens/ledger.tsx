import React, { useState } from 'react';
import { TailSpin } from 'react-loader-spinner';

import { LedgerConnector } from '../connectors';
import { useContractKitInternal } from '../use-contractkit';
import { useIsMounted } from '../utils/useIsMounted';
import { ConnectorProps } from '.';

export const Ledger: React.FC<ConnectorProps> = ({
  onSubmit,
}: ConnectorProps) => {
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
    <div className="tw-p-2">
      <div>
        <div className="tw-flex">
          <div className="tw-flex tw-flex-col">
            <div className="tw-text-lg tw-mb-1 tw-font-medium dark:tw-text-gray-200 tw-text-center">
              Ledger Connect
            </div>
            <p className="tw-mt-3 tw-text-sm tw-text-gray-600 dark:tw-text-gray-400">
              Securely connect to your ledger device. Before proceeding, please
              ensure you have:
            </p>
            <ul className="tw-list-disc tw-text-sm tw-text-gray-600 tw-list-inside tw-mt-4">
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

            <p className="tw-text-sm tw-text-gray-600 dark:tw-text-gray-400 tw-mt-4">
              Connect to account at index{' '}
              <input
                type="number"
                className="tw-ml-1 tw-text-center tw-text-gray-700 dark:tw-text-gray-300 tw-border border-light-gray-700 dark:border-light-gray-300 tw-rounded tw-outline-none focus:tw-outline-none"
                style={{ width: '40px', background: 'unset' }}
                value={index}
                onChange={(e) => setIndex(e.target.value)}
                disabled={submitting}
              />
            </p>

            {error && (
              <p className="tw-mt-4 tw-text-xs tw-text-red-600">
                {error.message}
              </p>
            )}

            <button
              className="tw-mt-6 tw-px-4 tw-py-2 tw-border tw-border-transparent tw-rounded-md tw-shadow-sm tw-text-base tw-font-medium tw-text-white tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 hover:tw-from-purple-700 hover:tw-to-indigo-700"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? (
                <div className="tw-flex tw-items-center tw-justify-center">
                  <TailSpin color="white" height={24} width={24} />
                </div>
              ) : (
                'Connect'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
