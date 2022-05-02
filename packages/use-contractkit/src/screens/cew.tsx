import React, { useCallback, useEffect } from 'react';

import ConnectorScreen from '../components/connector-screen';
import Spinner from '../components/spinner';
import { CeloExtensionWalletConnector } from '../connectors';
import { useContractKitInternal } from '../use-contractkit';
import cls from '../utils/tailwind';
import { ConnectorProps } from '.';

const styles = cls({
  container: `
    tw-my-8 
    tw-flex 
    tw-flex-col 
    tw-items-center 
    tw-justify-center 
    grid tw-gap-8 
    tw-flex-grow`,
  error: `
    tw-text-red-500 
    tw-text-md 
    tw-pb-4`,
  disclaimer: `
    tw-text-slate-500 
    tw-text-sm`,
});

export const CeloExtensionWallet = ({ onSubmit }: ConnectorProps) => {
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
    <ConnectorScreen
      title="Connect your Celo Extension Wallet"
      content={
        <div className={styles.container}>
          {error ? (
            <p className={styles.error}>{error.message}</p>
          ) : (
            <>
              <Spinner />
              <p className={styles.disclaimer}>
                No pop-up? Check your if your MetaMask extension is unlocked.
              </p>
            </>
          )}
        </div>
      }
      footer={{
        name: 'Celo Extension Wallet',
        url: 'https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en',
      }}
    />
  );
};
