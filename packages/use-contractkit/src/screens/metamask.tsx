import React from 'react';
import Loader from 'react-loader-spinner';

import { AddCeloNetworkButton } from '../components/AddCeloNetworkButton';
import { UnsupportedChainIdError } from '../connectors';
import { useInjectedConnector } from '../connectors/useMetaMaskConnector';
import { ConnectorProps } from '.';

export const MetaMaskOrInjectedWallet: React.FC<ConnectorProps> = ({
  onSubmit,
}: ConnectorProps) => {
  const isMetamask = !!window.ethereum?.isMetaMask;
  const { error, dapp, network } = useInjectedConnector(onSubmit, isMetamask);
  if (error?.name === UnsupportedChainIdError.NAME) {
    return (
      <div className="tw-space-y-6">
        <p className="tw-text-xl font-medium dark:tw-text-gray-300">
          Switch to the Celo Network
        </p>
        <p className="dark:tw-text-gray-400">
          In order to use {dapp.name} you must be connected to the Celo network.{' '}
          {isMetamask && (
            <a
              className="tw-underline tw-font-medium"
              target="_blank"
              rel="noreferrer"
              href="https://docs.celo.org/getting-started/wallets/using-metamask-with-celo"
            >
              What does this mean?
            </a>
          )}
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
