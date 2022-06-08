import { CeloContract, CeloTokenContract } from '@celo/contractkit/lib/base';
import { newKitFromWeb3 } from '@celo/contractkit/lib/mini-kit';

// Uncomment with WCV2 support
// import {
//   WalletConnectWallet,
//   WalletConnectWalletOptions,
// } from '@celo/wallet-walletconnect';
import { localStorageKeys, WalletTypes } from '../constants';
import { Connector, Network } from '../types';
import {
  setLastUsedWalletArgs,
  setTypedStorageKey,
  WalletArgs,
} from '../utils/local-storage';

export type Web3Type = Parameters<typeof newKitFromWeb3>[0];

export class UnsupportedChainIdError extends Error {
  public static readonly NAME: string = 'UnsupportedChainIdError';
  constructor(public readonly chainID: number) {
    super(`Unsupported chain ID: ${chainID}`);
    this.name = UnsupportedChainIdError.NAME;
  }
}

export async function updateFeeCurrency(
  this: Connector,
  feeContract: CeloTokenContract
): Promise<void> {
  if (!this.supportsFeeCurrency()) {
    return;
  }
  this.feeCurrency = feeContract;
  const address =
    feeContract === CeloContract.GoldToken
      ? undefined
      : await this.kit.registry.addressFor(feeContract);

  this.kit.connection.defaultFeeCurrency = address;
}

export function persist({
  walletType,
  walletId,
  options = [],
  network,
}: {
  walletType?: WalletTypes;
  walletId?: string;
  options?: WalletArgs;
  network?: Network;
}): void {
  if (walletType) {
    setTypedStorageKey(localStorageKeys.lastUsedWalletType, walletType);
  }
  if (walletId) {
    setTypedStorageKey(localStorageKeys.lastUsedWalletId, walletId);
  }
  if (network) {
    setTypedStorageKey(localStorageKeys.lastUsedNetwork, network.name);
  }
  setLastUsedWalletArgs(options);
}
