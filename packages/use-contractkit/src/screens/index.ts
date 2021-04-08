import { FunctionComponent } from 'react';
import { SupportedProviders, WalletTypes } from '../constants';
import { Connector } from '../types';
import { Metamask } from './cew';
import { Ledger } from './ledger';
import { PrivateKey } from './private-key';
import { Valora } from './valora';
import { WalletConnect } from './wallet-connect';

const defaultScreens: {
  [P in SupportedProviders]?: FunctionComponent<{
    onSubmit: (connector: Connector) => Promise<void> | void;
  }>;
} = {
  [SupportedProviders.Ledger]: Ledger,
  [SupportedProviders.Valora]: Valora,
  [SupportedProviders.WalletConnect]: WalletConnect,
  // [SupportedProviders.MetaMask]: Metamask,
  [SupportedProviders.CeloExtensionWallet]: Metamask,
  [SupportedProviders.PrivateKey]: PrivateKey,
};

export default defaultScreens;
