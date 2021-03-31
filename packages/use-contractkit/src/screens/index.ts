import { FunctionComponent } from 'react';
import { Connector, WalletTypes } from '../create-kit';
import { SupportedProviders } from '../types';
import { Ledger } from './ledger';
import { Metamask } from './cew';
import { PrivateKey } from './private-key';
import { Valora } from './valora';
import { WalletConnect } from './wallet-connect';

const screens: {
  [p in SupportedProviders]: FunctionComponent<{
    onSubmit: (x: {
      type: WalletTypes;
      connector: Connector;
    }) => Promise<void> | void;
  }>;
} = {
  [SupportedProviders.Ledger]: Ledger,
  [SupportedProviders.Valora]: Valora,
  [SupportedProviders.PrivateKey]: PrivateKey,
  [SupportedProviders.WalletConnect]: WalletConnect,
  [SupportedProviders.MetaMask]: Metamask,
};

export default screens;
