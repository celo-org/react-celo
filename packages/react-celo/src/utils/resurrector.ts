/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CeloContract } from '@celo/contractkit';

import {
  CeloExtensionWalletConnector,
  CoinbaseWalletConnector,
  InjectedConnector,
  LedgerConnector,
  MetaMaskConnector,
  PrivateKeyConnector,
  WalletConnectConnector,
} from '../connectors';
import { buildOptions } from '../connectors/wallet-connect';
import { localStorageKeys, WalletTypes } from '../constants';
import { Dapp, Network } from '../types';
import { getTypedStorageKey } from './local-storage';
import { getApplicationLogger } from './logger';

export function resurrector(
  networks: Network[],
  dapp: Dapp,
  manualNetworkingMode: boolean
) {
  const walletType = getTypedStorageKey(localStorageKeys.lastUsedWalletType);
  const network = getNetwork(networks);

  if (!walletType || !network) return null;
  getApplicationLogger().log(
    '[resurrector] will create',
    walletType,
    'with',
    network,
    dapp
  );
  try {
    switch (walletType) {
      case WalletTypes.Ledger: {
        const index = getTypedStorageKey(localStorageKeys.lastUsedIndex);

        if (index === null) return null;

        return new LedgerConnector(network, index, CeloContract.GoldToken);
      }
      case WalletTypes.CeloExtensionWallet:
        return new CeloExtensionWalletConnector(
          network,
          CeloContract.GoldToken
        );
      case WalletTypes.MetaMask:
        return new MetaMaskConnector(network, manualNetworkingMode);
      case WalletTypes.Injected:
        return new InjectedConnector(network, manualNetworkingMode);
      case WalletTypes.PrivateKey: {
        const privateKey = getTypedStorageKey(
          localStorageKeys.lastUsedPrivateKey
        );
        return new PrivateKeyConnector(
          network,
          privateKey as string,
          CeloContract.GoldToken
        );
      }
      case WalletTypes.CoinbaseWallet:
        return new CoinbaseWalletConnector(network, manualNetworkingMode, dapp);
      case WalletTypes.CeloDance:
      case WalletTypes.CeloTerminal:
      case WalletTypes.CeloWallet:
      case WalletTypes.Valora:
      case WalletTypes.WalletConnect: {
        return new WalletConnectConnector(
          network,
          manualNetworkingMode,
          CeloContract.GoldToken,
          buildOptions(network)
        );
      }

      case WalletTypes.Unauthenticated:
        return null;
    }
  } catch (e) {
    getApplicationLogger().error('Unknown error resurrecting', walletType, e);
    return null;
  }
}

function getNetwork(networks: Network[]) {
  const networkName = getTypedStorageKey(localStorageKeys.lastUsedNetwork);
  if (!networkName) return;
  const network = networks.find((net) => net.name === networkName);
  return network;
}
