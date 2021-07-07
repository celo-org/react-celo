import { WalletTypes } from '../constants';
import { Connector, Network } from '../types';
import {
  CeloExtensionWalletConnector,
  InjectedConnector,
  LedgerConnector,
  MetaMaskConnector,
  PrivateKeyConnector,
  UnauthenticatedConnector,
  WalletConnectConnector,
} from './connectors';

export * from './connectors';

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
  [WalletTypes.Valora]: WalletConnectConnector,
  [WalletTypes.WalletConnect]: WalletConnectConnector,
};
