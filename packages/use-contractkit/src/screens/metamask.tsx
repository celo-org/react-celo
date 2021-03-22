import React, { useEffect } from 'react';
import Loader from 'react-loader-spinner';

export function Metamask({ onSubmit }: { onSubmit: (x: any) => void }) {
  useEffect(() => {
    async function f() {
      const { default: Web3 } = await import('web3');

      // @ts-ignore
      const celo: any = window.celo;
      if (celo) {
        const web3 = new Web3(celo);
        celo.enable();
        onSubmit(web3);
      } else {
        console.warn('No Metamask extension installed');
      }
    }
    f();
  }, []);

  return (
    <div className="tw-flex tw-items-center tw-justify-center">
      <Loader type="TailSpin" color="white" height="36px" width="36px" />
    </div>
  );
}
