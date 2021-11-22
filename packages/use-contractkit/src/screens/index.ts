import React from 'react';

import { SupportedProviders } from '../constants';
import { Connector } from '../types';
import { CeloExtensionWallet } from './cew';
import { Ledger } from './ledger';
import { MetaMaskOrInjectedWallet } from './metamask';
import { PrivateKey } from './private-key';
import { WalletConnect } from './wallet-connect';

export const defaultScreens: {
  [P in SupportedProviders]: React.FC<ConnectorProps>;
} = {
  [SupportedProviders.MetaMask]: MetaMaskOrInjectedWallet,
  [SupportedProviders.WalletConnect]: WalletConnect,
  [SupportedProviders.Ledger]: Ledger,
  [SupportedProviders.CeloExtensionWallet]: CeloExtensionWallet,
  [SupportedProviders.Injected]: MetaMaskOrInjectedWallet,
  [SupportedProviders.PrivateKey]: PrivateKey,
};

export type ConnectorProps = {
  onSubmit: (connector: Connector) => void;
};
