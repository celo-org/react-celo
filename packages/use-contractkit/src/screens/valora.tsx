import React, { FunctionComponent, useEffect } from 'react';
import Loader from 'react-loader-spinner';
import { DappKitConnector } from '../connectors';
import { WalletTypes } from '../constants';
import { Connector } from '../types';
import { useContractKit } from '../use-contractkit';

export const Valora: FunctionComponent<any> = ({
  onSubmit,
}: {
  onSubmit: (x: { type: WalletTypes; connector: Connector }) => void;
}) => {
  const { network, dappName } = useContractKit();

  useEffect(() => {
    async function f() {
      const connector = new DappKitConnector(network, dappName);
      await connector.initialise();
      onSubmit({ type: WalletTypes.DappKit, connector });
    }
    f();
  }, [onSubmit]);

  return (
    <div className="tw-flex tw-items-center tw-justify-center">
      <Loader type="TailSpin" color="white" height="36px" width="36px" />
    </div>
  );
};
