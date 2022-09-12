import { CeloContract, CeloTokenContract } from '@celo/contractkit/lib/base';
import {
  MiniContractKit,
  newKitFromWeb3,
} from '@celo/contractkit/lib/mini-kit';
import EventEmitter from 'eventemitter3';

import { WalletTypes } from '../constants';
import { Connector } from '../types';
import { getApplicationLogger } from '../utils/logger';

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

export enum ConnectorEvents {
  'CONNECTED' = 'CONNECTED',
  'DISCONNECTED' = 'DISCONNECTED',
  'ADDRESS_CHANGED' = 'ADDRESS_CHANGED',
  'NETWORK_CHANGED' = 'NETWORK_CHANGED',
  'NETWORK_CHANGE_FAILED' = 'NETWORK_CHANGE_FAILED',
  'WALLET_CHAIN_CHANGED' = 'WALLET_CHAIN_CHANGED',
  'WC_URI_RECEIVED' = 'WC_URI_RECEIVED',
  'WC_INITIALISED' = 'WC_INITIALISED',
  'WC_ERROR' = 'WC_ERROR',
}

interface ConnectorParamsCommon {
  networkName: string;
  walletType: WalletTypes;
  walletChainId: number | null;
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
  [ConnectorEvents.ADDRESS_CHANGED]: string; // address/account changed
  [ConnectorEvents.NETWORK_CHANGED]: string; // network has been changed, when this is issued post it being reflected on kit and wallet
  [ConnectorEvents.NETWORK_CHANGE_FAILED]: unknown; // an attempt to change chain id failed (likely either the wallet or dapp does not support the requested chain)
  [ConnectorEvents.WALLET_CHAIN_CHANGED]: number; // wallet changed network, dapp and connector should respond
  [ConnectorEvents.CONNECTED]: ConnectorParams; // wallet is now connected
  [ConnectorEvents.WC_URI_RECEIVED]: string; // wc uri is available
  [ConnectorEvents.WC_INITIALISED]: void; // called when the initialise function is complete. at this point CONNECTED should have already been emited and uri should be available
  [ConnectorEvents.WC_ERROR]: Error; // generic errors from wallet connect operations
  [ConnectorEvents.DISCONNECTED]: void; // wallet is no longer connected
};

export class AbstractConnector {
  public kit?: MiniContractKit;
  type: WalletTypes | undefined;
  protected emitter = new EventEmitter();

  get account() {
    return this.kit?.connection?.defaultAccount;
  }

  protected set account(address) {
    this.kit!.connection.defaultAccount = address;
  }

  on = <E extends ConnectorEvents>(
    event: E,
    fn: (arg: EventsMap[E]) => void
  ) => {
    this.emitter.on(event, fn);
  };

  supportsFeeCurrency() {
    return false;
  }

  protected emit = <E extends ConnectorEvents>(
    event: E,
    data?: EventsMap[E]
  ) => {
    getApplicationLogger().debug('[CONNECTOR EMIT]', this.type, event, data);
    this.emitter.emit(event, data);
  };

  protected disconnect() {
    this.emit(ConnectorEvents.DISCONNECTED);
    this.emitter.removeAllListeners();
  }
}
