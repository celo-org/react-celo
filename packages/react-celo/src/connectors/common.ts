import { CeloContract, CeloTokenContract } from '@celo/contractkit/lib/base';
import { newKitFromWeb3 } from '@celo/contractkit/lib/mini-kit';
import { Network } from '@ethersproject/providers';
import EventEmitter from 'eventemitter3';

import { WalletTypes } from '../constants';
import { Connector } from '../types';

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

  supportsFeeCurrency() {
    return false;
  }

  setNetworkOnWallet(network: Network) {}

  protected emit = <E extends ConnectorEvents>(
    event: E,
    data?: EventsMap[E]
  ) => {
    this.emitter.emit(event, data);
  };
}

/*
  Next up

  ✅ setup address changed emission

  determin the connect, initialisedConnector, connected flow

  make all connector.initialise calls idempotent

  setup network changed emission (or is it just disconnect and reconnect?)

  ✅ replace loadConfig with resurrector

  ✅ setup updater and persistor

  ✅ remove the direct usage of local storage

  look for peculiarities

  bring Connector and Abstract Connector together

  wallet connect connector needs to be updated to have address change

  wallet connect wallet get URI should not setup the event listeners.

*/
