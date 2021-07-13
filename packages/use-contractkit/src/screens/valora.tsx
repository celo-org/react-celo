import QrCode from 'qrcode.react';
import React, { useCallback } from 'react';
import { isIOS, isMobile } from 'react-device-detect';
import Loader from 'react-loader-spinner';

import { useWalletConnectConnector } from '../connectors/useWalletConnectConnector';
import { Connector } from '../types';

interface Props {
  onSubmit: (connector: Connector) => void;
}

export const Valora: React.FC<Props> = ({ onSubmit }: Props) => {
  const getDeepLink = useCallback((uri: string) => {
    return isIOS
      ? `celo://wallet/wc?uri=${encodeURIComponent(uri)}`
      : `wc:${encodeURIComponent(uri)}`;
  }, []);
  const uri = useWalletConnectConnector(onSubmit, isMobile, getDeepLink);

  return (
    <div className="tw-flex tw-flex-col tw-items-center">
      <h1 className="tw-text-lg dark:tw-text-gray-200 tw-font-medium">
        Valora
      </h1>
      <div className="tw-w-64 tw-text-gray-600 dark:tw-text-gray-400 tw-text-sm tw-mt-2 tw-text-center">
        {`Opening Valora Wallet. If it doesn't open, you can scan this QR code.`}
      </div>

      <div className="tw-mt-6 tw-mb-2">
        {uri ? (
          <QrCode value={uri} size={180} />
        ) : (
          <div className="tw-my-8 tw-flex tw-items-center tw-justify-center">
            <Loader
              type="TailSpin"
              color="#666666"
              height="60px"
              width="60px"
            />
          </div>
        )}
      </div>
    </div>
  );
};
