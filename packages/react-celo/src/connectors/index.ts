import CeloExtensionWalletConnector from './celo-extension-wallet';
import CoinbaseWalletConnector from './coinbase-wallet';
import InjectedConnector from './injected';
import LedgerConnector from './ledger';
import MetaMaskConnector from './metamask';
import PrivateKeyConnector from './private-key';
import UnauthenticatedConnector from './unauthenticated';
import WalletConnectConnector from './wallet-connect';

export * from './connectors-by-name';

export {
  CeloExtensionWalletConnector,
  CoinbaseWalletConnector,
  InjectedConnector,
  LedgerConnector,
  MetaMaskConnector,
  PrivateKeyConnector,
  UnauthenticatedConnector,
  WalletConnectConnector,
};
