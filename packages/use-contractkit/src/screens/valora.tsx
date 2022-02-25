import QrCode from 'qrcode.react';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { TailSpin } from 'react-loader-spinner';

import { useWalletConnectConnector } from '../connectors/useWalletConnectConnector';
import { WalletIds } from '../constants';
import { Connector } from '../types';

interface Props {
  onSubmit: (connector: Connector) => void;
}

const getDeepLink = (uri: string) => {
  return `celo://wallet/wc?uri=${uri}`;
};

export const Valora: React.FC<Props> = ({ onSubmit }: Props) => {
  const uri = useWalletConnectConnector(
    onSubmit,
    isMobile,
    getDeepLink,
    WalletIds.Valora
  );

  return (
    <div className="tw-flex tw-flex-col tw-items-center">
      <h1 className="tw-text-lg dark:tw-text-gray-200 tw-font-medium">
        Valora
      </h1>
      <div className="tw-w-64 tw-text-gray-600 dark:tw-text-gray-400 tw-text-sm tw-mt-2 tw-text-center">
        {`Opening Valora Wallet. If it doesn't open, you can scan this QR code or if on a mobile device press 'Open'.`}
      </div>

      <div className="tw-mt-6 tw-mb-2">
        {uri ? (
          <>
            <QrCode value={uri} size={180} />
            <div className="tw-mt-6 tw-flex tw-items-center tw-justify-center">
              <a href={getDeepLink(uri)}>Open valora</a>
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
