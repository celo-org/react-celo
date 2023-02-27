import { SupportedProviders } from '../constants';
import { Connector, WalletConnectProvider } from '../types';
import { CoinbaseWallet } from './coinbase';
import { Ledger } from './ledger';
import { MetaMaskOrInjectedWallet } from './metamask';
import { PrivateKey } from './private-key';
import { WalletConnect } from './wallet-connect';

export const defaultScreens: {
  [K in SupportedProviders]: React.FC<ConnectorProps>;
} = {
  [SupportedProviders.Valora]: WalletConnect,
  [SupportedProviders.MetaMask]: MetaMaskOrInjectedWallet,
  [SupportedProviders.WalletConnect]: WalletConnect,
  [SupportedProviders.Ledger]: Ledger,
  [SupportedProviders.CeloWallet]: WalletConnect,
  [SupportedProviders.CeloDance]: WalletConnect,
  [SupportedProviders.CeloTerminal]: WalletConnect,
  [SupportedProviders.Omni]: WalletConnect,
  [SupportedProviders.Injected]: MetaMaskOrInjectedWallet,
  [SupportedProviders.PrivateKey]: PrivateKey,
  [SupportedProviders.CoinbaseWallet]: CoinbaseWallet,
};

export type ConnectorProps = {
  onSubmit: (connector: Connector) => void;
  provider: WalletConnectProvider;
};
