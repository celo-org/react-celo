import { CeloProvider, Mainnet } from '@celo/react-celo';
import React from 'react';

import { ConnectWalletCheck } from '../components/test-plan/connect-wallet';
import { SwitchNetwork } from '../components/test-plan/switch-networks';

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
        </div>
        <ConnectWalletCheck />
        <SwitchNetwork />
      </div>
    </CeloProvider>
  );
}
