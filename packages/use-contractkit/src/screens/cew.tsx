import React, { useCallback, useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { ConnectorProps } from '.';
import { CeloExtensionWalletConnector } from '../connectors';
import { useContractKitInternal } from '../use-contractkit';

export const CeloExtensionWallet: React.FC<ConnectorProps> = ({
  onSubmit,
}: ConnectorProps) => {
  const {
    network,
    initConnector,
    initError: error,
    feeCurrency,
  } = useContractKitInternal();

  const initialiseConnection = useCallback(async () => {
    const connector = new CeloExtensionWalletConnector(network, feeCurrency);
    await initConnector(connector);
    void onSubmit(connector);
  }, [initConnector, network, onSubmit, feeCurrency]);

  useEffect(() => {
    void initialiseConnection();
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
        <div className="tw-my-8 tw-flex tw-items-center tw-justify-center">
          <TailSpin color="#666666" height="60px" width="60px" />
        </div>
      )}
    </div>
  );
};
