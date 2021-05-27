import QrCode from 'qrcode.react';
import React, { useCallback, useEffect, useState } from 'react';
import Loader from 'react-loader-spinner';
import { CopyText } from '../components';
import { WalletConnectConnector } from '../connectors';
import { Alfajores } from '../constants';
import { Connector } from '../types';
import { useContractKit } from '../use-contractkit';

export function WalletConnect({
  onSubmit,
}: {
  onSubmit: (connector: Connector) => void;
}) {
  const { network, dapp, destroy } = useContractKit();
  const [uri, setUri] = useState('');

  const initialiseConnection = useCallback(async () => {
    const relayProvider =
      network.name === Alfajores.name
        ? 'wss://walletconnect.celo-networks-dev.org'
        : 'wss://walletconnect.celo.org';
    const connector = new WalletConnectConnector(network, {
      connect: {
        metadata: {
          name: dapp.name,
          description: dapp.description,
          url: dapp.url,
          icons: [dapp.icon],
        },
      },
      init: {
        relayProvider,
        logger: 'error',
      },
    });

    connector.onUri((newUri) => setUri(newUri));
    connector.onClose(destroy);

    await connector.initialise();

    onSubmit(connector);
  }, [network, dapp]);

  useEffect(() => {
    initialiseConnection();
  }, [initialiseConnection]);

  return (
    <div className="tw-p-2">
      <div className="tw-text-lg dark:tw-text-gray-200 tw-font-medium">
        WalletConnect
      </div>
      <div className="tw-text-gray-600 dark:tw-text-gray-400 tw-text-sm tw-mt-2">
        By connecting with WalletConnect you'll need to scan the below QR code
        with the camera on your mobile device.
      </div>

      <div className="tw-w-full mt-4">
        {uri ? (
          <>
            {false /* mobile */ ? (
              <button className="tw-mt-3 tw-px-4 tw-py-2 tw-border tw-border-transparent tw-rounded-md tw-shadow-sm tw-text-base tw-font-medium tw-text-white tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 hover:tw-from-purple-700 hover:tw-to-indigo-700">
                Connect with WalletConnect
              </button>
            ) : (
              <div>
                <QrCode value={uri} className="tw-w-full tw-h-full" />
                <div className="tw-mt-4 tw-flex tw-items-center tw-justify-center">
                  <CopyText text="Copy to clipboard" payload={uri} />
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Loader type="TailSpin" color="white" height="36px" width="36px" />
          </div>
        )}
      </div>
    </div>
  );
}
