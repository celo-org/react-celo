import React, { useCallback, useEffect } from 'react';
import Loader from 'react-loader-spinner';

import { AddCeloNetworkButton } from '../components/AddCeloNetworkButton';
import { MetaMaskConnector, UnsupportedChainIdError } from '../connectors';
import { useInternalContractKit } from '../use-contractkit';
import { ConnectorProps } from '.';

export const MetaMaskWallet: React.FC<ConnectorProps> = ({
  onSubmit,
}: ConnectorProps) => {
  const { network, initConnector, initError: error } = useInternalContractKit();

  const initialiseConnection = useCallback(async () => {
    const connector = new MetaMaskConnector(network);
    const { error } = await initConnector(connector);
    if (!error) {
      console.log('no error', { error });
      await onSubmit(connector);
    } else {
      console.log('error', { error });
    }
  }, [initConnector, network, onSubmit]);

  useEffect(() => {
    void initialiseConnection();
  }, [initialiseConnection]);

  if (error?.name === UnsupportedChainIdError.NAME) {
    return (
      <div className="tw-flex tw-items-center tw-justify-center tw-flex-col">
        <p className="tw-text-red-500 tw-pb-4">
          Please connect to the Celo network to continue.
        </p>
        <AddCeloNetworkButton chainId={network.chainId} />
      </div>
    );
  }

  return (
    <div className="tw-flex tw-items-center tw-justify-center">
      {error ? (
        <p className="tw-text-red-500 tw-pb-4">{error.message}</p>
      ) : (
        <Loader type="TailSpin" color="white" height="36px" width="36px" />
      )}
    </div>
  );
};
