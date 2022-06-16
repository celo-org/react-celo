import { CeloContract, CeloTokenContract } from '@celo/contractkit/lib/base';
import { newKitFromWeb3 } from '@celo/contractkit/lib/mini-kit';
import EventEmitter from 'eventemitter3';

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

export enum ConnectorEvents {
  'CONNECTED' = 'CONNECTED',
  'DISCONNECTED' = 'DISCONNECTED',
  'ADDRESS_CHANGED' = 'ADDRESS_CHANGED',
  'NETWORK_CHANGED' = 'NETWORK_CHANGED',
}

interface ConnectorParamsCommon {
  networkName: string;
  walletType: WalletTypes;
  address: string;
  walletId?: string;
  index?: number;
}

interface PrivateKeyParams extends ConnectorParamsCommon {
  walletType: WalletTypes.PrivateKey;
  privateKey: string;
}

interface LedgerParams extends ConnectorParamsCommon {
  walletType: WalletTypes.Ledger;
  index: number;
}

interface WalletConnectParams extends ConnectorParamsCommon {
  walletType:
    | WalletTypes.CeloWallet
    | WalletTypes.Valora
    | WalletTypes.WalletConnect
    | WalletTypes.CeloTerminal
    | WalletTypes.CeloDance;

  walletId: string;
}

export type ConnectorParams =
  | ConnectorParamsCommon
  | PrivateKeyParams
  | LedgerParams
  | WalletConnectParams;

export type EventsMap = {
  [ConnectorEvents.ADDRESS_CHANGED]: string;
  [ConnectorEvents.NETWORK_CHANGED]: string;
  [ConnectorEvents.CONNECTED]: ConnectorParams;
  [ConnectorEvents.DISCONNECTED]: void;
};

export class AbstractConnector {
  protected emitter = new EventEmitter();

  on = <E extends ConnectorEvents>(
    event: E,
    fn: (arg: EventsMap[E]) => void
  ) => {
    this.emitter.on(event, fn);
  };

  emit = <E extends ConnectorEvents>(event: E, data?: EventsMap[E]) => {
    this.emitter.emit(event, data);
  };
}
