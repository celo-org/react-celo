import React from 'react';
import { TailSpin } from 'react-loader-spinner';
import { ConnectorProps } from '.';
import { useInjectedConnector } from '../connectors/useMetaMaskConnector';
import { isEthereumFromMetamask } from '../utils/ethereum';

export const MetaMaskOrInjectedWallet: React.FC<ConnectorProps> = ({
  onSubmit,
}: ConnectorProps) => {
  const isMetaMask = isEthereumFromMetamask();
  const { error } = useInjectedConnector(onSubmit, isMetaMask);

  return (
    <div className="tw-flex tw-items-center tw-justify-center">
      {error ? (
        <p className="tw-text-red-500 tw-pb-4">{error.message}</p>
      ) : (
        <div className="tw-my-8 tw-flex tw-items-center tw-justify-center">
          <TailSpin color="#666666" height="60px" width="60px" />
        </div>
      )}
    </div>
  );
};
