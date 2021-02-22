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
    <div className="p-2">
      <div>
        <div className="flex">
          <div className="mr-4">
            <img
              src={
                'https://www.ledger.com/wp-content/uploads/2020/02/puce_blue.png'
              }
              style={{ height: '36px', minWidth: '36px' }}
            />
          </div>

          <div className="flex flex-col">
            <div className="text-lg mb-1">Ledger Connect</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Securely connect Celo Manager to your ledger device. Before
              proceeding, please ensure you have:
              <ul className="list-disc list-inside mt-2">
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
              className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
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
