import React, { FunctionComponent, useCallback, useEffect } from 'react';
import Loader from 'react-loader-spinner';
import { DappKitConnector } from '../connectors';
import { WalletTypes } from '../constants';
import { Connector } from '../types';
import { useContractKit } from '../use-contractkit';

export const Valora: FunctionComponent<any> = ({
  onSubmit,
}: {
  onSubmit: (connector: DappKitConnector) => void;
}) => {
  const { network, dappName } = useContractKit();

  const initialiseConnection = useCallback(async () => {
    const connector = new DappKitConnector(network, dappName);
    await connector.initialise();

    onSubmit(connector);
  }, [onSubmit]);

  useEffect(() => {
    initialiseConnection();
  }, [initialiseConnection]);

  return (
    <div className="tw-flex tw-items-center tw-justify-center">
      <Loader type="TailSpin" color="white" height="36px" width="36px" />
    </div>
  );
};
