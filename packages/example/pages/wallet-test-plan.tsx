import { CeloProvider, Mainnet } from '@celo/react-celo';
import React from 'react';

import { ConnectWalletCheck } from '../components/test-plan/connect-wallet';
import DisconnectButton from '../components/test-plan/disconnect-button';
import { SendTransaction } from '../components/test-plan/send-transaction';
import { SignTypedData } from '../components/test-plan/sign-typed-data';
import { SwitchNetwork } from '../components/test-plan/switch-networks';
import { UpdateFeeCurrency } from '../components/test-plan/update-fee-currency';

export default function WalletTestPlan(): React.ReactElement {
  return (
    <CeloProvider
      dapp={{
        name: 'Wallet test plan',
        description: 'Wallet test plan',
        url: 'https://react-celo.vercel.app/wallet-test-plan',
        icon: 'https://react-celo.vercel.app/favicon.ico',
      }}
      network={Mainnet}
      connectModal={{
        providersOptions: { searchable: true },
      }}
    >
      <div>
        <div className="font-semibold text-2xl">Wallet Test Plan</div>
        <div className="text-slate-600 mt-2">
          A set of steps to help verify how well a given wallet interacts with
          react-celo.
          <br />
          You will need to connect a wallet before being able to run any other
          test.
        </div>
        <div>
          <DisconnectButton />
        </div>
        <ConnectWalletCheck />
        <SwitchNetwork />
        <UpdateFeeCurrency />
        <SendTransaction />
        <SignTypedData />
      </div>
    </CeloProvider>
  );
}
