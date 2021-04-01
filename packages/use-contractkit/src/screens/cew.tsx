import React, { useEffect } from 'react';
import Loader from 'react-loader-spinner';
import { CeloExtensionWalletConnector } from '../connectors';
import { WalletTypes } from '../constants';
import { useContractKit } from '../use-contractkit';

export function Metamask({ onSubmit }: { onSubmit: (x: any) => void }) {
  const { network } = useContractKit();

  useEffect(() => {
    async function f() {
      const connector = new CeloExtensionWalletConnector(network);
      await connector.initialise();
      onSubmit({ type: WalletTypes.CeloExtensionWallet, connector });
    }
    f();
  }, []);

  return (
    <div className="tw-flex tw-items-center tw-justify-center">
      <Loader type="TailSpin" color="white" height="36px" width="36px" />
    </div>
  );
}
