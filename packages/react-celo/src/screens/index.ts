import { SupportedProviders } from '../constants';
import { Connector, WalletConnectProvider } from '../types';
import { CeloExtensionWallet } from './cew';
import { CoinbaseWallet } from './coinbase';
import { Ledger } from './ledger';
import { MetaMaskOrInjectedWallet } from './metamask';
import { PrivateKey } from './private-key';
import { WalletConnect } from './wallet-connect';

export const defaultScreens = {
  [SupportedProviders.Valora]: WalletConnect,
  [SupportedProviders.MetaMask]: MetaMaskOrInjectedWallet,
  [SupportedProviders.WalletConnect]: WalletConnect,
  [SupportedProviders.Ledger]: Ledger,
  [SupportedProviders.CeloWallet]: WalletConnect,
  [SupportedProviders.CeloDance]: WalletConnect,
  [SupportedProviders.CeloTerminal]: WalletConnect,
  [SupportedProviders.CeloExtensionWallet]: CeloExtensionWallet,
  [SupportedProviders.Steakwallet]: WalletConnect,
  [SupportedProviders.Injected]: MetaMaskOrInjectedWallet,
  [SupportedProviders.PrivateKey]: PrivateKey,
  [SupportedProviders.CoinbaseWallet]: CoinbaseWallet,
};

export type ConnectorProps = {
  onSubmit: (connector: Connector) => void;
  provider?: WalletConnectProvider;
};
