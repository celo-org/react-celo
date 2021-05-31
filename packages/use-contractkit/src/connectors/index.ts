import { WalletTypes } from '../constants';
import { Connector, Network } from '../types';
import {
  CeloExtensionWalletConnector,
  DappKitConnector,
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
  [x in WalletTypes]: new (n: Network, ...args: any[]) => Connector;
} = {
  [WalletTypes.Unauthenticated]: UnauthenticatedConnector,
  [WalletTypes.PrivateKey]: PrivateKeyConnector,
  [WalletTypes.Ledger]: LedgerConnector,
  [WalletTypes.WalletConnect]: WalletConnectConnector,
  [WalletTypes.CeloExtensionWallet]: CeloExtensionWalletConnector,
  [WalletTypes.MetaMask]: MetaMaskConnector,
  [WalletTypes.Injected]: InjectedConnector,
  [WalletTypes.DappKit]: DappKitConnector,
};
