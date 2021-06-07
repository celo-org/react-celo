import { FunctionComponent } from 'react';

import { SupportedProviders } from '../constants';
import { Connector } from '../types';
import { CeloExtensionWallet } from './cew';
import { Ledger } from './ledger';
import { MetaMaskWallet } from './metamask';
import { PrivateKey } from './private-key';
import { WalletConnect } from './wallet-connect';

export const defaultScreens: {
  [P in SupportedProviders]: FunctionComponent<{
    onSubmit: (connector: Connector) => Promise<void> | void;
  }>;
} = {
  [SupportedProviders.CeloExtensionWallet]: CeloExtensionWallet,
  [SupportedProviders.Ledger]: Ledger,
  [SupportedProviders.MetaMask]: MetaMaskWallet,
  [SupportedProviders.Injected]: MetaMaskWallet,
  [SupportedProviders.PrivateKey]: PrivateKey,
  [SupportedProviders.Valora]: WalletConnect,
  [SupportedProviders.WalletConnect]: WalletConnect,
};
