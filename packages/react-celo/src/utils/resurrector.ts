import { CeloContract } from '@celo/contractkit';
import { WalletConnectWalletOptions } from '@celo/wallet-walletconnect-v1';

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
  if (!walletType!) return null;

  const networkName = getTypedStorageKey(localStorageKeys.lastUsedNetwork);
  const network = networks.find((net) => net.name === networkName);

  if (!network) {
    console.info('Could not find saved network, aborting resurrection');
    return null;
  }
  try {
    switch (walletType) {
      case WalletTypes.Ledger: {
        const index = getTypedStorageKey(localStorageKeys.lastUsedIndex);
        if (index === null) {
          return null;
        }
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
        const options: WalletConnectWalletOptions = buildOptions(network);
        return new WalletConnectConnector(
          network,
          CeloContract.GoldToken,
          options
        );
      }
      case WalletTypes.Unauthenticated:
        return null;
    }
  } catch (e) {
    console.log('Unknown error in resurrector', e);
    return null;
  }
};

// function migrate() {
//   const lastArgs = getLastUsedWalletArgs()

//   if (lastArgs === null || lastArgs === undefined || lastArgs.length === 0) {
//     return null;
//   }

//   if (typeof lastArgs[0] === 'number') {
//     setTypedStorageKey(localStorageKeys.lastUsedIndex, lastArgs[0])
//   } else if ()

//   switch(lastArgs[0]) {
//     case
//   }
// }
