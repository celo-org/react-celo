import React, { useCallback, useEffect, useState } from 'react';
import Loader from 'react-loader-spinner';
import { MetaMaskConnector } from '../connectors';
import { useContractKit } from '../use-contractkit';

export function MetaMaskWallet({
  onSubmit,
}: {
  onSubmit: (connector: MetaMaskConnector) => void;
}) {
  const { network } = useContractKit();
  const [error, setError] = useState('');

  const initialiseConnection = useCallback(async () => {
    const connector = new MetaMaskConnector(network);
    try {
      await connector.initialise();
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      onSubmit(connector);
    }
  }, [onSubmit]);

  useEffect(() => {
    initialiseConnection();
  }, [initialiseConnection]);

  return (
    <div className="tw-flex tw-items-center tw-justify-center">
      {error ? (
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
      ) : (
        <Loader type="TailSpin" color="white" height="36px" width="36px" />
      )}
    </div>
  );
}
