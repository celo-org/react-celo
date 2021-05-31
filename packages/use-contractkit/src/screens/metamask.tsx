import React, { useCallback, useEffect } from 'react';
import Loader from 'react-loader-spinner';
import { CeloExtensionWalletConnector, InjectedConnector } from '../connectors';
import { useContractKit } from '../use-contractkit';

export function MetaMaskWallet({
  onSubmit,
}: {
  onSubmit: (connector: InjectedConnector) => void;
}) {
  const { network } = useContractKit();

  const initialiseConnection = useCallback(async () => {
    const connector = new InjectedConnector(network);
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
}
