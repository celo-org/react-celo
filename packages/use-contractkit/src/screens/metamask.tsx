import React, { useCallback, useEffect } from 'react';
import Loader from 'react-loader-spinner';

import { AddCeloNetworkButton } from '../components/AddCeloNetworkButton';
import { MetaMaskConnector, UnsupportedChainIdError } from '../connectors';
import { useInternalContractKit } from '../use-contractkit';
import { ConnectorProps } from '.';

export const MetaMaskWallet: React.FC<ConnectorProps> = ({
  onSubmit,
}: ConnectorProps) => {
  const {
    network,
    initConnector,
    initError: error,
    dapp,
  } = useInternalContractKit();

  const initialiseConnection = useCallback(async () => {
    const connector = new MetaMaskConnector(network);
    const { error } = await initConnector(connector);
    if (!error) {
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
      <div className="tw-space-y-6">
        <p className="tw-text-xl font-medium">Switch to the Celo Network</p>
        <p className="">
          In order to use {dapp.name} you must be connected to the Celo network.{' '}
          <a
            className="tw-underline tw-font-medium"
            target="_blank"
            href="https://docs.celo.org/getting-started/wallets/using-metamask-with-celo"
          >
            What does this mean?
          </a>
        </p>

        <div className="tw-flex tw-justify-center">
          <AddCeloNetworkButton chainId={network.chainId} />
        </div>
      </div>
    );
  }

  return (
    <div className="tw-flex tw-items-center tw-justify-center">
      {error ? (
        <p className="tw-text-red-500 tw-pb-4">{error.message}</p>
      ) : (
        <div className="tw-my-8 tw-flex tw-items-center tw-justify-center">
          <Loader type="TailSpin" color="#666666" height="60px" width="60px" />
        </div>
      )}
    </div>
  );
};
