import { FunctionComponent } from 'react';
import { SupportedProviders } from '../types';
import { Ledger } from './ledger';
import { Metamask } from './metamask';
import { PrivateKey } from './private-key';
import { Valora } from './valora';
import { WalletConnect } from './wallet-connect';

const screens: {
  [p in SupportedProviders]: FunctionComponent<{
    onSubmit: (args?: any) => Promise<void> | void;
  }>;
} = {
  [SupportedProviders.Ledger]: Ledger,
  [SupportedProviders.Valora]: Valora,
  [SupportedProviders.PrivateKey]: PrivateKey,
  [SupportedProviders.WalletConnect]: WalletConnect,
  [SupportedProviders.MetaMask]: Metamask,
};

export default screens;
