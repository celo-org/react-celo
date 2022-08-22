import { WalletTypes } from '../constants';
import { Connector, Network } from '../types';
import CeloExtensionWalletConnector from './celo-extension-wallet';
import CoinbaseWalletConnector from './coinbase-wallet';
import InjectedConnector from './injected';
import LedgerConnector from './ledger';
import MetaMaskConnector from './metamask';
import PrivateKeyConnector from './private-key';
import UnauthenticatedConnector from './unauthenticated';
import WalletConnectConnector from './wallet-connect';

/**
 * Connectors for each wallet.
 */
export const CONNECTOR_TYPES: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x in WalletTypes]: new (n: Network, ...args: any[]) => Connector;
} = {
  [WalletTypes.CeloExtensionWallet]: CeloExtensionWalletConnector,
  [WalletTypes.Injected]: InjectedConnector,
  [WalletTypes.Ledger]: LedgerConnector,
  [WalletTypes.MetaMask]: MetaMaskConnector,
  [WalletTypes.PrivateKey]: PrivateKeyConnector,
  [WalletTypes.Unauthenticated]: UnauthenticatedConnector,
  [WalletTypes.WalletConnect]: WalletConnectConnector,
  // TODO: only show these ones dynamically depending on the which wallets run on our blockchain (eip155:42220)
  [WalletTypes.Valora]: WalletConnectConnector,
  [WalletTypes.CeloDance]: WalletConnectConnector,
  [WalletTypes.CeloTerminal]: WalletConnectConnector,
  [WalletTypes.CeloWallet]: WalletConnectConnector,
  [WalletTypes.CoinbaseWallet]: CoinbaseWalletConnector,
};
