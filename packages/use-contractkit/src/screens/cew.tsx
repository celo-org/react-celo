import React, { useCallback, useEffect } from 'react';
import Loader from 'react-loader-spinner';
import { CeloExtensionWalletConnector } from '../connectors';
import { useContractKit } from '../use-contractkit';

export function CeloExtensionWallet({
  onSubmit,
}: {
  onSubmit: (connector: CeloExtensionWalletConnector) => void;
}) {
  const { network } = useContractKit();

  const initialiseConnection = useCallback(async () => {
    const connector = new CeloExtensionWalletConnector(network);
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
