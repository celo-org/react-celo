import React, { useEffect } from 'react';
import Loader from 'react-loader-spinner';
import Web3 from 'web3';

export function Metamask({ onSubmit }: { onSubmit: (x: any) => void }) {
  useEffect(() => {
    async function f() {
      // @ts-ignore
      if (window.celo) {
        // @ts-ignore
        const web3 = new Web3(window.celo);
        console.log(await web3.eth.getAccounts());
        onSubmit(web3);
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
