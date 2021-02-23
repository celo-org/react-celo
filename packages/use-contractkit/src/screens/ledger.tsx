import React, { FunctionComponent, useState } from 'react';
import Loader from 'react-loader-spinner';

export const Ledger: FunctionComponent<any> = ({
  onSubmit,
}: {
  onSubmit: () => Promise<void>;
}) => {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tw-p-2">
      <div>
        <div className="tw-flex">
          <div className="tw-mr-4">
            <img
              src={
                'https://www.ledger.com/wp-content/uploads/2020/02/puce_blue.png'
              }
              style={{ height: '36px', minWidth: '36px' }}
            />
          </div>

          <div className="tw-flex tw-flex-col">
            <div className="tw-text-lg tw-mb-1 tw-font-medium dark:tw-text-gray-200">
              Ledger Connect
            </div>
            <p className="tw-text-sm tw-text-gray-600 tw-dark:text-gray-400">
              Securely connect Celo Manager to your ledger device. Before
              proceeding, please ensure you have:
              <ul className="tw-list-disc tw-list-inside tw-mt-2">
                <li>Connected your Ledger (via USB)</li>
                <li>Unlocked your Ledger</li>
                <li>
                  Opened the{' '}
                  <a
                    href="https://docs.celo.org/celo-owner-guide/ledger"
                    target="_blank"
                  >
                    Celo application
                  </a>{' '}
                </li>
              </ul>
            </p>
            {error && (
              <p
                style={{
                  paddingBottom: '0.25em',
                  paddingTop: '0.75em',
                  fontSize: '0.7em',
                  color: 'red',
                }}
              >
                {error}
              </p>
            )}
            <button
              className="tw-mt-4 tw-px-4 tw-py-2 tw-border tw-border-transparent tw-rounded-md tw-shadow-sm tw-text-base tw-font-medium tw-text-white tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 hover:tw-from-purple-700 hover:tw-to-indigo-700"
              onClick={submit}
            >
              {submitting ? (
                <div>
                  <Loader
                    type="TailSpin"
                    color="white"
                    height={18}
                    width={18}
                  />
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
