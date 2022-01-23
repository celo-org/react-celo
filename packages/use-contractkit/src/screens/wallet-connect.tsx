import QrCode from 'qrcode.react';
import React from 'react';
import { isAndroid, isMobile } from 'react-device-detect';
import { TailSpin } from 'react-loader-spinner';

import { CopyText } from '../components';
import { useWalletConnectConnector } from '../connectors/useWalletConnectConnector';
import { Connector } from '../types';

interface Props {
  onSubmit: (connector: Connector) => void;
}

export const WalletConnect: React.FC<Props> = ({ onSubmit }: Props) => {
  const uri = useWalletConnectConnector(onSubmit, isAndroid);

  return (
    <div className="tw-flex tw-flex-col tw-items-center">
      <h1 className="tw-text-lg dark:tw-text-gray-200 tw-font-medium">
        WalletConnect
      </h1>
      <div className="tw-w-64 md:w-80 tw-text-gray-600 dark:tw-text-gray-400 tw-text-sm tw-mt-2 tw-text-center">
        Scan the QR code below or copy-paste the information into your wallet.
      </div>

      <div className="tw-mt-6">
        {uri ? (
          <>
            <div>
              <QrCode value={uri} size={isMobile ? 180 : 240} />
              <div className="tw-mt-6 tw-flex tw-items-center tw-justify-center">
                <CopyText text="Copy to clipboard" payload={uri} />
              </div>
            </div>
          </>
        ) : (
          <div className="tw-my-8 tw-flex tw-items-center tw-justify-center">
            <TailSpin color="#666666" height="60px" width="60px" />
          </div>
        )}
      </div>
    </div>
  );
};
