import React, { useCallback, useEffect } from 'react';
import Loader from 'react-loader-spinner';
import { CeloExtensionWalletConnector } from '../connectors';
import { useInternalContractKit } from '../use-contractkit';

export function CeloExtensionWallet({
  onSubmit,
}: {
  onSubmit: (connector: CeloExtensionWalletConnector) => void;
}) {
  const { network, initConnector, initError: error } = useInternalContractKit();

  const initialiseConnection = useCallback(async () => {
    const connector = new CeloExtensionWalletConnector(network);
    await initConnector(connector);
    onSubmit(connector);
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
          {error.message}
        </p>
      ) : (
        <Loader type="TailSpin" color="white" height="36px" width="36px" />
      )}
    </div>
  );
}
