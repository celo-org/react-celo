/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CeloContract } from '@celo/contractkit';

import {
  CeloExtensionWalletConnector,
  InjectedConnector,
  LedgerConnector,
  MetaMaskConnector,
  PrivateKeyConnector,
  WalletConnectConnector,
} from '../connectors';
import { buildOptions } from '../connectors/wallet-connect';
import { localStorageKeys, WalletTypes } from '../constants';
import { Connector, Network } from '../types';
import { getTypedStorageKey } from './local-storage';

type Resurrector = (networks: Network[]) => Connector | null;

export const resurrector: Resurrector = function (networks: Network[]) {
  const walletType = getTypedStorageKey(localStorageKeys.lastUsedWalletType);
  const network = getNetwork(networks);

  if (!walletType || !network) return null;

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
        return new MetaMaskConnector(network, CeloContract.GoldToken);
      case WalletTypes.Injected:
        return new InjectedConnector(network, CeloContract.GoldToken);

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
      case WalletTypes.CeloDance:
      case WalletTypes.CeloTerminal:
      case WalletTypes.CeloWallet:
      case WalletTypes.Valora:
      case WalletTypes.WalletConnect: {
        return new WalletConnectConnector(
          network,
          CeloContract.GoldToken,
          buildOptions(network)
        );
      }
      case WalletTypes.Unauthenticated:
        return null;
    }
  } catch (e) {
    process.env.NODE_ENV !== 'production' &&
      console.error('[react-celo] Unknown error in resurrector', e);
    return null;
  }
};
function getNetwork(networks: Network[]) {
  const networkName = getTypedStorageKey(localStorageKeys.lastUsedNetwork);
  if (!networkName) return;
  const network = networks.find((net) => net.name === networkName);
  return network;
}
